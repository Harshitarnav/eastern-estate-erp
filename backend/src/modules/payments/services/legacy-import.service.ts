import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Customer } from '../../customers/entities/customer.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Flat } from '../../flats/entities/flat.entity';
import {
  FlatPaymentPlan,
  FlatPaymentPlanStatus,
  FlatPaymentMilestone,
} from '../../payment-plans/entities/flat-payment-plan.entity';
import { Payment } from '../entities/payment.entity';
import {
  DemandDraft,
  DemandDraftStatus,
  DemandDraftTone,
} from '../../demand-drafts/entities/demand-draft.entity';
import { SettingsService } from '../../settings/settings.service';
import { AccountingIntegrationService } from '../../accounting/accounting-integration.service';

// ─────────────────────────────────────────────────────────────────────────────
// DTO shapes (kept as plain interfaces so we can accept any JSON payload -
// the controller runs light validation before handing it here).
// ─────────────────────────────────────────────────────────────────────────────

export interface LegacyCustomerInput {
  rowId: string; // caller-chosen temp id (used by bookings)
  existingCustomerId?: string; // if already in the DB, skip create
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  panNumber?: string;
  aadharNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
}

export interface LegacyBookingInput {
  rowId: string;
  customerRowId?: string;
  existingCustomerId?: string;
  flatId: string; // must exist in flats
  bookingNumber?: string; // auto-generated if absent
  bookingDate: string; // ISO date string (YYYY-MM-DD)
  totalAmount: number;
  tokenAmount?: number;
  isLegacyImport?: boolean; // defaults to true in this importer
  initialEscalationLevel?: 0 | 1 | 2 | 3; // admin override
  remindersEnabled?: boolean; // optional explicit override
}

export interface LegacyMilestoneInput {
  bookingRowId: string;
  sequence: number;
  name: string;
  description?: string;
  amount: number;
  paymentPercentage?: number;
  dueDate?: string; // ISO date string
  constructionPhase?: string;
  phasePercentage?: number;
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'TRIGGERED';
}

export interface LegacyPaymentInput {
  bookingRowId: string;
  milestoneSequence?: number;
  amount: number;
  paymentDate: string; // ISO date
  paymentMode: string;
  referenceNumber?: string;
  notes?: string;
}

export interface LegacyImportPayload {
  importBatchId?: string; // auto-generated if absent
  customers: LegacyCustomerInput[];
  bookings: LegacyBookingInput[];
  milestones: LegacyMilestoneInput[];
  payments?: LegacyPaymentInput[];
}

export interface LegacyImportPreview {
  importBatchId: string;
  summary: {
    customers: number;
    existingCustomersReferenced: number;
    bookings: number;
    milestones: number;
    payments: number;
    estimatedOverdueMilestones: number;
  };
  errors: string[];
  warnings: string[];
}

export interface LegacyImportResult {
  importBatchId: string;
  created: {
    customers: number;
    bookings: number;
    plans: number;
    milestones: number;
    payments: number;
    demandDrafts: number;
  };
  errors: string[];
}

/**
 * LegacyImportService
 * ===================
 *
 * Preview + commit entry points for importing historical customers / bookings
 * / payment plans / past payments into the ERP.
 *
 * Designed for the specific PR1 use case: ~15 Cr rupees of pending
 * collections spread across 5 years of pre-ERP bookings, each with a
 * bespoke payment plan.
 *
 * Key guarantees:
 * - Preview is read-only and never touches the DB.
 * - Commit is idempotent via importBatchId - re-running the same batch
 *   is a no-op (skips everything that already has matching import_batch_id).
 * - Each plan is created with is_legacy_import=true and imported_at=now.
 * - Unpaid milestones whose dueDate is in the past are auto-materialized
 *   as DemandDraft rows in DRAFT status so they immediately surface in
 *   the Collections inbox for human review.
 * - remindersEnabled defaults to false for legacy plans where the oldest
 *   overdue is beyond legacy_auto_remind_max_age_days (hybrid rule).
 */
