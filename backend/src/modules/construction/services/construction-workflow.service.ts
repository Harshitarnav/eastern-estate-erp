import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import {
  ConstructionPhase,
  PhaseStatus,
} from '../entities/construction-tower-progress.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { Flat } from '../../flats/entities/flat.entity';
import {
  FlatPaymentPlan,
  FlatPaymentPlanStatus,
} from '../../payment-plans/entities/flat-payment-plan.entity';
import {
  DemandDraft,
  DemandDraftStatus,
} from '../../demand-drafts/entities/demand-draft.entity';
import { AutoDemandDraftService } from './auto-demand-draft.service';

/**
 * Shape returned to the caller when an automated demand draft is raised.
 * Frontend uses this to surface a toast ("DD raised for X - ₹Y").
 */
export interface GeneratedDemandDraftSummary {
  id: string;
  title: string;
  amount: number;
  refNumber?: string;
  milestoneName?: string;
  flatNumber?: string;
  towerName?: string;
  propertyName?: string;
  customerName?: string;
  dueDate?: Date;
}

export interface ConstructionWorkflowResult {
  milestonesTriggered: number;
  generatedDemandDrafts: GeneratedDemandDraftSummary[];
}

/**
 * Construction Workflow Service
 *
 * Entry point invoked after a construction progress log is saved.
 * Responsibilities:
 *   1. Stamp the flat's construction stage / % so lists stay fresh
 *   2. Detect which payment plan milestones are now due
 *   3. Delegate DD creation to {@link AutoDemandDraftService} (the single
 *      source of truth for demand-draft generation, templating, scheduling,
 *      auto-send resolution and email side-effects)
 *
 * Historically this service contained its own copy of the DD-generation
 * logic. That duplicate diverged over time - one path stamped the
 * construction checkpoint row, the other didn't; one path created a
 * PaymentSchedule, the other didn't; one called FlatPaymentPlanService.
 * updateMilestone, the other mutated in-memory and saved. Unifying on
 * AutoDemandDraftService keeps the side-effects consistent no matter
 * which entry point fired.
 */
@Injectable()
export class ConstructionWorkflowService {
  private readonly logger = new Logger(ConstructionWorkflowService.name);

  constructor(
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(DemandDraft)
    private readonly demandDraftRepository: Repository<DemandDraft>,
    @InjectRepository(ConstructionFlatProgress)
    private readonly progressRepository: Repository<ConstructionFlatProgress>,
    @InjectRepository(ConstructionProject)
    private readonly projectRepository: Repository<ConstructionProject>,
    private readonly autoDemandDraftService: AutoDemandDraftService,
  ) {}

