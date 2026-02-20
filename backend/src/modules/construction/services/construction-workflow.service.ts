import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan, FlatPaymentPlanStatus } from '../../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft, DemandDraftStatus } from '../../demand-drafts/entities/demand-draft.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Booking } from '../../bookings/entities/booking.entity';

/**
 * Construction Workflow Service
 * 
 * Handles the complete automated flow:
 * 1. Construction progress log updated
 * 2. Update flat module (stage and percentage)
 * 3. If flat is sold → check payment plan
 * 4. Check if milestone reached → update status
 * 5. Auto-generate demand draft
 */
@Injectable()
export class ConstructionWorkflowService {
  private readonly logger = new Logger(ConstructionWorkflowService.name);

  constructor(
    @InjectRepository(Flat)
    private flatRepository: Repository<Flat>,
    @InjectRepository(FlatPaymentPlan)
    private flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(DemandDraft)
    private demandDraftRepository: Repository<DemandDraft>,
    @InjectRepository(ConstructionFlatProgress)
    private progressRepository: Repository<ConstructionFlatProgress>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Main workflow trigger - called after construction progress is logged
   */
  async processConstructionUpdate(
    flatId: string,
    phase: string,
    phaseProgress: number,
    overallProgress: number,
  ): Promise<void> {
    this.logger.log(`Processing construction update for flat ${flatId}`);

    try {
      // Step 1: Update flat with latest construction info
      await this.updateFlatConstructionStatus(flatId, phase, overallProgress);

      // Step 2: Check if flat has an active payment plan (i.e., is sold)
      const paymentPlan = await this.flatPaymentPlanRepository.findOne({
        where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
        relations: ['customer', 'booking', 'flat', 'flat.property', 'flat.tower'],
      });

      if (!paymentPlan) {
        this.logger.log(`No active payment plan found for flat ${flatId} - skipping milestone check`);
        return;
      }

      this.logger.log(`Active payment plan found for flat ${flatId} - checking milestones`);

      // Step 3: Check and update milestones
      await this.checkAndUpdateMilestones(paymentPlan, phase, phaseProgress);

    } catch (error) {
      this.logger.error(`Error processing construction update for flat ${flatId}:`, error);
      throw error;
    }
  }

  /**
   * Step 1: Update flat entity with current construction status
   */
  private async updateFlatConstructionStatus(
    flatId: string,
    stage: string,
    progress: number,
  ): Promise<void> {
    this.logger.log(`Updating flat ${flatId}: stage=${stage}, progress=${progress}%`);

    await this.flatRepository.update(flatId, {
      constructionStage: stage,
      constructionProgress: progress,
      lastConstructionUpdate: new Date(),
    });

    this.logger.log(`Flat ${flatId} updated successfully`);
  }

  /**
   * Step 3: Check if any milestones are reached and update them
   */
  private async checkAndUpdateMilestones(
    paymentPlan: FlatPaymentPlan,
    currentPhase: string,
    phaseProgress: number,
  ): Promise<void> {
    this.logger.log(`Checking milestones for payment plan ${paymentPlan.id}`);

    let planUpdated = false;

    for (const milestone of paymentPlan.milestones) {
      // Skip if milestone is not pending
      if (milestone.status !== 'PENDING') {
        continue;
      }

      // Skip if milestone has no construction phase linkage
      if (!milestone.constructionPhase) {
        continue;
      }

      // Check if this milestone's construction phase matches and progress is reached
      if (
        milestone.constructionPhase === currentPhase &&
        phaseProgress >= (milestone.phasePercentage || 100)
      ) {
        this.logger.log(
          `Milestone ${milestone.sequence} reached for flat ${paymentPlan.flatId}: ` +
          `${currentPhase} at ${phaseProgress}% (required: ${milestone.phasePercentage}%)`,
        );

        // Update milestone status to TRIGGERED
        milestone.status = 'TRIGGERED';
        planUpdated = true;

        // Generate demand draft
        await this.generateDemandDraft(paymentPlan, milestone);
      }
    }

    // Save payment plan if any milestones were updated
    if (planUpdated) {
      await this.flatPaymentPlanRepository.save(paymentPlan);
      this.logger.log(`Payment plan ${paymentPlan.id} updated with triggered milestones`);
    } else {
      this.logger.log(`No milestones reached for payment plan ${paymentPlan.id}`);
    }
  }

  /**
   * Step 4: Auto-generate demand draft
   */
  private async generateDemandDraft(
    paymentPlan: FlatPaymentPlan,
    milestone: any,
  ): Promise<void> {
    this.logger.log(
      `Generating demand draft for milestone ${milestone.sequence} of payment plan ${paymentPlan.id}`,
    );

    // Check if draft already exists for this milestone
    const existingDraft = await this.demandDraftRepository.findOne({
      where: {
        flatId: paymentPlan.flatId,
        milestoneId: `${milestone.sequence}`,
      },
    });

    if (existingDraft) {
      this.logger.log(`Demand draft already exists for milestone ${milestone.sequence}`);
      return;
    }

    // Get customer and booking details
    const customer = paymentPlan.customer;
    const booking = paymentPlan.booking;
    const flat = paymentPlan.flat;

    if (!customer || !flat) {
      this.logger.warn(`Missing customer or flat data for payment plan ${paymentPlan.id}`);
      return;
    }

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Generate demand draft content
    const content = this.generateDemandDraftContent(
      customer,
      flat,
      milestone,
      paymentPlan,
      dueDate,
    );

    // Create demand draft
    const demandDraft = this.demandDraftRepository.create({
      flatId: paymentPlan.flatId,
      customerId: paymentPlan.customerId,
      bookingId: paymentPlan.bookingId,
      milestoneId: `${milestone.sequence}`,
      content,
      amount: milestone.amount,
      status: DemandDraftStatus.DRAFT,
      requiresReview: true,
      generatedAt: new Date(),
      autoGenerated: true,
      flatPaymentPlanId: paymentPlan.id,
      metadata: {
        title: `Payment Demand - ${milestone.name}`,
        dueDate: dueDate.toISOString(),
        milestoneSequence: milestone.sequence,
        milestoneName: milestone.name,
        constructionPhase: milestone.constructionPhase,
        autoGenerated: true,
      },
    });

    await this.demandDraftRepository.save(demandDraft);

    this.logger.log(
      `Demand draft ${demandDraft.id} generated for milestone ${milestone.sequence}`,
    );
  }

  /**
   * Generate demand draft content
   */
  private generateDemandDraftContent(
    customer: Customer,
    flat: any,
    milestone: any,
    paymentPlan: FlatPaymentPlan,
    dueDate: Date,
  ): string {
    const propertyName = flat.property?.name || 'Property';
    const towerName = flat.tower?.name || 'Tower';
    const flatNumber = flat.flatNumber || 'N/A';

    return `
Dear ${customer.fullName},

Subject: Payment Demand - ${milestone.name}

This is to inform you that the construction of your unit (${flatNumber}, ${towerName}, ${propertyName}) has reached the milestone: ${milestone.name}.

As per your payment plan, the following payment is now due:

**Milestone Details:**
- Milestone: ${milestone.name}
- Description: ${milestone.description || 'N/A'}
- Construction Phase: ${milestone.constructionPhase || 'N/A'}
- Amount Due: ₹${milestone.amount.toLocaleString('en-IN')}

**Payment Details:**
- Total Property Value: ₹${paymentPlan.totalAmount.toLocaleString('en-IN')}
- Amount Paid So Far: ₹${paymentPlan.paidAmount.toLocaleString('en-IN')}
- Current Installment: ₹${milestone.amount.toLocaleString('en-IN')}
- Balance After Payment: ₹${(paymentPlan.balanceAmount - milestone.amount).toLocaleString('en-IN')}

**Due Date:** ${dueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

Please make the payment by the due date to avoid any delays in possession.

For payment instructions or queries, please contact our accounts department.

Best regards,
Accounts Team
    `.trim();
  }

  /**
   * Get all pending demand drafts that need review
   */
  async getPendingDemandDrafts(): Promise<DemandDraft[]> {
    return await this.demandDraftRepository.find({
      where: {
        status: DemandDraftStatus.DRAFT,
        requiresReview: true,
      },
      relations: ['customer', 'flat', 'flat.property', 'flat.tower', 'booking'],
      order: { generatedAt: 'DESC' },
    });
  }
}
