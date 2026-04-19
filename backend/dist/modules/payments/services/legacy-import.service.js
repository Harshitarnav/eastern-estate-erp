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
var LegacyImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const payment_entity_1 = require("../entities/payment.entity");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const settings_service_1 = require("../../settings/settings.service");
const accounting_integration_service_1 = require("../../accounting/accounting-integration.service");
let LegacyImportService = LegacyImportService_1 = class LegacyImportService {
    constructor(customerRepo, bookingRepo, flatRepo, planRepo, paymentRepo, ddRepo, settingsService, accountingIntegration, dataSource) {
        this.customerRepo = customerRepo;
        this.bookingRepo = bookingRepo;
        this.flatRepo = flatRepo;
        this.planRepo = planRepo;
        this.paymentRepo = paymentRepo;
        this.ddRepo = ddRepo;
        this.settingsService = settingsService;
        this.accountingIntegration = accountingIntegration;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(LegacyImportService_1.name);
    }
    async preview(payload) {
        const errors = [];
        const warnings = [];
        const batchId = payload.importBatchId ?? `legacy-${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        const now = new Date();
        const customerRowIds = new Set();
        const bookingRowIds = new Set();
        for (const [idx, c] of payload.customers.entries()) {
            if (!c.rowId) {
                errors.push(`customers[${idx}]: missing rowId`);
                continue;
            }
            if (customerRowIds.has(c.rowId)) {
                errors.push(`customers[${idx}]: duplicate rowId "${c.rowId}"`);
            }
            customerRowIds.add(c.rowId);
            if (!c.existingCustomerId) {
                if (!c.fullName?.trim()) {
                    errors.push(`customers[${idx}] (${c.rowId}): fullName is required for new customers`);
                }
                if (!c.phoneNumber?.trim()) {
                    errors.push(`customers[${idx}] (${c.rowId}): phoneNumber is required for new customers`);
                }
            }
        }
        const existingIds = payload.customers
            .map((c) => c.existingCustomerId)
            .filter((x) => !!x);
        let existingFound = 0;
        if (existingIds.length > 0) {
            const found = await this.customerRepo
                .createQueryBuilder('c')
                .where('c.id IN (:...ids)', { ids: existingIds })
                .select('c.id')
                .getMany();
            existingFound = found.length;
            if (found.length !== existingIds.length) {
                const foundIds = new Set(found.map((c) => c.id));
                for (const id of existingIds) {
                    if (!foundIds.has(id)) {
                        errors.push(`existingCustomerId ${id} not found in database`);
                    }
                }
            }
        }
        const flatIds = new Set(payload.bookings.map((b) => b.flatId));
        const foundFlats = await this.flatRepo
            .createQueryBuilder('f')
            .where('f.id IN (:...ids)', { ids: Array.from(flatIds) })
            .select(['f.id', 'f.propertyId'])
            .getMany();
        const flatMap = new Map(foundFlats.map((f) => [f.id, f]));
        for (const [idx, b] of payload.bookings.entries()) {
            if (!b.rowId) {
                errors.push(`bookings[${idx}]: missing rowId`);
                continue;
            }
            if (bookingRowIds.has(b.rowId)) {
                errors.push(`bookings[${idx}]: duplicate rowId "${b.rowId}"`);
            }
            bookingRowIds.add(b.rowId);
            if (!b.flatId) {
                errors.push(`bookings[${idx}] (${b.rowId}): flatId is required`);
            }
            else if (!flatMap.has(b.flatId)) {
                errors.push(`bookings[${idx}] (${b.rowId}): flatId ${b.flatId} not found`);
            }
            if (!b.existingCustomerId && !b.customerRowId) {
                errors.push(`bookings[${idx}] (${b.rowId}): must specify customerRowId or existingCustomerId`);
            }
            if (b.customerRowId && !customerRowIds.has(b.customerRowId)) {
                errors.push(`bookings[${idx}] (${b.rowId}): customerRowId "${b.customerRowId}" not declared in customers[]`);
            }
            if (!b.bookingDate) {
                errors.push(`bookings[${idx}] (${b.rowId}): bookingDate is required`);
            }
            if (typeof b.totalAmount !== 'number' || b.totalAmount <= 0) {
                errors.push(`bookings[${idx}] (${b.rowId}): totalAmount must be > 0`);
            }
        }
        const milestonesByBooking = new Map();
        for (const [idx, m] of payload.milestones.entries()) {
            if (!m.bookingRowId) {
                errors.push(`milestones[${idx}]: missing bookingRowId`);
                continue;
            }
            if (!bookingRowIds.has(m.bookingRowId)) {
                errors.push(`milestones[${idx}]: bookingRowId "${m.bookingRowId}" not declared in bookings[]`);
                continue;
            }
            if (typeof m.amount !== 'number' || m.amount < 0) {
                errors.push(`milestones[${idx}]: amount must be >= 0`);
            }
            const arr = milestonesByBooking.get(m.bookingRowId) ?? [];
            arr.push(m);
            milestonesByBooking.set(m.bookingRowId, arr);
        }
        for (const b of payload.bookings) {
            if (!milestonesByBooking.has(b.rowId)) {
                warnings.push(`Booking "${b.rowId}" has no milestones - plan will be created empty`);
            }
        }
        for (const b of payload.bookings) {
            const ms = milestonesByBooking.get(b.rowId) ?? [];
            const sum = ms.reduce((s, m) => s + Number(m.amount || 0), 0);
            if (ms.length > 0 && Math.abs(sum - Number(b.totalAmount || 0)) > 1) {
                warnings.push(`Booking "${b.rowId}": sum of milestone amounts (${sum}) does not match booking.totalAmount (${b.totalAmount})`);
            }
        }
        let overdueCount = 0;
        for (const m of payload.milestones) {
            const isUnpaid = !m.status || m.status === 'PENDING' || m.status === 'OVERDUE' || m.status === 'TRIGGERED';
            if (!isUnpaid)
                continue;
            if (!m.dueDate)
                continue;
            if (new Date(m.dueDate) < now)
                overdueCount += 1;
        }
        const payments = payload.payments ?? [];
        for (const [idx, p] of payments.entries()) {
            if (!p.bookingRowId) {
                errors.push(`payments[${idx}]: missing bookingRowId`);
                continue;
            }
            if (!bookingRowIds.has(p.bookingRowId)) {
                errors.push(`payments[${idx}]: bookingRowId "${p.bookingRowId}" not declared`);
            }
            if (typeof p.amount !== 'number' || p.amount <= 0) {
                errors.push(`payments[${idx}]: amount must be > 0`);
            }
            if (!p.paymentDate) {
                errors.push(`payments[${idx}]: paymentDate is required`);
            }
        }
        if (payload.importBatchId) {
            const existing = await this.planRepo.count({
                where: { importBatchId: payload.importBatchId },
            });
            if (existing > 0) {
                warnings.push(`importBatchId "${payload.importBatchId}" already has ${existing} plan(s) - commit will skip those rows (idempotent)`);
            }
        }
        return {
            importBatchId: batchId,
            summary: {
                customers: payload.customers.filter((c) => !c.existingCustomerId).length,
                existingCustomersReferenced: existingFound,
                bookings: payload.bookings.length,
                milestones: payload.milestones.length,
                payments: payments.length,
                estimatedOverdueMilestones: overdueCount,
            },
            errors,
            warnings,
        };
    }
    async commit(payload, actorUserId) {
        const pre = await this.preview(payload);
        if (pre.errors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Validation errors prevent commit',
                errors: pre.errors,
                warnings: pre.warnings,
            });
        }
        const batchId = pre.importBatchId;
        const settings = await this.settingsService.get();
        const legacyMaxAge = settings.legacyAutoRemindMaxAgeDays ?? 180;
        const result = {
            importBatchId: batchId,
            created: {
                customers: 0,
                bookings: 0,
                plans: 0,
                milestones: 0,
                payments: 0,
                demandDrafts: 0,
            },
            errors: [],
        };
        await this.dataSource.transaction(async (mgr) => {
            const rowIdToCustomerId = new Map();
            const rowIdToBookingId = new Map();
            const rowIdToPlanId = new Map();
            const rowIdToBooking = new Map();
            for (const c of payload.customers) {
                if (c.existingCustomerId) {
                    rowIdToCustomerId.set(c.rowId, c.existingCustomerId);
                    continue;
                }
                const customer = mgr.create(customer_entity_1.Customer, {
                    customerCode: await this.nextCustomerCode(mgr),
                    fullName: c.fullName,
                    email: c.email ?? undefined,
                    phoneNumber: c.phoneNumber,
                    panNumber: c.panNumber ?? undefined,
                    aadharNumber: c.aadharNumber ?? undefined,
                    addressLine1: c.addressLine1 ?? undefined,
                    city: c.city ?? undefined,
                    state: c.state ?? undefined,
                    pincode: c.pincode ?? undefined,
                    notes: c.notes ?? undefined,
                    isActive: true,
                    metadata: { legacyImportBatchId: batchId },
                });
                const saved = await mgr.save(customer_entity_1.Customer, customer);
                rowIdToCustomerId.set(c.rowId, saved.id);
                result.created.customers += 1;
            }
            for (const b of payload.bookings) {
                const customerId = b.existingCustomerId
                    ? b.existingCustomerId
                    : rowIdToCustomerId.get(b.customerRowId);
                const flat = await mgr.findOne(flat_entity_1.Flat, { where: { id: b.flatId } });
                if (!flat) {
                    result.errors.push(`flat ${b.flatId} vanished during commit`);
                    continue;
                }
                const bookingNumber = b.bookingNumber?.trim() ||
                    `BK-LEGACY-${batchId.slice(-6)}-${String(result.created.bookings + 1).padStart(4, '0')}`;
                const booking = mgr.create(booking_entity_1.Booking, {
                    bookingNumber,
                    customerId,
                    flatId: b.flatId,
                    propertyId: flat.propertyId,
                    status: booking_entity_1.BookingStatus.CONFIRMED,
                    bookingDate: new Date(b.bookingDate),
                    totalAmount: Number(b.totalAmount),
                    tokenAmount: Number(b.tokenAmount ?? 0),
                    paidAmount: 0,
                    balanceAmount: Number(b.totalAmount),
                    isActive: true,
                    notes: `Legacy import - batch ${batchId}`,
                });
                const saved = await mgr.save(booking_entity_1.Booking, booking);
                rowIdToBookingId.set(b.rowId, saved.id);
                rowIdToBooking.set(b.rowId, saved);
                result.created.bookings += 1;
            }
            const milestonesByBooking = new Map();
            for (const m of payload.milestones) {
                const arr = milestonesByBooking.get(m.bookingRowId) ?? [];
                arr.push(m);
                milestonesByBooking.set(m.bookingRowId, arr);
            }
            const now = new Date();
            for (const b of payload.bookings) {
                const bookingId = rowIdToBookingId.get(b.rowId);
                const customerId = rowIdToCustomerId.get(b.customerRowId ?? b.existingCustomerId);
                if (!bookingId)
                    continue;
                const ms = (milestonesByBooking.get(b.rowId) ?? []).sort((a, z) => a.sequence - z.sequence);
                const milestoneJson = ms.map((m) => ({
                    sequence: m.sequence,
                    name: m.name,
                    constructionPhase: m.constructionPhase ?? null,
                    phasePercentage: m.phasePercentage ?? null,
                    amount: Number(m.amount),
                    dueDate: m.dueDate ?? null,
                    status: (m.status ?? 'PENDING'),
                    paymentScheduleId: null,
                    constructionCheckpointId: null,
                    demandDraftId: null,
                    paymentId: null,
                    completedAt: null,
                    description: m.description ?? '',
                }));
                let defaultRemindersEnabled = true;
                if (b.remindersEnabled !== undefined) {
                    defaultRemindersEnabled = !!b.remindersEnabled;
                }
                else {
                    const oldestOverdueAgeDays = milestoneJson
                        .filter((m) => m.status !== 'PAID' && m.dueDate)
                        .map((m) => this.daysBetween(new Date(m.dueDate), now))
                        .filter((d) => d > 0)
                        .reduce((max, d) => Math.max(max, d), 0);
                    if (oldestOverdueAgeDays > legacyMaxAge) {
                        defaultRemindersEnabled = false;
                    }
                }
                const plan = mgr.create(flat_payment_plan_entity_1.FlatPaymentPlan, {
                    flatId: b.flatId,
                    bookingId,
                    customerId,
                    paymentPlanTemplateId: null,
                    totalAmount: Number(b.totalAmount),
                    paidAmount: 0,
                    balanceAmount: Number(b.totalAmount),
                    milestones: milestoneJson,
                    status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE,
                    isLegacyImport: b.isLegacyImport !== false,
                    importedAt: now,
                    initialEscalationLevel: b.initialEscalationLevel ?? 0,
                    remindersEnabled: defaultRemindersEnabled,
                    importBatchId: batchId,
                });
                const savedPlan = await mgr.save(flat_payment_plan_entity_1.FlatPaymentPlan, plan);
                rowIdToPlanId.set(b.rowId, savedPlan.id);
                result.created.plans += 1;
                result.created.milestones += milestoneJson.length;
            }
            const payments = payload.payments ?? [];
            const paymentsByBookingRow = new Map();
            for (const p of payments) {
                const arr = paymentsByBookingRow.get(p.bookingRowId) ?? [];
                arr.push(p);
                paymentsByBookingRow.set(p.bookingRowId, arr);
            }
            const createdPaymentRefs = [];
            for (const b of payload.bookings) {
                const bookingId = rowIdToBookingId.get(b.rowId);
                const booking = rowIdToBooking.get(b.rowId);
                const planId = rowIdToPlanId.get(b.rowId);
                if (!bookingId || !booking)
                    continue;
                const bookingPayments = (paymentsByBookingRow.get(b.rowId) ?? []).slice().sort((a, z) => new Date(a.paymentDate).getTime() - new Date(z.paymentDate).getTime());
                if (bookingPayments.length === 0)
                    continue;
                const plan = planId
                    ? await mgr.findOne(flat_payment_plan_entity_1.FlatPaymentPlan, { where: { id: planId } })
                    : null;
                const milestones = plan
                    ? [...(plan.milestones ?? [])].sort((a, z) => a.sequence - z.sequence)
                    : [];
                const milestoneRemaining = new Map(milestones.map((m) => [
                    m.sequence,
                    Math.max(0, Number(m.amount) - (m.status === 'PAID' ? Number(m.amount) : 0)),
                ]));
                let totalPaid = 0;
                for (const p of bookingPayments) {
                    const paymentCode = `PAY-LEGACY-${batchId.slice(-6)}-${String(result.created.payments + 1).padStart(4, '0')}`;
                    const payment = mgr.create(payment_entity_1.Payment, {
                        paymentCode,
                        bookingId,
                        customerId: booking.customerId,
                        paymentType: 'INSTALLMENT',
                        paymentMethod: p.paymentMode,
                        amount: Number(p.amount),
                        paymentDate: new Date(p.paymentDate),
                        transactionReference: p.referenceNumber ?? undefined,
                        status: 'COMPLETED',
                        notes: p.notes ?? `Legacy import - batch ${batchId}`,
                        verifiedAt: new Date(p.paymentDate),
                    });
                    const savedPayment = await mgr.save(payment_entity_1.Payment, payment);
                    result.created.payments += 1;
                    totalPaid += Number(p.amount);
                    createdPaymentRefs.push({
                        id: savedPayment.id,
                        paymentCode: savedPayment.paymentCode,
                        amount: Number(savedPayment.amount),
                        paymentDate: savedPayment.paymentDate,
                        paymentMethod: savedPayment.paymentMethod,
                    });
                    let remainingToAllocate = Number(p.amount);
                    const orderedSeqs = [];
                    if (typeof p.milestoneSequence === 'number') {
                        orderedSeqs.push(p.milestoneSequence);
                    }
                    for (const m of milestones) {
                        if (!orderedSeqs.includes(m.sequence))
                            orderedSeqs.push(m.sequence);
                    }
                    for (const seq of orderedSeqs) {
                        if (remainingToAllocate <= 0)
                            break;
                        const remain = milestoneRemaining.get(seq) ?? 0;
                        if (remain <= 0)
                            continue;
                        const applied = Math.min(remainingToAllocate, remain);
                        milestoneRemaining.set(seq, remain - applied);
                        remainingToAllocate -= applied;
                        const ms = milestones.find((m) => m.sequence === seq);
                        if (!ms)
                            continue;
                        const stillOwed = milestoneRemaining.get(seq) ?? 0;
                        if (stillOwed <= 0) {
                            ms.status = 'PAID';
                            ms.paymentId = savedPayment.id;
                            ms.completedAt = new Date(p.paymentDate).toISOString();
                        }
                    }
                }
                booking.paidAmount = totalPaid;
                booking.balanceAmount = Math.max(0, Number(booking.totalAmount) - totalPaid);
                if (booking.balanceAmount <= 0) {
                    booking.status = booking_entity_1.BookingStatus.COMPLETED;
                }
                await mgr.save(booking_entity_1.Booking, booking);
                if (plan) {
                    plan.milestones = milestones;
                    plan.paidAmount = totalPaid;
                    plan.balanceAmount = Math.max(0, Number(plan.totalAmount) - totalPaid);
                    await mgr.save(flat_payment_plan_entity_1.FlatPaymentPlan, plan);
                }
            }
            for (const b of payload.bookings) {
                const planId = rowIdToPlanId.get(b.rowId);
                const bookingId = rowIdToBookingId.get(b.rowId);
                if (!planId || !bookingId)
                    continue;
                const customerId = rowIdToCustomerId.get(b.customerRowId ?? b.existingCustomerId);
                const plan = await mgr.findOne(flat_payment_plan_entity_1.FlatPaymentPlan, { where: { id: planId } });
                if (!plan)
                    continue;
                const initialLevel = b.initialEscalationLevel ?? 0;
                const toneForInitial = initialLevel === 0
                    ? demand_draft_entity_1.DemandDraftTone.ON_TIME
                    : initialLevel === 1
                        ? demand_draft_entity_1.DemandDraftTone.REMINDER_1
                        : initialLevel === 2
                            ? demand_draft_entity_1.DemandDraftTone.REMINDER_2
                            : demand_draft_entity_1.DemandDraftTone.REMINDER_3;
                for (const m of plan.milestones) {
                    if (m.status === 'PAID')
                        continue;
                    if (!m.dueDate)
                        continue;
                    const dueDate = new Date(m.dueDate);
                    const daysOverdue = this.daysBetween(dueDate, now);
                    if (daysOverdue <= 0)
                        continue;
                    const existing = await mgr.findOne(demand_draft_entity_1.DemandDraft, {
                        where: { flatId: b.flatId, milestoneId: String(m.sequence) },
                    });
                    if (existing)
                        continue;
                    const refNumber = `DD-LEGACY-${batchId.slice(-6)}-${String(m.sequence).padStart(2, '0')}`;
                    const dd = mgr.create(demand_draft_entity_1.DemandDraft, {
                        flatId: b.flatId,
                        customerId,
                        bookingId,
                        milestoneId: String(m.sequence),
                        title: `${m.name} (legacy)`,
                        amount: Number(m.amount),
                        status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
                        content: '',
                        dueDate,
                        metadata: {
                            legacyImportBatchId: batchId,
                            refNumber,
                            note: 'Auto-materialized by LegacyImportService on commit',
                        },
                        flatPaymentPlanId: plan.id,
                        autoGenerated: true,
                        requiresReview: true,
                        tone: toneForInitial,
                        reminderCount: 0,
                        escalationLevel: initialLevel,
                        daysOverdue,
                        importBatchId: batchId,
                        generatedAt: now,
                        createdBy: actorUserId,
                    });
                    await mgr.save(demand_draft_entity_1.DemandDraft, dd);
                    result.created.demandDrafts += 1;
                }
            }
        });
        this.logger.log(`Legacy import ${batchId} committed: ${JSON.stringify(result.created)}`);
        let jeCreated = 0;
        let jeFailed = 0;
        const postCommitPayments = await this.dataSource
            .getRepository(payment_entity_1.Payment)
            .createQueryBuilder('p')
            .where('p.payment_code LIKE :prefix', { prefix: `PAY-LEGACY-${batchId.slice(-6)}-%` })
            .getMany();
        for (const p of postCommitPayments) {
            try {
                await this.accountingIntegration.onPaymentCompleted({
                    id: p.id,
                    paymentCode: p.paymentCode,
                    amount: Number(p.amount),
                    paymentDate: p.paymentDate,
                    paymentMethod: p.paymentMethod,
                    createdBy: actorUserId ?? undefined,
                });
                jeCreated += 1;
            }
            catch (err) {
                jeFailed += 1;
                result.errors.push(`Accounting JE failed for ${p.paymentCode}: ${err?.message ?? err}`);
            }
        }
        this.logger.log(`Legacy import ${batchId} accounting sweep: created=${jeCreated} failed=${jeFailed}`);
        return result;
    }
    daysBetween(from, to) {
        return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    }
    async nextCustomerCode(mgr) {
        const date = new Date();
        const yr = date.getFullYear().toString().slice(-2);
        const mo = (date.getMonth() + 1).toString().padStart(2, '0');
        let seq = 1;
        while (true) {
            const code = `CU${yr}${mo}${seq.toString().padStart(4, '0')}-L`;
            const exists = await mgr.findOne(customer_entity_1.Customer, { where: { customerCode: code } });
            if (!exists)
                return code;
            seq += 1;
        }
    }
};
exports.LegacyImportService = LegacyImportService;
exports.LegacyImportService = LegacyImportService = LegacyImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(3, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(5, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService,
        accounting_integration_service_1.AccountingIntegrationService,
        typeorm_2.DataSource])
], LegacyImportService);
//# sourceMappingURL=legacy-import.service.js.map