@Injectable()
export class LegacyImportService {
  private readonly logger = new Logger(LegacyImportService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Flat)
    private readonly flatRepo: Repository<Flat>,
    @InjectRepository(FlatPaymentPlan)
    private readonly planRepo: Repository<FlatPaymentPlan>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(DemandDraft)
    private readonly ddRepo: Repository<DemandDraft>,
    private readonly settingsService: SettingsService,
    private readonly accountingIntegration: AccountingIntegrationService,
    private readonly dataSource: DataSource,
  ) {}

  // ────────────────────────────────────────────────────────────────────────
  // Preview (read-only)
  // ────────────────────────────────────────────────────────────────────────

  async preview(payload: LegacyImportPayload): Promise<LegacyImportPreview> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const batchId = payload.importBatchId ?? `legacy-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const now = new Date();

    const customerRowIds = new Set<string>();
    const bookingRowIds = new Set<string>();

    // ── 1. Validate customers ─────────────────────────────────────────────
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

    // Check that existingCustomerIds actually exist.
    const existingIds = payload.customers
      .map((c) => c.existingCustomerId)
      .filter((x): x is string => !!x);
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

    // ── 2. Validate bookings ──────────────────────────────────────────────
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
      } else if (!flatMap.has(b.flatId)) {
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

    // ── 3. Validate milestones + estimate overdues ────────────────────────
    const milestonesByBooking = new Map<string, LegacyMilestoneInput[]>();
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

    // Warn if a booking has no milestones.
    for (const b of payload.bookings) {
      if (!milestonesByBooking.has(b.rowId)) {
        warnings.push(`Booking "${b.rowId}" has no milestones - plan will be created empty`);
      }
    }

    // Warn if milestone totals do not match bookings.totalAmount (within 1 rupee).
    for (const b of payload.bookings) {
      const ms = milestonesByBooking.get(b.rowId) ?? [];
      const sum = ms.reduce((s, m) => s + Number(m.amount || 0), 0);
      if (ms.length > 0 && Math.abs(sum - Number(b.totalAmount || 0)) > 1) {
        warnings.push(
          `Booking "${b.rowId}": sum of milestone amounts (${sum}) does not match booking.totalAmount (${b.totalAmount})`,
        );
      }
    }

    // Estimate how many overdue DDs will be materialized on commit.
    let overdueCount = 0;
    for (const m of payload.milestones) {
      const isUnpaid = !m.status || m.status === 'PENDING' || m.status === 'OVERDUE' || m.status === 'TRIGGERED';
      if (!isUnpaid) continue;
      if (!m.dueDate) continue;
      if (new Date(m.dueDate) < now) overdueCount += 1;
    }

    // ── 4. Validate payments ──────────────────────────────────────────────
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

    // ── 5. Idempotency check ──────────────────────────────────────────────
    if (payload.importBatchId) {
      const existing = await this.planRepo.count({
        where: { importBatchId: payload.importBatchId },
      });
      if (existing > 0) {
        warnings.push(
          `importBatchId "${payload.importBatchId}" already has ${existing} plan(s) - commit will skip those rows (idempotent)`,
        );
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

  // ────────────────────────────────────────────────────────────────────────
  // Commit (transactional + idempotent)
  // ────────────────────────────────────────────────────────────────────────

  async commit(
    payload: LegacyImportPayload,
    actorUserId: string | null,
  ): Promise<LegacyImportResult> {
    // Preview first to surface validation errors before we write anything.
    const pre = await this.preview(payload);
    if (pre.errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation errors prevent commit',
        errors: pre.errors,
        warnings: pre.warnings,
      });
    }

    const batchId = pre.importBatchId;
    const settings = await this.settingsService.get();
    const legacyMaxAge = settings.legacyAutoRemindMaxAgeDays ?? 180;

    const result: LegacyImportResult = {
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

    // Single transaction for the whole import - if anything fails, we
    // roll back so the admin can fix and retry.
    await this.dataSource.transaction(async (mgr) => {
      const rowIdToCustomerId = new Map<string, string>();
      const rowIdToBookingId = new Map<string, string>();
      const rowIdToPlanId = new Map<string, string>();
      const rowIdToBooking = new Map<string, Booking>();

      // ── 1. Customers ────────────────────────────────────────────────────
      for (const c of payload.customers) {
        if (c.existingCustomerId) {
          rowIdToCustomerId.set(c.rowId, c.existingCustomerId);
          continue;
        }
        const customer = mgr.create(Customer, {
          customerCode: await this.nextCustomerCode(mgr),
          fullName: c.fullName!,
          email: c.email ?? undefined,
          phoneNumber: c.phoneNumber!,
          panNumber: c.panNumber ?? undefined,
          aadharNumber: c.aadharNumber ?? undefined,
          addressLine1: c.addressLine1 ?? undefined,
          city: c.city ?? undefined,
          state: c.state ?? undefined,
          pincode: c.pincode ?? undefined,
          notes: c.notes ?? undefined,
          isActive: true,
          metadata: { legacyImportBatchId: batchId },
        } as Partial<Customer>);
        const saved = await mgr.save(Customer, customer);
        rowIdToCustomerId.set(c.rowId, saved.id);
        result.created.customers += 1;
      }

      // ── 2. Bookings ─────────────────────────────────────────────────────
      for (const b of payload.bookings) {
        const customerId = b.existingCustomerId
          ? b.existingCustomerId
          : rowIdToCustomerId.get(b.customerRowId!)!;

        const flat = await mgr.findOne(Flat, { where: { id: b.flatId } });
        if (!flat) {
          result.errors.push(`flat ${b.flatId} vanished during commit`);
          continue;
        }

        const bookingNumber =
          b.bookingNumber?.trim() ||
          `BK-LEGACY-${batchId.slice(-6)}-${String(result.created.bookings + 1).padStart(4, '0')}`;

        const booking = mgr.create(Booking, {
          bookingNumber,
          customerId,
          flatId: b.flatId,
          propertyId: flat.propertyId,
          status: BookingStatus.CONFIRMED, // legacy ones are treated as confirmed unless overdue scanner flips to AT_RISK later
          bookingDate: new Date(b.bookingDate),
          totalAmount: Number(b.totalAmount),
          tokenAmount: Number(b.tokenAmount ?? 0),
          paidAmount: 0,
          balanceAmount: Number(b.totalAmount),
          isActive: true,
          notes: `Legacy import - batch ${batchId}`,
        } as Partial<Booking>);
        const saved = await mgr.save(Booking, booking);
        rowIdToBookingId.set(b.rowId, saved.id);
        rowIdToBooking.set(b.rowId, saved);
        result.created.bookings += 1;
      }

      // ── 3. Flat payment plans (one per booking) + milestones ────────────
      const milestonesByBooking = new Map<string, LegacyMilestoneInput[]>();
      for (const m of payload.milestones) {
        const arr = milestonesByBooking.get(m.bookingRowId) ?? [];
        arr.push(m);
        milestonesByBooking.set(m.bookingRowId, arr);
      }

      const now = new Date();
      for (const b of payload.bookings) {
        const bookingId = rowIdToBookingId.get(b.rowId);
        const customerId = rowIdToCustomerId.get(b.customerRowId ?? b.existingCustomerId!)!;
        if (!bookingId) continue;

        const ms = (milestonesByBooking.get(b.rowId) ?? []).sort(
          (a, z) => a.sequence - z.sequence,
        );
        const milestoneJson: FlatPaymentMilestone[] = ms.map((m) => ({
          sequence: m.sequence,
          name: m.name,
          constructionPhase: (m.constructionPhase as any) ?? null,
          phasePercentage: m.phasePercentage ?? null,
          amount: Number(m.amount),
          dueDate: m.dueDate ?? null,
          status: (m.status ?? 'PENDING') as any,
          paymentScheduleId: null,
          constructionCheckpointId: null,
          demandDraftId: null,
          paymentId: null,
          completedAt: null,
          description: m.description ?? '',
        }));

        // Hybrid rule: check oldest overdue age to decide default for
        // remindersEnabled. If admin explicitly passed a value, respect it.
        let defaultRemindersEnabled = true;
        if (b.remindersEnabled !== undefined) {
          defaultRemindersEnabled = !!b.remindersEnabled;
        } else {
          const oldestOverdueAgeDays = milestoneJson
            .filter((m) => m.status !== 'PAID' && m.dueDate)
            .map((m) => this.daysBetween(new Date(m.dueDate!), now))
            .filter((d) => d > 0)
            .reduce((max, d) => Math.max(max, d), 0);
          if (oldestOverdueAgeDays > legacyMaxAge) {
            defaultRemindersEnabled = false;
          }
        }

        const plan = mgr.create(FlatPaymentPlan, {
          flatId: b.flatId,
          bookingId,
          customerId,
          paymentPlanTemplateId: null as any,
          totalAmount: Number(b.totalAmount),
          paidAmount: 0,
          balanceAmount: Number(b.totalAmount),
          milestones: milestoneJson,
          status: FlatPaymentPlanStatus.ACTIVE,
          isLegacyImport: b.isLegacyImport !== false,
          importedAt: now,
          initialEscalationLevel: b.initialEscalationLevel ?? 0,
          remindersEnabled: defaultRemindersEnabled,
          importBatchId: batchId,
        } as Partial<FlatPaymentPlan>);
        const savedPlan = await mgr.save(FlatPaymentPlan, plan);
        rowIdToPlanId.set(b.rowId, savedPlan.id);
        result.created.plans += 1;
        result.created.milestones += milestoneJson.length;
      }

      // ── 4. Historical payments ──────────────────────────────────────────
      //
      // Two things happen here that used to be missing:
      //
      //   (a) We track the saved Payment rows so we can fire the
      //       accounting journal entry post-commit. Without this,
      //       historical payments never hit the books and reports
      //       under-report revenue by the full imported amount.
      //   (b) Per-booking totals are walked in payment-date order and
      //       allocated across the plan milestones FIFO-style, marking
      //       each covered milestone PAID with the payment's id. This
      //       matches what PaymentCompletionService does for live
      //       payments and ensures the "status" column in the payment
      //       plan is meaningful - previously every legacy milestone
      //       stayed PENDING even when the booking was 100% paid,
      //       which caused the overdue scanner to raise spurious DDs.
      const payments = payload.payments ?? [];
      const paymentsByBookingRow = new Map<string, LegacyPaymentInput[]>();
      for (const p of payments) {
        const arr = paymentsByBookingRow.get(p.bookingRowId) ?? [];
        arr.push(p);
        paymentsByBookingRow.set(p.bookingRowId, arr);
      }

      // Collect saved Payment ids + paymentCodes so we can fire JEs
      // after the transaction commits.
      const createdPaymentRefs: Array<{
        id: string;
        paymentCode: string;
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
      }> = [];

      for (const b of payload.bookings) {
        const bookingId = rowIdToBookingId.get(b.rowId);
        const booking = rowIdToBooking.get(b.rowId);
        const planId = rowIdToPlanId.get(b.rowId);
        if (!bookingId || !booking) continue;

        const bookingPayments = (paymentsByBookingRow.get(b.rowId) ?? []).slice().sort(
          (a, z) => new Date(a.paymentDate).getTime() - new Date(z.paymentDate).getTime(),
        );

        if (bookingPayments.length === 0) continue;

        // Load plan once, mutate milestones in-memory, save at end.
        const plan = planId
          ? await mgr.findOne(FlatPaymentPlan, { where: { id: planId } })
          : null;

        // Walk plan.milestones in sequence order to allocate. We keep
        // a running "unallocated" balance per milestone so partial
        // payments across multiple installments still work.
        const milestones = plan
          ? [...(plan.milestones ?? [])].sort((a, z) => a.sequence - z.sequence)
          : [];
        const milestoneRemaining = new Map<number, number>(
          milestones.map((m) => [
            m.sequence,
            Math.max(0, Number(m.amount) - (m.status === 'PAID' ? Number(m.amount) : 0)),
          ]),
        );

        let totalPaid = 0;
        for (const p of bookingPayments) {
          const paymentCode = `PAY-LEGACY-${batchId.slice(-6)}-${String(result.created.payments + 1).padStart(4, '0')}`;
          const payment = mgr.create(Payment, {
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
          } as Partial<Payment>);
          const savedPayment = await mgr.save(Payment, payment);
          result.created.payments += 1;
          totalPaid += Number(p.amount);
          createdPaymentRefs.push({
            id: savedPayment.id,
            paymentCode: savedPayment.paymentCode,
            amount: Number(savedPayment.amount),
            paymentDate: savedPayment.paymentDate,
            paymentMethod: savedPayment.paymentMethod,
          });

          // FIFO-allocate this payment across remaining milestones.
          // If the caller pinned a specific milestoneSequence, honour
          // it first.
          let remainingToAllocate = Number(p.amount);
          const orderedSeqs: number[] = [];
          if (typeof p.milestoneSequence === 'number') {
            orderedSeqs.push(p.milestoneSequence);
          }
          for (const m of milestones) {
            if (!orderedSeqs.includes(m.sequence)) orderedSeqs.push(m.sequence);
          }

          for (const seq of orderedSeqs) {
            if (remainingToAllocate <= 0) break;
            const remain = milestoneRemaining.get(seq) ?? 0;
            if (remain <= 0) continue;
            const applied = Math.min(remainingToAllocate, remain);
            milestoneRemaining.set(seq, remain - applied);
            remainingToAllocate -= applied;

            const ms = milestones.find((m) => m.sequence === seq);
            if (!ms) continue;
            const stillOwed = milestoneRemaining.get(seq) ?? 0;
            if (stillOwed <= 0) {
              ms.status = 'PAID';
              ms.paymentId = savedPayment.id;
              ms.completedAt = new Date(p.paymentDate).toISOString();
            }
          }
        }

        // Persist booking totals.
        booking.paidAmount = totalPaid;
        booking.balanceAmount = Math.max(0, Number(booking.totalAmount) - totalPaid);
        if (booking.balanceAmount <= 0) {
          booking.status = BookingStatus.COMPLETED;
        }
        await mgr.save(Booking, booking);

        // Persist plan totals + mutated milestones.
        if (plan) {
          plan.milestones = milestones;
          plan.paidAmount = totalPaid;
          plan.balanceAmount = Math.max(0, Number(plan.totalAmount) - totalPaid);
          await mgr.save(FlatPaymentPlan, plan);
        }
      }

      // ── 5. Materialize DDs for overdue unpaid milestones ────────────────
      // Each unpaid milestone whose dueDate is in the past becomes a DRAFT
      // DD, visible in the Collections inbox immediately for human review.
      for (const b of payload.bookings) {
        const planId = rowIdToPlanId.get(b.rowId);
        const bookingId = rowIdToBookingId.get(b.rowId);
        if (!planId || !bookingId) continue;
        const customerId = rowIdToCustomerId.get(b.customerRowId ?? b.existingCustomerId!)!;

        const plan = await mgr.findOne(FlatPaymentPlan, { where: { id: planId } });
        if (!plan) continue;

        const initialLevel = b.initialEscalationLevel ?? 0;
        const toneForInitial =
          initialLevel === 0
            ? DemandDraftTone.ON_TIME
            : initialLevel === 1
              ? DemandDraftTone.REMINDER_1
              : initialLevel === 2
                ? DemandDraftTone.REMINDER_2
                : DemandDraftTone.REMINDER_3;

        for (const m of plan.milestones) {
          // Skip milestones that are already PAID - either historically
          // (incoming payload said so) or newly-covered by a legacy
          // payment we just allocated in step 4. Without this, an
          // import of a fully-paid old booking would still spawn DDs
          // in the Collections inbox, producing noise for reviewers.
          if (m.status === 'PAID') continue;
          if (!m.dueDate) continue;
          const dueDate = new Date(m.dueDate);
          const daysOverdue = this.daysBetween(dueDate, now);
          if (daysOverdue <= 0) continue;

          // Dedup: skip if a DD for this (flatId, milestoneSequence) already exists.
          const existing = await mgr.findOne(DemandDraft, {
            where: { flatId: b.flatId, milestoneId: String(m.sequence) },
          });
          if (existing) continue;

          const refNumber = `DD-LEGACY-${batchId.slice(-6)}-${String(m.sequence).padStart(2, '0')}`;

          const dd = mgr.create(DemandDraft, {
            flatId: b.flatId,
            customerId,
            bookingId,
            milestoneId: String(m.sequence),
            title: `${m.name} (legacy)`,
            amount: Number(m.amount),
            // Legacy DDs start life in DRAFT. Human hits "Send" from the
            // Collections inbox to make them SENT and kick off the
            // reminder cadence.
            status: DemandDraftStatus.DRAFT,
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
          } as Partial<DemandDraft>);
          await mgr.save(DemandDraft, dd);
          result.created.demandDrafts += 1;
        }
      }
    });

    this.logger.log(
      `Legacy import ${batchId} committed: ${JSON.stringify(result.created)}`,
    );

    // ── 6. Post-commit accounting entries ─────────────────────────────────
    // Fire journal entries AFTER the main import transaction commits so a
    // JE failure can't roll back the whole import. Each call is best-
    // effort; the admin sees a summary of failures in the logs and can
    // re-run the accounting sweep for the batchId later.
    //
    // We reference the imported Payment rows by id here instead of
    // passing them directly because AccountingIntegrationService expects
    // the canonical payment shape and we already committed those rows
    // inside the transaction above.
    let jeCreated = 0;
    let jeFailed = 0;
    // paymentCode prefix is deterministic (`PAY-LEGACY-<batch6>-NNNN`)
    // and survives payload-level note overrides, so it's the safest
    // post-commit filter.
    const postCommitPayments = await this.dataSource
      .getRepository(Payment)
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
      } catch (err: any) {
        jeFailed += 1;
        result.errors.push(
          `Accounting JE failed for ${p.paymentCode}: ${err?.message ?? err}`,
        );
      }
    }
    this.logger.log(
      `Legacy import ${batchId} accounting sweep: created=${jeCreated} failed=${jeFailed}`,
    );

    return result;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────

  private daysBetween(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  }

  private async nextCustomerCode(mgr: any): Promise<string> {
    // Mirrors CustomersService.generateCustomerCode but via the manager
    // so it participates in the transaction.
    const date = new Date();
    const yr = date.getFullYear().toString().slice(-2);
    const mo = (date.getMonth() + 1).toString().padStart(2, '0');
    let seq = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const code = `CU${yr}${mo}${seq.toString().padStart(4, '0')}-L`;
      const exists = await mgr.findOne(Customer, { where: { customerCode: code } });
      if (!exists) return code;
      seq += 1;
    }
  }
}
