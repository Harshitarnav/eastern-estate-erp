import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatPaymentPlan, FlatPaymentMilestone, FlatPaymentPlanStatus } from '../entities/flat-payment-plan.entity';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { PaymentPlanTemplateService } from './payment-plan-template.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Payment } from '../../payments/entities/payment.entity';

export interface LedgerRow {
  date: string | null;
  description: string;
  type: 'DEMAND' | 'PAYMENT';
  /** Amount demanded (debit side) */
  debit: number;
  /** Amount paid (credit side) */
  credit: number;
  /** Running balance after this row */
  balance: number;
  /** Milestone sequence if this is a demand row */
  milestoneSequence?: number;
  /** Demand draft ID if exists */
  demandDraftId?: string | null;
  /** Payment ID if this is a payment row */
  paymentId?: string | null;
  /** Payment code / receipt number for reference */
  reference?: string;
  /** Row status (milestone status or payment status) */
  status?: string;
}

export interface LedgerResponse {
  plan: {
    id: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
  };
  customer: { id: string; fullName: string; phone?: string; email?: string } | null;
  flat: { id: string; flatNumber: string; property?: string; tower?: string } | null;
  booking: { id: string; bookingNumber: string; bookingDate?: Date } | null;
  rows: LedgerRow[];
  summary: {
    totalDemanded: number;
    totalPaid: number;
    balance: number;
    overdueCount: number;
    pendingMilestones: number;
  };
}

@Injectable()
export class FlatPaymentPlanService {
  constructor(
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly templateService: PaymentPlanTemplateService,
  ) {}

