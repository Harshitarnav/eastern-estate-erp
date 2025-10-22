import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PaymentInstallment, InstallmentStatus } from './entities/payment-installment.entity';
import { CreateInstallmentDto, CreateInstallmentScheduleDto } from './dto/create-installment.dto';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(PaymentInstallment)
    private installmentRepository: Repository<PaymentInstallment>,
  ) {}

  async create(createInstallmentDto: CreateInstallmentDto): Promise<PaymentInstallment> {
    const installment = this.installmentRepository.create(createInstallmentDto);
    return this.installmentRepository.save(installment);
  }

  async createSchedule(scheduleDto: CreateInstallmentScheduleDto): Promise<PaymentInstallment[]> {
    const { bookingId, numberOfInstallments, totalAmount, startDate, intervalDays } = scheduleDto;

    // Check if schedule already exists for this booking
    const existing = await this.installmentRepository.findOne({
      where: { bookingId },
    });

    if (existing) {
      throw new BadRequestException(`Installment schedule already exists for booking ${bookingId}`);
    }

    const installmentAmount = totalAmount / numberOfInstallments;
    const installments: PaymentInstallment[] = [];

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * intervalDays));

      const installment = this.installmentRepository.create({
        bookingId,
        installmentNumber: i + 1,
        dueDate,
        amount: installmentAmount,
        status: InstallmentStatus.PENDING,
      });

      installments.push(installment);
    }

    return this.installmentRepository.save(installments);
  }

  async findAll(filters?: {
    bookingId?: string;
    status?: InstallmentStatus;
    overdue?: boolean;
  }): Promise<PaymentInstallment[]> {
    const query = this.installmentRepository.createQueryBuilder('installment')
      .leftJoinAndSelect('installment.booking', 'booking')
      .leftJoinAndSelect('installment.payment', 'payment');

    if (filters?.bookingId) {
      query.andWhere('installment.bookingId = :bookingId', { bookingId: filters.bookingId });
    }

    if (filters?.status) {
      query.andWhere('installment.status = :status', { status: filters.status });
    }

    if (filters?.overdue) {
      query.andWhere('installment.dueDate < :today', { today: new Date() });
      query.andWhere('installment.status IN (:...statuses)', {
        statuses: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL],
      });
    }

    query.orderBy('installment.dueDate', 'ASC');

    return query.getMany();
  }

  async findOne(id: string): Promise<PaymentInstallment> {
    const installment = await this.installmentRepository.findOne({
      where: { id },
      relations: ['booking', 'payment'],
    });

    if (!installment) {
      throw new NotFoundException(`Installment with ID ${id} not found`);
    }

    return installment;
  }

  async findByBooking(bookingId: string): Promise<PaymentInstallment[]> {
    return this.installmentRepository.find({
      where: { bookingId },
      relations: ['payment'],
      order: { installmentNumber: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<PaymentInstallment>): Promise<PaymentInstallment> {
    const installment = await this.findOne(id);
    Object.assign(installment, updateData);
    return this.installmentRepository.save(installment);
  }

  async markAsPaid(
    id: string,
    paymentId: string,
    paidAmount?: number,
  ): Promise<PaymentInstallment> {
    const installment = await this.findOne(id);

    const amount = paidAmount || installment.amount;

    if (amount >= installment.amount) {
      installment.status = InstallmentStatus.PAID;
      installment.paidAmount = installment.amount;
    } else {
      installment.status = InstallmentStatus.PARTIAL;
      installment.paidAmount = amount;
    }

    installment.paymentId = paymentId;
    installment.paidDate = new Date();

    return this.installmentRepository.save(installment);
  }

  async waive(id: string): Promise<PaymentInstallment> {
    const installment = await this.findOne(id);
    installment.status = InstallmentStatus.WAIVED;
    return this.installmentRepository.save(installment);
  }

  async calculateLateFee(
    installment: PaymentInstallment,
    lateFeePerDay: number = 50,
  ): Promise<number> {
    if (installment.status === InstallmentStatus.PAID || installment.status === InstallmentStatus.WAIVED) {
      return 0;
    }

    if (installment.lateFeeWaived) {
      return 0;
    }

    const today = new Date();
    const dueDate = new Date(installment.dueDate);

    if (today <= dueDate) {
      return 0;
    }

    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue * lateFeePerDay;
  }

  async updateLateFees(lateFeePerDay: number = 50): Promise<void> {
    const overdueInstallments = await this.findAll({ overdue: true });

    for (const installment of overdueInstallments) {
      const lateFee = await this.calculateLateFee(installment, lateFeePerDay);
      
      if (lateFee !== installment.lateFee) {
        installment.lateFee = lateFee;
        installment.status = InstallmentStatus.OVERDUE;
        await this.installmentRepository.save(installment);
      }
    }
  }

  async getOverdue(): Promise<PaymentInstallment[]> {
    return this.installmentRepository.find({
      where: {
        dueDate: LessThan(new Date()),
        status: InstallmentStatus.PENDING,
      },
      relations: ['booking', 'booking.customer'],
      order: { dueDate: 'ASC' },
    });
  }

  async getUpcoming(days: number = 7): Promise<PaymentInstallment[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.installmentRepository
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .where('installment.dueDate BETWEEN :today AND :futureDate', { today, futureDate })
      .andWhere('installment.status = :status', { status: InstallmentStatus.PENDING })
      .orderBy('installment.dueDate', 'ASC')
      .getMany();
  }

  async remove(id: string): Promise<void> {
    const installment = await this.findOne(id);

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid installment');
    }

    await this.installmentRepository.remove(installment);
  }

  async getBookingStats(bookingId: string): Promise<{
    totalInstallments: number;
    paidInstallments: number;
    pendingInstallments: number;
    overdueInstallments: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    totalLateFees: number;
  }> {
    const installments = await this.findByBooking(bookingId);

    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.status === InstallmentStatus.PAID).length;
    const pendingInstallments = installments.filter(i => 
      i.status === InstallmentStatus.PENDING || i.status === InstallmentStatus.PARTIAL
    ).length;
    const overdueInstallments = installments.filter(i => i.status === InstallmentStatus.OVERDUE).length;

    const totalAmount = installments.reduce((sum, i) => sum + Number(i.amount), 0);
    const paidAmount = installments.reduce((sum, i) => sum + Number(i.paidAmount), 0);
    const pendingAmount = totalAmount - paidAmount;

    const overdueAmount = installments
      .filter(i => i.status === InstallmentStatus.OVERDUE)
      .reduce((sum, i) => sum + Number(i.amount) - Number(i.paidAmount), 0);

    const totalLateFees = installments.reduce((sum, i) => sum + Number(i.lateFee), 0);

    return {
      totalInstallments,
      paidInstallments,
      pendingInstallments,
      overdueInstallments,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      totalLateFees,
    };
  }
}
