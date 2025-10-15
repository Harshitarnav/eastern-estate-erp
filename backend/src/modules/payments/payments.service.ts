import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  QueryPaymentDto,
  PaymentResponseDto,
  PaginatedPaymentsResponse,
} from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const existing = await this.paymentsRepository.findOne({
      where: { paymentNumber: createPaymentDto.paymentNumber },
    });

    if (existing) {
      throw new ConflictException('Payment number already exists');
    }

    const payment = this.paymentsRepository.create(createPaymentDto);
    const savedPayment = await this.paymentsRepository.save(payment);

    return PaymentResponseDto.fromEntity(savedPayment);
  }

  async findAll(query: QueryPaymentDto): Promise<PaginatedPaymentsResponse> {
    const {
      search,
      paymentType,
      paymentMode,
      status,
      bookingId,
      customerId,
      paymentDateFrom,
      paymentDateTo,
      isVerified,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.customer', 'customer');

    if (search) {
      queryBuilder.andWhere(
        '(payment.paymentNumber ILIKE :search OR payment.receiptNumber ILIKE :search OR payment.transactionId ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (paymentType) {
      queryBuilder.andWhere('payment.paymentType = :paymentType', { paymentType });
    }

    if (paymentMode) {
      queryBuilder.andWhere('payment.paymentMode = :paymentMode', { paymentMode });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (bookingId) {
      queryBuilder.andWhere('payment.bookingId = :bookingId', { bookingId });
    }

    if (customerId) {
      queryBuilder.andWhere('payment.customerId = :customerId', { customerId });
    }

    if (paymentDateFrom) {
      queryBuilder.andWhere('payment.paymentDate >= :paymentDateFrom', { paymentDateFrom });
    }

    if (paymentDateTo) {
      queryBuilder.andWhere('payment.paymentDate <= :paymentDateTo', { paymentDateTo });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('payment.isVerified = :isVerified', { isVerified });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('payment.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const payments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: PaymentResponseDto.fromEntities(payments),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['booking', 'customer'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return PaymentResponseDto.fromEntity(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (updatePaymentDto.paymentNumber && updatePaymentDto.paymentNumber !== payment.paymentNumber) {
      const existing = await this.paymentsRepository.findOne({
        where: { paymentNumber: updatePaymentDto.paymentNumber },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Payment number already exists');
      }
    }

    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentsRepository.save(payment);

    return PaymentResponseDto.fromEntity(updatedPayment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    payment.isActive = false;
    await this.paymentsRepository.save(payment);
  }

  async verifyPayment(id: string, verifiedBy: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    payment.isVerified = true;
    payment.verifiedBy = verifiedBy;
    payment.verifiedAt = new Date();

    const verifiedPayment = await this.paymentsRepository.save(payment);

    return PaymentResponseDto.fromEntity(verifiedPayment);
  }

  async getStatistics() {
    const payments = await this.paymentsRepository.find({ where: { isActive: true } });

    const total = payments.length;
    const pending = payments.filter((p) => p.status === 'PENDING').length;
    const received = payments.filter((p) => p.status === 'RECEIVED').length;
    const cleared = payments.filter((p) => p.status === 'CLEARED').length;
    const bounced = payments.filter((p) => p.status === 'BOUNCED').length;

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalNetAmount = payments.reduce((sum, p) => sum + Number(p.netAmount), 0);
    const totalTDS = payments.reduce((sum, p) => sum + Number(p.tdsAmount), 0);
    const totalGST = payments.reduce((sum, p) => sum + Number(p.gstAmount), 0);

    const byPaymentMode = {
      cash: payments.filter((p) => p.paymentMode === 'CASH').length,
      cheque: payments.filter((p) => p.paymentMode === 'CHEQUE').length,
      bankTransfer: payments.filter((p) => p.paymentMode === 'BANK_TRANSFER').length,
      upi: payments.filter((p) => p.paymentMode === 'UPI').length,
      online: payments.filter((p) => p.paymentMode === 'ONLINE').length,
    };

    const verified = payments.filter((p) => p.isVerified).length;

    return {
      total,
      pending,
      received,
      cleared,
      bounced,
      totalAmount,
      totalNetAmount,
      totalTDS,
      totalGST,
      byPaymentMode,
      verified,
      verificationRate: total > 0 ? (verified / total) * 100 : 0,
    };
  }
}
