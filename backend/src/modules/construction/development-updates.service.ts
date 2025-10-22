import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionDevelopmentUpdate } from './entities/construction-development-update.entity';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { UpdateDevelopmentUpdateDto } from './dto/update-development-update.dto';

@Injectable()
export class DevelopmentUpdatesService {
  constructor(
    @InjectRepository(ConstructionDevelopmentUpdate)
    private readonly updatesRepo: Repository<ConstructionDevelopmentUpdate>,
  ) {}

  async create(createDto: CreateDevelopmentUpdateDto, createdBy: string) {
    const update = this.updatesRepo.create({
      ...createDto,
      updateDate: createDto.updateDate || new Date().toISOString().split('T')[0],
      createdBy,
    });

    return this.updatesRepo.save(update);
  }

  async findAll() {
    return this.updatesRepo.find({
      relations: ['constructionProject', 'creator'],
      order: { updateDate: 'DESC' },
    });
  }

  async findByProject(projectId: string) {
    return this.updatesRepo.find({
      where: { constructionProjectId: projectId },
      relations: ['creator'],
      order: { updateDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const update = await this.updatesRepo.findOne({
      where: { id },
      relations: ['constructionProject', 'creator'],
    });

    if (!update) {
      throw new NotFoundException('Development update not found');
    }

    return update;
  }

  async update(id: string, updateDto: UpdateDevelopmentUpdateDto) {
    const update = await this.findOne(id);
    Object.assign(update, updateDto);
    return this.updatesRepo.save(update);
  }

  async remove(id: string) {
    const update = await this.findOne(id);
    return this.updatesRepo.remove(update);
  }

  // Add images to an existing update
  async addImages(id: string, imageUrls: string[]) {
    const update = await this.findOne(id);
    
    if (!Array.isArray(update.images)) {
      update.images = [];
    }

    update.images = [...update.images, ...imageUrls];
    return this.updatesRepo.save(update);
  }

  // Remove an image from an update
  async removeImage(id: string, imageUrl: string) {
    const update = await this.findOne(id);
    
    if (Array.isArray(update.images)) {
      update.images = update.images.filter((img) => img !== imageUrl);
      return this.updatesRepo.save(update);
    }

    return update;
  }

  // Add attachments to an existing update
  async addAttachments(id: string, attachmentUrls: string[]) {
    const update = await this.findOne(id);
    
    if (!Array.isArray(update.attachments)) {
      update.attachments = [];
    }

    update.attachments = [...update.attachments, ...attachmentUrls];
    return this.updatesRepo.save(update);
  }

  // Get recent updates (within last N days)
  async getRecentUpdates(projectId: string, days: number = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.updatesRepo
      .createQueryBuilder('update')
      .leftJoinAndSelect('update.creator', 'creator')
      .where('update.constructionProjectId = :projectId', { projectId })
      .andWhere('update.updateDate >= :dateThreshold', {
        dateThreshold: dateThreshold.toISOString().split('T')[0],
      })
      .orderBy('update.updateDate', 'DESC')
      .getMany();
  }

  // Get updates with images
  async getUpdatesWithImages(projectId: string) {
    return this.updatesRepo
      .createQueryBuilder('update')
      .leftJoinAndSelect('update.creator', 'creator')
      .where('update.constructionProjectId = :projectId', { projectId })
      .andWhere("jsonb_array_length(update.images) > 0")
      .orderBy('update.updateDate', 'DESC')
      .getMany();
  }

  // Get updates by visibility level
  async getUpdatesByVisibility(projectId: string, visibility: string) {
    return this.updatesRepo.find({
      where: {
        constructionProjectId: projectId,
        visibility: visibility as any,
      },
      relations: ['creator'],
      order: { updateDate: 'DESC' },
    });
  }

  // Get updates timeline (grouped by month)
  async getUpdatesTimeline(projectId: string) {
    const updates = await this.findByProject(projectId);

    // Group by month
    const grouped = updates.reduce((acc, update) => {
      const date = new Date(update.updateDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      
      acc[monthKey].push(update);
      return acc;
    }, {} as Record<string, ConstructionDevelopmentUpdate[]>);

    // Convert to array and sort
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, updates]) => ({
        month,
        updates,
        count: updates.length,
      }));
  }

  // Get statistics for project updates
  async getProjectUpdateStatistics(projectId: string) {
    const updates = await this.findByProject(projectId);

    return {
      totalUpdates: updates.length,
      updatesWithImages: updates.filter((u) => u.hasImages).length,
      updatesWithAttachments: updates.filter((u) => u.hasAttachments).length,
      recentUpdates: updates.filter((u) => u.isRecent).length,
      totalImages: updates.reduce((sum, u) => sum + u.imageCount, 0),
      totalAttachments: updates.reduce((sum, u) => sum + u.attachmentCount, 0),
    };
  }
}
