import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Flat } from '../flats/entities/flat.entity';

// ─── Outstanding report ───────────────────────────────────────────────────────

export interface OutstandingRow {
  planId: string;
  bookingId: string;
  bookingNumber: string;
  property: string;
  tower: string;
  flatNumber: string;
  flatType: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  totalDemanded: number;
  totalPaid: number;
  outstanding: number;
  overdueMilestones: number;
  oldestOverdueDays: number | null;
  planStatus: string;
}

export interface OutstandingReportResult {
  rows: OutstandingRow[];
  summary: {
    totalUnits: number;
    totalAgreementValue: number;
    totalDemanded: number;
    totalPaid: number;
    totalOutstanding: number;
    unitsWithOverdue: number;
  };
}

// ─── Collection report ────────────────────────────────────────────────────────

export interface CollectionRow {
  paymentId: string;
  paymentCode: string;
  paymentDate: string;
  property: string;
  tower: string;
  flatNumber: string;
  customerName: string;
  customerPhone: string;
  bookingNumber: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  receiptNumber: string;
  reference: string;
}

export interface CollectionReportResult {
  rows: CollectionRow[];
  summary: {
    totalPayments: number;
    totalAmount: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

// ─── Inventory report ─────────────────────────────────────────────────────────

export interface InventoryRow {
  flatId: string;
  property: string;
  propertyId: string;
  tower: string;
  towerId: string;
  flatNumber: string;
  flatType: string;
  floor: number | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  basePrice: number | null;
  finalPrice: number | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  bookingNumber: string | null;
  bookingDate: string | null;
}

export interface InventoryReportResult {
  rows: InventoryRow[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    availablePercent: number;
    totalValue: number;
    bookedValue: number;
  };
}

// ─── Dashboard summary ────────────────────────────────────────────────────────

export interface DashboardSummary {
  /** Financial KPIs */
  totalAgreementValue: number;
  totalCollected: number;
  totalOutstanding: number;
  thisMonthCollection: number;
  thisMonthPaymentCount: number;

  /** Inventory KPIs */
  totalFlats: number;
  availableFlats: number;
  bookedFlats: number;
  soldFlats: number;
  onHoldFlats: number;
  availablePercent: number;

  /** CRM KPIs */
  totalCustomers: number;
  activeBookings: number;
  activeLeads: number;
  overdueMilestoneUnits: number;

  /** Inventory value */
  totalInventoryValue: number;
  bookedInventoryValue: number;

  /** Recent payments (last 5) */
  recentPayments: Array<{
    id: string;
    customerName: string;
    amount: number;
    paymentDate: string;
    flatNumber: string;
    property: string;
    paymentMethod: string;
  }>;

  /** Overdue units (top 5 worst) */
  overdueUnits: Array<{
    bookingId: string;
    customerName: string;
    flatNumber: string;
    property: string;
    outstanding: number;
    overdueDays: number | null;
    overdueMilestones: number;
  }>;

  /** Unit status breakdown for chart */
  statusBreakdown: Record<string, number>;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FlatPaymentPlan)
    private readonly planRepo: Repository<FlatPaymentPlan>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Flat)
    private readonly flatRepo: Repository<Flat>,
  ) {}

  async getDashboard(propertyId?: string): Promise<DashboardSummary> {
    const em = this.flatRepo.manager;

    // ── Run all queries in parallel ───────────────────────────────────────────
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // When a top-bar property is selected, every SQL below scopes by it.
    // Plan query uses QueryBuilder so the parameter name is scoped.
    const flatWhere = propertyId ? 'AND property_id = $1' : '';
    const bookingWhere = propertyId ? 'AND property_id = $1' : '';
    const paymentJoin = propertyId
      ? 'INNER JOIN bookings pb ON pb.id = payments.booking_id AND pb.property_id = $1'
      : '';
    const paymentJoin2 = propertyId
      ? 'INNER JOIN bookings pb ON pb.id = p.booking_id AND pb.property_id = $1'
      : '';

    const flatParams: any[] = propertyId ? [propertyId] : [];
    const bookingParams: any[] = propertyId ? [propertyId] : [];
    const paymentStatsParams: any[] = propertyId ? [propertyId] : [];
    const monthParams: any[] = propertyId
      ? [propertyId, monthStart, monthEnd]
      : [monthStart, monthEnd];
    const monthStartIdx = propertyId ? '$2' : '$1';
    const monthEndIdx = propertyId ? '$3' : '$2';

    const [
      flatStats,
      crmCounts,
      paymentStats,
      thisMonthStats,
      recentPaymentsRaw,
      plans,
    ] = await Promise.all([
      // 1. Flat status breakdown
      em.query(`
        SELECT
          status,
          COUNT(*)::int           AS count,
          COALESCE(SUM(final_price), 0)::float AS value
        FROM flats
        WHERE is_active = true
          ${flatWhere}
        GROUP BY status
      `, flatParams),

      // 2. Customer / booking / lead counts
      propertyId
        ? em.query(`
            SELECT
              (SELECT COUNT(DISTINCT b.customer_id)::int FROM bookings b WHERE b.property_id = $1)              AS "totalCustomers",
              (SELECT COUNT(*)::int FROM bookings WHERE status NOT IN ('CANCELLED') AND property_id = $1)        AS "activeBookings",
              (SELECT COUNT(*)::int FROM leads WHERE status NOT IN ('LOST','CLOSED') AND property_id = $1 LIMIT 1) AS "activeLeads"
          `, [propertyId])
        : em.query(`
            SELECT
              (SELECT COUNT(*)::int FROM customers)                        AS "totalCustomers",
              (SELECT COUNT(*)::int FROM bookings WHERE status NOT IN ('CANCELLED')) AS "activeBookings",
              (SELECT COUNT(*)::int FROM leads    WHERE status NOT IN ('LOST','CLOSED') LIMIT 1) AS "activeLeads"
          `),

      // 3. All-time payment totals (non-cancelled)
      em.query(`
        SELECT
          COALESCE(SUM(payments.amount), 0)::float  AS "totalCollected",
          COUNT(*)::int                              AS "totalPayments"
        FROM payments
        ${paymentJoin}
        WHERE payments.status NOT IN ('CANCELLED','FAILED')
      `, paymentStatsParams),

      // 4. This-month collection
      em.query(`
        SELECT
          COALESCE(SUM(payments.amount), 0)::float AS "thisMonthCollection",
          COUNT(*)::int                             AS "thisMonthPaymentCount"
        FROM payments
        ${paymentJoin}
        WHERE payments.status NOT IN ('CANCELLED','FAILED')
          AND payments.payment_date >= ${monthStartIdx}
          AND payments.payment_date <= ${monthEndIdx}
      `, monthParams),

      // 5. Recent 5 payments with flat/customer info
      em.query(`
        SELECT
          p.id,
          COALESCE(c.full_name, TRIM(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')), '-') AS "customerName",
          p.amount::float                   AS amount,
          p.payment_date::text              AS "paymentDate",
          COALESCE(f.flat_number, '-')      AS "flatNumber",
          COALESCE(prop.name, '-')          AS property,
          COALESCE(p.payment_method, '-')   AS "paymentMethod"
        FROM payments p
        LEFT JOIN customers c   ON c.id  = p.customer_id
        LEFT JOIN bookings  bk  ON bk.id = p.booking_id
        LEFT JOIN flats     f   ON f.id  = bk.flat_id
        LEFT JOIN properties prop ON prop.id = f.property_id
        ${paymentJoin2}
        WHERE p.status NOT IN ('CANCELLED','FAILED')
        ORDER BY p.payment_date DESC NULLS LAST, p.created_at DESC
        LIMIT 5
      `, paymentStatsParams),

      // 6. All active payment plans (for outstanding + overdue)
      (() => {
        const qb = this.planRepo
          .createQueryBuilder('plan')
          .leftJoinAndSelect('plan.flat', 'flat')
          .leftJoinAndSelect('flat.property', 'property')
          .leftJoinAndSelect('flat.tower', 'tower')
          .leftJoinAndSelect('plan.customer', 'customer')
          .leftJoinAndSelect('plan.booking', 'booking')
          .where('plan.status != :cancelled', { cancelled: 'CANCELLED' });
        if (propertyId) {
          qb.andWhere('flat.propertyId = :dashPropertyId', {
            dashPropertyId: propertyId,
          });
        }
        return qb.getMany();
      })(),
    ]);

    // ── Process flat stats ────────────────────────────────────────────────────
    const statusBreakdown: Record<string, number> = {};
    let totalFlats = 0;
    let totalInventoryValue = 0;
    let bookedInventoryValue = 0;

    for (const row of flatStats) {
      const s = String(row.status ?? 'UNKNOWN');
      statusBreakdown[s] = Number(row.count);
      totalFlats += Number(row.count);
      totalInventoryValue += Number(row.value ?? 0);
      if (!['AVAILABLE', 'ON_HOLD'].includes(s)) {
        bookedInventoryValue += Number(row.value ?? 0);
      }
    }

    const availableFlats = statusBreakdown['AVAILABLE'] ?? 0;
    const bookedFlats    = statusBreakdown['BOOKED']    ?? 0;
    const soldFlats      = statusBreakdown['SOLD']      ?? 0;
    const onHoldFlats    = statusBreakdown['ON_HOLD']   ?? 0;

    // ── Process plans for outstanding / overdue ───────────────────────────────
    const today = new Date();
    let totalAgreementValue = 0;
    let totalOutstanding    = 0;
    const overdueRows: DashboardSummary['overdueUnits'] = [];

    for (const plan of plans) {
      totalAgreementValue += Number(plan.totalAmount ?? 0);
      totalOutstanding    += Number(plan.balanceAmount ?? 0);

      const milestones = plan.milestones ?? [];
      const overdueMilestones = milestones.filter((m: any) => m.status === 'OVERDUE');

      if (overdueMilestones.length > 0) {
        let oldestDays: number | null = null;
        const dueDates = overdueMilestones
          .filter((m: any) => m.dueDate)
          .map((m: any) => new Date(m.dueDate).getTime());
        if (dueDates.length > 0) {
          oldestDays = Math.floor((today.getTime() - Math.min(...dueDates)) / 86_400_000);
        }
        overdueRows.push({
          bookingId:         plan.bookingId,
          customerName:      (plan.customer as any)?.fullName ?? '-',
          flatNumber:        plan.flat?.flatNumber ?? '-',
          property:          (plan.flat as any)?.property?.name ?? '-',
          outstanding:       Number(plan.balanceAmount ?? 0),
          overdueDays:       oldestDays,
          overdueMilestones: overdueMilestones.length,
        });
      }
    }

    // Sort overdue by oldest first, take top 5
    overdueRows.sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0));

    return {
      totalAgreementValue,
      totalCollected:           Number(paymentStats[0]?.totalCollected    ?? 0),
      totalOutstanding,
      thisMonthCollection:      Number(thisMonthStats[0]?.thisMonthCollection   ?? 0),
      thisMonthPaymentCount:    Number(thisMonthStats[0]?.thisMonthPaymentCount ?? 0),

      totalFlats,
      availableFlats,
      bookedFlats,
      soldFlats,
      onHoldFlats,
      availablePercent: totalFlats > 0 ? Math.round((availableFlats / totalFlats) * 100) : 0,

      totalCustomers:        Number(crmCounts[0]?.totalCustomers ?? 0),
      activeBookings:        Number(crmCounts[0]?.activeBookings  ?? 0),
      activeLeads:           Number(crmCounts[0]?.activeLeads     ?? 0),
      overdueMilestoneUnits: overdueRows.length,

      totalInventoryValue,
      bookedInventoryValue,

      recentPayments: (recentPaymentsRaw ?? []).map((r: any) => ({
        id:            r.id,
        customerName:  r.customerName,
        amount:        Number(r.amount),
        paymentDate:   r.paymentDate ? String(r.paymentDate).split('T')[0] : '-',
        flatNumber:    r.flatNumber,
        property:      r.property,
        paymentMethod: r.paymentMethod,
      })),

      overdueUnits: overdueRows.slice(0, 5),
      statusBreakdown,
    };
  }

  async getOutstandingReport(filters: {
    propertyId?: string;
    towerId?: string;
    status?: string;
  }): Promise<OutstandingReportResult> {
    const qb = this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.flat', 'flat')
      .leftJoinAndSelect('flat.property', 'property')
      .leftJoinAndSelect('flat.tower', 'tower')
      .leftJoinAndSelect('plan.customer', 'customer')
      .leftJoinAndSelect('plan.booking', 'booking')
      .where('plan.status != :cancelled', { cancelled: 'CANCELLED' });

    if (filters.propertyId) {
      qb.andWhere('property.id = :propertyId', { propertyId: filters.propertyId });
    }
    if (filters.towerId) {
      qb.andWhere('tower.id = :towerId', { towerId: filters.towerId });
    }
    if (filters.status) {
      qb.andWhere('plan.status = :status', { status: filters.status });
    }

    qb.orderBy('property.name', 'ASC')
      .addOrderBy('tower.name', 'ASC')
      .addOrderBy('flat.flatNumber', 'ASC');

    const plans = await qb.getMany();
    const today = new Date();

    const rows: OutstandingRow[] = plans.map((plan) => {
      const milestones = plan.milestones ?? [];

      // Calculate total demanded from non-PENDING milestones
      const totalDemanded = milestones
        .filter((m) => m.status !== 'PENDING')
        .reduce((s, m) => s + Number(m.amount), 0);

      const overdueMilestones = milestones.filter((m) => m.status === 'OVERDUE');
      let oldestOverdueDays: number | null = null;

      if (overdueMilestones.length > 0) {
        const dueDates = overdueMilestones
          .filter((m) => m.dueDate)
          .map((m) => new Date(m.dueDate!).getTime());
        if (dueDates.length > 0) {
          const oldest = Math.min(...dueDates);
          oldestOverdueDays = Math.floor((today.getTime() - oldest) / (1000 * 60 * 60 * 24));
        }
      }

      return {
        planId: plan.id,
        bookingId: plan.bookingId,
        bookingNumber: (plan.booking as any)?.bookingNumber ?? '-',
        property: (plan.flat as any)?.property?.name ?? '-',
        tower: (plan.flat as any)?.tower?.name ?? '-',
        flatNumber: plan.flat?.flatNumber ?? '-',
        flatType: (plan.flat as any)?.flatType ?? '-',
        customerName: plan.customer?.fullName ?? '-',
        customerPhone: (plan.customer as any)?.phoneNumber ?? '-',
        totalAmount: Number(plan.totalAmount),
        totalDemanded,
        totalPaid: Number(plan.paidAmount),
        outstanding: Number(plan.balanceAmount),
        overdueMilestones: overdueMilestones.length,
        oldestOverdueDays,
        planStatus: plan.status,
      };
    });

    const summary = {
      totalUnits: rows.length,
      totalAgreementValue: rows.reduce((s, r) => s + r.totalAmount, 0),
      totalDemanded: rows.reduce((s, r) => s + r.totalDemanded, 0),
      totalPaid: rows.reduce((s, r) => s + r.totalPaid, 0),
      totalOutstanding: rows.reduce((s, r) => s + r.outstanding, 0),
      unitsWithOverdue: rows.filter((r) => r.overdueMilestones > 0).length,
    };

    return { rows, summary };
  }

  async getCollectionReport(filters: {
    propertyId?: string;
    towerId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  }): Promise<CollectionReportResult> {
    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.customer', 'customer')
      .leftJoinAndSelect('booking.flat', 'flat')
      .leftJoinAndSelect('flat.property', 'property')
      .leftJoinAndSelect('flat.tower', 'tower')
      .where('payment.status != :cancelled', { cancelled: 'CANCELLED' });

    if (filters.startDate) {
      qb.andWhere('payment.paymentDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      qb.andWhere('payment.paymentDate <= :endDate', { endDate: filters.endDate });
    }
    if (filters.propertyId) {
      qb.andWhere('property.id = :propertyId', { propertyId: filters.propertyId });
    }
    if (filters.towerId) {
      qb.andWhere('tower.id = :towerId', { towerId: filters.towerId });
    }
    if (filters.paymentMethod) {
      qb.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }

    qb.orderBy('payment.paymentDate', 'DESC');

    const payments = await qb.getMany();

    const rows: CollectionRow[] = payments.map((p) => ({
      paymentId: p.id,
      paymentCode: p.paymentCode,
      paymentDate: p.paymentDate
        ? new Date(p.paymentDate).toISOString().split('T')[0]
        : '-',
      property: (p as any).booking?.flat?.property?.name ?? '-',
      tower: (p as any).booking?.flat?.tower?.name ?? '-',
      flatNumber: (p as any).booking?.flat?.flatNumber ?? '-',
      customerName: (p as any).customer?.fullName ?? '-',
      customerPhone: (p as any).customer?.phoneNumber ?? '-',
      bookingNumber: (p as any).booking?.bookingNumber ?? '-',
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod ?? '-',
      paymentType: p.paymentType ?? '-',
      status: p.status ?? '-',
      receiptNumber: p.receiptNumber ?? '-',
      reference: p.transactionReference ?? p.chequeNumber ?? p.upiId ?? '-',
    }));

    // Group totals
    const byMethod: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalAmount = 0;

    for (const r of rows) {
      totalAmount += r.amount;
      byMethod[r.paymentMethod] = (byMethod[r.paymentMethod] ?? 0) + r.amount;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + r.amount;
    }

    return {
      rows,
      summary: {
        totalPayments: rows.length,
        totalAmount,
        byMethod,
        byStatus,
      },
    };
  }

  async getInventoryReport(filters: {
    propertyId?: string;
    towerId?: string;
    status?: string;
    flatType?: string;
  }): Promise<InventoryReportResult> {
    // Build parameterised raw SQL - Flat has no TypeORM relation to Customer/Booking
    const conditions: string[] = ['flat.is_active = true'];
    const params: any[] = [];
    let idx = 1;

    if (filters.propertyId) {
      conditions.push(`prop.id = $${idx++}`);
      params.push(filters.propertyId);
    }
    if (filters.towerId) {
      conditions.push(`tower.id = $${idx++}`);
      params.push(filters.towerId);
    }
    if (filters.status) {
      conditions.push(`flat.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.flatType) {
      conditions.push(`flat.type = $${idx++}`);
      params.push(filters.flatType);
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT
        flat.id                                   AS "flatId",
        COALESCE(prop.name, '-')                  AS "property",
        COALESCE(prop.id::text, '')               AS "propertyId",
        COALESCE(tower.name, '-')                 AS "tower",
        COALESCE(tower.id::text, '')              AS "towerId",
        flat.flat_number                          AS "flatNumber",
        COALESCE(flat.type, '-')                  AS "flatType",
        flat.floor                                AS "floor",
        flat.carpet_area                          AS "carpetArea",
        flat.built_up_area                        AS "builtUpArea",
        flat.base_price                           AS "basePrice",
        flat.final_price                          AS "finalPrice",
        flat.status                               AS "status",
        cust.full_name                            AS "customerName",
        cust.phone_number                         AS "customerPhone",
        bk.booking_number                         AS "bookingNumber",
        bk.booking_date::text                     AS "bookingDate"
      FROM   flats flat
      LEFT JOIN properties  prop  ON prop.id  = flat.property_id
      LEFT JOIN towers      tower ON tower.id = flat.tower_id
      LEFT JOIN customers   cust  ON cust.id  = flat.customer_id
      LEFT JOIN LATERAL (
        SELECT booking_number, booking_date
        FROM   bookings
        WHERE  flat_id = flat.id
          AND  status NOT IN ('CANCELLED')
        ORDER BY created_at DESC
        LIMIT  1
      ) bk ON true
      WHERE  ${whereClause}
      ORDER BY prop.name ASC, tower.name ASC, flat.floor ASC NULLS LAST, flat.flat_number ASC
    `;

    const raw: any[] = await this.flatRepo.manager.query(sql, params);

    const rows: InventoryRow[] = raw.map((r) => ({
      flatId: r.flatId,
      property: r.property ?? '-',
      propertyId: r.propertyId ?? '',
      tower: r.tower ?? '-',
      towerId: r.towerId ?? '',
      flatNumber: r.flatNumber,
      flatType: r.flatType ?? '-',
      floor: r.floor != null ? Number(r.floor) : null,
      carpetArea: r.carpetArea != null ? Number(r.carpetArea) : null,
      builtUpArea: r.builtUpArea != null ? Number(r.builtUpArea) : null,
      basePrice: r.basePrice != null ? Number(r.basePrice) : null,
      finalPrice: r.finalPrice != null ? Number(r.finalPrice) : null,
      status: r.status,
      customerName: r.customerName ?? null,
      customerPhone: r.customerPhone ?? null,
      bookingNumber: r.bookingNumber ?? null,
      bookingDate: r.bookingDate ? r.bookingDate.split('T')[0] : null,
    }));

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalValue = 0;
    let bookedValue = 0;

    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byType[r.flatType] = (byType[r.flatType] ?? 0) + 1;
      if (r.finalPrice) totalValue += r.finalPrice;
      if (r.status !== 'AVAILABLE' && r.status !== 'ON_HOLD' && r.finalPrice) {
        bookedValue += r.finalPrice;
      }
    }

    const available = byStatus['AVAILABLE'] ?? 0;

    return {
      rows,
      summary: {
        total: rows.length,
        byStatus,
        byType,
        availablePercent: rows.length > 0 ? Math.round((available / rows.length) * 100) : 0,
        totalValue,
        bookedValue,
      },
    };
  }
}
