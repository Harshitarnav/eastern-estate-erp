import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class DemandDraftsService {
  private readonly logger = new Logger(DemandDraftsService.name);

  constructor(
    @InjectRepository(DemandDraft)
    private readonly demandDraftRepository: Repository<DemandDraft>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(
    query: any,
    accessiblePropertyIds?: string[] | null,
  ): Promise<DemandDraft[]> {
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

    // Property scope: we derive the property from the draft's flat.
    // A join is only needed when filtering by property, so we gate it.
    const wantsPropertyScope =
      !!query.propertyId ||
      (accessiblePropertyIds && accessiblePropertyIds.length > 0);

    if (wantsPropertyScope) {
      queryBuilder.leftJoin('flats', 'flat', 'flat.id = draft.flatId');

      if (query.propertyId) {
        if (
          accessiblePropertyIds &&
          accessiblePropertyIds.length > 0 &&
          !accessiblePropertyIds.includes(query.propertyId)
        ) {
          queryBuilder.andWhere('1 = 0');
        } else {
          queryBuilder.andWhere('flat.property_id = :propertyId', {
            propertyId: query.propertyId,
          });
        }
      } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
        queryBuilder.andWhere(
          'flat.property_id IN (:...accessiblePropertyIds)',
          { accessiblePropertyIds },
        );
      }
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
    const saved = (await this.demandDraftRepository.save(draft)) as unknown as DemandDraft;

    // Notify the customer (best-effort)
    if (saved.customerId) {
      this.notifyCustomerOnDraftCreated(saved).catch(e =>
        this.logger.warn(`Failed to send demand draft notification: ${e.message}`),
      );
    }

    return saved;
  }

  private async notifyCustomerOnDraftCreated(draft: DemandDraft): Promise<void> {
    const customerUser = await this.userRepository.findOne({
      where: { customerId: draft.customerId },
      select: ['id'],
    });
    if (!customerUser) return;

    const amt = draft.amount
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency', currency: 'INR', maximumFractionDigits: 0,
        }).format(Number(draft.amount))
      : '';

    await this.notificationsService.create({
      userId: customerUser.id,
      title: 'Demand Draft Issued',
      message: `A demand draft${amt ? ` of ${amt}` : ''} has been generated${(draft as any).title ? ` for "${(draft as any).title}"` : ''}.`,
      type: NotificationType.INFO,
      category: NotificationCategory.PAYMENT,
      actionUrl: draft.bookingId ? `/portal/bookings/${draft.bookingId}` : '/portal/payments',
      actionLabel: 'View Details',
      relatedEntityId: draft.id,
      relatedEntityType: 'demand_draft',
    });
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
