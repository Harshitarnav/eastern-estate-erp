import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProgressLog, ShiftType } from './entities/construction-progress-log.entity';
import { ConstructionProject } from './entities/construction-project.entity';

@Injectable()
export class ConstructionProgressLogsService {
  constructor(
    @InjectRepository(ConstructionProgressLog)
    private readonly constructionProgressLogRepository: Repository<ConstructionProgressLog>,
    @InjectRepository(ConstructionProject)
    private readonly constructionProjectRepository: Repository<ConstructionProject>,
  ) {}

  async create(createDto: any) {
    let propertyId = createDto.propertyId || null;

    // Auto-derive propertyId from the linked construction project
    if (!propertyId && createDto.constructionProjectId) {
      const project = await this.constructionProjectRepository.findOne({
        where: { id: createDto.constructionProjectId },
        select: ['id', 'propertyId'],
      });
      if (project?.propertyId) {
        propertyId = project.propertyId;
      }
    }

    // Map frontend field names to entity field names
    const log = this.constructionProgressLogRepository.create({
      constructionProjectId: createDto.constructionProjectId || null,
      propertyId,
      towerId: createDto.towerId || null,
      logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
      progressType: createDto.progressType || null,
      // Map workCompleted → description (new modal field name)
      description: createDto.description || createDto.workCompleted || null,
      progressPercentage: createDto.progressPercentage ?? null,
      weatherCondition: createDto.weatherCondition || null,
      temperature: createDto.temperature ?? null,
      loggedBy: createDto.loggedBy || null,
      photos: createDto.photos || [],
      // New project-based daily log fields
      shift: (createDto.shift as ShiftType) || null,
      workersPresent: createDto.workersPresent != null ? Number(createDto.workersPresent) : null,
      workersAbsent: createDto.workersAbsent != null ? Number(createDto.workersAbsent) : null,
      materialsUsed: createDto.materialsUsed || null,
      issuesDelays: createDto.issuesDelays || null,
      supervisorName: createDto.supervisorName || null,
      nextDayPlan: createDto.nextDayPlan || null,
      remarks: createDto.remarks || null,
    });

    return await this.constructionProgressLogRepository.save(log);
  }

  async findAll(filters?: { constructionProjectId?: string; propertyId?: string }) {
    const where: any = {};
    if (filters?.constructionProjectId) where.constructionProjectId = filters.constructionProjectId;
    if (filters?.propertyId) where.propertyId = filters.propertyId;

    return await this.constructionProgressLogRepository.find({
      where: Object.keys(where).length ? where : undefined,
      order: { logDate: 'DESC', createdAt: 'DESC' },
      take: 200,
    });
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.find({
      where: { constructionProjectId },
      order: { logDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const log = await this.constructionProgressLogRepository.findOne({
      where: { id },
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
    return { success: true };
  }

  async getLatestByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.findOne({
      where: { constructionProjectId },
      order: { logDate: 'DESC' },
    });
  }

  /** Append new photo URLs to a log's photos JSONB array */
  async addPhotos(id: string, urls: string[]): Promise<ConstructionProgressLog> {
    const log = await this.findOne(id);
    const existing: string[] = Array.isArray(log.photos) ? log.photos : [];
    log.photos = [...existing, ...urls];
    return await this.constructionProgressLogRepository.save(log);
  }

  /** Remove a single photo URL from a log's photos array */
  async removePhoto(id: string, photoUrl: string): Promise<ConstructionProgressLog> {
    const log = await this.findOne(id);
    const existing: string[] = Array.isArray(log.photos) ? log.photos : [];
    log.photos = existing.filter(u => u !== photoUrl);
    return await this.constructionProgressLogRepository.save(log);
  }
}
