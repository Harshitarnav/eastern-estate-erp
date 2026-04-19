import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FlatProgressService } from './flat-progress.service';
import { CreateFlatProgressDto } from './dto/create-flat-progress.dto';
import { UpdateFlatProgressDto } from './dto/update-flat-progress.dto';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
import { ConstructionWorkflowService } from './services/construction-workflow.service';
import { ConstructionProjectsService } from './construction-projects.service';

@Controller('construction-projects')
export class FlatProgressController {
  constructor(
    private readonly flatProgressService: FlatProgressService,
    // Workflow service is the single place where construction-progress
    // changes propagate to flats + payment-plan milestones + auto-DDs.
    // Calling it here ensures direct API writes to the flat progress
    // table (bypassing ConstructionProgressLogsService) still trigger
    // milestone detection instead of silently sitting in the table.
    private readonly workflowService: ConstructionWorkflowService,
    private readonly projectsService: ConstructionProjectsService,
  ) {}

  // Create or update flat progress for a phase
  @Post(':projectId/flats/:flatId/progress')
  async createFlatProgress(
    @Param('projectId') projectId: string,
    @Param('flatId') flatId: string,
    @Body() createDto: CreateFlatProgressDto,
  ) {
    const saved = await this.flatProgressService.create({
      ...createDto,
      constructionProjectId: projectId,
      flatId,
    });

    // Fire the unified workflow best-effort. Failure here must not
    // break the direct progress-record write the user just performed.
    this.workflowService
      .processConstructionUpdate(
        flatId,
        saved.phase as string,
        Number(saved.phaseProgress ?? 0),
        Number(saved.overallProgress ?? saved.phaseProgress ?? 0),
      )
      .catch(() => {});
    this.projectsService.recomputeOverallProgress(projectId).catch(() => {});

    return saved;
  }

  // Update specific flat progress record
  @Put('flat-progress/:id')
  async updateFlatProgress(
    @Param('id') id: string,
    @Body() updateDto: UpdateFlatProgressDto,
  ) {
    const saved = await this.flatProgressService.update(id, updateDto);
    this.workflowService
      .processConstructionUpdate(
        saved.flatId,
        saved.phase as string,
        Number(saved.phaseProgress ?? 0),
        Number(saved.overallProgress ?? saved.phaseProgress ?? 0),
      )
      .catch(() => {});
    if (saved?.constructionProjectId) {
      this.projectsService
        .recomputeOverallProgress(saved.constructionProjectId)
        .catch(() => {});
    }
    return saved;
  }

  // Get all progress records for a specific flat
  @Get(':projectId/flats/:flatId/progress')
  async getFlatProgress(
    @Param('projectId') projectId: string,
    @Param('flatId') flatId: string,
    @Query('phase') phase?: ConstructionPhase,
  ) {
    if (phase) {
      return this.flatProgressService.findByFlatAndPhase(flatId, phase);
    }
    return this.flatProgressService.findByFlat(flatId);
  }

  // Get progress for specific phase of a flat
  @Get(':projectId/flats/:flatId/progress/:phase')
  async getFlatPhaseProgress(
    @Param('flatId') flatId: string,
    @Param('phase') phase: ConstructionPhase,
  ) {
    return this.flatProgressService.findByFlatAndPhase(flatId, phase);
  }

  // Get flat progress summary for a project
  @Get(':id/flat-summary')
  async getFlatSummary(@Param('id') projectId: string) {
    return this.flatProgressService.getFlatProgressSummary(projectId);
  }

  // Get flats ready for handover
  @Get(':id/flats-ready-for-handover')
  async getFlatsReadyForHandover(@Param('id') projectId: string) {
    return this.flatProgressService.getFlatsReadyForHandover(projectId);
  }

  // Get flat progress by tower
  @Get(':projectId/towers/:towerId/flats-progress')
  async getFlatProgressByTower(
    @Param('projectId') projectId: string,
    @Param('towerId') towerId: string,
  ) {
    return this.flatProgressService.getFlatProgressByTower(
      projectId,
      towerId,
    );
  }

  // Initialize all 5 phases for a flat
  @Post(':projectId/flats/:flatId/initialize')
  async initializeFlatPhases(
    @Param('projectId') projectId: string,
    @Param('flatId') flatId: string,
  ) {
    return this.flatProgressService.initializeFlatPhases(projectId, flatId);
  }

  // Calculate and update flat overall progress
  @Post('flats/:flatId/calculate-progress')
  async calculateProgress(
    @Param('flatId') flatId: string,
    @Query('projectId') projectId: string,
  ) {
    const overallProgress =
      await this.flatProgressService.updateFlatOverallProgress(
        flatId,
        projectId,
      );
    return { overallProgress };
  }

  // Get overall completion percentage for all flats in project
  @Get(':id/flats-completion')
  async getProjectFlatsCompletion(@Param('id') projectId: string) {
    const completion =
      await this.flatProgressService.getProjectFlatsCompletionPercentage(
        projectId,
      );
    return { completion };
  }

  // Delete flat progress record
  @Delete('flat-progress/:id')
  async deleteFlatProgress(@Param('id') id: string) {
    return this.flatProgressService.remove(id);
  }

  // Get all flat progress for a project
  @Get(':id/all-flat-progress')
  async getAllFlatProgress(@Param('id') projectId: string) {
    return this.flatProgressService.findByProject(projectId);
  }
}