  /**
   * Main workflow trigger - called after construction progress is logged
   */
  async processConstructionUpdate(
    flatId: string,
    phase: string,
    phaseProgress: number,
    overallProgress: number,
  ): Promise<ConstructionWorkflowResult> {
    this.logger.log(`Processing construction update for flat ${flatId}`);

    const emptyResult: ConstructionWorkflowResult = {
      milestonesTriggered: 0,
      generatedDemandDrafts: [],
    };

    try {
      await this.updateFlatConstructionStatus(
        flatId,
        phase,
        phaseProgress,
        overallProgress,
      );

      const paymentPlan = await this.flatPaymentPlanRepository.findOne({
        where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
        relations: ['customer', 'booking', 'flat', 'flat.property', 'flat.tower'],
      });

      if (!paymentPlan) {
        this.logger.log(
          `No active payment plan found for flat ${flatId} - skipping milestone check`,
        );
        return emptyResult;
      }

      return await this.checkAndUpdateMilestones(paymentPlan, phase, phaseProgress);
    } catch (error) {
      this.logger.error(
        `Error processing construction update for flat ${flatId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Step 1: Update flat entity with current construction status.
   * Also upserts the matching ConstructionFlatProgress row so the
   * per-flat progress table stays in lockstep with flat.construction*
   * columns. Downstream milestone detection reads from this table,
   * so forgetting to write it means milestones never fire for the
   * direct-update path.
   */
  private async updateFlatConstructionStatus(
    flatId: string,
    stage: string,
    phaseProgress: number,
    overallProgress: number,
  ): Promise<void> {
    this.logger.log(
      `Updating flat ${flatId}: stage=${stage}, phaseProgress=${phaseProgress}%, overallProgress=${overallProgress}%`,
    );

    await this.flatRepository.update(flatId, {
      constructionStage: stage,
      constructionProgress: overallProgress,
      lastConstructionUpdate: new Date(),
    });

    // Keep construction_flat_progress in sync. Historically this
    // routine only stamped the flats table, leaving the phase-rows
    // table to be updated by whichever controller happened to hit
    // it - so milestone detection (which reads phase rows) saw
    // stale data any time the caller was ConstructionProgressLogs
    // (which writes neither table directly).
    //
    // Upsert strategy: find the (flatId, phase) row; if absent,
    // resolve the project via flat.propertyId and create one.
    try {
      if (!this.isKnownPhase(stage)) return;
      const phase = stage as ConstructionPhase;

      let row = await this.progressRepository.findOne({
        where: { flatId, phase },
      });

      if (!row) {
        const flat = await this.flatRepository.findOne({
          where: { id: flatId },
        });
        if (!flat?.propertyId) return;
        const project = await this.projectRepository.findOne({
          where: { propertyId: flat.propertyId },
          select: ['id'] as any,
        });
        if (!project) return;

        row = this.progressRepository.create({
          constructionProjectId: project.id,
          flatId,
          phase,
          phaseProgress,
          overallProgress,
          status:
            phaseProgress >= 100
              ? PhaseStatus.COMPLETED
              : phaseProgress > 0
                ? PhaseStatus.IN_PROGRESS
                : PhaseStatus.NOT_STARTED,
        });
      } else {
        row.phaseProgress = phaseProgress;
        row.overallProgress = overallProgress;
        if (phaseProgress >= 100) {
          row.status = PhaseStatus.COMPLETED;
          row.actualEndDate = row.actualEndDate ?? new Date();
        } else if (phaseProgress > 0 && row.status === PhaseStatus.NOT_STARTED) {
          row.status = PhaseStatus.IN_PROGRESS;
        }
      }
      await this.progressRepository.save(row);
    } catch (err: any) {
      this.logger.warn(
        `Could not sync construction_flat_progress for flat ${flatId}/${stage}: ${err?.message}`,
      );
    }
  }

  private isKnownPhase(v: string): boolean {
    return (Object.values(ConstructionPhase) as string[]).includes(v);
  }

  /**
   * Step 3: For each pending milestone whose construction phase matches
   * the phase that was just logged, delegate generation to the unified
   * AutoDemandDraftService. That service is responsible for:
   *   - idempotency check (flatId + milestoneSequence)
   *   - PaymentSchedule creation
   *   - template rendering
   *   - auto-send resolution (customer > property > company)
   *   - email side-effect on auto-send
   *   - flat_payment_plan milestone status update
   *   - construction checkpoint stamping
   */
  private async checkAndUpdateMilestones(
    paymentPlan: FlatPaymentPlan,
    currentPhase: string,
    phaseProgress: number,
  ): Promise<ConstructionWorkflowResult> {
    this.logger.log(`Checking milestones for payment plan ${paymentPlan.id}`);

    const generatedDemandDrafts: GeneratedDemandDraftSummary[] = [];
    let milestonesTriggered = 0;

    for (const milestone of paymentPlan.milestones ?? []) {
      if (milestone.status !== 'PENDING') continue;
      if (!milestone.constructionPhase) continue;

      if (
        milestone.constructionPhase !== currentPhase ||
        phaseProgress < (milestone.phasePercentage || 100)
      ) {
        continue;
      }

      this.logger.log(
        `Milestone ${milestone.sequence} reached for flat ${paymentPlan.flatId}: ` +
          `${currentPhase} at ${phaseProgress}% (required: ${milestone.phasePercentage}%)`,
      );

      // Isolate each milestone's delegation so one failure (e.g. a stale
      // payment_schedules column, a bad updated_by cast) doesn't prevent
      // the others from firing AND doesn't drop the list of DDs that did
      // succeed. The DD row for this milestone may still have been saved
      // on disk before the failure – the 2-hourly cron sweep will report
      // and reconcile it on the next pass.
      try {
        const summary = await this.delegateDemandDraft(paymentPlan, milestone, currentPhase);
        if (summary) {
          generatedDemandDrafts.push(summary);
          milestonesTriggered += 1;
        }
      } catch (err: any) {
        this.logger.error(
          `Failed to delegate DD for milestone ${milestone.sequence} on flat ${paymentPlan.flatId}: ${err?.message}`,
        );
      }
    }

    return { milestonesTriggered, generatedDemandDrafts };
  }

  /**
   * Thin wrapper around AutoDemandDraftService.generateDemandDraft.
   *
   * Returns null if a draft already exists for this milestone (caller
   * treats null as "no toast this time"). Any lookup / validation
   * errors from the unified generator bubble up as-is so the workflow
   * caller can log them once per construction log.
   */
  private async delegateDemandDraft(
    paymentPlan: FlatPaymentPlan,
    milestone: any,
    currentPhase: string,
  ): Promise<GeneratedDemandDraftSummary | null> {
    const existing = await this.demandDraftRepository.findOne({
      where: {
        flatId: paymentPlan.flatId,
        milestoneId: String(milestone.sequence),
      },
    });
    if (existing) {
      this.logger.log(
        `Demand draft already exists for milestone ${milestone.sequence} on flat ${paymentPlan.flatId}`,
      );
      // If the plan's milestone row never got flipped to TRIGGERED (e.g.
      // a prior run crashed mid-way in updateMilestone), self-heal now.
      // This keeps the Payment Plan panel in the log UI accurate instead
      // of permanently showing PENDING even though a DD exists.
      const planMilestone = paymentPlan.milestones?.find(
        (m) => m.sequence === milestone.sequence,
      );
      if (planMilestone && planMilestone.status === 'PENDING') {
        try {
          await this.healMilestoneStatus(paymentPlan, milestone.sequence, existing.id);
        } catch (err: any) {
          this.logger.warn(
            `Could not heal milestone ${milestone.sequence} status: ${err?.message}`,
          );
        }
      }
      return null;
    }

    const constructionProgress = await this.progressRepository.findOne({
      where: {
        flatId: paymentPlan.flatId,
        phase: currentPhase as ConstructionPhase,
      },
    });

    const saved = await this.autoDemandDraftService.generateDemandDraft({
      flatPaymentPlan: paymentPlan,
      milestoneSequence: milestone.sequence,
      constructionProgress: constructionProgress ?? null,
      milestoneName: milestone.name,
      amount: Number(milestone.amount) || 0,
    });

    const flat = paymentPlan.flat;
    const bookingRef =
      paymentPlan.booking?.bookingNumber ??
      paymentPlan.bookingId.substring(0, 8).toUpperCase();
    const refNumber = `DD-${bookingRef}-${String(milestone.sequence).padStart(2, '0')}`;

    return {
      id: saved.id,
      title: saved.title,
      amount: Number(saved.amount) || 0,
      refNumber,
      milestoneName: milestone.name,
      flatNumber: flat?.flatNumber || undefined,
      towerName: flat?.tower?.name || undefined,
      propertyName: flat?.property?.name || undefined,
      customerName: paymentPlan.customer?.fullName || undefined,
      dueDate: saved.dueDate,
    };
  }

  /**
   * Self-heal a plan's milestone row when a DD exists on disk but the
   * milestone was left in PENDING (e.g. a prior run crashed mid-way in
   * FlatPaymentPlanService.updateMilestone due to schema drift or a bad
   * updated_by value). We re-apply the TRIGGERED state using the FlatPayment
   * plan repo directly so we don't re-invoke the service method that
   * already failed once. updated_by is left untouched (NULL) rather than
   * stamped with the string 'SYSTEM'.
   */
  private async healMilestoneStatus(
    paymentPlan: FlatPaymentPlan,
    milestoneSequence: number,
    demandDraftId: string,
  ): Promise<void> {
    const fresh = await this.flatPaymentPlanRepository.findOne({
      where: { id: paymentPlan.id },
    });
    if (!fresh) return;
    const idx = (fresh.milestones || []).findIndex(
      (m) => m.sequence === milestoneSequence,
    );
    if (idx === -1) return;
    if (fresh.milestones[idx].status !== 'PENDING') return;

    fresh.milestones[idx] = {
      ...fresh.milestones[idx],
      status: 'TRIGGERED',
      demandDraftId,
    };
    await this.flatPaymentPlanRepository.save(fresh);
    this.logger.log(
      `Healed milestone ${milestoneSequence} on plan ${fresh.id} → TRIGGERED (dd=${demandDraftId})`,
    );
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
      relations: ['customer', 'flat', 'flat.property', 'flat.tower'],
      order: { generatedAt: 'DESC' },
    });
  }
}
