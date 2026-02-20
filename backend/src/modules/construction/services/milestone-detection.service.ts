import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { FlatPaymentPlan, FlatPaymentPlanStatus } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionPhase } from '../entities/construction-tower-progress.entity';

export interface MilestoneMatch {
  flatPaymentPlan: FlatPaymentPlan;
  milestoneSequence: number;
  constructionProgress: ConstructionFlatProgress;
  milestoneName: string;
  amount: number;
}

/**
 * Milestone Detection Service
 * 
 * Monitors construction progress and detects when payment milestones are reached.
 * Runs periodically to check for milestone triggers.
 */
@Injectable()
export class MilestoneDetectionService {
  private readonly logger = new Logger(MilestoneDetectionService.name);

  constructor(
    @InjectRepository(ConstructionFlatProgress)
    private readonly progressRepository: Repository<ConstructionFlatProgress>,
    @InjectRepository(FlatPaymentPlan)
    private readonly paymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
  ) {}

  /**
   * Scheduled job to check for milestone triggers
   * Runs every hour
   * COMMENTED OUT FOR NOW - Enable when ready for automation
   */
  // @Cron(CronExpression.EVERY_HOUR)
  // async checkMilestones(): Promise<void> {
  //   this.logger.log('Starting milestone detection check...');
  //   try {
  //     const matches = await this.detectMilestones();
  //     this.logger.log(`Found ${matches.length} milestone(s) that can be triggered`);
  //     
  //     // Note: Actual demand draft generation is handled by AutoDemandDraftService
  //     // This service only detects and marks milestones
  //     
  //   } catch (error) {
  //     this.logger.error('Error during milestone detection:', error);
  //   }
  // }

  /**
   * Detect construction milestones that match payment plan milestones
   */
  async detectMilestones(): Promise<MilestoneMatch[]> {
    const matches: MilestoneMatch[] = [];

    // Get all active flat payment plans
    const paymentPlans = await this.paymentPlanRepository.find({
      where: { status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat'],
    });

    for (const plan of paymentPlans) {
      // Get construction progress for this flat
      const progressRecords = await this.progressRepository.find({
        where: { flatId: plan.flatId },
        order: { phase: 'ASC' },
      });

      // Check each milestone in the payment plan
      for (const milestone of plan.milestones) {
        // Skip if already triggered or paid
        if (milestone.status !== 'PENDING') {
          continue;
        }

        // Token/Down payment milestones (no construction phase) should be manually triggered
        if (!milestone.constructionPhase) {
          continue;
        }

        // Find matching construction progress
        const matchingProgress = progressRecords.find(
          p => p.phase === milestone.constructionPhase
        );

        if (!matchingProgress) {
          continue;
        }

        // Check if construction has reached the required percentage
        const requiredPercentage = milestone.phasePercentage || 100;
        const actualPercentage = matchingProgress.phaseProgress;

        if (actualPercentage >= requiredPercentage) {
          matches.push({
            flatPaymentPlan: plan,
            milestoneSequence: milestone.sequence,
            constructionProgress: matchingProgress,
            milestoneName: milestone.name,
            amount: milestone.amount,
          });
        }
      }
    }

    return matches;
  }

  /**
   * Detect milestones for a specific flat
   */
  async detectMilestonesForFlat(flatId: string): Promise<MilestoneMatch[]> {
    const matches: MilestoneMatch[] = [];

    // Get active payment plan for this flat
    const paymentPlan = await this.paymentPlanRepository.findOne({
      where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat'],
    });

    if (!paymentPlan) {
      return matches;
    }

    // Get construction progress for this flat
    const progressRecords = await this.progressRepository.find({
      where: { flatId },
      order: { phase: 'ASC' },
    });

    // Check each milestone
    for (const milestone of paymentPlan.milestones) {
      if (milestone.status !== 'PENDING' || !milestone.constructionPhase) {
        continue;
      }

      const matchingProgress = progressRecords.find(
        p => p.phase === milestone.constructionPhase
      );

      if (!matchingProgress) {
        continue;
      }

      const requiredPercentage = milestone.phasePercentage || 100;
      if (matchingProgress.phaseProgress >= requiredPercentage) {
        matches.push({
          flatPaymentPlan: paymentPlan,
          milestoneSequence: milestone.sequence,
          constructionProgress: matchingProgress,
          milestoneName: milestone.name,
          amount: milestone.amount,
        });
      }
    }

    return matches;
  }

  /**
   * Check if a specific milestone can be triggered
   */
  async canTriggerMilestone(
    paymentPlanId: string,
    milestoneSequence: number
  ): Promise<boolean> {
    const paymentPlan = await this.paymentPlanRepository.findOne({
      where: { id: paymentPlanId },
    });

    if (!paymentPlan) {
      return false;
    }

    const milestone = paymentPlan.milestones.find(m => m.sequence === milestoneSequence);
    if (!milestone || milestone.status !== 'PENDING') {
      return false;
    }

    // Token/Down payment can always be triggered manually
    if (!milestone.constructionPhase) {
      return true;
    }

    // Check construction progress
    const progressRecords = await this.progressRepository.find({
      where: { flatId: paymentPlan.flatId },
    });

    const matchingProgress = progressRecords.find(
      p => p.phase === milestone.constructionPhase
    );

    if (!matchingProgress) {
      return false;
    }

    const requiredPercentage = milestone.phasePercentage || 100;
    return matchingProgress.phaseProgress >= requiredPercentage;
  }

  /**
   * Get construction phase summary for a flat
   */
  async getConstructionSummary(flatId: string): Promise<{
    phases: Record<string, { progress: number; status: string }>;
    overallProgress: number;
  }> {
    const progressRecords = await this.progressRepository.find({
      where: { flatId },
    });

    const phases: Record<string, { progress: number; status: string }> = {};
    let totalProgress = 0;

    for (const record of progressRecords) {
      phases[record.phase] = {
        progress: record.phaseProgress,
        status: record.status,
      };
      totalProgress += record.phaseProgress;
    }

    const overallProgress = progressRecords.length > 0 
      ? totalProgress / progressRecords.length 
      : 0;

    return { phases, overallProgress };
  }
}
