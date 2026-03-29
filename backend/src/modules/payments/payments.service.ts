import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly accountingIntegrationService: AccountingIntegrationService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Direct COMPLETED payments are not allowed — all payments must go through verify()
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
    accessiblePropertyIds?: string[] | null;
  }): Promise<Payment[]> {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.customer', 'customer');

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

    if (filters?.accessiblePropertyIds && filters.accessiblePropertyIds.length > 0) {
      query.andWhere('booking.propertyId IN (:...accessiblePropertyIds)', {
        accessiblePropertyIds: filters.accessiblePropertyIds,
      });
    }

    query.orderBy('payment.paymentDate', 'DESC');

    return query.getMany();
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

  async verify(id: string, userId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already verified');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.verifiedBy = userId;
    payment.verifiedAt = new Date();
    const saved = await this.paymentRepository.save(payment);

    // Auto-create Journal Entry (best-effort, never blocks the payment)
    await this.accountingIntegrationService.onPaymentCompleted({
      id: saved.id,
      paymentCode: saved.paymentCode,
      amount: Number(saved.amount),
      paymentDate: saved.paymentDate,
      paymentMethod: saved.paymentMethod,
      createdBy: userId,
    });

    return saved;
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

    if (filters?.accessiblePropertyIds && filters.accessiblePropertyIds.length > 0) {
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
