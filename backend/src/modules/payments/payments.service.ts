import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
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
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
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

    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Payment is already verified');
    }

    payment.status = 'COMPLETED';

    return this.paymentRepository.save(payment);
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
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (filters?.startDate && filters?.endDate) {
      query.where('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.paymentType) {
      query.andWhere('payment.paymentType = :paymentType', { paymentType: filters.paymentType });
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
