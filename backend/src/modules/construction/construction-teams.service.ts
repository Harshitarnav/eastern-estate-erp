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

  async findByProject(constructionProjectId: string) {
    return await this.constructionTeamRepository.find({
      where: { constructionProjectId, isActive: true },
      relations: ['employee', 'constructionProject'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const team = await this.constructionTeamRepository.findOne({
      where: { id },
      relations: ['employee', 'constructionProject'],
    });

    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
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
  }
}
