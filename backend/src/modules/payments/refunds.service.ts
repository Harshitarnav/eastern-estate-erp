import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRefund, RefundStatus } from './entities/payment-refund.entity';
import { CreateRefundDto, ApproveRefundDto, ProcessRefundDto } from './dto/create-refund.dto';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './entities/payment.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(PaymentRefund)
    private refundRepository: Repository<PaymentRefund>,
    private paymentsService: PaymentsService,
  ) {}

  async create(createRefundDto: CreateRefundDto, userId: string): Promise<PaymentRefund> {
    // Verify the payment exists and is completed
    const payment = await this.paymentsService.findOne(createRefundDto.paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only create refunds for completed payments');
    }

    // Check if refund amount is valid
    if (createRefundDto.refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Check for existing refunds
    const existingRefunds = await this.refundRepository.find({
      where: { paymentId: createRefundDto.paymentId },
    });

    const totalRefunded = existingRefunds.reduce((sum, r) => sum + Number(r.refundAmount), 0);

    if (totalRefunded + createRefundDto.refundAmount > payment.amount) {
      throw new BadRequestException(
        `Total refund amount (${totalRefunded + createRefundDto.refundAmount}) would exceed payment amount (${payment.amount})`
      );
    }

    const refund = this.refundRepository.create({
      ...createRefundDto,
      createdBy: userId,
    });

    return this.refundRepository.save(refund);
  }

  async findAll(filters?: {
    paymentId?: string;
    status?: RefundStatus;
  }): Promise<PaymentRefund[]> {
    const query = this.refundRepository.createQueryBuilder('refund')
      .leftJoinAndSelect('refund.payment', 'payment')
      .leftJoinAndSelect('refund.creator', 'creator')
      .leftJoinAndSelect('refund.approver', 'approver')
      .leftJoinAndSelect('refund.processor', 'processor');

    if (filters?.paymentId) {
      query.andWhere('refund.paymentId = :paymentId', { paymentId: filters.paymentId });
    }

    if (filters?.status) {
      query.andWhere('refund.status = :status', { status: filters.status });
    }

    query.orderBy('refund.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(id: string): Promise<PaymentRefund> {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['payment', 'creator', 'approver', 'processor'],
    });

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }

    return refund;
  }

  async approve(
    id: string,
    userId: string,
    approveDto?: ApproveRefundDto,
  ): Promise<PaymentRefund> {
    const refund = await this.findOne(id);

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot approve refund with status ${refund.status}`);
    }

    refund.status = RefundStatus.APPROVED;
    refund.approvedBy = userId;
    refund.approvedAt = new Date();

    return this.refundRepository.save(refund);
  }

  async reject(id: string, userId: string, reason: string): Promise<PaymentRefund> {
    const refund = await this.findOne(id);

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Cannot reject refund with status ${refund.status}`);
    }

    refund.status = RefundStatus.REJECTED;
    refund.approvedBy = userId;
    refund.approvedAt = new Date();
    refund.bankDetails = `Rejected: ${reason}`;

    return this.refundRepository.save(refund);
  }

  async process(
    id: string,
    userId: string,
    processDto: ProcessRefundDto,
  ): Promise<PaymentRefund> {
    const refund = await this.findOne(id);

    if (refund.status !== RefundStatus.APPROVED) {
      throw new BadRequestException('Can only process approved refunds');
    }

    refund.status = RefundStatus.PROCESSED;
    refund.processedBy = userId;
    refund.processedAt = new Date();
    refund.transactionReference = processDto.transactionReference;

    // Update payment status to refunded if fully refunded
    const payment = await this.paymentsService.findOne(refund.paymentId);
    const allRefunds = await this.findAll({ paymentId: refund.paymentId });
    
    const totalRefunded = allRefunds
      .filter(r => r.status === RefundStatus.PROCESSED)
      .reduce((sum, r) => sum + Number(r.refundAmount), 0);

    if (totalRefunded >= payment.amount) {
      await this.paymentsService.update(payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }

    return this.refundRepository.save(refund);
  }

  async getPendingRefunds(): Promise<PaymentRefund[]> {
    return this.findAll({ status: RefundStatus.PENDING });
  }

  async getApprovedRefunds(): Promise<PaymentRefund[]> {
    return this.findAll({ status: RefundStatus.APPROVED });
  }

  async getRefundStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalRefunds: number;
    totalAmount: number;
    pendingRefunds: number;
    pendingAmount: number;
    approvedRefunds: number;
    approvedAmount: number;
    processedRefunds: number;
    processedAmount: number;
    rejectedRefunds: number;
    rejectedAmount: number;
  }> {
    const query = this.refundRepository.createQueryBuilder('refund');

    if (filters?.startDate && filters?.endDate) {
      query.where('refund.refundDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const refunds = await query.getMany();

    const totalRefunds = refunds.length;
    const totalAmount = refunds.reduce((sum, r) => sum + Number(r.refundAmount), 0);

    const pendingRefunds = refunds.filter(r => r.status === RefundStatus.PENDING).length;
    const pendingAmount = refunds
      .filter(r => r.status === RefundStatus.PENDING)
      .reduce((sum, r) => sum + Number(r.refundAmount), 0);

    const approvedRefunds = refunds.filter(r => r.status === RefundStatus.APPROVED).length;
    const approvedAmount = refunds
      .filter(r => r.status === RefundStatus.APPROVED)
      .reduce((sum, r) => sum + Number(r.refundAmount), 0);

    const processedRefunds = refunds.filter(r => r.status === RefundStatus.PROCESSED).length;
    const processedAmount = refunds
      .filter(r => r.status === RefundStatus.PROCESSED)
      .reduce((sum, r) => sum + Number(r.refundAmount), 0);

    const rejectedRefunds = refunds.filter(r => r.status === RefundStatus.REJECTED).length;
    const rejectedAmount = refunds
      .filter(r => r.status === RefundStatus.REJECTED)
      .reduce((sum, r) => sum + Number(r.refundAmount), 0);

    return {
      totalRefunds,
      totalAmount,
      pendingRefunds,
      pendingAmount,
      approvedRefunds,
      approvedAmount,
      processedRefunds,
      processedAmount,
      rejectedRefunds,
      rejectedAmount,
    };
  }
}
