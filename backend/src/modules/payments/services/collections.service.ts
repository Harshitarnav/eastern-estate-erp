import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  DemandDraft,
  DemandDraftStatus,
  DemandDraftTone,
} from '../../demand-drafts/entities/demand-draft.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';

export type CollectionTier =
  | 'ON_TRACK'
  | 'OVERDUE'
  | 'REMINDER_1'
  | 'REMINDER_2'
  | 'REMINDER_3'
  | 'REMINDER_4'
  | 'WARNING'
  | 'POST_WARNING'
  | 'AT_RISK';

/**
 * Live "days overdue" expression, computed from due_date at query time.
 *
 * Why not just read the `dd.days_overdue` column? That column is a
 * cached snapshot maintained by OverdueScannerService, which only runs
 * once a day (09:00 IST) and only touches DDs in status=SENT. That
 * means a DD whose due_date crossed earlier today, or any DD still in
 * DRAFT/READY/FAILED, would read `0` from the column and get
 * mis-classified as ON_TRACK until the next scan. Computing it live
 * here keeps the tiering honest for every UI read.
 *
 * Returns a non-negative integer number of days. NULL due_date → 0.
 */
const DAYS_OVERDUE_SQL =
  `GREATEST(0, (CURRENT_DATE - dd.due_date::date))::int`;

export interface CollectionsListFilter {
  tier?: CollectionTier;
  customerId?: string;
  bookingId?: string;
  propertyId?: string;
  flatId?: string;
  status?: DemandDraftStatus;
  tone?: DemandDraftTone;
  includeLegacyOnly?: boolean;
  // When true, DDs that have already been closed (status = PAID) are
  // included in the result set. Off by default so the workstation
  // shows a live, actionable queue.
  includePaid?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  // Collector queue filters
  assigneeId?: string;        // specific user; 'unassigned' keyword reserved
  unassignedOnly?: boolean;   // true => collector_user_id IS NULL
  mineUserId?: string;        // service-level helper: interpret "My Queue"
}

export interface CollectionsRow {
  id: string;
  title: string | null;
  amount: number;
  status: DemandDraftStatus;
  tone: DemandDraftTone;
  escalationLevel: number;
  reminderCount: number;
  dueDate: Date | null;
  daysOverdue: number;
  lastReminderAt: Date | null;
  nextReminderDueAt: Date | null;
  cancellationWarningIssuedAt: Date | null;
  parentDemandDraftId: string | null;
  isLegacyImport: boolean;
  createdAt: Date;
  // Joined context
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  bookingId: string | null;
  bookingCode: string | null;
  bookingStatus: string | null;
  flatId: string | null;
  flatCode: string | null;
  propertyId: string | null;
  propertyName: string | null;
  pauseRemindersUntil: Date | null;
  // Collector / assignment
  collectorUserId: string | null;
  collectorName: string | null;
  assignedAt: Date | null;
  // Computed
  tier: CollectionTier;
}

export interface CollectorSummary {
  userId: string;
  name: string;
  email: string | null;
  assignedCount: number;
  overdueCount: number;
}

export interface CollectionsStats {
  totalOverdueAmount: number;
  totalPendingAmount: number;
  ddCount: number;
  overdueCount: number;
  atRiskBookingCount: number;
  byTier: Record<CollectionTier, { count: number; amount: number }>;
  agingBuckets: {
    d_0_7: { count: number; amount: number };
    d_8_30: { count: number; amount: number };
    d_31_90: { count: number; amount: number };
    d_91_180: { count: number; amount: number };
    d_181_365: { count: number; amount: number };
    d_365_plus: { count: number; amount: number };
  };
  draftWarningsPending: number;
  pausedCount: number;
  legacyOverdueAmount: number;
}

/**
 * CollectionsService
 * ==================
 *
 * Reads layer for the Collections workstation. Joins DemandDrafts with
 * their customer / booking / flat / plan context and classifies every
 * row into a collection tier (ON_TRACK, REMINDER_1..4, WARNING,
 * POST_WARNING, AT_RISK). Also aggregates finance stats for the
 * dashboard cards.
 *
 * Kept deliberately read-mostly. Write actions (pause reminders, record
 * contact, manually fire a reminder, approve+send a cancellation
 * warning) live on the controller and delegate to the OverdueScanner /
 * existing DD service.
 */
