"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CollectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const DAYS_OVERDUE_SQL = `GREATEST(0, (CURRENT_DATE - dd.due_date::date))::int`;
let CollectionsService = CollectionsService_1 = class CollectionsService {
    constructor(ddRepo, bookingRepo, customerRepo, flatRepo, planRepo) {
        this.ddRepo = ddRepo;
        this.bookingRepo = bookingRepo;
        this.customerRepo = customerRepo;
        this.flatRepo = flatRepo;
        this.planRepo = planRepo;
        this.logger = new common_1.Logger(CollectionsService_1.name);
    }
    async list(filter) {
        const qb = this.ddRepo
            .createQueryBuilder('dd')
            .leftJoin(customer_entity_1.Customer, 'c', 'c.id = dd.customer_id')
            .leftJoin(booking_entity_1.Booking, 'b', 'b.id = dd.booking_id')
            .leftJoin(flat_entity_1.Flat, 'f', 'f.id = dd.flat_id')
            .leftJoin('towers', 't', 't.id = f.tower_id')
            .leftJoin(flat_payment_plan_entity_1.FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
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
            .addSelect(`COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`, 'collectorName');
        if (filter.customerId)
            qb.andWhere('dd.customer_id = :customerId', { customerId: filter.customerId });
        if (filter.bookingId)
            qb.andWhere('dd.booking_id = :bookingId', { bookingId: filter.bookingId });
        if (filter.flatId)
            qb.andWhere('dd.flat_id = :flatId', { flatId: filter.flatId });
        if (filter.propertyId)
            qb.andWhere('t.property_id = :propertyId', { propertyId: filter.propertyId });
        if (filter.status) {
            qb.andWhere('dd.status = :status', { status: filter.status });
        }
        else if (!filter.includePaid) {
            qb.andWhere('dd.status != :paid', { paid: demand_draft_entity_1.DemandDraftStatus.PAID });
        }
        if (filter.tone)
            qb.andWhere('dd.tone = :tone', { tone: filter.tone });
        if (filter.includeLegacyOnly)
            qb.andWhere('p.is_legacy_import = TRUE');
        if (filter.mineUserId) {
            qb.andWhere('dd.collector_user_id = :mineUserId', {
                mineUserId: filter.mineUserId,
            });
        }
        else if (filter.unassignedOnly) {
            qb.andWhere('dd.collector_user_id IS NULL');
        }
        else if (filter.assigneeId) {
            qb.andWhere('dd.collector_user_id = :assigneeId', {
                assigneeId: filter.assigneeId,
            });
        }
        if (filter.search) {
            const s = `%${filter.search.trim()}%`;
            qb.andWhere('(c.full_name ILIKE :s OR c.email ILIKE :s OR c.phone_number ILIKE :s OR b.booking_number ILIKE :s OR f.flat_number ILIKE :s OR dd.title ILIKE :s)', { s });
        }
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
                    qb.andWhere('b.status = :atRisk', { atRisk: booking_entity_1.BookingStatus.AT_RISK });
                    break;
            }
        }
        qb.orderBy(`CASE WHEN b.status = '${booking_entity_1.BookingStatus.AT_RISK}' THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('dd.escalation_level', 'DESC')
            .addOrderBy(DAYS_OVERDUE_SQL, 'DESC')
            .addOrderBy('dd.due_date', 'ASC');
        const countQb = qb.clone();
        const total = await countQb.getCount();
        qb.limit(filter.limit ?? 50);
        qb.offset(filter.offset ?? 0);
        const raw = await qb.getRawMany();
        const rows = raw.map((r) => this.hydrateRow(r));
        return { rows, total };
    }
    async stats(filter = {}) {
        const qb = this.ddRepo
            .createQueryBuilder('dd')
            .leftJoin(booking_entity_1.Booking, 'b', 'b.id = dd.booking_id')
            .leftJoin(flat_entity_1.Flat, 'f', 'f.id = dd.flat_id')
            .leftJoin('towers', 't', 't.id = f.tower_id')
            .leftJoin(flat_payment_plan_entity_1.FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
            .leftJoin(customer_entity_1.Customer, 'c', 'c.id = dd.customer_id')
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
        qb.andWhere('dd.status != :paid', { paid: demand_draft_entity_1.DemandDraftStatus.PAID });
        if (filter.propertyId)
            qb.andWhere('t.property_id = :propertyId', { propertyId: filter.propertyId });
        const raw = await qb.getRawMany();
        const stats = {
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
        const atRiskBookingIds = new Set();
        const now = new Date();
        for (const r of raw) {
            const amount = Number(r.amount) || 0;
            const daysOverdue = Number(r.daysOverdue) || 0;
            const escalationLevel = Number(r.escalationLevel) || 0;
            const isLegacy = r.isLegacyImport === true;
            const planPause = r.planPauseUntil ? new Date(r.planPauseUntil) : null;
            const custPause = r.customerPauseUntil ? new Date(r.customerPauseUntil) : null;
            const isPaused = (planPause && planPause > now) || (custPause && custPause > now);
            stats.totalPendingAmount += amount;
            if (daysOverdue > 0) {
                stats.overdueCount += 1;
                stats.totalOverdueAmount += amount;
                if (isLegacy)
                    stats.legacyOverdueAmount += amount;
            }
            if (isPaused)
                stats.pausedCount += 1;
            if (r.status === demand_draft_entity_1.DemandDraftStatus.DRAFT && r.tone === demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING) {
                stats.draftWarningsPending += 1;
            }
            if (r.bookingStatus === booking_entity_1.BookingStatus.AT_RISK) {
                atRiskBookingIds.add(String(r.bookingId ?? ''));
            }
            const tier = this.classifyTier({
                daysOverdue,
                escalationLevel,
                cancellationWarningIssuedAt: r.cancellationWarningIssuedAt,
                bookingStatus: r.bookingStatus,
            });
            stats.byTier[tier].count += 1;
            stats.byTier[tier].amount += amount;
            if (daysOverdue > 0) {
                const b = stats.agingBuckets;
                if (daysOverdue <= 7) {
                    b.d_0_7.count += 1;
                    b.d_0_7.amount += amount;
                }
                else if (daysOverdue <= 30) {
                    b.d_8_30.count += 1;
                    b.d_8_30.amount += amount;
                }
                else if (daysOverdue <= 90) {
                    b.d_31_90.count += 1;
                    b.d_31_90.amount += amount;
                }
                else if (daysOverdue <= 180) {
                    b.d_91_180.count += 1;
                    b.d_91_180.amount += amount;
                }
                else if (daysOverdue <= 365) {
                    b.d_181_365.count += 1;
                    b.d_181_365.amount += amount;
                }
                else {
                    b.d_365_plus.count += 1;
                    b.d_365_plus.amount += amount;
                }
            }
        }
        stats.atRiskBookingCount = atRiskBookingIds.size;
        return stats;
    }
    async detail(id) {
        const rows = await this.listByIds([id]);
        if (!rows.length)
            throw new common_1.NotFoundException(`DD ${id} not found`);
        const row = rows[0];
        const rootId = row.parentDemandDraftId ?? row.id;
        const threadIds = await this.ddRepo
            .createQueryBuilder('dd')
            .select('dd.id', 'id')
            .where('dd.id = :rootId', { rootId })
            .orWhere('dd.parent_demand_draft_id = :rootId', { rootId })
            .getRawMany();
        const thread = await this.listByIds(threadIds.map((r) => r.id));
        const timeline = [];
        const threadFull = await this.ddRepo.find({
            where: { id: (0, typeorm_2.In)([rootId, ...threadIds.map((r) => r.id)]) },
        });
        const paidAtByDd = new Map();
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
        const focal = await this.ddRepo.findOne({ where: { id } });
        if (focal?.metadata) {
            const contacts = focal.metadata.contacts || [];
            for (const c of contacts) {
                if (!c?.at)
                    continue;
                timeline.push({
                    at: new Date(c.at),
                    kind: 'contact',
                    label: `Contact attempt (${String(c.channel ?? 'other')})`,
                    detail: c.note ? String(c.note) : undefined,
                });
            }
            const pauses = focal.metadata.pauses || [];
            for (const p of pauses) {
                if (!p?.at)
                    continue;
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
    async pauseReminders(id, days, scope = 'plan', note) {
        const dd = await this.ddRepo.findOne({ where: { id } });
        if (!dd)
            throw new common_1.NotFoundException(`DD ${id} not found`);
        const pausedUntil = new Date();
        pausedUntil.setDate(pausedUntil.getDate() + Math.max(1, days));
        if (scope === 'customer' && dd.customerId) {
            const customer = await this.customerRepo.findOne({ where: { id: dd.customerId } });
            if (customer) {
                customer.pauseRemindersUntil = pausedUntil;
                await this.customerRepo.save(customer);
            }
        }
        else if (dd.flatPaymentPlanId) {
            const plan = await this.planRepo.findOne({ where: { id: dd.flatPaymentPlanId } });
            if (plan) {
                plan.pauseRemindersUntil = pausedUntil;
                await this.planRepo.save(plan);
            }
        }
        dd.metadata = {
            ...(dd.metadata || {}),
            pauses: [
                ...(dd.metadata?.pauses || []),
                { at: new Date().toISOString(), days, scope, note: note ?? null },
            ],
        };
        await this.ddRepo.save(dd);
        return { pausedUntil, scope };
    }
    async recordContact(id, input) {
        const dd = await this.ddRepo.findOne({ where: { id } });
        if (!dd)
            throw new common_1.NotFoundException(`DD ${id} not found`);
        dd.metadata = {
            ...(dd.metadata || {}),
            contacts: [
                ...(dd.metadata?.contacts || []),
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
    async bulkPause(ids, days, scope, note) {
        const ok = [];
        const failed = [];
        for (const id of ids) {
            try {
                await this.pauseReminders(id, days, scope, note);
                ok.push(id);
            }
            catch (err) {
                failed.push({ id, reason: err?.message || 'Failed' });
            }
        }
        return { ok, failed };
    }
    async pauseCustomer(customerId, days, note) {
        const customer = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${customerId} not found`);
        const pausedUntil = new Date();
        pausedUntil.setDate(pausedUntil.getDate() + Math.max(1, days));
        customer.pauseRemindersUntil = pausedUntil;
        await this.customerRepo.save(customer);
        const openDds = await this.ddRepo
            .createQueryBuilder('dd')
            .where('dd.customer_id = :customerId', { customerId })
            .andWhere('dd.status != :paid', { paid: demand_draft_entity_1.DemandDraftStatus.PAID })
            .getMany();
        const stamp = {
            at: new Date().toISOString(),
            days,
            scope: 'customer',
            note: note ?? null,
        };
        for (const dd of openDds) {
            dd.metadata = {
                ...(dd.metadata || {}),
                pauses: [...(dd.metadata?.pauses || []), stamp],
            };
        }
        if (openDds.length)
            await this.ddRepo.save(openDds);
        return { pausedUntil, affectedDds: openDds.length };
    }
    async bulkRecordContact(ids, input) {
        const ok = [];
        const failed = [];
        for (const id of ids) {
            try {
                await this.recordContact(id, input);
                ok.push(id);
            }
            catch (err) {
                failed.push({ id, reason: err?.message || 'Failed' });
            }
        }
        return { ok, failed };
    }
    async assignRows(ids, assigneeId, assignedBy) {
        if (!ids.length)
            return { updated: 0 };
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
    async listAssignees(filter = {}) {
        const qb = this.ddRepo
            .createQueryBuilder('dd')
            .leftJoin('users', 'u', 'u.id = dd.collector_user_id')
            .select('dd.collector_user_id', 'userId')
            .addSelect(`COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`, 'name')
            .addSelect('u.email', 'email')
            .addSelect('COUNT(dd.id)::int', 'assignedCount')
            .addSelect(`SUM(CASE WHEN ${DAYS_OVERDUE_SQL} > 0 THEN 1 ELSE 0 END)::int`, 'overdueCount')
            .where('dd.collector_user_id IS NOT NULL')
            .andWhere('dd.status != :paid', { paid: demand_draft_entity_1.DemandDraftStatus.PAID });
        if (filter.propertyId) {
            qb.leftJoin(flat_entity_1.Flat, 'f', 'f.id = dd.flat_id')
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
    async listByIds(ids) {
        if (!ids.length)
            return [];
        const qb = this.ddRepo
            .createQueryBuilder('dd')
            .leftJoin(customer_entity_1.Customer, 'c', 'c.id = dd.customer_id')
            .leftJoin(booking_entity_1.Booking, 'b', 'b.id = dd.booking_id')
            .leftJoin(flat_entity_1.Flat, 'f', 'f.id = dd.flat_id')
            .leftJoin('towers', 't', 't.id = f.tower_id')
            .leftJoin(flat_payment_plan_entity_1.FlatPaymentPlan, 'p', 'p.id = dd.flat_payment_plan_id')
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
            .addSelect(`COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.email)`, 'collectorName')
            .where('dd.id = ANY(:ids)', { ids });
        const raw = await qb.getRawMany();
        const byId = new Map(raw.map((r) => [r.id, this.hydrateRow(r)]));
        return ids.map((id) => byId.get(id)).filter(Boolean);
    }
    hydrateRow(r) {
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
        const pauseRemindersUntil = customerPause && planPause
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
    classifyTier(args) {
        if (args.bookingStatus === booking_entity_1.BookingStatus.AT_RISK)
            return 'AT_RISK';
        if (args.cancellationWarningIssuedAt && args.escalationLevel >= 6)
            return 'POST_WARNING';
        if (args.cancellationWarningIssuedAt || args.escalationLevel === 5)
            return 'WARNING';
        if (args.escalationLevel === 4)
            return 'REMINDER_4';
        if (args.escalationLevel === 3)
            return 'REMINDER_3';
        if (args.escalationLevel === 2)
            return 'REMINDER_2';
        if (args.escalationLevel === 1)
            return 'REMINDER_1';
        if (args.daysOverdue > 0)
            return 'OVERDUE';
        return 'ON_TRACK';
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = CollectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(4, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map