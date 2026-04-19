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
import { TowerProgressService } from './tower-progress.service';
import { CreateTowerProgressDto } from './dto/create-tower-progress.dto';
import { UpdateTowerProgressDto } from './dto/update-tower-progress.dto';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
import { ConstructionProjectsService } from './construction-projects.service';

@Controller('construction-projects')
export class TowerProgressController {
  constructor(
    private readonly towerProgressService: TowerProgressService,
    // Roll up tower phase changes to project.overallProgress so the
    // project cards don't drift from the raw phase data.
    private readonly projectsService: ConstructionProjectsService,
  ) {}

  // Create or update tower progress for a phase
  @Post(':projectId/towers/:towerId/progress')
  async createTowerProgress(
    @Param('projectId') projectId: string,
    @Param('towerId') towerId: string,
    @Body() createDto: CreateTowerProgressDto,
  ) {
    const saved = await this.towerProgressService.create({
      ...createDto,
      constructionProjectId: projectId,
      towerId,
    });
    this.projectsService.recomputeOverallProgress(projectId).catch(() => {});
    return saved;
  }

  // Update specific tower progress record
  @Put('tower-progress/:id')
  async updateTowerProgress(
    @Param('id') id: string,
    @Body() updateDto: UpdateTowerProgressDto,
  ) {
    const saved = await this.towerProgressService.update(id, updateDto);
    if (saved?.constructionProjectId) {
      this.projectsService
        .recomputeOverallProgress(saved.constructionProjectId)
        .catch(() => {});
    }
    return saved;
  }

  // Get all progress records for a specific tower
  @Get(':projectId/towers/:towerId/progress')
  async getTowerProgress(
    @Param('projectId') projectId: string,
    @Param('towerId') towerId: string,
    @Query('phase') phase?: ConstructionPhase,
  ) {
    if (phase) {
      return this.towerProgressService.findByTowerAndPhase(towerId, phase);
    }
    return this.towerProgressService.findByTower(towerId);
  }

  // Get progress for specific phase of a tower
  @Get(':projectId/towers/:towerId/progress/:phase')
  async getTowerPhaseProgress(
    @Param('towerId') towerId: string,
    @Param('phase') phase: ConstructionPhase,
  ) {
    return this.towerProgressService.findByTowerAndPhase(towerId, phase);
  }

  // Get tower progress summary for a project
  @Get(':id/tower-summary')
  async getTowerSummary(@Param('id') projectId: string) {
    return this.towerProgressService.getTowerProgressSummary(projectId);
  }

  // Initialize all 5 phases for a tower
  @Post(':projectId/towers/:towerId/initialize')
  async initializeTowerPhases(
    @Param('projectId') projectId: string,
    @Param('towerId') towerId: string,
  ) {
    return this.towerProgressService.initializeTowerPhases(projectId, towerId);
  }

  // Calculate and update tower overall progress
  @Post('towers/:towerId/calculate-progress')
  async calculateProgress(
    @Param('towerId') towerId: string,
    @Query('projectId') projectId: string,
  ) {
    const overallProgress =
      await this.towerProgressService.updateTowerOverallProgress(
        towerId,
        projectId,
      );
    return { overallProgress };
  }

  // Get overall completion percentage for all towers in project
  @Get(':id/towers-completion')
  async getProjectTowersCompletion(@Param('id') projectId: string) {
    const completion =
      await this.towerProgressService.getProjectTowersCompletionPercentage(
        projectId,
      );
    return { completion };
  }

  // Delete tower progress record
  @Delete('tower-progress/:id')
  async deleteTowerProgress(@Param('id') id: string) {
    return this.towerProgressService.remove(id);
  }

  // Get all tower progress for a project
  @Get(':id/all-tower-progress')
  async getAllTowerProgress(@Param('id') projectId: string) {
    return this.towerProgressService.findByProject(projectId);
  }
}
