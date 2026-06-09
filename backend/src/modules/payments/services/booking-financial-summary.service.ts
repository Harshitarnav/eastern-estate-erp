import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { DemandDraft, DemandDraftStatus } from '../../demand-drafts/entities/demand-draft.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export interface CategoryTotals {
  demanded: number;
  collected: number;
  arrear: number;
  deferred: number; // tax explicitly deferred to registry (PRIMARY_PAID DDs)
}

export interface TaggedTotal {
  label: string;
  amount: number;
}

export interface BookingFinancialSummary {
  primary: CategoryTotals;
  misc: CategoryTotals;
  tax: CategoryTotals;
  total: CategoryTotals;
  /** Sum of all tax deferred across all PRIMARY_PAID DDs for this booking. */
  totalTaxDeferred: number;
  /** Collected misc, broken down by tag (aggregated across all payments). */
  miscTags: TaggedTotal[];
  /** Collected tax, broken down by tag (aggregated across all payments). */
  taxTags: TaggedTotal[];
}

/** Statuses that represent active demands (money was formally requested). */
const DEMAND_STATUSES: DemandDraftStatus[] = [
  DemandDraftStatus.SENT,
  DemandDraftStatus.PRIMARY_PAID,
  DemandDraftStatus.PARTIALLY_PAID,
  DemandDraftStatus.PAID,
];

/** Statuses where a DD is fully closed (no further action needed in collections). */
const CLOSED_STATUSES: DemandDraftStatus[] = [
  DemandDraftStatus.PRIMARY_PAID,
  DemandDraftStatus.PAID,
];

