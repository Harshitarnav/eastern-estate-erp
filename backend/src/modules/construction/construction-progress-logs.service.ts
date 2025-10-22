import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';

@Injectable()
export class ConstructionProgressLogsService {
  constructor(
    @InjectRepository(ConstructionProgressLog)
    private readonly constructionProgressLogRepository: Repository<ConstructionProgressLog>,
  ) {}

  async create(createDto: any) {
    const log = this.constructionProgressLogRepository.create({
      ...createDto,
      logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
    });
    return await this.constructionProgressLogRepository.save(log);
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.find({
      where: { constructionProjectId },
      relations: ['constructionProject', 'loggedBy'],
      order: { logDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const log = await this.constructionProgressLogRepository.findOne({
      where: { id },
      relations: ['constructionProject', 'loggedBy'],
    });

    if (!log) {
      throw new NotFoundException(`Progress log with ID ${id} not found`);
    }

    return log;
  }

  async update(id: string, updateDto: any) {
    const log = await this.findOne(id);
    Object.assign(log, updateDto);
    
    if (updateDto.logDate) {
      log.logDate = new Date(updateDto.logDate);
    }
    
    return await this.constructionProgressLogRepository.save(log);
  }

  async remove(id: string) {
    const log = await this.findOne(id);
    await this.constructionProgressLogRepository.remove(log);
  }

  async getLatestByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.findOne({
      where: { constructionProjectId },
      relations: ['loggedBy'],
      order: { logDate: 'DESC' },
    });
  }
}
