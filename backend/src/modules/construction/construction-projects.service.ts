import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTowerProgress } from './entities/construction-tower-progress.entity';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';

@Injectable()
export class ConstructionProjectsService {
  private readonly logger = new Logger(ConstructionProjectsService.name);

  constructor(
    @InjectRepository(ConstructionProject)
    private readonly constructionProjectRepository: Repository<ConstructionProject>,
    @InjectRepository(ConstructionTowerProgress)
    private readonly towerProgressRepository: Repository<ConstructionTowerProgress>,
    @InjectRepository(ConstructionFlatProgress)
    private readonly flatProgressRepository: Repository<ConstructionFlatProgress>,
  ) {}

  /**
   * Recompute `project.overallProgress` from the underlying phase rows.
   *
   * Preference order:
   *   1. Average of tower_progress.overallProgress (when towers are
   *      tracked - gives equal weight per tower)
   *   2. Average of flat_progress.overallProgress (fallback when the
   *      project tracks individual flats but not towers)
   *   3. Leave as-is (no rows to derive from)
   *
   * Called from the write paths for tower and flat progress so the
   * project-level number stays in sync without requiring an hourly
   * cron. Best-effort: errors are logged but never thrown.
   */
  async recomputeOverallProgress(projectId: string): Promise<number | null> {
    try {
      const towerAvg = await this.towerProgressRepository
        .createQueryBuilder('tp')
        .where('tp.construction_project_id = :projectId', { projectId })
        .select('AVG(tp.overall_progress)', 'avg')
        .addSelect('COUNT(*)', 'cnt')
        .getRawOne<{ avg: string | null; cnt: string }>();

      let avg: number | null = null;
      if (towerAvg && Number(towerAvg.cnt) > 0 && towerAvg.avg !== null) {
        avg = Number(towerAvg.avg);
      } else {
        const flatAvg = await this.flatProgressRepository
          .createQueryBuilder('fp')
          .where('fp.construction_project_id = :projectId', { projectId })
          .select('AVG(fp.overall_progress)', 'avg')
          .addSelect('COUNT(*)', 'cnt')
          .getRawOne<{ avg: string | null; cnt: string }>();
        if (flatAvg && Number(flatAvg.cnt) > 0 && flatAvg.avg !== null) {
          avg = Number(flatAvg.avg);
        }
      }

      if (avg === null) return null;
      const rounded = Math.round(avg * 100) / 100;
      await this.constructionProjectRepository.update(
        { id: projectId },
        { overallProgress: rounded },
      );
      return rounded;
    } catch (err: any) {
      this.logger.warn(
        `recomputeOverallProgress failed for project ${projectId}: ${err?.message}`,
      );
      return null;
    }
  }

  async create(createDto: CreateConstructionProjectDto): Promise<ConstructionProject> {
    const project = this.constructionProjectRepository.create({
      ...createDto,
      propertyId: createDto.propertyId ?? null,
      startDate: createDto.startDate ? new Date(createDto.startDate) : null,
      expectedCompletionDate: createDto.expectedCompletionDate 
        ? new Date(createDto.expectedCompletionDate) 
        : null,
    });

    return await this.constructionProjectRepository.save(project);
  }

  async findAll(propertyId?: string, accessiblePropertyIds?: string[] | null) {
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      where.propertyId = In(accessiblePropertyIds);
    }

    return await this.constructionProjectRepository.find({
      where,
      relations: ['property', 'projectManager'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ConstructionProject> {
    const project = await this.constructionProjectRepository.findOne({
      where: { id },
      relations: ['property', 'projectManager'],
    });

    if (!project) {
      throw new NotFoundException(`Construction Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProject> {
    const project = await this.findOne(id);

    Object.assign(project, updateDto);

    if (updateDto.propertyId !== undefined) {
      project.propertyId = updateDto.propertyId ?? null;
    }

    if (updateDto.startDate) {
      project.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.expectedCompletionDate) {
      project.expectedCompletionDate = new Date(updateDto.expectedCompletionDate);
    }

    return await this.constructionProjectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.constructionProjectRepository.remove(project);
  }

  async getByProperty(propertyId: string) {
    return await this.constructionProjectRepository.find({
      where: { propertyId },
      relations: ['projectManager'],
      order: { createdAt: 'DESC' },
    });
  }
}
