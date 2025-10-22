import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionTowerProgress, ConstructionPhase } from './entities/construction-tower-progress.entity';
import { CreateTowerProgressDto } from './dto/create-tower-progress.dto';
import { UpdateTowerProgressDto } from './dto/update-tower-progress.dto';

@Injectable()
export class TowerProgressService {
  constructor(
    @InjectRepository(ConstructionTowerProgress)
    private readonly towerProgressRepo: Repository<ConstructionTowerProgress>,
  ) {}

  async create(createDto: CreateTowerProgressDto) {
    const progress = this.towerProgressRepo.create(createDto);
    return this.towerProgressRepo.save(progress);
  }

  async findAll() {
    return this.towerProgressRepo.find({
      relations: ['constructionProject', 'tower'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: string) {
    return this.towerProgressRepo.find({
      where: { constructionProjectId: projectId },
      relations: ['tower'],
      order: { phase: 'ASC' },
    });
  }

  async findByTower(towerId: string) {
    return this.towerProgressRepo.find({
      where: { towerId },
      relations: ['constructionProject'],
      order: { phase: 'ASC' },
    });
  }

  async findByTowerAndPhase(towerId: string, phase?: ConstructionPhase) {
    if (phase) {
      return this.towerProgressRepo.findOne({
        where: { towerId, phase },
        relations: ['constructionProject', 'tower'],
      });
    }
    return this.findByTower(towerId);
  }

  async findOne(id: string) {
    const progress = await this.towerProgressRepo.findOne({
      where: { id },
      relations: ['constructionProject', 'tower'],
    });

    if (!progress) {
      throw new NotFoundException('Tower progress record not found');
    }

    return progress;
  }

  async update(id: string, updateDto: UpdateTowerProgressDto) {
    const progress = await this.findOne(id);
    Object.assign(progress, updateDto);
    return this.towerProgressRepo.save(progress);
  }

  async remove(id: string) {
    const progress = await this.findOne(id);
    return this.towerProgressRepo.remove(progress);
  }

  // Calculate overall tower progress based on all phases
  async calculateTowerOverallProgress(towerId: string, projectId: string): Promise<number> {
    const phases = await this.towerProgressRepo.find({
      where: { towerId, constructionProjectId: projectId },
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

  // Update overall progress for a tower
  async updateTowerOverallProgress(towerId: string, projectId: string) {
    const overallProgress = await this.calculateTowerOverallProgress(towerId, projectId);
    
    // Update all phase records for this tower with the new overall progress
    await this.towerProgressRepo
      .createQueryBuilder()
      .update(ConstructionTowerProgress)
      .set({ overallProgress })
      .where('towerId = :towerId', { towerId })
      .andWhere('constructionProjectId = :projectId', { projectId })
      .execute();

    return overallProgress;
  }

  // Get tower progress summary for a project
  async getTowerProgressSummary(projectId: string) {
    const progressRecords = await this.towerProgressRepo
      .createQueryBuilder('tp')
      .leftJoinAndSelect('tp.tower', 'tower')
      .where('tp.constructionProjectId = :projectId', { projectId })
      .select([
        'tower.id as towerId',
        'tower.name as towerName',
        'AVG(tp.overallProgress) as averageProgress',
        'COUNT(DISTINCT tp.phase) as phasesStarted',
        'COUNT(CASE WHEN tp.status = \'COMPLETED\' THEN 1 END) as phasesCompleted',
      ])
      .groupBy('tower.id')
      .addGroupBy('tower.name')
      .getRawMany();

    return progressRecords;
  }

  // Initialize all phases for a tower in a project
  async initializeTowerPhases(projectId: string, towerId: string) {
    const phases: ConstructionPhase[] = [
      ConstructionPhase.FOUNDATION,
      ConstructionPhase.STRUCTURE,
      ConstructionPhase.MEP,
      ConstructionPhase.FINISHING,
      ConstructionPhase.HANDOVER,
    ];

    const progressRecords = phases.map((phase) =>
      this.towerProgressRepo.create({
        constructionProjectId: projectId,
        towerId,
        phase,
        phaseProgress: 0,
        overallProgress: 0,
        status: 'NOT_STARTED' as any,
      }),
    );

    return this.towerProgressRepo.save(progressRecords);
  }

  // Get completion percentage for all towers in a project
  async getProjectTowersCompletionPercentage(projectId: string): Promise<number> {
    const result = await this.towerProgressRepo
      .createQueryBuilder('tp')
      .where('tp.constructionProjectId = :projectId', { projectId })
      .select('AVG(tp.overallProgress)', 'avgProgress')
      .getRawOne();

    return result?.avgProgress ? parseFloat(result.avgProgress) : 0;
  }
}