  /**
   * Create a flat payment plan from a template
   */
  async create(createDto: CreateFlatPaymentPlanDto, userId: string): Promise<FlatPaymentPlan> {
    // Verify flat exists
    const flat = await this.flatRepository.findOne({ where: { id: createDto.flatId } });
    if (!flat) {
      throw new NotFoundException(`Flat with ID ${createDto.flatId} not found`);
    }

    // Verify booking exists
    const booking = await this.bookingRepository.findOne({ where: { id: createDto.bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${createDto.bookingId} not found`);
    }

    // Verify customer exists
    const customer = await this.customerRepository.findOne({ where: { id: createDto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${createDto.customerId} not found`);
    }

    // Check if flat already has a payment plan
    const existing = await this.flatPaymentPlanRepository.findOne({
      where: { flatId: createDto.flatId, bookingId: createDto.bookingId }
    });
    if (existing) {
      throw new BadRequestException('This flat-booking combination already has a payment plan');
    }

    // Get template
    const template = await this.templateService.findOne(createDto.paymentPlanTemplateId);

    // Convert template milestones to flat milestones with calculated amounts
    const milestones: FlatPaymentMilestone[] = template.milestones.map((tm) => ({
      sequence: tm.sequence,
      name: tm.name,
      constructionPhase: tm.constructionPhase,
      phasePercentage: tm.phasePercentage,
      amount: (createDto.totalAmount * tm.paymentPercentage) / 100,
      dueDate: null,
      status: 'PENDING',
      paymentScheduleId: null,
      constructionCheckpointId: null,
      demandDraftId: null,
      paymentId: null,
      completedAt: null,
      description: tm.description,
    }));

    // Create flat payment plan
    const flatPaymentPlan = this.flatPaymentPlanRepository.create({
      flatId: createDto.flatId,
      bookingId: createDto.bookingId,
      customerId: createDto.customerId,
      paymentPlanTemplateId: createDto.paymentPlanTemplateId,
      totalAmount: createDto.totalAmount,
      paidAmount: 0,
      balanceAmount: createDto.totalAmount,
      milestones,
      status: FlatPaymentPlanStatus.ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.flatPaymentPlanRepository.save(flatPaymentPlan);

    // Note: Flat entity linking removed as paymentPlanId column doesn't exist in schema
    // The relationship is maintained via flatId in FlatPaymentPlan

    return saved;
  }

  /**
   * Create a flat payment plan while a booking is being created.
   *
   * Supports three modes:
   *  - `template`       → snapshot milestones from the template as-is (percentages × totalAmount)
   *  - `template-edit`  → start from the template but override milestones with provided values
   *  - `custom`         → no template, just use the provided milestones
   *
   * Milestones may specify either `paymentPercentage` OR `amount`. If both are given,
   * `amount` wins. If neither is given the row is dropped.
   */
  async createForBooking(
    input: {
      flatId: string;
      bookingId: string;
      customerId: string;
      totalAmount: number;
      mode: 'template' | 'template-edit' | 'custom';
      templateId?: string;
      milestones?: Array<{
        sequence: number;
        name: string;
        constructionPhase?: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
        phasePercentage?: number | null;
        paymentPercentage?: number;
        amount?: number;
        description?: string;
      }>;
    },
    userId: string,
  ): Promise<FlatPaymentPlan> {
    // Guard: don't double-create for the same booking
    const existing = await this.flatPaymentPlanRepository.findOne({
      where: { flatId: input.flatId, bookingId: input.bookingId },
    });
    if (existing) {
      throw new BadRequestException('This booking already has a payment plan');
    }

    let templateId: string | null = null;
    let milestones: FlatPaymentMilestone[] = [];

    if (input.mode === 'template' || input.mode === 'template-edit') {
      if (!input.templateId) {
        throw new BadRequestException('templateId is required for template modes');
      }
      const template = await this.templateService.findOne(input.templateId);
      templateId = template.id;

      if (input.mode === 'template') {
        milestones = template.milestones.map((tm) => ({
          sequence: tm.sequence,
          name: tm.name,
          constructionPhase: tm.constructionPhase,
          phasePercentage: tm.phasePercentage,
          amount: (input.totalAmount * tm.paymentPercentage) / 100,
          dueDate: null,
          status: 'PENDING',
          paymentScheduleId: null,
          constructionCheckpointId: null,
          demandDraftId: null,
          paymentId: null,
          completedAt: null,
          description: tm.description,
        }));
      }
    }

    // Custom / template-edit: use the provided milestones
    if (input.mode === 'custom' || input.mode === 'template-edit') {
      if (!input.milestones || input.milestones.length === 0) {
        throw new BadRequestException('At least one milestone is required');
      }
      milestones = input.milestones
        .map((m) => {
          const resolvedAmount =
            m.amount !== undefined && m.amount !== null
              ? Number(m.amount)
              : m.paymentPercentage !== undefined && m.paymentPercentage !== null
              ? (input.totalAmount * Number(m.paymentPercentage)) / 100
              : NaN;

          if (!Number.isFinite(resolvedAmount)) return null;

          return {
            sequence: m.sequence,
            name: m.name,
            constructionPhase: m.constructionPhase ?? null,
            phasePercentage: m.phasePercentage ?? null,
            amount: resolvedAmount,
            dueDate: null,
            status: 'PENDING',
            paymentScheduleId: null,
            constructionCheckpointId: null,
            demandDraftId: null,
            paymentId: null,
            completedAt: null,
            description: m.description ?? '',
          } as FlatPaymentMilestone;
        })
        .filter((m): m is FlatPaymentMilestone => m !== null);
    }

    // Soft check: amounts should sum close to totalAmount (±1 INR tolerance)
    const sum = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);
    if (Math.abs(sum - Number(input.totalAmount)) > 1) {
      throw new BadRequestException(
        `Milestone amounts (${sum.toFixed(2)}) don't match total amount (${Number(input.totalAmount).toFixed(2)})`,
      );
    }

    const plan = this.flatPaymentPlanRepository.create({
      flatId: input.flatId,
      bookingId: input.bookingId,
      customerId: input.customerId,
      paymentPlanTemplateId: templateId as any,
      totalAmount: input.totalAmount,
      paidAmount: 0,
      balanceAmount: input.totalAmount,
      milestones,
      status: FlatPaymentPlanStatus.ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Get all flat payment plans, optionally scoped to a property.
   * `propertyId` (optional) filters by the flat's property so the
   * top-bar selection is honored. `accessiblePropertyIds` is the
   * user's RBAC fence - when present, results are always intersected
   * with it so callers cannot widen scope.
   */
  async findAll(
    propertyId?: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<FlatPaymentPlan[]> {
    const qb = this.flatPaymentPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.flat', 'flat')
      .leftJoinAndSelect('flat.property', 'flatProperty')
      .leftJoinAndSelect('flat.tower', 'flatTower')
      .leftJoinAndSelect('plan.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'bookingCustomer')
      .leftJoinAndSelect('plan.customer', 'customer')
      .leftJoinAndSelect('plan.paymentPlanTemplate', 'template')
      .orderBy('plan.createdAt', 'DESC');

    if (propertyId) {
      if (
        accessiblePropertyIds &&
        accessiblePropertyIds.length > 0 &&
        !accessiblePropertyIds.includes(propertyId)
      ) {
        qb.andWhere('1 = 0');
      } else {
        qb.andWhere('flat.propertyId = :propertyId', { propertyId });
      }
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      qb.andWhere('flat.propertyId IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds,
      });
    }

    return qb.getMany();
  }

  /**
   * Get flat payment plan by ID
   */
  async findOne(id: string): Promise<FlatPaymentPlan> {
    const plan = await this.flatPaymentPlanRepository.findOne({
      where: { id },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
    if (!plan) {
      throw new NotFoundException(`Flat payment plan with ID ${id} not found`);
    }
    return plan;
  }

  /**
   * Get flat payment plan by flat ID
   */
  async findByFlatId(flatId: string): Promise<FlatPaymentPlan | null> {
    return await this.flatPaymentPlanRepository.findOne({
      where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
  }

  /**
   * Get flat payment plan by booking ID
   */
  async findByBookingId(bookingId: string): Promise<FlatPaymentPlan | null> {
    return await this.flatPaymentPlanRepository.findOne({
      where: { bookingId, status: FlatPaymentPlanStatus.ACTIVE },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
    });
  }

  /**
   * Update milestone in flat payment plan
   */
  async updateMilestone(
    planId: string,
    milestoneSequence: number,
    updates: Partial<FlatPaymentMilestone>,
    userId: string,
  ): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(planId);
    
    const milestoneIndex = plan.milestones.findIndex(m => m.sequence === milestoneSequence);
    if (milestoneIndex === -1) {
      throw new NotFoundException(`Milestone with sequence ${milestoneSequence} not found in plan`);
    }

    // Update milestone
    plan.milestones[milestoneIndex] = {
      ...plan.milestones[milestoneIndex],
      ...updates,
    };

    // Recalculate paid and balance amounts
    const paidAmount = plan.milestones
      .filter(m => m.status === 'PAID')
      .reduce((sum, m) => sum + m.amount, 0);
    
    plan.paidAmount = paidAmount;
    plan.balanceAmount = plan.totalAmount - paidAmount;

    // Check if all milestones are paid
    const allPaid = plan.milestones.every(m => m.status === 'PAID');
    if (allPaid) {
      plan.status = FlatPaymentPlanStatus.COMPLETED;
    }

    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Bulk-replace all milestones in a flat payment plan.
   * Re-derives paidAmount / balanceAmount automatically.
   */
  async updateMilestones(
    planId: string,
    milestones: FlatPaymentMilestone[],
    userId: string,
  ): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(planId);

    plan.milestones = milestones;

    // Recalculate paid and balance amounts
    const paidAmount = milestones
      .filter(m => m.status === 'PAID')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    plan.paidAmount = paidAmount;
    plan.balanceAmount = plan.totalAmount - paidAmount;

    const allPaid = milestones.length > 0 && milestones.every(m => m.status === 'PAID');
    if (allPaid) {
      plan.status = FlatPaymentPlanStatus.COMPLETED;
    } else if (plan.status === FlatPaymentPlanStatus.COMPLETED) {
      plan.status = FlatPaymentPlanStatus.ACTIVE;
    }

    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Patch plan-level fields (totalAmount, status).
   * Recomputes balanceAmount when totalAmount changes.
   */
  async updatePlan(
    planId: string,
    updates: { totalAmount?: number; status?: FlatPaymentPlanStatus },
    userId: string,
  ): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(planId);

    if (updates.totalAmount !== undefined) {
      plan.totalAmount = updates.totalAmount;
      plan.balanceAmount = updates.totalAmount - plan.paidAmount;
    }
    if (updates.status !== undefined) {
      plan.status = updates.status;
    }

    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Cancel flat payment plan
   */
  async cancel(id: string, userId: string): Promise<FlatPaymentPlan> {
    const plan = await this.findOne(id);
    plan.status = FlatPaymentPlanStatus.CANCELLED;
    plan.updatedBy = userId;
    return await this.flatPaymentPlanRepository.save(plan);
  }

  /**
   * Generate a unit-wise ledger for a booking.
   * Combines milestone demands (debit) with actual payment receipts (credit)
   * into a chronological statement with running balance.
   */
  async getLedger(bookingId: string): Promise<LedgerResponse> {
    // 1. Load the payment plan for this booking
    const plan = await this.flatPaymentPlanRepository.findOne({
      where: { bookingId },
      relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'customer'],
    });
    if (!plan) {
      throw new NotFoundException(`No payment plan found for booking ${bookingId}`);
    }

    // 2. Load all payments linked to this booking
    const payments = await this.paymentRepository.find({
      where: { bookingId },
      order: { paymentDate: 'ASC' },
    });

    // 3. Build raw event list (demands + payments)
    type RawEvent =
      | { sortKey: string; type: 'DEMAND'; milestone: FlatPaymentMilestone }
      | { sortKey: string; type: 'PAYMENT'; payment: Payment };

    const events: RawEvent[] = [];

    // Milestone demand rows - only include milestones that have been triggered/demanded
    for (const m of plan.milestones) {
      // Include all non-PENDING milestones in the ledger (TRIGGERED, OVERDUE, PAID)
      // Also include PENDING milestones that have a due date (scheduled)
      if (m.status !== 'PENDING' || m.dueDate) {
        const dateKey = m.dueDate ?? '9999-12-31'; // PENDING w/ no date go last
        events.push({ sortKey: dateKey, type: 'DEMAND', milestone: m });
      }
    }

    // Payment rows
    for (const p of payments) {
      const dateKey = p.paymentDate
        ? new Date(p.paymentDate).toISOString().split('T')[0]
        : '9999-12-31';
      events.push({ sortKey: dateKey, type: 'PAYMENT', payment: p });
    }

    // 4. Sort chronologically
    events.sort((a, b) => {
      if (a.sortKey < b.sortKey) return -1;
      if (a.sortKey > b.sortKey) return 1;
      // Demands before payments on the same day
      if (a.type === 'DEMAND' && b.type === 'PAYMENT') return -1;
      if (a.type === 'PAYMENT' && b.type === 'DEMAND') return 1;
      return 0;
    });

    // 5. Build ledger rows with running balance
    let runningBalance = 0;
    const rows: LedgerRow[] = [];

    for (const ev of events) {
      if (ev.type === 'DEMAND') {
        const m = ev.milestone;
        const debit = Number(m.amount) || 0;
        runningBalance += debit;
        rows.push({
          date: m.dueDate ?? null,
          description: m.name,
          type: 'DEMAND',
          debit,
          credit: 0,
          balance: runningBalance,
          milestoneSequence: m.sequence,
          demandDraftId: m.demandDraftId ?? null,
          status: m.status,
        });
      } else {
        const p = ev.payment;
        const credit = Number(p.amount) || 0;
        runningBalance -= credit;
        rows.push({
          date: p.paymentDate
            ? new Date(p.paymentDate).toISOString().split('T')[0]
            : null,
          description: `Payment received - ${p.paymentMethod?.replace(/_/g, ' ') ?? ''}`,
          type: 'PAYMENT',
          debit: 0,
          credit,
          balance: runningBalance,
          paymentId: p.id,
          reference: p.paymentCode,
          status: p.status,
        });
      }
    }

    // 6. Summary
    const totalDemanded = rows
      .filter(r => r.type === 'DEMAND')
      .reduce((s, r) => s + r.debit, 0);
    const totalPaid = rows
      .filter(r => r.type === 'PAYMENT')
      .reduce((s, r) => s + r.credit, 0);
    const overdueCount = plan.milestones.filter(m => m.status === 'OVERDUE').length;
    const pendingMilestones = plan.milestones.filter(m => m.status === 'PENDING').length;

    return {
      plan: {
        id: plan.id,
        totalAmount: Number(plan.totalAmount),
        paidAmount: Number(plan.paidAmount),
        balanceAmount: Number(plan.balanceAmount),
        status: plan.status,
      },
      customer: plan.customer
        ? {
            id: plan.customer.id,
            fullName: plan.customer.fullName,
            phone: (plan.customer as any).phoneNumber ?? null,
            email: plan.customer.email,
          }
        : null,
      flat: plan.flat
        ? {
            id: plan.flat.id,
            flatNumber: plan.flat.flatNumber,
            property: (plan.flat as any).property?.name ?? undefined,
            tower: (plan.flat as any).tower?.name ?? undefined,
          }
        : null,
      booking: plan.booking
        ? {
            id: plan.booking.id,
            bookingNumber: plan.booking.bookingNumber,
            bookingDate: plan.booking.bookingDate,
          }
        : null,
      rows,
      summary: {
        totalDemanded,
        totalPaid,
        balance: totalDemanded - totalPaid,
        overdueCount,
        pendingMilestones,
      },
    };
  }
}
