import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';
import { ModuleRef } from '@nestjs/core';
import { PaymentCompletionService } from './services/payment-completion.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly accountingIntegrationService: AccountingIntegrationService,
    private readonly notificationsService: NotificationsService,
    // Lazy-resolved to avoid any circularity with modules that also import PaymentCompletionService.
    private readonly moduleRef: ModuleRef,
  ) {}

  /** Lazily resolve PaymentCompletionService (same module, so no provider magic needed). */
  private getCompletionService(): PaymentCompletionService {
    return this.moduleRef.get(PaymentCompletionService, { strict: false });
  }

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Direct COMPLETED payments are not allowed - all payments must go through verify()
    if ((createPaymentDto as any).status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Payments cannot be created in COMPLETED status directly. Create the payment as PENDING and use the verify action to complete it.',
      );
    }

    // Generate payment code if not provided
    if (!createPaymentDto.paymentCode) {
      createPaymentDto.paymentCode = await this.generatePaymentCode();
    }

    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  /**
   * Build the shared filtered query used by findAll, findAllPaginated,
   * and getStatistics. Keeps property-scope logic in one place.
   */
  private buildFilteredQuery(filters?: {
    bookingId?: string;
    customerId?: string;
    paymentType?: string;
    paymentMethod?: string;
    status?: PaymentStatus;
    isVerified?: boolean;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    propertyId?: string;
    accessiblePropertyIds?: string[] | null;
  }) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.customer', 'customer');
    this.applyPaymentFilters(query, filters);
    return query;
  }

  async findAll(filters?: {
    bookingId?: string;
    customerId?: string;
    paymentType?: string;
    paymentMethod?: string;
    status?: PaymentStatus;
    isVerified?: boolean;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    propertyId?: string;
    accessiblePropertyIds?: string[] | null;
  }): Promise<Payment[]> {
    const query = this.buildFilteredQuery(filters);
    query.orderBy('payment.paymentDate', 'DESC');
    return query.getMany();
  }

  /** SQL-level pagination (skip/take). Use for list endpoints. */
  async findAllPaginated(
    filters: Parameters<PaymentsService['findAll']>[0],
    page: number,
    limit: number,
  ): Promise<{ data: Payment[]; total: number }> {
    const query = this.buildFilteredQuery(filters);
    query.orderBy('payment.paymentDate', 'DESC');
    const total = await query.getCount();
    const data = await query.skip((page - 1) * limit).take(limit).getMany();
    return { data, total };
  }

  private applyPaymentFilters(
    query: import('typeorm').SelectQueryBuilder<Payment>,
    filters?: Parameters<PaymentsService['findAll']>[0],
  ): void {

    if (filters?.bookingId) {
      query.andWhere('payment.bookingId = :bookingId', { bookingId: filters.bookingId });
    }

    if (filters?.customerId) {
      query.andWhere('payment.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.paymentType) {
      query.andWhere('payment.paymentType = :paymentType', { paymentType: filters.paymentType });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.isVerified !== undefined) {
      if (filters.isVerified) {
        query.andWhere('payment.verifiedBy IS NOT NULL');
      } else {
        query.andWhere('payment.verifiedBy IS NULL');
      }
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.minAmount) {
      query.andWhere('payment.amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters?.maxAmount) {
      query.andWhere('payment.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    // Property scope: honor the top-bar selection (propertyId) when
    // present, but always intersect with the caller's accessible set.
    if (filters?.propertyId) {
      if (
        filters.accessiblePropertyIds &&
        filters.accessiblePropertyIds.length > 0 &&
        !filters.accessiblePropertyIds.includes(filters.propertyId)
      ) {
        query.andWhere('1 = 0');
      } else {
        query.andWhere('booking.propertyId = :propertyId', {
          propertyId: filters.propertyId,
        });
      }
    } else if (
      filters?.accessiblePropertyIds &&
      filters.accessiblePropertyIds.length > 0
    ) {
      query.andWhere('booking.propertyId IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds: filters.accessiblePropertyIds,
      });
    }
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking', 'customer'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByPaymentCode(paymentCode: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentCode },
      relations: ['booking', 'customer'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with code ${paymentCode} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    // Prevent updating completed or refunded payments
    if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException(`Cannot update payment with status ${payment.status}`);
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  /**
   * Flip a payment's status to REFUNDED. Separate from {@link update}
   * because `update` intentionally rejects transitions on COMPLETED /
   * REFUNDED rows - but the refund processing flow needs exactly that
   * transition once a refund has been fully processed. Previously the
   * refunds service tried to go through update() and silently failed
   * (payment stayed COMPLETED, collections / reports got misaligned).
   */
  async markRefunded(id: string, userId?: string | null): Promise<Payment> {
    const payment = await this.findOne(id);
    if (payment.status === PaymentStatus.REFUNDED) return payment;
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Only COMPLETED payments can be marked REFUNDED (current: ${payment.status})`,
      );
    }
    payment.status = PaymentStatus.REFUNDED;
    payment.notes = [payment.notes, userId ? `Refunded by ${userId}` : 'Refunded']
      .filter(Boolean)
      .join(' | ');
    return this.paymentRepository.save(payment);
  }

  async verify(id: string, userId: string): Promise<Payment> {
    const { payment } = await this.verifyWithReport(id, userId);
    return payment;
  }

  /**
   * Same as {@link verify}, but returns the post-completion hook
   * summary so the caller can surface whether an auto-JE was posted,
   * skipped, or failed. The Collections "Record Payment" action uses
   * this to show a warning toast when the Chart of Accounts is
   * incomplete (instead of a silent success that hides a missing JE).
   */
  async verifyWithReport(
    id: string,
    userId: string,
  ): Promise<{
    payment: Payment;
    journalEntryId: string | null;
    journalEntrySkipReason: string | null;
  }> {
    const payment = await this.findOne(id);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already verified');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.verifiedBy = userId;
    payment.verifiedAt = new Date();
    const saved = await this.paymentRepository.save(payment);

    const hookResult = await this.runPostCompletionHooks(saved.id, userId);

    return {
      payment: saved,
      journalEntryId: hookResult.journalEntryId,
      journalEntrySkipReason: hookResult.journalEntrySkipReason,
    };
  }

  /**
   * Run the three post-completion side-effects that every freshly-
   * COMPLETED payment needs, regardless of whether it originated from
   * {@link verify} or a booking-creation token flow:
   *
   *   1. Match against a payment schedule / milestone and update the
   *      parent booking totals via PaymentCompletionService.
   *   2. Post the accounting journal entry.
   *   3. Notify the customer.
   *
   * All three are best-effort - individual failures are logged but
   * never thrown, so a transient SMTP error can't stop a payment from
   * landing in the books. The token-payment path in BookingsService
   * calls this post-commit so the same pipeline covers both entry
   * points.
   */
  async runPostCompletionHooks(
    paymentId: string,
    userId?: string | null,
  ): Promise<{
    journalEntryId: string | null;
    journalEntrySkipReason: string | null;
  }> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      this.logger.warn(`runPostCompletionHooks: payment ${paymentId} not found`);
      return { journalEntryId: null, journalEntrySkipReason: 'payment-not-found' };
    }

    try {
      await this.getCompletionService().processPaymentCompletion(payment.id);
    } catch (err: any) {
      this.logger.error(
        `Payment completion workflow failed for payment ${payment.paymentCode}: ${err.message}`,
      );
    }

    let journalEntryId: string | null = null;
    let journalEntrySkipReason: string | null = null;
    try {
      const entry = await this.accountingIntegrationService.onPaymentCompleted({
        id: payment.id,
        paymentCode: payment.paymentCode,
        amount: Number(payment.amount),
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        createdBy: userId ?? undefined,
      });
      if (entry?.id) {
        journalEntryId = entry.id;
      } else {
        // onPaymentCompleted returns null when the Chart of Accounts is
        // missing a default Bank/Cash or Sales/Revenue account. That
        // should be self-healing via AccountsBootstrapService but on
        // older installs it can still happen - surface it to the caller
        // so the UI can show a warning instead of a misleading success.
        journalEntrySkipReason = 'missing-default-accounts';
      }
    } catch (err: any) {
      journalEntrySkipReason = err?.message || 'unknown-error';
      this.logger.error(
        `Auto JE failed for payment ${payment.paymentCode}: ${err.message}`,
      );
    }

    this.notifyCustomerOnPaymentVerified(payment).catch((e) =>
      this.logger.warn(`Failed to send payment notification: ${e.message}`),
    );

    return { journalEntryId, journalEntrySkipReason };
  }

  private async notifyCustomerOnPaymentVerified(payment: Payment): Promise<void> {
    if (!payment.bookingId) return;
    const booking = await this.bookingRepository.findOne({
      where: { id: payment.bookingId },
      select: ['id', 'customerId', 'bookingNumber'],
    });
    if (!booking?.customerId) return;

    const customerUser = await this.userRepository.findOne({
      where: { customerId: booking.customerId },
      select: ['id'],
    });
    if (!customerUser) return;

    const amt = new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(Number(payment.amount));

    await this.notificationsService.create({
      userId: customerUser.id,
      title: 'Payment Verified',
      message: `Your payment of ${amt} has been verified and recorded for booking #${booking.bookingNumber}.`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.PAYMENT,
      actionUrl: `/portal/bookings/${payment.bookingId}`,
      actionLabel: 'View Booking',
      relatedEntityId: payment.id,
      relatedEntityType: 'payment',
    });
  }

  async cancel(id: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed payment. Create a refund instead.');
    }

    payment.status = 'CANCELLED';
    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete a completed payment');
    }

    await this.paymentRepository.remove(payment);
  }

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    paymentType?: string;
    propertyId?: string;
    accessiblePropertyIds?: string[] | null;
  }): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    completedAmount: number;
    pendingPayments: number;
    pendingAmount: number;
    byMethod: Array<{ method: string; count: number; amount: number }>;
    byType: Array<{ type: string; count: number; amount: number }>;
  }> {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoin('payment.booking', 'booking');

    if (filters?.startDate && filters?.endDate) {
      query.where('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.paymentType) {
      query.andWhere('payment.paymentType = :paymentType', { paymentType: filters.paymentType });
    }

    if (filters?.propertyId) {
      if (
        filters.accessiblePropertyIds &&
        filters.accessiblePropertyIds.length > 0 &&
        !filters.accessiblePropertyIds.includes(filters.propertyId)
      ) {
        query.andWhere('1 = 0');
      } else {
        query.andWhere('booking.propertyId = :propertyId', {
          propertyId: filters.propertyId,
        });
      }
    } else if (
      filters?.accessiblePropertyIds &&
      filters.accessiblePropertyIds.length > 0
    ) {
      query.andWhere('booking.propertyId IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds: filters.accessiblePropertyIds,
      });
    }

    const payments = await query.getMany();

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
    const completedAmount = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
    const pendingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Group by payment method
    const byMethodMap = new Map<string, { count: number; amount: number }>();
    payments.forEach(p => {
      const existing = byMethodMap.get(p.paymentMethod) || { count: 0, amount: 0 };
      byMethodMap.set(p.paymentMethod, {
        count: existing.count + 1,
        amount: existing.amount + Number(p.amount),
      });
    });

    const byMethod = Array.from(byMethodMap.entries()).map(([method, data]) => ({
      method,
      ...data,
    }));

    // Group by payment type
    const byTypeMap = new Map<string, { count: number; amount: number }>();
    payments.forEach(p => {
      const existing = byTypeMap.get(p.paymentType) || { count: 0, amount: 0 };
      byTypeMap.set(p.paymentType, {
        count: existing.count + 1,
        amount: existing.amount + Number(p.amount),
      });
    });

    const byType = Array.from(byTypeMap.entries()).map(([type, data]) => ({
      type,
      ...data,
    }));

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      completedAmount,
      pendingPayments,
      pendingAmount,
      byMethod,
      byType,
    };
  }

  private async generatePaymentCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const code = `PAY${dateStr}${randomNum}`;

    // Check if code already exists
    const existing = await this.paymentRepository.findOne({ where: { paymentCode: code } });
    if (existing) {
      // Recursively generate a new code
      return this.generatePaymentCode();
    }

    return code;
  }
}
