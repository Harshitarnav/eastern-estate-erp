import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionTeam } from './entities/construction-team.entity';

@Injectable()
export class ConstructionTeamsService {
  constructor(
    @InjectRepository(ConstructionTeam)
    private readonly constructionTeamRepository: Repository<ConstructionTeam>,
  ) {}

  async create(createDto: any) {
    const team = this.constructionTeamRepository.create(createDto);
    return await this.constructionTeamRepository.save(team);
  }

  async findAll(filters?: { constructionProjectId?: string; propertyId?: string }) {
    const where: any = { isActive: true };
    if (filters?.constructionProjectId) where.constructionProjectId = filters.constructionProjectId;
    if (filters?.propertyId) where.propertyId = filters.propertyId;

    return await this.constructionTeamRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionTeamRepository.find({
      where: { constructionProjectId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const team = await this.constructionTeamRepository.findOne({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, updateDto: any) {
    const team = await this.findOne(id);
    Object.assign(team, updateDto);
    return await this.constructionTeamRepository.save(team);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    team.isActive = false;
    await this.constructionTeamRepository.save(team);
    return { success: true };
  }
}
