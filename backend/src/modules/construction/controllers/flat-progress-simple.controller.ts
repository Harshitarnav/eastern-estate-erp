import { Controller, Get, Post, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatProgressService } from '../flat-progress.service';
import { CreateFlatProgressDto } from '../dto/create-flat-progress.dto';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { ConstructionWorkflowService } from '../services/construction-workflow.service';

interface SimpleFlatProgressDto {
  flatId: string;
  phase: string;
  phaseProgress?: number;
  overallProgress?: number;
  status?: string;
  notes?: string;
}

@Controller('construction/flat-progress')
export class FlatProgressSimpleController {
  constructor(
    private readonly flatProgressService: FlatProgressService,
    private readonly workflowService: ConstructionWorkflowService,
    @InjectRepository(Flat)
    private flatRepository: Repository<Flat>,
    @InjectRepository(ConstructionProject)
    private constructionProjectRepository: Repository<ConstructionProject>,
  ) {}

  // Get all progress records for a flat
  @Get('flat/:flatId')
  async getFlatProgress(@Param('flatId') flatId: string) {
    return this.flatProgressService.findByFlat(flatId);
  }

  // Create or update flat progress record (simplified - auto-finds or creates constructionProject)
  @Post()
  async createFlatProgress(@Body() dto: SimpleFlatProgressDto) {
    // Find the flat to get its property
    const flat = await this.flatRepository.findOne({
      where: { id: dto.flatId },
      relations: ['property'],
    });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${dto.flatId} not found`);
    }

    if (!flat.propertyId) {
      throw new BadRequestException('Flat must be associated with a property');
    }

    // Try to find an existing construction project for this property
    let constructionProject = await this.constructionProjectRepository.findOne({
      where: { propertyId: flat.propertyId },
      order: { createdAt: 'DESC' },
    });

    // If no project exists, create a default one
    if (!constructionProject) {
      const today = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(today.getFullYear() + 1);

      constructionProject = this.constructionProjectRepository.create({
        projectName: `${flat.property?.name || 'Property'} - Construction`,
        propertyId: flat.propertyId,
        status: 'IN_PROGRESS',
        startDate: today,
        expectedCompletionDate: oneYearLater,
        overallProgress: 0,
        budgetAllocated: 0,
        budgetSpent: 0,
      });
      constructionProject = await this.constructionProjectRepository.save(constructionProject);
    }

    // Check if a progress record already exists for this flat and phase
    const existingProgress = await this.flatProgressService.findByFlatAndPhase(
      dto.flatId,
      dto.phase as any, // Phase is always provided, so this will return a single object or null
    );

    let savedProgress;

    if (existingProgress && !Array.isArray(existingProgress)) {
      // Update existing record
      savedProgress = await this.flatProgressService.update(existingProgress.id, {
        phaseProgress: dto.phaseProgress,
        overallProgress: dto.overallProgress,
        status: dto.status as any,
        notes: dto.notes,
      });
    } else {
      // Create new record
      const createDto: CreateFlatProgressDto = {
        ...dto,
        constructionProjectId: constructionProject.id,
      } as CreateFlatProgressDto;

      savedProgress = await this.flatProgressService.create(createDto);
    }

    // Trigger automated workflow: update flat, check milestones, generate demand drafts
    try {
      await this.workflowService.processConstructionUpdate(
        dto.flatId,
        dto.phase,
        dto.phaseProgress || 0,
        dto.overallProgress || 0,
      );
    } catch (error) {
      // Log error but don't fail the request - progress was saved successfully
      console.error('Error in automated workflow:', error);
    }

    return savedProgress;
  }
}