@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(DemandDraft)
    private readonly ddRepo: Repository<DemandDraft>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Flat)
    private readonly flatRepo: Repository<Flat>,
    @InjectRepository(FlatPaymentPlan)
    private readonly planRepo: Repository<FlatPaymentPlan>,
  ) {}

  /**
   * Return a paginated, enriched list of DDs for the Collections inbox.
   * Every row is classified into a CollectionTier and enriched with
   * customer / booking / flat / property context in a single query.
   */
  async list(filter: CollectionsListFilter): Promise<{
    rows: CollectionsRow[];
    total: number;
  }> {
    const qb = this.ddRepo
      .createQueryBuilder('dd')
      .leftJoin(Customer, 'c', 'c.id = dd.customer_id')
      .leftJoin(Booking, 'b', 'b.id = dd.booking_id')
      .leftJoin(Flat, 'f', 'f.id = dd.flat_id')
      .leftJoin('towers', 't', 't.id = f.tower_id')
      .leftJoin(FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
      .leftJoin('users', 'u', 'u.id = dd.collector_user_id')
      .select('dd.id', 'id')
      .addSelect('dd.title', 'title')
      .addSelect('dd.amount', 'amount')
      .addSelect('dd.status', 'status')
      .addSelect('dd.tone', 'tone')
      .addSelect('dd.escalation_level', 'escalationLevel')
      .addSelect('dd.reminder_count', 'reminderCount')
      .addSelect('dd.due_date', 'dueDate')
      .addSelect(DAYS_OVERDUE_SQL, 'daysOverdue')
      .addSelect('dd.last_reminder_at', 'lastReminderAt')
      .addSelect('dd.next_reminder_due_at', 'nextReminderDueAt')
      .addSelect('dd.cancellation_warning_issued_at', 'cancellationWarningIssuedAt')
      .addSelect('dd.parent_demand_draft_id', 'parentDemandDraftId')
      .addSelect('dd.created_at', 'createdAt')
      .addSelect('dd.customer_id', 'customerId')
      .addSelect('c.full_name', 'customerName')
      .addSelect('c.phone_number', 'customerPhone')
      .addSelect('c.email', 'customerEmail')
      .addSelect('c.pause_reminders_until', 'customerPauseUntil')
      .addSelect('dd.booking_id', 'bookingId')
      .addSelect('b.booking_number', 'bookingCode')
      .addSelect('b.status', 'bookingStatus')
      .addSelect('dd.flat_id', 'flatId')
      .addSelect('f.flat_number', 'flatCode')
      .addSelect('t.property_id', 'propertyId')
      .addSelect('p.is_legacy_import', 'isLegacyImport')
      .addSelect('p.pause_reminders_until', 'planPauseUntil')
      .addSelect('dd.collector_user_id', 'collectorUserId')
      .addSelect('dd.assigned_at', 'assignedAt')
      .addSelect(
        `COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`,
        'collectorName',
      );

    // Apply filters
    if (filter.customerId) qb.andWhere('dd.customer_id = :customerId', { customerId: filter.customerId });
    if (filter.bookingId) qb.andWhere('dd.booking_id = :bookingId', { bookingId: filter.bookingId });
    if (filter.flatId) qb.andWhere('dd.flat_id = :flatId', { flatId: filter.flatId });
    if (filter.propertyId) qb.andWhere('t.property_id = :propertyId', { propertyId: filter.propertyId });
    if (filter.status) {
      qb.andWhere('dd.status = :status', { status: filter.status });
    } else if (!filter.includePaid) {
      // Keep closed DDs out of the default inbox view. Callers that want
      // the archive (e.g. a "Show paid" toggle or a specific customer's
      // full history) can opt in via `includePaid` or by passing
      // status=PAID explicitly.
      qb.andWhere('dd.status != :paid', { paid: DemandDraftStatus.PAID });
    }
    if (filter.tone) qb.andWhere('dd.tone = :tone', { tone: filter.tone });
    if (filter.includeLegacyOnly) qb.andWhere('p.is_legacy_import = TRUE');

    // Collector queue filters
    if (filter.mineUserId) {
      qb.andWhere('dd.collector_user_id = :mineUserId', {
        mineUserId: filter.mineUserId,
      });
    } else if (filter.unassignedOnly) {
      qb.andWhere('dd.collector_user_id IS NULL');
    } else if (filter.assigneeId) {
      qb.andWhere('dd.collector_user_id = :assigneeId', {
        assigneeId: filter.assigneeId,
      });
    }

    if (filter.search) {
      const s = `%${filter.search.trim()}%`;
      qb.andWhere(
        '(c.full_name ILIKE :s OR c.email ILIKE :s OR c.phone_number ILIKE :s OR b.booking_number ILIKE :s OR f.flat_number ILIKE :s OR dd.title ILIKE :s)',
        { s },
      );
    }

    // Tier filter is computed, so we translate into a WHERE on
    // escalation_level / booking.status / cancellation_warning_issued_at.
    if (filter.tier) {
      switch (filter.tier) {
        case 'ON_TRACK':
          qb.andWhere(`${DAYS_OVERDUE_SQL} <= 0 AND dd.escalation_level = 0`);
          break;
        case 'OVERDUE':
          qb.andWhere(`${DAYS_OVERDUE_SQL} > 0 AND dd.escalation_level = 0`);
          break;
        case 'REMINDER_1':
          qb.andWhere('dd.escalation_level = 1');
          break;
        case 'REMINDER_2':
          qb.andWhere('dd.escalation_level = 2');
          break;
        case 'REMINDER_3':
          qb.andWhere('dd.escalation_level = 3');
          break;
        case 'REMINDER_4':
          qb.andWhere('dd.escalation_level = 4');
          break;
        case 'WARNING':
          qb.andWhere('dd.cancellation_warning_issued_at IS NOT NULL AND dd.escalation_level = 5');
          break;
        case 'POST_WARNING':
          qb.andWhere('dd.escalation_level >= 6');
          break;
        case 'AT_RISK':
          qb.andWhere('b.status = :atRisk', { atRisk: BookingStatus.AT_RISK });
          break;
      }
    }

    // Order: most urgent first. AT_RISK bookings float to top, then
    // escalation desc, then daysOverdue desc, then due date.
    qb.orderBy(
      `CASE WHEN b.status = '${BookingStatus.AT_RISK}' THEN 0 ELSE 1 END`,
      'ASC',
    )
      .addOrderBy('dd.escalation_level', 'DESC')
      .addOrderBy(DAYS_OVERDUE_SQL, 'DESC')
      .addOrderBy('dd.due_date', 'ASC');

    // Total count without pagination for UI
    const countQb = qb.clone();
    const total = await countQb.getCount();

    qb.limit(filter.limit ?? 50);
    qb.offset(filter.offset ?? 0);

    const raw = await qb.getRawMany();
    const rows: CollectionsRow[] = raw.map((r) => this.hydrateRow(r));
    return { rows, total };
  }

  /**
   * Aggregate stats for the Collections dashboard header. One pass over
   * DDs - still cheap since DDs are indexed and count is bounded.
   */
  async stats(filter: Pick<CollectionsListFilter, 'propertyId'> = {}): Promise<CollectionsStats> {
    const qb = this.ddRepo
      .createQueryBuilder('dd')
      .leftJoin(Booking, 'b', 'b.id = dd.booking_id')
      .leftJoin(Flat, 'f', 'f.id = dd.flat_id')
      .leftJoin('towers', 't', 't.id = f.tower_id')
      .leftJoin(FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
      .leftJoin(Customer, 'c', 'c.id = dd.customer_id')
      .select('dd.id', 'id')
      .addSelect('dd.amount', 'amount')
      .addSelect('dd.status', 'status')
      .addSelect(DAYS_OVERDUE_SQL, 'daysOverdue')
      .addSelect('dd.escalation_level', 'escalationLevel')
      .addSelect('dd.tone', 'tone')
      .addSelect('dd.cancellation_warning_issued_at', 'cancellationWarningIssuedAt')
      .addSelect('b.status', 'bookingStatus')
      .addSelect('p.is_legacy_import', 'isLegacyImport')
      .addSelect('p.pause_reminders_until', 'planPauseUntil')
      .addSelect('c.pause_reminders_until', 'customerPauseUntil');

    // Skip closed DDs in the dashboard totals. A DD flips to PAID when
    // the linked payment is verified (see PaymentCompletionService),
    // so counting it as "overdue / pending" would double-report money
    // that's already in the books.
    qb.andWhere('dd.status != :paid', { paid: DemandDraftStatus.PAID });

    if (filter.propertyId) qb.andWhere('t.property_id = :propertyId', { propertyId: filter.propertyId });

    const raw = await qb.getRawMany();

    const stats: CollectionsStats = {
      totalOverdueAmount: 0,
      totalPendingAmount: 0,
      ddCount: raw.length,
      overdueCount: 0,
      atRiskBookingCount: 0,
      byTier: {
        ON_TRACK: { count: 0, amount: 0 },
        OVERDUE: { count: 0, amount: 0 },
        REMINDER_1: { count: 0, amount: 0 },
        REMINDER_2: { count: 0, amount: 0 },
        REMINDER_3: { count: 0, amount: 0 },
        REMINDER_4: { count: 0, amount: 0 },
        WARNING: { count: 0, amount: 0 },
        POST_WARNING: { count: 0, amount: 0 },
        AT_RISK: { count: 0, amount: 0 },
      },
      agingBuckets: {
        d_0_7: { count: 0, amount: 0 },
        d_8_30: { count: 0, amount: 0 },
        d_31_90: { count: 0, amount: 0 },
        d_91_180: { count: 0, amount: 0 },
        d_181_365: { count: 0, amount: 0 },
        d_365_plus: { count: 0, amount: 0 },
      },
      draftWarningsPending: 0,
      pausedCount: 0,
      legacyOverdueAmount: 0,
    };

    const atRiskBookingIds = new Set<string>();
    const now = new Date();

    for (const r of raw) {
      const amount = Number(r.amount) || 0;
      const daysOverdue = Number(r.daysOverdue) || 0;
      const escalationLevel = Number(r.escalationLevel) || 0;
      const isLegacy = r.isLegacyImport === true;
      const planPause = r.planPauseUntil ? new Date(r.planPauseUntil) : null;
      const custPause = r.customerPauseUntil ? new Date(r.customerPauseUntil) : null;
      const isPaused =
        (planPause && planPause > now) || (custPause && custPause > now);

      stats.totalPendingAmount += amount;
      if (daysOverdue > 0) {
        stats.overdueCount += 1;
        stats.totalOverdueAmount += amount;
        if (isLegacy) stats.legacyOverdueAmount += amount;
      }
      if (isPaused) stats.pausedCount += 1;
      if (r.status === DemandDraftStatus.DRAFT && r.tone === DemandDraftTone.CANCELLATION_WARNING) {
        stats.draftWarningsPending += 1;
      }
      if (r.bookingStatus === BookingStatus.AT_RISK) {
        atRiskBookingIds.add(String(r.bookingId ?? ''));
      }

      // Classify tier (compute using the same rules as hydrateRow)
      const tier = this.classifyTier({
        daysOverdue,
        escalationLevel,
        cancellationWarningIssuedAt: r.cancellationWarningIssuedAt,
        bookingStatus: r.bookingStatus,
      });
      stats.byTier[tier].count += 1;
      stats.byTier[tier].amount += amount;

      // Aging buckets (overdue only)
      if (daysOverdue > 0) {
        const b = stats.agingBuckets;
        if (daysOverdue <= 7) {
          b.d_0_7.count += 1; b.d_0_7.amount += amount;
        } else if (daysOverdue <= 30) {
          b.d_8_30.count += 1; b.d_8_30.amount += amount;
        } else if (daysOverdue <= 90) {
          b.d_31_90.count += 1; b.d_31_90.amount += amount;
        } else if (daysOverdue <= 180) {
          b.d_91_180.count += 1; b.d_91_180.amount += amount;
        } else if (daysOverdue <= 365) {
          b.d_181_365.count += 1; b.d_181_365.amount += amount;
        } else {
          b.d_365_plus.count += 1; b.d_365_plus.amount += amount;
        }
      }
    }

    stats.atRiskBookingCount = atRiskBookingIds.size;
    return stats;
  }

  /**
   * Full detail for a single DD: the row, its parent + all child DDs,
   * and the timeline of reminders / warnings / contacts logged in
   * metadata.
   */
  async detail(id: string): Promise<{
    row: CollectionsRow;
    thread: CollectionsRow[];
    timeline: Array<{
      at: Date;
      kind: string;
      label: string;
      detail?: string;
      // When present, the UI can link this event to /collections/:id so
      // users can drill into the actual DD that was generated / sent.
      demandDraftId?: string;
    }>;
  }> {
    const rows = await this.listByIds([id]);
    if (!rows.length) throw new NotFoundException(`DD ${id} not found`);
    const row = rows[0];

    // Thread = parent + siblings + descendants
    const rootId = row.parentDemandDraftId ?? row.id;
    const threadIds = await this.ddRepo
      .createQueryBuilder('dd')
      .select('dd.id', 'id')
      .where('dd.id = :rootId', { rootId })
      .orWhere('dd.parent_demand_draft_id = :rootId', { rootId })
      .getRawMany();

    const thread = await this.listByIds(threadIds.map((r) => r.id));

    // Timeline: sort events from thread. generatedAt / sentAt / cancellationWarningIssuedAt.
    const timeline: Array<{
      at: Date;
      kind: string;
      label: string;
      detail?: string;
      demandDraftId?: string;
    }> = [];
    // Fetch full DD rows for the thread so we can surface paidAt events
    // (which only live on the DD entity, not on the hydrated row shape).
    const threadFull = await this.ddRepo.find({
      where: { id: In([rootId, ...threadIds.map((r) => r.id)]) },
    });
    const paidAtByDd = new Map<string, { at: Date; paymentId: string | null }>();
    for (const d of threadFull) {
      if (d.paidAt) {
        paidAtByDd.set(d.id, { at: d.paidAt, paymentId: d.paidPaymentId });
      }
    }

    for (const t of thread) {
      timeline.push({
        at: t.createdAt,
        kind: 'generated',
        label: `DD ${t.tone} generated`,
        detail: t.title ?? undefined,
        demandDraftId: t.id,
      });
      if (t.lastReminderAt) {
        timeline.push({
          at: t.lastReminderAt,
          kind: 'reminder',
          label: `Reminder (${t.tone}) sent`,
          demandDraftId: t.id,
        });
      }
      if (t.cancellationWarningIssuedAt) {
        timeline.push({
          at: t.cancellationWarningIssuedAt,
          kind: 'warning',
          label: `Cancellation warning prepared`,
          demandDraftId: t.id,
        });
      }
      const paid = paidAtByDd.get(t.id);
      if (paid) {
        timeline.push({
          at: paid.at,
          kind: 'paid',
          label: 'Payment received - DD closed',
          detail: paid.paymentId
            ? `Payment ${paid.paymentId.slice(0, 8)}…`
            : undefined,
          demandDraftId: t.id,
        });
      }
    }

    // Pull contact attempts and pause events from the focal DD's metadata
    // so the human audit trail surfaces next to the system events.
    const focal = await this.ddRepo.findOne({ where: { id } });
    if (focal?.metadata) {
      const contacts = (focal.metadata.contacts as any[]) || [];
      for (const c of contacts) {
        if (!c?.at) continue;
        timeline.push({
          at: new Date(c.at),
          kind: 'contact',
          label: `Contact attempt (${String(c.channel ?? 'other')})`,
          detail: c.note ? String(c.note) : undefined,
        });
      }
      const pauses = (focal.metadata.pauses as any[]) || [];
      for (const p of pauses) {
        if (!p?.at) continue;
        timeline.push({
          at: new Date(p.at),
          kind: 'pause',
          label: `Reminders paused (${String(p.scope ?? 'plan')}, ${Number(p.days) || 0}d)`,
          detail: p.note ? String(p.note) : undefined,
        });
      }
    }

    timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    return { row, thread, timeline };
  }

  /**
   * Pause future reminders at the plan level for `days` days. If
   * `scope === 'customer'` it pauses at the customer level instead
   * (affects every booking of that customer).
   */
  async pauseReminders(
    id: string,
    days: number,
    scope: 'plan' | 'customer' = 'plan',
    note?: string,
  ): Promise<{ pausedUntil: Date; scope: string }> {
    const dd = await this.ddRepo.findOne({ where: { id } });
    if (!dd) throw new NotFoundException(`DD ${id} not found`);

    const pausedUntil = new Date();
    pausedUntil.setDate(pausedUntil.getDate() + Math.max(1, days));

    if (scope === 'customer' && dd.customerId) {
      const customer = await this.customerRepo.findOne({ where: { id: dd.customerId } });
      if (customer) {
        customer.pauseRemindersUntil = pausedUntil;
        await this.customerRepo.save(customer);
      }
    } else if (dd.flatPaymentPlanId) {
      const plan = await this.planRepo.findOne({ where: { id: dd.flatPaymentPlanId } });
      if (plan) {
        plan.pauseRemindersUntil = pausedUntil;
        await this.planRepo.save(plan);
      }
    }

    // Stamp a note into DD metadata for the audit trail.
    dd.metadata = {
      ...(dd.metadata || {}),
      pauses: [
        ...((dd.metadata?.pauses as any[]) || []),
        { at: new Date().toISOString(), days, scope, note: note ?? null },
      ],
    };
    await this.ddRepo.save(dd);

    return { pausedUntil, scope };
  }

  /**
   * Append a "contact attempt" note to the DD metadata so finance can
   * track who called/emailed the customer outside the system.
   */
  async recordContact(
    id: string,
    input: { channel: 'phone' | 'email' | 'sms' | 'visit' | 'other'; note: string; by?: string | null },
  ): Promise<void> {
    const dd = await this.ddRepo.findOne({ where: { id } });
    if (!dd) throw new NotFoundException(`DD ${id} not found`);
    dd.metadata = {
      ...(dd.metadata || {}),
      contacts: [
        ...((dd.metadata?.contacts as any[]) || []),
        {
          at: new Date().toISOString(),
          channel: input.channel,
          note: input.note,
          by: input.by ?? null,
        },
      ],
    };
    await this.ddRepo.save(dd);
  }

  /**
   * Pause reminders for a set of DDs. Each id is processed best-effort;
   * failures are collected so the UI can show per-row feedback without
   * rolling back the whole batch.
   */
  async bulkPause(
    ids: string[],
    days: number,
    scope: 'plan' | 'customer',
    note?: string,
  ): Promise<{ ok: string[]; failed: Array<{ id: string; reason: string }> }> {
    const ok: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      try {
        await this.pauseReminders(id, days, scope, note);
        ok.push(id);
      } catch (err: any) {
        failed.push({ id, reason: err?.message || 'Failed' });
      }
    }
    return { ok, failed };
  }

  /**
   * Pause reminders for every open DD of a customer in one shot. Sets
   * `customer.pause_reminders_until` so future DDs generated during the
   * window also respect the pause, and stamps an audit entry into every
   * currently-open (non-SENT) DD so the timeline on each DD's detail
   * page reflects the decision.
   */
  async pauseCustomer(
    customerId: string,
    days: number,
    note?: string,
  ): Promise<{ pausedUntil: Date; affectedDds: number }> {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);

    const pausedUntil = new Date();
    pausedUntil.setDate(pausedUntil.getDate() + Math.max(1, days));

    customer.pauseRemindersUntil = pausedUntil;
    await this.customerRepo.save(customer);

    // Stamp every open DD of the customer so the per-DD timeline shows
    // this pause without having to walk to the customer record.
    const openDds = await this.ddRepo
      .createQueryBuilder('dd')
      .where('dd.customer_id = :customerId', { customerId })
      .andWhere('dd.status != :paid', { paid: DemandDraftStatus.PAID })
      .getMany();

    const stamp = {
      at: new Date().toISOString(),
      days,
      scope: 'customer' as const,
      note: note ?? null,
    };
    for (const dd of openDds) {
      dd.metadata = {
        ...(dd.metadata || {}),
        pauses: [...((dd.metadata?.pauses as any[]) || []), stamp],
      };
    }
    if (openDds.length) await this.ddRepo.save(openDds);

    return { pausedUntil, affectedDds: openDds.length };
  }

  /**
   * Record the same contact attempt against a batch of DDs in one shot,
   * e.g. "called customer about all 3 overdue drafts". Each id is handled
   * best-effort so a single bad id doesn't abort the batch.
   */
  async bulkRecordContact(
    ids: string[],
    input: {
      channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
      note: string;
      by?: string | null;
    },
  ): Promise<{ ok: string[]; failed: Array<{ id: string; reason: string }> }> {
    const ok: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      try {
        await this.recordContact(id, input);
        ok.push(id);
      } catch (err: any) {
        failed.push({ id, reason: err?.message || 'Failed' });
      }
    }
    return { ok, failed };
  }

  /**
   * Assign a batch of DDs to a collector (or unassign by passing null).
   * Batched in a single UPDATE for speed; the whole call is one FK
   * check against users(id) if assigneeId is non-null.
   */
  async assignRows(
    ids: string[],
    assigneeId: string | null,
    assignedBy: string | null,
  ): Promise<{ updated: number }> {
    if (!ids.length) return { updated: 0 };
    const now = assigneeId ? new Date() : null;
    const res = await this.ddRepo
      .createQueryBuilder()
      .update()
      .set({
        collectorUserId: assigneeId,
        assignedAt: now,
        assignedBy: assigneeId ? assignedBy ?? null : null,
      })
      .where('id = ANY(:ids)', { ids })
      .execute();
    return { updated: res.affected ?? 0 };
  }

  /**
   * Return every distinct user currently assigned to at least one open
   * DD, plus a count of open + overdue rows for each. Powers the
   * "Queues" side rail and the Assign dropdown.
   *
   * When `propertyId` is supplied, queues are scoped to that project so
   * the dropdown only shows collectors relevant to the currently-picked
   * property - different projects can have different collection teams.
   */
  async listAssignees(
    filter: Pick<CollectionsListFilter, 'propertyId'> = {},
  ): Promise<CollectorSummary[]> {
    const qb = this.ddRepo
      .createQueryBuilder('dd')
      .leftJoin('users', 'u', 'u.id = dd.collector_user_id')
      .select('dd.collector_user_id', 'userId')
      .addSelect(
        `COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`,
        'name',
      )
      .addSelect('u.email', 'email')
      .addSelect('COUNT(dd.id)::int', 'assignedCount')
      .addSelect(
        `SUM(CASE WHEN ${DAYS_OVERDUE_SQL} > 0 THEN 1 ELSE 0 END)::int`,
        'overdueCount',
      )
      .where('dd.collector_user_id IS NOT NULL')
      .andWhere('dd.status != :paid', { paid: DemandDraftStatus.PAID });

    if (filter.propertyId) {
      qb.leftJoin(Flat, 'f', 'f.id = dd.flat_id')
        .leftJoin('towers', 't', 't.id = f.tower_id')
        .andWhere('t.property_id = :propertyId', {
          propertyId: filter.propertyId,
        });
    }

    const raw = await qb
      .groupBy('dd.collector_user_id')
      .addGroupBy('u.first_name')
      .addGroupBy('u.last_name')
      .addGroupBy('u.email')
      .orderBy('"assignedCount"', 'DESC')
      .getRawMany();

    return raw.map((r) => ({
      userId: r.userId,
      name: r.name ?? '(unknown)',
      email: r.email ?? null,
      assignedCount: Number(r.assignedCount) || 0,
      overdueCount: Number(r.overdueCount) || 0,
    }));
  }

  // ───────────────────── internals ─────────────────────

  private async listByIds(ids: string[]): Promise<CollectionsRow[]> {
    if (!ids.length) return [];
    const qb = this.ddRepo
      .createQueryBuilder('dd')
      .leftJoin(Customer, 'c', 'c.id = dd.customer_id')
      .leftJoin(Booking, 'b', 'b.id = dd.booking_id')
      .leftJoin(Flat, 'f', 'f.id = dd.flat_id')
      .leftJoin('towers', 't', 't.id = f.tower_id')
      .leftJoin(FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
      .leftJoin('users', 'u', 'u.id = dd.collector_user_id')
      .select('dd.id', 'id')
      .addSelect('dd.title', 'title')
      .addSelect('dd.amount', 'amount')
      .addSelect('dd.status', 'status')
      .addSelect('dd.tone', 'tone')
      .addSelect('dd.escalation_level', 'escalationLevel')
      .addSelect('dd.reminder_count', 'reminderCount')
      .addSelect('dd.due_date', 'dueDate')
      .addSelect(DAYS_OVERDUE_SQL, 'daysOverdue')
      .addSelect('dd.last_reminder_at', 'lastReminderAt')
      .addSelect('dd.next_reminder_due_at', 'nextReminderDueAt')
      .addSelect('dd.cancellation_warning_issued_at', 'cancellationWarningIssuedAt')
      .addSelect('dd.parent_demand_draft_id', 'parentDemandDraftId')
      .addSelect('dd.created_at', 'createdAt')
      .addSelect('dd.customer_id', 'customerId')
      .addSelect('c.full_name', 'customerName')
      .addSelect('c.phone_number', 'customerPhone')
      .addSelect('c.email', 'customerEmail')
      .addSelect('c.pause_reminders_until', 'customerPauseUntil')
      .addSelect('dd.booking_id', 'bookingId')
      .addSelect('b.booking_number', 'bookingCode')
      .addSelect('b.status', 'bookingStatus')
      .addSelect('dd.flat_id', 'flatId')
      .addSelect('f.flat_number', 'flatCode')
      .addSelect('t.property_id', 'propertyId')
      .addSelect('p.is_legacy_import', 'isLegacyImport')
      .addSelect('p.pause_reminders_until', 'planPauseUntil')
      .addSelect('dd.collector_user_id', 'collectorUserId')
      .addSelect('dd.assigned_at', 'assignedAt')
      .addSelect(
        `COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`,
        'collectorName',
      )
      .where('dd.id = ANY(:ids)', { ids });

    const raw = await qb.getRawMany();
    const byId = new Map(raw.map((r) => [r.id, this.hydrateRow(r)]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as CollectionsRow[];
  }

  private hydrateRow(r: any): CollectionsRow {
    const daysOverdue = Number(r.daysOverdue) || 0;
    const escalationLevel = Number(r.escalationLevel) || 0;
    const tier = this.classifyTier({
      daysOverdue,
      escalationLevel,
      cancellationWarningIssuedAt: r.cancellationWarningIssuedAt,
      bookingStatus: r.bookingStatus,
    });
    const customerPause = r.customerPauseUntil ? new Date(r.customerPauseUntil) : null;
    const planPause = r.planPauseUntil ? new Date(r.planPauseUntil) : null;
    const pauseRemindersUntil =
      customerPause && planPause
        ? customerPause > planPause
          ? customerPause
          : planPause
        : customerPause ?? planPause;
    return {
      id: r.id,
      title: r.title,
      amount: Number(r.amount) || 0,
      status: r.status,
      tone: r.tone,
      escalationLevel,
      reminderCount: Number(r.reminderCount) || 0,
      dueDate: r.dueDate ? new Date(r.dueDate) : null,
      daysOverdue,
      lastReminderAt: r.lastReminderAt ? new Date(r.lastReminderAt) : null,
      nextReminderDueAt: r.nextReminderDueAt ? new Date(r.nextReminderDueAt) : null,
      cancellationWarningIssuedAt: r.cancellationWarningIssuedAt
        ? new Date(r.cancellationWarningIssuedAt)
        : null,
      parentDemandDraftId: r.parentDemandDraftId,
      isLegacyImport: r.isLegacyImport === true,
      createdAt: new Date(r.createdAt),
      customerId: r.customerId,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      bookingId: r.bookingId,
      bookingCode: r.bookingCode,
      bookingStatus: r.bookingStatus,
      flatId: r.flatId,
      flatCode: r.flatCode,
      propertyId: r.propertyId,
      propertyName: null,
      pauseRemindersUntil,
      collectorUserId: r.collectorUserId ?? null,
      collectorName: r.collectorName ?? null,
      assignedAt: r.assignedAt ? new Date(r.assignedAt) : null,
      tier,
    };
  }

  private classifyTier(args: {
    daysOverdue: number;
    escalationLevel: number;
    cancellationWarningIssuedAt: any;
    bookingStatus: any;
  }): CollectionTier {
    if (args.bookingStatus === BookingStatus.AT_RISK) return 'AT_RISK';
    if (args.cancellationWarningIssuedAt && args.escalationLevel >= 6) return 'POST_WARNING';
    if (args.cancellationWarningIssuedAt || args.escalationLevel === 5) return 'WARNING';
    if (args.escalationLevel === 4) return 'REMINDER_4';
    if (args.escalationLevel === 3) return 'REMINDER_3';
    if (args.escalationLevel === 2) return 'REMINDER_2';
    if (args.escalationLevel === 1) return 'REMINDER_1';
    if (args.daysOverdue > 0) return 'OVERDUE';
    return 'ON_TRACK';
  }
}
