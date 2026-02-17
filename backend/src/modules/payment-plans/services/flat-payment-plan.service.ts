import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatPaymentPlan, FlatPaymentMilestone, FlatPaymentPlanStatus } from '../entities/flat-payment-plan.entity';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { PaymentPlanTemplateService } from './payment-plan-template.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';

@Injectable()
export class FlatPaymentPlanService {
  constructor(
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly templateService: PaymentPlanTemplateService,
  ) {}

  /**
   * Create a flat payment plan from a template
   */
  async create(createDto: CreateFlatPaymentPlanDto, userId: string): Promise<FlatPaymentPlan> {
    // Verify flat exists
    const flat = await this.flatRepository.findOne({ where: { id: createDto.flatId } });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${createDto.flatId} not found`);
    }

    // Verify booking exists
    const booking = await this.bookingRepository.findOne({ where: { id: createDto.bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${createDto.bookingId} not found`);
    }

    // Verify customer exists
    const customer = await this.customerRepository.findOne({ where: { id: createDto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${createDto.customerId} not found`);
    }

    // Check if flat already has a payment plan
    const existing = await this.flatPaymentPlanRepository.findOne({
      where: { flatId: createDto.flatId, bookingId: createDto.bookingId }
    });
    if (existing) {
      throw new BadRequestException('This flat-booking combination already has a payment plan');
    }

    // Get template
    const template = await this.templateService.findOne(createDto.paymentPlanTemplateId);

    // Convert template milestones to flat milestones with calculated amounts
    const milestones: FlatPaymentMilestone[] = template.milestones.map((tm) => ({
      sequence: tm.sequence,
      name: tm.name,
      constructionPhase: tm.constructionPhase,
      phasePercentage: tm.phasePercentage,
      amount: (createDto.totalAmount * tm.paymentPercentage) / 100,
      dueDate: null,
      status: 'PENDING',
      paymentScheduleId: null,
      constructionCheckpointId: null,
      demandDraftId: null,
      paymentId: null,
      completedAt: null,
      description: tm.description,
    }));

    // Create flat payment plan
    const flatPaymentPlan = this.flatPaymentPlanRepository.create({
      flatId: createDto.flatId,
      bookingId: createDto.bookingId,
      customerId: createDto.customerId,
      paymentPlanTemplateId: createDto.paymentPlanTemplateId,
      totalAmount: createDto.totalAmount,
      paidAmount: 0,
      balanceAmount: createDto.totalAmount,
      milestones,
      status: FlatPaymentPlanStatus.ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.flatPaymentPlanRepository.save(flatPaymentPlan);

    // Note: Flat entity linking removed as paymentPlanId column doesn't exist in schema
    // The relationship is maintained via flatId in FlatPaymentPlan

    return saved;
  }

  /**
   * Get all flat payment plans
   */
  async findAll(): Promise<FlatPaymentPlan[]> {
    return await this.flatPaymentPlanRepository.find({
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get flat payment plan by ID
   */
  async findOne(id: string): Promise<FlatPaymentPlan> {
    const plan = await this.flatPaymentPlanRepository.findOne({
      where: { id },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
    if (!plan) {
      throw new NotFoundException(`Flat payment plan with ID ${id} not found`);
    }
    return plan;
  }

  /**
   * Get flat payment plan by flat ID
   */
  async findByFlatId(flatId: string): Promise<FlatPaymentPlan | null> {
    return await this.flatPaymentPlanRepository.findOne({
      where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
  }

  /**
   * Get flat payment plan by booking ID
   */
  async findByBookingId(bookingId: string): Promise<FlatPaymentPlan | null> {
    return await this.flatPaymentPlanRepository.findOne({
      where: { bookingId, status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
  }

  /**
   * Update milestone in flat payment plan
   */
  async updateMilestone(
    planId: string,
    milestoneSequence: number,
    updates: Partial<FlatPaymentMilestone>,
    userId: string,
  ): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(planId);
    
    const milestoneIndex = plan.milestones.findIndex(m => m.sequence === milestoneSequence);
    if (milestoneIndex === -1) {
      throw new NotFoundException(`Milestone with sequence ${milestoneSequence} not found in plan`);
    }

    // Update milestone
    plan.milestones[milestoneIndex] = {
      ...plan.milestones[milestoneIndex],
      ...updates,
    };

    // Recalculate paid and balance amounts
    const paidAmount = plan.milestones
      .filter(m => m.status === 'PAID')
      .reduce((sum, m) => sum + m.amount, 0);
    
    plan.paidAmount = paidAmount;
    plan.balanceAmount = plan.totalAmount - paidAmount;

    // Check if all milestones are paid
    const allPaid = plan.milestones.every(m => m.status === 'PAID');
    if (allPaid) {
      plan.status = FlatPaymentPlanStatus.COMPLETED;
    }

    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Cancel flat payment plan
   */
  async cancel(id: string, userId: string): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(id);
    plan.status = FlatPaymentPlanStatus.CANCELLED;
    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }
}
