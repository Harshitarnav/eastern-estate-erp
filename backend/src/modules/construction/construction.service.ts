import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import {
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  ConstructionProjectResponseDto,
  PaginatedConstructionProjectsResponse,
} from './dto';

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(ConstructionProject)
    private constructionRepository: Repository<ConstructionProject>,
  ) {}

  async create(createDto: CreateConstructionProjectDto): Promise<ConstructionProjectResponseDto> {
    const existing = await this.constructionRepository.findOne({
      where: { projectCode: createDto.projectCode },
    });

    if (existing) {
      throw new ConflictException('Project code already exists');
    }

    const project = this.constructionRepository.create(createDto);
    const savedProject = await this.constructionRepository.save(project);

    return ConstructionProjectResponseDto.fromEntity(savedProject);
  }

  async findAll(query: QueryConstructionProjectDto): Promise<PaginatedConstructionProjectsResponse> {
    const {
      search,
      projectPhase,
      projectStatus,
      propertyId,
      towerId,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.constructionRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.property', 'property')
      .leftJoinAndSelect('project.tower', 'tower');

    if (search) {
      queryBuilder.andWhere(
        '(project.projectCode ILIKE :search OR project.projectName ILIKE :search OR project.mainContractorName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (projectPhase) {
      queryBuilder.andWhere('project.projectPhase = :projectPhase', { projectPhase });
    }

    if (projectStatus) {
      queryBuilder.andWhere('project.projectStatus = :projectStatus', { projectStatus });
    }

    if (propertyId) {
      queryBuilder.andWhere('project.propertyId = :propertyId', { propertyId });
    }

    if (towerId) {
      queryBuilder.andWhere('project.towerId = :towerId', { towerId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('project.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`project.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const projects = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: ConstructionProjectResponseDto.fromEntities(projects),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ConstructionProjectResponseDto> {
    const project = await this.constructionRepository.findOne({
      where: { id },
      relations: ['property', 'tower'],
    });

    if (!project) {
      throw new NotFoundException(`Construction project with ID ${id} not found`);
    }

    return ConstructionProjectResponseDto.fromEntity(project);
  }

  async update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProjectResponseDto> {
    const project = await this.constructionRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Construction project with ID ${id} not found`);
    }

    if (updateDto.projectCode && updateDto.projectCode !== project.projectCode) {
      const existing = await this.constructionRepository.findOne({
        where: { projectCode: updateDto.projectCode },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Project code already exists');
      }
    }

    Object.assign(project, updateDto);
    const updatedProject = await this.constructionRepository.save(project);

    return ConstructionProjectResponseDto.fromEntity(updatedProject);
  }

  async remove(id: string): Promise<void> {
    const project = await this.constructionRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Construction project with ID ${id} not found`);
    }

    project.isActive = false;
    await this.constructionRepository.save(project);
  }

  async updateProgress(id: string, phase: string, progress: number): Promise<ConstructionProjectResponseDto> {
    const project = await this.constructionRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Construction project with ID ${id} not found`);
    }

    // Update specific phase progress
    const phaseMap: any = {
      PLANNING: 'planningProgress',
      SITE_PREPARATION: 'sitePrepProgress',
      FOUNDATION: 'foundationProgress',
      STRUCTURE: 'structureProgress',
      MASONRY: 'masonryProgress',
      ROOFING: 'roofingProgress',
      PLUMBING: 'plumbingProgress',
      ELECTRICAL: 'electricalProgress',
      PLASTERING: 'plasteringProgress',
      FLOORING: 'flooringProgress',
      PAINTING: 'paintingProgress',
      FINISHING: 'finishingProgress',
      LANDSCAPING: 'landscapingProgress',
    };

    if (phaseMap[phase]) {
      project[phaseMap[phase]] = progress;
    }

    // Calculate overall progress (average of all phases)
    const phases = [
      project.planningProgress,
      project.sitePrepProgress,
      project.foundationProgress,
      project.structureProgress,
      project.masonryProgress,
      project.roofingProgress,
      project.plumbingProgress,
      project.electricalProgress,
      project.plasteringProgress,
      project.flooringProgress,
      project.paintingProgress,
      project.finishingProgress,
      project.landscapingProgress,
    ];

    const totalProgress = phases.reduce((sum, val) => sum + Number(val), 0);
    project.overallProgress = totalProgress / phases.length;

    const updatedProject = await this.constructionRepository.save(project);
    return ConstructionProjectResponseDto.fromEntity(updatedProject);
  }

  async getStatistics() {
    const projects = await this.constructionRepository.find({ where: { isActive: true } });

    const total = projects.length;
    const notStarted = projects.filter((p) => p.projectStatus === 'NOT_STARTED').length;
    const inProgress = projects.filter((p) => p.projectStatus === 'IN_PROGRESS').length;
    const onHold = projects.filter((p) => p.projectStatus === 'ON_HOLD').length;
    const delayed = projects.filter((p) => p.projectStatus === 'DELAYED').length;
    const completed = projects.filter((p) => p.projectStatus === 'COMPLETED').length;

    const totalBudget = projects.reduce((sum, p) => sum + Number(p.estimatedBudget), 0);
    const totalCost = projects.reduce((sum, p) => sum + Number(p.actualCost), 0);
    const totalDelayDays = projects.reduce((sum, p) => sum + p.delayDays, 0);

    const avgProgress = total > 0 
      ? projects.reduce((sum, p) => sum + Number(p.overallProgress), 0) / total 
      : 0;

    const byPhase = {
      planning: projects.filter((p) => p.projectPhase === 'PLANNING').length,
      foundation: projects.filter((p) => p.projectPhase === 'FOUNDATION').length,
      structure: projects.filter((p) => p.projectPhase === 'STRUCTURE').length,
      finishing: projects.filter((p) => p.projectPhase === 'FINISHING').length,
      completed: projects.filter((p) => p.projectPhase === 'COMPLETED').length,
    };

    return {
      total,
      notStarted,
      inProgress,
      onHold,
      delayed,
      completed,
      totalBudget,
      totalCost,
      budgetVariance: totalCost - totalBudget,
      totalDelayDays,
      avgProgress,
      byPhase,
      onTimeRate: total > 0 ? ((total - delayed) / total) * 100 : 0,
    };
  }
}
