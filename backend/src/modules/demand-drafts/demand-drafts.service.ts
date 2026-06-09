import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraft, DemandDraftStatus } from './entities/demand-draft.entity';
import { User } from '../users/entities/user.entity';
import { Flat } from '../flats/entities/flat.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';
import { appendCollectionsActivityPayload } from '../../common/utils/collections-dd-activity.util';
import { buildDemandDraftHtml } from '../../common/utils/demand-draft-html.builder';

type TaggedItem = { label: string; amount: number };
const fmtINR = (n: number) =>
  (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-IN');
const sumTagged = (items?: TaggedItem[]) =>
  (items ?? []).reduce((s, i) => s + (Number(i?.amount) || 0), 0);

@Injectable()
export class DemandDraftsService {
  private readonly logger = new Logger(DemandDraftsService.name);

  constructor(
    @InjectRepository(DemandDraft)
    private readonly demandDraftRepository: Repository<DemandDraft>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * For the DD review screen: return the flat's misc line-items with a flag
   * showing which are already attached to ANOTHER demand draft of the same
   * booking (so the CRM only allocates each misc charge once). Items already
   * on THIS draft are marked allocatedHere so they stay ticked.
   */
  async getAvailableMisc(ddId: string): Promise<{
    items: Array<{ label: string; amount: number; allocatedElsewhere: boolean; allocatedHere: boolean }>;
  }> {
    const dd = await this.findOne(ddId);
    if (!dd.flatId) return { items: [] };

    const flat = await this.flatRepository.findOne({ where: { id: dd.flatId } });
    const master = (flat?.miscBreakdown ?? []) as Array<{ label: string; amount: number }>;
    if (!master.length) return { items: [] };

    // Sibling DDs of the same booking (or flat) that already carry misc items.
    const siblings = await this.demandDraftRepository.find({
      where: dd.bookingId ? { bookingId: dd.bookingId } : { flatId: dd.flatId },
    });

    const elsewhere = new Set<string>();
    const here = new Set<string>();
    for (const s of siblings) {
      const items = (s.miscBreakdown ?? []) as Array<{ label: string; amount: number }>;
      for (const it of items) {
        if (s.id === ddId) here.add(it.label);
        else elsewhere.add(it.label);
      }
    }

    return {
      items: master.map((m) => ({
        label: m.label,
        amount: Number(m.amount) || 0,
        allocatedElsewhere: elsewhere.has(m.label),
        allocatedHere: here.has(m.label),
      })),
    };
  }

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

    const tracked = ['title', 'amount', 'dueDate', 'content'] as const;
    const changed: string[] = [];

    const unchanged = (key: (typeof tracked)[number], newVal: unknown): boolean => {
      const oldVal = (draft as any)[key];
      if (newVal === undefined) return true;
      if (key === 'dueDate') {
        const a =
          newVal == null || newVal === ''
            ? ''
            : new Date(newVal as string).toISOString().slice(0, 10);
        const b =
          oldVal == null ? '' : new Date(oldVal as Date).toISOString().slice(0, 10);
        return a === b;
      }
      if (key === 'amount') {
        return Number(newVal) === Number(oldVal);
      }
      return String(newVal ?? '') === String(oldVal ?? '');
    };

    for (const key of tracked) {
      if (!(key in updateDto) || updateDto[key] === undefined) continue;
      if (!unchanged(key, updateDto[key])) changed.push(key);
    }

    for (const key in updateDto) {
      if (updateDto.hasOwnProperty(key)) {
        draft[key] = updateDto[key];
      }
    }

    // When the category split is edited on the review screen, keep the
    // grand total (amount) consistent with primary + misc + tax. We only
    // recompute if at least one category field was part of this update and
    // the caller did not send an explicit amount.
    const touchedCategory =
      'primaryAmount' in updateDto ||
      'miscAmount' in updateDto ||
      'taxAmount' in updateDto ||
      'miscBreakdown' in updateDto ||
      'taxBreakdown' in updateDto;
    if (touchedCategory) {
      // Keep each category total in lock-step with its tagged breakdown so
      // the H1 invariant (sum(breakdown) === category total) always holds.
      if ((draft.miscBreakdown ?? []).length) {
        draft.miscAmount = sumTagged(draft.miscBreakdown as TaggedItem[]);
      }
      if ((draft.taxBreakdown ?? []).length) {
        draft.taxAmount = sumTagged(draft.taxBreakdown as TaggedItem[]);
      }
      // Recompute the grand total (incl. any arrears) unless the caller sent
      // an explicit amount.
      if (updateDto.amount === undefined) {
        const p = Number(draft.primaryAmount) || 0;
        const m = Number(draft.miscAmount) || 0;
        const t = Number(draft.taxAmount) || 0;
        const arr =
          (Number(draft.arrearsPrimary) || 0) +
          (Number(draft.arrearsMisc) || 0) +
          (Number(draft.arrearsTax) || 0);
        draft.amount = p + m + t + arr;
      }
      // The customer-facing HTML must reflect the edited split, otherwise the
      // PDF/email still shows the original primary-only amount (H3). Skip if the
      // caller sent its own content in this same update.
      if (!('content' in updateDto)) {
        this.rebuildContentFromTemplateData(draft);
      }
    }

    draft.updatedBy = userId;

    if (changed.length) {
      draft.metadata = appendCollectionsActivityPayload(
        draft.metadata as Record<string, unknown>,
        {
          kind: 'edit',
          label: 'Draft edited',
          detail: `Updated fields: ${changed.join(', ')}`,
          by: userId,
        },
      );
    }

    return this.demandDraftRepository.save(draft);
  }

  /**
   * Re-render the canonical demand-draft HTML from the draft's stored
   * templateData plus its current category split, so an edit on the review
   * screen is reflected in the PDF/email the customer receives.
   *
   * Skipped when a DB template was used (templateId set) — that content came
   * from the template engine, not the canonical builder, and re-rendering it
   * needs the template service, not this path. Best-effort: a render failure
   * must never block the save.
   */
  private rebuildContentFromTemplateData(draft: DemandDraft): void {
    if ((draft as any).templateId) return;
    const td = (draft.templateData ?? {}) as Record<string, any>;
    if (!td || !td.refNumber) return;
    try {
      const miscItems = (draft.miscBreakdown ?? []) as TaggedItem[];
      const taxItems = (draft.taxBreakdown ?? []) as TaggedItem[];
      const primary = Number(draft.primaryAmount) || 0;
      const misc = Number(draft.miscAmount) || 0;
      const tax = Number(draft.taxAmount) || 0;
      draft.content = buildDemandDraftHtml({
        refNumber: td.refNumber,
        dateIssued: td.dateIssued ?? '',
        customerName: td.customerName ?? '',
        customerEmail: td.customerEmail || undefined,
        customerPhone: td.customerPhone || undefined,
        propertyName: td.propertyName ?? '',
        towerName: td.towerName || undefined,
        flatNumber: td.flatNumber ?? '',
        bookingNumber: td.bookingNumber || undefined,
        milestoneSeq: td.milestoneSeq ?? '',
        milestoneName: td.milestoneName ?? '',
        milestoneDescription: td.milestoneDescription || undefined,
        constructionPhase: td.constructionPhase || undefined,
        phasePercentage: td.phasePercentage ?? undefined,
        primaryAmount: primary > 0 ? fmtINR(primary) : undefined,
        miscAmount: misc > 0 ? fmtINR(misc) : undefined,
        taxAmount: tax > 0 ? fmtINR(tax) : undefined,
        miscItems: miscItems.filter((i) => (Number(i?.amount) || 0) > 0),
        taxItems: taxItems.filter((i) => (Number(i?.amount) || 0) > 0),
        amount: fmtINR(Number(draft.amount) || primary + misc + tax),
        dueDate: td.dueDate ?? '',
        totalAmount: td.totalAmount,
        paidAmount: td.paidAmount,
        balanceAfterPayment: td.balanceAfterPayment,
        bankName: td.bankName,
        accountName: td.accountName,
        accountNumber: td.accountNumber,
        ifscCode: td.ifscCode,
        branch: td.branch,
      });
    } catch (e: any) {
      this.logger.warn(`Could not rebuild DD content for ${draft.id}: ${e?.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.demandDraftRepository.delete(id);
  }
}
