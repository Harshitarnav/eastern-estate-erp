import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ConstructionDevelopmentUpdate,
  DevelopmentUpdateCategory,
  DevelopmentUpdateScope,
} from './entities/construction-development-update.entity';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { UpdateDevelopmentUpdateDto } from './dto/update-development-update.dto';
import { ConstructionProject } from './entities/construction-project.entity';

export interface ScopedUpdateFilters {
  propertyId?: string;
  towerId?: string;
  scopeType?: DevelopmentUpdateScope;
  category?: DevelopmentUpdateCategory;
  limit?: number;
  offset?: number;
}

@Injectable()
export class DevelopmentUpdatesService {
  constructor(
    @InjectRepository(ConstructionDevelopmentUpdate)
    private readonly updatesRepo: Repository<ConstructionDevelopmentUpdate>,
    @InjectRepository(ConstructionProject)
    private readonly projectRepo: Repository<ConstructionProject>,
  ) {}

  async create(createDto: CreateDevelopmentUpdateDto, createdBy: string) {
    // Require either a project anchor, or a property (new path).
    if (!createDto.constructionProjectId && !createDto.propertyId) {
      throw new BadRequestException(
        'Either propertyId or constructionProjectId is required',
      );
    }

    // If propertyId missing but project present, derive property from project so
    // listing by property works uniformly.
    let propertyId = createDto.propertyId ?? null;
    if (!propertyId && createDto.constructionProjectId) {
      const project = await this.projectRepo.findOne({
        where: { id: createDto.constructionProjectId },
      });
      propertyId = project?.propertyId ?? null;
    }

    const update = this.updatesRepo.create({
      ...createDto,
      propertyId,
      scopeType: createDto.scopeType ?? null,
      category: createDto.category ?? null,
      towerId: createDto.towerId ?? null,
      commonAreaLabel: createDto.commonAreaLabel ?? null,
      constructionProjectId: createDto.constructionProjectId ?? null,
      updateDate: createDto.updateDate || new Date().toISOString().split('T')[0],
      createdBy,
    });

    return this.updatesRepo.save(update);
  }

  async findAll() {
    return this.updatesRepo.find({
      relations: ['constructionProject', 'creator', 'property', 'tower'],
      order: { updateDate: 'DESC' },
    });
  }

  // New scoped listing for property/tower/common-area feeds.
  async findScoped(
    filters: ScopedUpdateFilters,
    accessiblePropertyIds?: string[] | null,
  ) {
    const qb = this.updatesRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.creator', 'creator')
      .leftJoinAndSelect('u.property', 'property')
      .leftJoinAndSelect('u.tower', 'tower')
      .leftJoinAndSelect('u.constructionProject', 'cp')
      .orderBy('u.updateDate', 'DESC')
      .addOrderBy('u.createdAt', 'DESC');

    if (filters.propertyId) {
      qb.andWhere('u.property_id = :propertyId', { propertyId: filters.propertyId });
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      qb.andWhere('(u.property_id IS NULL OR u.property_id IN (:...accIds))', {
        accIds: accessiblePropertyIds,
      });
    }

    if (filters.towerId) {
      qb.andWhere('u.tower_id = :towerId', { towerId: filters.towerId });
    }
    if (filters.scopeType) {
      qb.andWhere('u.scope_type = :scopeType', { scopeType: filters.scopeType });
    }
    if (filters.category) {
      qb.andWhere('u.category = :category', { category: filters.category });
    }

    if (typeof filters.limit === 'number') qb.take(filters.limit);
    if (typeof filters.offset === 'number') qb.skip(filters.offset);

    return qb.getMany();
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
