import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
import { CreateFlatProgressDto } from './dto/create-flat-progress.dto';
import { UpdateFlatProgressDto } from './dto/update-flat-progress.dto';

@Injectable()
export class FlatProgressService {
  constructor(
    @InjectRepository(ConstructionFlatProgress)
    private readonly flatProgressRepo: Repository<ConstructionFlatProgress>,
  ) {}

  async create(createDto: CreateFlatProgressDto) {
    const progress = this.flatProgressRepo.create(createDto);
    return this.flatProgressRepo.save(progress);
  }

  async findAll() {
    return this.flatProgressRepo.find({
      relations: ['constructionProject', 'flat'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: string) {
    return this.flatProgressRepo.find({
      where: { constructionProjectId: projectId },
      relations: ['flat', 'flat.tower'],
      order: { phase: 'ASC' },
    });
  }

  async findByFlat(flatId: string) {
    return this.flatProgressRepo.find({
      where: { flatId },
      relations: ['constructionProject'],
      order: { phase: 'ASC' },
    });
  }

  async findByFlatAndPhase(flatId: string, phase?: ConstructionPhase) {
    if (phase) {
      return this.flatProgressRepo.findOne({
        where: { flatId, phase },
        relations: ['constructionProject', 'flat'],
      });
    }
    return this.findByFlat(flatId);
  }

  async findOne(id: string) {
    const progress = await this.flatProgressRepo.findOne({
      where: { id },
      relations: ['constructionProject', 'flat', 'flat.tower'],
    });

    if (!progress) {
      throw new NotFoundException('Flat progress record not found');
    }

    return progress;
  }

  async update(id: string, updateDto: UpdateFlatProgressDto) {
    const progress = await this.findOne(id);
    Object.assign(progress, updateDto);
    return this.flatProgressRepo.save(progress);
  }

  async remove(id: string) {
    const progress = await this.findOne(id);
    return this.flatProgressRepo.remove(progress);
  }

  // Calculate overall flat progress based on all phases
  async calculateFlatOverallProgress(flatId: string, projectId: string): Promise<number> {
    const phases = await this.flatProgressRepo.find({
      where: { flatId, constructionProjectId: projectId },
    });

    if (phases.length === 0) {
      return 0;
    }

    // Each phase has equal weight (20% for 5 phases)
    const phaseWeight = 100 / 5;
    const totalProgress = phases.reduce(
      (sum, phase) => sum + (phase.phaseProgress * phaseWeight / 100),
      0
    );

    return Math.round(totalProgress * 100) / 100; // Round to 2 decimal places
  }

  // Update overall progress for a flat
  async updateFlatOverallProgress(flatId: string, projectId: string) {
    const overallProgress = await this.calculateFlatOverallProgress(flatId, projectId);
    
    // Update all phase records for this flat with the new overall progress
    await this.flatProgressRepo
      .createQueryBuilder()
      .update(ConstructionFlatProgress)
      .set({ overallProgress })
      .where('flatId = :flatId', { flatId })
      .andWhere('constructionProjectId = :projectId', { projectId })
      .execute();

    return overallProgress;
  }

  // Get flat progress summary for a project
  async getFlatProgressSummary(projectId: string) {
    const progressRecords = await this.flatProgressRepo
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.flat', 'flat')
      .leftJoinAndSelect('flat.tower', 'tower')
      .where('fp.constructionProjectId = :projectId', { projectId })
      .select([
        'flat.id as flatId',
        'flat.flatNumber as flatNumber',
        'tower.name as towerName',
        'AVG(fp.overallProgress) as averageProgress',
        'COUNT(DISTINCT fp.phase) as phasesStarted',
        'COUNT(CASE WHEN fp.status = \'COMPLETED\' THEN 1 END) as phasesCompleted',
      ])
      .groupBy('flat.id')
      .addGroupBy('flat.flatNumber')
      .addGroupBy('tower.name')
      .getRawMany();

    return progressRecords;
  }

  // Initialize all phases for a flat in a project
  async initializeFlatPhases(projectId: string, flatId: string) {
    const phases: ConstructionPhase[] = [
      ConstructionPhase.FOUNDATION,
      ConstructionPhase.STRUCTURE,
      ConstructionPhase.MEP,
      ConstructionPhase.FINISHING,
      ConstructionPhase.HANDOVER,
    ];

    const progressRecords = phases.map((phase) =>
      this.flatProgressRepo.create({
        constructionProjectId: projectId,
        flatId,
        phase,
        phaseProgress: 0,
        overallProgress: 0,
        status: 'NOT_STARTED' as any,
      }),
    );

    return this.flatProgressRepo.save(progressRecords);
  }

  // Get completion percentage for all flats in a project
  async getProjectFlatsCompletionPercentage(projectId: string): Promise<number> {
    const result = await this.flatProgressRepo
      .createQueryBuilder('fp')
      .where('fp.constructionProjectId = :projectId', { projectId })
      .select('AVG(fp.overallProgress)', 'avgProgress')
      .getRawOne();

    return result?.avgProgress ? parseFloat(result.avgProgress) : 0;
  }

  // Get flats ready for handover in a project
  async getFlatsReadyForHandover(projectId: string) {
    return this.flatProgressRepo
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.flat', 'flat')
      .where('fp.constructionProjectId = :projectId', { projectId })
      .andWhere('fp.phase = :handoverPhase', { handoverPhase: ConstructionPhase.HANDOVER })
      .andWhere('fp.phaseProgress = 100')
      .andWhere('fp.status = :completed', { completed: 'COMPLETED' })
      .getMany();
  }

  // Get flats by tower in a project
  async getFlatProgressByTower(projectId: string, towerId: string) {
    return this.flatProgressRepo
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.flat', 'flat')
      .where('fp.constructionProjectId = :projectId', { projectId })
      .andWhere('flat.towerId = :towerId', { towerId })
      .orderBy('flat.flatNumber', 'ASC')
      .addOrderBy('fp.phase', 'ASC')
      .getMany();
  }
}