@Injectable()
export class BookingFinancialSummaryService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(DemandDraft)
    private readonly ddRepo: Repository<DemandDraft>,
    @InjectRepository(FlatPaymentPlan)
    private readonly planRepo: Repository<FlatPaymentPlan>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  /**
   * Compute the 3-category financial summary for a booking.
   *
   * Demanded = sum of all SENT/PAID/PRIMARY_PAID/PARTIALLY_PAID DDs.
   * Collected = sum of all COMPLETED payments on this booking.
   * Arrear    = demanded - collected (per category).
   * Deferred  = sum of tax_deferred_amount on PRIMARY_PAID DDs.
   */
  async getSummaryForBooking(bookingId: string): Promise<BookingFinancialSummary> {
    const [dds, payments] = await Promise.all([
      this.ddRepo.find({
        where: {
          bookingId,
          status: In(DEMAND_STATUSES),
        },
      }),
      this.paymentRepo.find({
        where: { bookingId, status: 'COMPLETED' },
      }),
    ]);

    // Only root DDs (no parent) count as demands to avoid double-counting
    // reminder threads which share the same milestone money.
    const rootDds = dds.filter((dd) => !dd.parentDemandDraftId);

    const demanded = {
      primary: rootDds.reduce((s, dd) => s + (Number(dd.primaryAmount) || 0) + (Number(dd.arrearsPrimary) || 0), 0),
      misc:    rootDds.reduce((s, dd) => s + (Number(dd.miscAmount)    || 0) + (Number(dd.arrearsMisc)    || 0), 0),
      tax:     rootDds.reduce((s, dd) => s + (Number(dd.taxAmount)     || 0) + (Number(dd.arrearsTax)     || 0), 0),
    };

    const collected = {
      primary: payments.reduce((s, p) => s + (Number(p.primaryAmount) || 0), 0),
      misc:    payments.reduce((s, p) => s + (Number(p.miscAmount)    || 0), 0),
      tax:     payments.reduce((s, p) => s + (Number(p.taxAmount)     || 0), 0),
    };

    const totalTaxDeferred = rootDds
      .filter((dd) => dd.status === DemandDraftStatus.PRIMARY_PAID)
      .reduce((s, dd) => s + (Number(dd.taxDeferredAmount) || 0), 0);

    const primary: CategoryTotals = {
      demanded: demanded.primary,
      collected: collected.primary,
      arrear: Math.max(0, demanded.primary - collected.primary),
      deferred: 0,
    };
    const misc: CategoryTotals = {
      demanded: demanded.misc,
      collected: collected.misc,
      arrear: Math.max(0, demanded.misc - collected.misc),
      deferred: 0,
    };
    const tax: CategoryTotals = {
      demanded: demanded.tax,
      collected: collected.tax,
      arrear: Math.max(0, demanded.tax - collected.tax),
      deferred: totalTaxDeferred,
    };
    const total: CategoryTotals = {
      demanded: primary.demanded + misc.demanded + tax.demanded,
      collected: primary.collected + misc.collected + tax.collected,
      arrear: primary.arrear + misc.arrear + tax.arrear,
      deferred: totalTaxDeferred,
    };

    return {
      primary, misc, tax, total, totalTaxDeferred,
      miscTags: this.aggregateTags(payments, 'miscBreakdown'),
      taxTags:  this.aggregateTags(payments, 'taxBreakdown'),
    };
  }

  /** Roll up tagged line-items across payments into label → total amount. */
  private aggregateTags(
    payments: Payment[],
    field: 'miscBreakdown' | 'taxBreakdown',
  ): TaggedTotal[] {
    const byLabel = new Map<string, number>();
    for (const p of payments) {
      const items = (p[field] as TaggedTotal[] | null) ?? [];
      for (const it of items) {
        const label = (it?.label ?? '').trim() || 'Unlabelled';
        byLabel.set(label, (byLabel.get(label) ?? 0) + (Number(it?.amount) || 0));
      }
    }
    return Array.from(byLabel.entries())
      .map(([label, amount]) => ({ label, amount }))
      .filter((t) => t.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Compute summaries for multiple bookings in one query (for list views).
   * Returns a map of bookingId → BookingFinancialSummary.
   */
  async getSummariesForBookings(
    bookingIds: string[],
  ): Promise<Map<string, BookingFinancialSummary>> {
    if (!bookingIds.length) return new Map();

    const [dds, payments] = await Promise.all([
      this.ddRepo.find({
        where: { bookingId: In(bookingIds), status: In(DEMAND_STATUSES) },
      }),
      this.paymentRepo.find({
        where: { bookingId: In(bookingIds), status: 'COMPLETED' },
      }),
    ]);

    const result = new Map<string, BookingFinancialSummary>();

    for (const bookingId of bookingIds) {
      const rootDds = dds.filter(
        (dd) => dd.bookingId === bookingId && !dd.parentDemandDraftId,
      );
      const bPayments = payments.filter((p) => p.bookingId === bookingId);

      const demanded = {
        primary: rootDds.reduce((s, dd) => s + (Number(dd.primaryAmount) || 0) + (Number(dd.arrearsPrimary) || 0), 0),
        misc:    rootDds.reduce((s, dd) => s + (Number(dd.miscAmount)    || 0) + (Number(dd.arrearsMisc)    || 0), 0),
        tax:     rootDds.reduce((s, dd) => s + (Number(dd.taxAmount)     || 0) + (Number(dd.arrearsTax)     || 0), 0),
      };
      const collected = {
        primary: bPayments.reduce((s, p) => s + (Number(p.primaryAmount) || 0), 0),
        misc:    bPayments.reduce((s, p) => s + (Number(p.miscAmount)    || 0), 0),
        tax:     bPayments.reduce((s, p) => s + (Number(p.taxAmount)     || 0), 0),
      };
      const totalTaxDeferred = rootDds
        .filter((dd) => dd.status === DemandDraftStatus.PRIMARY_PAID)
        .reduce((s, dd) => s + (Number(dd.taxDeferredAmount) || 0), 0);

      result.set(bookingId, {
        primary: { demanded: demanded.primary, collected: collected.primary, arrear: Math.max(0, demanded.primary - collected.primary), deferred: 0 },
        misc:    { demanded: demanded.misc,    collected: collected.misc,    arrear: Math.max(0, demanded.misc    - collected.misc),    deferred: 0 },
        tax:     { demanded: demanded.tax,     collected: collected.tax,     arrear: Math.max(0, demanded.tax     - collected.tax),     deferred: totalTaxDeferred },
        total:   {
          demanded:  demanded.primary  + demanded.misc  + demanded.tax,
          collected: collected.primary + collected.misc + collected.tax,
          arrear:    Math.max(0, demanded.primary - collected.primary) + Math.max(0, demanded.misc - collected.misc) + Math.max(0, demanded.tax - collected.tax),
          deferred:  totalTaxDeferred,
        },
        totalTaxDeferred,
        miscTags: this.aggregateTags(bPayments, 'miscBreakdown'),
        taxTags:  this.aggregateTags(bPayments, 'taxBreakdown'),
      });
    }

    return result;
  }

  /**
   * Compute the current arrears for a booking so that a new DD can carry
   * them forward as a snapshot. Called by DD generation logic.
   */
  async getArrearsSnapshot(bookingId: string): Promise<{
    arrearsPrimary: number;
    arrearsMisc: number;
    arrearsTax: number;
  }> {
    const summary = await this.getSummaryForBooking(bookingId);
    return {
      arrearsPrimary: summary.primary.arrear,
      arrearsMisc:    summary.misc.arrear,
      arrearsTax:     summary.tax.arrear,
    };
  }

  /**
   * Total tax deferred (registry-pending) across all bookings,
   * optionally scoped to a property. Used by the dashboard KPI.
   */
  async getTotalTaxDeferred(propertyId?: string): Promise<number> {
    let qb = this.ddRepo
      .createQueryBuilder('dd')
      .select('COALESCE(SUM(dd.tax_deferred_amount), 0)', 'total')
      .where('dd.status = :status', { status: DemandDraftStatus.PRIMARY_PAID })
      // Only root DDs. Reminder/warning children mirror the parent's tax, so
      // summing them too would multiply the deferred total by the number of
      // reminders sent.
      .andWhere('dd.parent_demand_draft_id IS NULL');

    if (propertyId) {
      qb = qb
        .innerJoin('bookings', 'bk', 'bk.id = dd.booking_id')
        .andWhere('bk.property_id = :propertyId', { propertyId });
    }

    const row = await qb.getRawOne();
    return Number(row?.total ?? 0);
  }
}
