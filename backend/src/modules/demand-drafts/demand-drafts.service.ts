import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraft } from './entities/demand-draft.entity';

@Injectable()
export class DemandDraftsService {
  constructor(
    @InjectRepository(DemandDraft)
    private readonly demandDraftRepository: Repository<DemandDraft>,
  ) {}

  async findAll(query: any): Promise<DemandDraft[]> {
    const queryBuilder = this.demandDraftRepository.createQueryBuilder('draft');

    if (query.flatId) {
      queryBuilder.andWhere('draft.flatId = :flatId', { flatId: query.flatId });
    }
    if (query.customerId) {
      queryBuilder.andWhere('draft.customerId = :customerId', { customerId: query.customerId });
    }
    if (query.bookingId) {
      queryBuilder.andWhere('draft.bookingId = :bookingId', { bookingId: query.bookingId });
    }
    if (query.status) {
      queryBuilder.andWhere('draft.status = :status', { status: query.status });
    }
    if (query.requiresReview !== undefined) {
      queryBuilder.andWhere('draft.requiresReview = :requiresReview', {
        requiresReview: query.requiresReview === 'true',
      });
    }

    queryBuilder.orderBy('draft.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<DemandDraft> {
    const draft = await this.demandDraftRepository.findOne({ where: { id } });
    if (!draft) {
      throw new NotFoundException(`Demand draft with ID ${id} not found`);
    }
    return draft;
  }

  async create(createDto: any, userId: string): Promise<DemandDraft> {
    const draft = this.demandDraftRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.demandDraftRepository.save(draft);
    return saved as unknown as DemandDraft;
  }

  async update(id: string, updateDto: any, userId: string): Promise<DemandDraft> {
    const draft = await this.findOne(id);
    
    for (const key in updateDto) {
      if (updateDto.hasOwnProperty(key)) {
        draft[key] = updateDto[key];
      }
    }
    draft.updatedBy = userId;
    
    return this.demandDraftRepository.save(draft);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.demandDraftRepository.delete(id);
  }
}
