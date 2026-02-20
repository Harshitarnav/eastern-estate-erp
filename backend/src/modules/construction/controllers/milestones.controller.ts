import { Controller, Post, Put, Body, Param, Req, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { MilestoneDetectionService } from '../services/milestone-detection.service';
import { AutoDemandDraftService } from '../services/auto-demand-draft.service';

@Controller('construction/milestones')
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(
    private readonly milestoneDetectionService: MilestoneDetectionService,
    private readonly autoDemandDraftService: AutoDemandDraftService,
  ) {}

  /**
   * Get all detected milestones ready to trigger
   */
  @Get('detected')
  async getDetectedMilestones() {
    return await this.milestoneDetectionService.detectMilestones();
  }

  /**
   * Get detected milestones for a specific flat
   */
  @Get('flat/:flatId')
  async getDetectedMilestonesForFlat(@Param('flatId') flatId: string) {
    return await this.milestoneDetectionService.detectMilestonesForFlat(flatId);
  }

  /**
   * Get construction summary for a flat
   */
  @Get('flat/:flatId/summary')
  async getConstructionSummary(@Param('flatId') flatId: string) {
    return await this.milestoneDetectionService.getConstructionSummary(flatId);
  }

  /**
   * Manually trigger demand draft generation for a specific milestone
   */
  @Post('trigger-demand-draft')
  async triggerDemandDraft(
    @Body() body: { flatPaymentPlanId: string; milestoneSequence: number },
    @Req() req: any,
  ) {
    return await this.autoDemandDraftService.manualGenerateDemandDraft(
      body.flatPaymentPlanId,
      body.milestoneSequence,
      req.user.id,
    );
  }
}
