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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const flat_entity_1 = require("../flats/entities/flat.entity");
let ReportsService = class ReportsService {
    constructor(planRepo, paymentRepo, flatRepo) {
        this.planRepo = planRepo;
        this.paymentRepo = paymentRepo;
        this.flatRepo = flatRepo;
    }
    async getDashboard(propertyId) {
        const em = this.flatRepo.manager;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const flatWhere = propertyId ? 'AND property_id = $1' : '';
        const bookingWhere = propertyId ? 'AND property_id = $1' : '';
        const paymentJoin = propertyId
            ? 'INNER JOIN bookings pb ON pb.id = payments.booking_id AND pb.property_id = $1'
            : '';
        const paymentJoin2 = propertyId
            ? 'INNER JOIN bookings pb ON pb.id = p.booking_id AND pb.property_id = $1'
            : '';
        const flatParams = propertyId ? [propertyId] : [];
        const bookingParams = propertyId ? [propertyId] : [];
        const paymentStatsParams = propertyId ? [propertyId] : [];
        const monthParams = propertyId
            ? [propertyId, monthStart, monthEnd]
            : [monthStart, monthEnd];
        const monthStartIdx = propertyId ? '$2' : '$1';
        const monthEndIdx = propertyId ? '$3' : '$2';
        const [flatStats, crmCounts, paymentStats, thisMonthStats, recentPaymentsRaw, plans,] = await Promise.all([
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
            em.query(`
        SELECT
          COALESCE(SUM(payments.amount), 0)::float  AS "totalCollected",
          COUNT(*)::int                              AS "totalPayments"
        FROM payments
        ${paymentJoin}
        WHERE payments.status NOT IN ('CANCELLED','FAILED')
      `, paymentStatsParams),
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
        const statusBreakdown = {};
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
        const bookedFlats = statusBreakdown['BOOKED'] ?? 0;
        const soldFlats = statusBreakdown['SOLD'] ?? 0;
        const onHoldFlats = statusBreakdown['ON_HOLD'] ?? 0;
        const today = new Date();
        let totalAgreementValue = 0;
        let totalOutstanding = 0;
        const overdueRows = [];
        for (const plan of plans) {
            totalAgreementValue += Number(plan.totalAmount ?? 0);
            totalOutstanding += Number(plan.balanceAmount ?? 0);
            const milestones = plan.milestones ?? [];
            const overdueMilestones = milestones.filter((m) => m.status === 'OVERDUE');
            if (overdueMilestones.length > 0) {
                let oldestDays = null;
                const dueDates = overdueMilestones
                    .filter((m) => m.dueDate)
                    .map((m) => new Date(m.dueDate).getTime());
                if (dueDates.length > 0) {
                    oldestDays = Math.floor((today.getTime() - Math.min(...dueDates)) / 86_400_000);
                }
                overdueRows.push({
                    bookingId: plan.bookingId,
                    customerName: plan.customer?.fullName ?? '-',
                    flatNumber: plan.flat?.flatNumber ?? '-',
                    property: plan.flat?.property?.name ?? '-',
                    outstanding: Number(plan.balanceAmount ?? 0),
                    overdueDays: oldestDays,
                    overdueMilestones: overdueMilestones.length,
                });
            }
        }
        overdueRows.sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0));
        return {
            totalAgreementValue,
            totalCollected: Number(paymentStats[0]?.totalCollected ?? 0),
            totalOutstanding,
            thisMonthCollection: Number(thisMonthStats[0]?.thisMonthCollection ?? 0),
            thisMonthPaymentCount: Number(thisMonthStats[0]?.thisMonthPaymentCount ?? 0),
            totalFlats,
            availableFlats,
            bookedFlats,
            soldFlats,
            onHoldFlats,
            availablePercent: totalFlats > 0 ? Math.round((availableFlats / totalFlats) * 100) : 0,
            totalCustomers: Number(crmCounts[0]?.totalCustomers ?? 0),
            activeBookings: Number(crmCounts[0]?.activeBookings ?? 0),
            activeLeads: Number(crmCounts[0]?.activeLeads ?? 0),
            overdueMilestoneUnits: overdueRows.length,
            totalInventoryValue,
            bookedInventoryValue,
            recentPayments: (recentPaymentsRaw ?? []).map((r) => ({
                id: r.id,
                customerName: r.customerName,
                amount: Number(r.amount),
                paymentDate: r.paymentDate ? String(r.paymentDate).split('T')[0] : '-',
                flatNumber: r.flatNumber,
                property: r.property,
                paymentMethod: r.paymentMethod,
            })),
            overdueUnits: overdueRows.slice(0, 5),
            statusBreakdown,
        };
    }
    async getOutstandingReport(filters) {
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
        const rows = plans.map((plan) => {
            const milestones = plan.milestones ?? [];
            const totalDemanded = milestones
                .filter((m) => m.status !== 'PENDING')
                .reduce((s, m) => s + Number(m.amount), 0);
            const overdueMilestones = milestones.filter((m) => m.status === 'OVERDUE');
            let oldestOverdueDays = null;
            if (overdueMilestones.length > 0) {
                const dueDates = overdueMilestones
                    .filter((m) => m.dueDate)
                    .map((m) => new Date(m.dueDate).getTime());
                if (dueDates.length > 0) {
                    const oldest = Math.min(...dueDates);
                    oldestOverdueDays = Math.floor((today.getTime() - oldest) / (1000 * 60 * 60 * 24));
                }
            }
            return {
                planId: plan.id,
                bookingId: plan.bookingId,
                bookingNumber: plan.booking?.bookingNumber ?? '-',
                property: plan.flat?.property?.name ?? '-',
                tower: plan.flat?.tower?.name ?? '-',
                flatNumber: plan.flat?.flatNumber ?? '-',
                flatType: plan.flat?.flatType ?? '-',
                customerName: plan.customer?.fullName ?? '-',
                customerPhone: plan.customer?.phoneNumber ?? '-',
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
    async getCollectionReport(filters) {
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
        const rows = payments.map((p) => ({
            paymentId: p.id,
            paymentCode: p.paymentCode,
            paymentDate: p.paymentDate
                ? new Date(p.paymentDate).toISOString().split('T')[0]
                : '-',
            property: p.booking?.flat?.property?.name ?? '-',
            tower: p.booking?.flat?.tower?.name ?? '-',
            flatNumber: p.booking?.flat?.flatNumber ?? '-',
            customerName: p.customer?.fullName ?? '-',
            customerPhone: p.customer?.phoneNumber ?? '-',
            bookingNumber: p.booking?.bookingNumber ?? '-',
            amount: Number(p.amount),
            paymentMethod: p.paymentMethod ?? '-',
            paymentType: p.paymentType ?? '-',
            status: p.status ?? '-',
            receiptNumber: p.receiptNumber ?? '-',
            reference: p.transactionReference ?? p.chequeNumber ?? p.upiId ?? '-',
        }));
        const byMethod = {};
        const byStatus = {};
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
    async getInventoryReport(filters) {
        const conditions = ['flat.is_active = true'];
        const params = [];
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
        const raw = await this.flatRepo.manager.query(sql, params);
        const rows = raw.map((r) => ({
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
        const byStatus = {};
        const byType = {};
        let totalValue = 0;
        let bookedValue = 0;
        for (const r of rows) {
            byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
            byType[r.flatType] = (byType[r.flatType] ?? 0) + 1;
            if (r.finalPrice)
                totalValue += r.finalPrice;
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map