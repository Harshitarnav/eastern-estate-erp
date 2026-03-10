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
        bookingNumber: (plan.booking as any)?.bookingNumber ?? '—',
        property: (plan.flat as any)?.property?.name ?? '—',
        tower: (plan.flat as any)?.tower?.name ?? '—',
        flatNumber: plan.flat?.flatNumber ?? '—',
        flatType: (plan.flat as any)?.flatType ?? '—',
        customerName: plan.customer?.fullName ?? '—',
        customerPhone: (plan.customer as any)?.phoneNumber ?? '—',
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
        : '—',
      property: (p as any).booking?.flat?.property?.name ?? '—',
      tower: (p as any).booking?.flat?.tower?.name ?? '—',
      flatNumber: (p as any).booking?.flat?.flatNumber ?? '—',
      customerName: (p as any).customer?.fullName ?? '—',
      customerPhone: (p as any).customer?.phoneNumber ?? '—',
      bookingNumber: (p as any).booking?.bookingNumber ?? '—',
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod ?? '—',
      paymentType: p.paymentType ?? '—',
      status: p.status ?? '—',
      receiptNumber: p.receiptNumber ?? '—',
      reference: p.transactionReference ?? p.chequeNumber ?? p.upiId ?? '—',
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
    // Build parameterised raw SQL — Flat has no TypeORM relation to Customer/Booking
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
        COALESCE(prop.name, '—')                  AS "property",
        COALESCE(prop.id::text, '')               AS "propertyId",
        COALESCE(tower.name, '—')                 AS "tower",
        COALESCE(tower.id::text, '')              AS "towerId",
        flat.flat_number                          AS "flatNumber",
        COALESCE(flat.type, '—')                  AS "flatType",
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
      property: r.property ?? '—',
      propertyId: r.propertyId ?? '',
      tower: r.tower ?? '—',
      towerId: r.towerId ?? '',
      flatNumber: r.flatNumber,
      flatType: r.flatType ?? '—',
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
