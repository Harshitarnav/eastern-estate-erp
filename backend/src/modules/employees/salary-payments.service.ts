import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryPayment, PaymentStatus } from './entities/salary-payment.entity';
import { Employee } from './entities/employee.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';

export interface CreateSalaryPaymentDto {
  employeeId: string;
  paymentMonth: string; // YYYY-MM-DD (first day of month)
  workingDays: number;
  presentDays: number;
  absentDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  overtimeHours?: number;
  basicSalary: number;
  houseRentAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  overtimePayment?: number;
  otherAllowances?: number;
  pfDeduction?: number;
  esiDeduction?: number;
  taxDeduction?: number;
  advanceDeduction?: number;
  loanDeduction?: number;
  otherDeductions?: number;
  notes?: string;
}

@Injectable()
export class SalaryPaymentsService {
  constructor(
    @InjectRepository(SalaryPayment)
    private salaryPaymentRepo: Repository<SalaryPayment>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private readonly accountingIntegrationService: AccountingIntegrationService,
  ) {}

  async create(dto: CreateSalaryPaymentDto, createdBy: string): Promise<SalaryPayment> {
    const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    // Calculate gross and net
    const grossSalary =
      Number(dto.basicSalary) +
      Number(dto.houseRentAllowance || 0) +
      Number(dto.transportAllowance || 0) +
      Number(dto.medicalAllowance || 0) +
      Number(dto.overtimePayment || 0) +
      Number(dto.otherAllowances || 0);

    const totalDeductions =
      Number(dto.pfDeduction || 0) +
      Number(dto.esiDeduction || 0) +
      Number(dto.taxDeduction || 0) +
      Number(dto.advanceDeduction || 0) +
      Number(dto.loanDeduction || 0) +
      Number(dto.otherDeductions || 0);

    const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100;

    const payment = this.salaryPaymentRepo.create({
      ...dto,
      paymentMonth: new Date(dto.paymentMonth),
      absentDays: dto.absentDays || 0,
      paidLeaveDays: dto.paidLeaveDays || 0,
      unpaidLeaveDays: dto.unpaidLeaveDays || 0,
      overtimeHours: dto.overtimeHours || 0,
      houseRentAllowance: dto.houseRentAllowance || 0,
      transportAllowance: dto.transportAllowance || 0,
      medicalAllowance: dto.medicalAllowance || 0,
      overtimePayment: dto.overtimePayment || 0,
      otherAllowances: dto.otherAllowances || 0,
      pfDeduction: dto.pfDeduction || 0,
      esiDeduction: dto.esiDeduction || 0,
      taxDeduction: dto.taxDeduction || 0,
      advanceDeduction: dto.advanceDeduction || 0,
      loanDeduction: dto.loanDeduction || 0,
      otherDeductions: dto.otherDeductions || 0,
      grossSalary,
      totalDeductions,
      netSalary,
      paymentStatus: PaymentStatus.PENDING,
      createdBy,
    });

    return this.salaryPaymentRepo.save(payment);
  }

  async findAll(filters?: { employeeId?: string; month?: string; status?: string }): Promise<SalaryPayment[]> {
    const qb = this.salaryPaymentRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.employee', 'employee')
      .orderBy('sp.paymentMonth', 'DESC');

    if (filters?.employeeId) qb.andWhere('sp.employeeId = :eid', { eid: filters.employeeId });
    if (filters?.status) qb.andWhere('sp.paymentStatus = :status', { status: filters.status });
    if (filters?.month) {
      const start = new Date(filters.month);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      qb.andWhere('sp.paymentMonth BETWEEN :start AND :end', { start, end });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<SalaryPayment> {
    const sp = await this.salaryPaymentRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!sp) throw new NotFoundException(`Salary payment ${id} not found`);
    return sp;
  }

  async processPay(id: string, userId: string, opts: {
    paymentMode?: string;
    transactionReference?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paymentRemarks?: string;
  }): Promise<SalaryPayment> {
    const sp = await this.findOne(id);

    if (sp.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Salary payment is already processed');
    }
    if (sp.paymentStatus === PaymentStatus.CANCELLED) {
      throw new BadRequestException('Cancelled salary payments cannot be processed');
    }

    const employee = await this.employeeRepo.findOne({ where: { id: sp.employeeId } });

    sp.paymentStatus = PaymentStatus.PAID;
    sp.paymentDate = new Date();
    sp.paymentMode = opts.paymentMode as any;
    sp.transactionReference = opts.transactionReference;
    sp.bankName = opts.bankName;
    sp.accountNumber = opts.accountNumber;
    sp.ifscCode = opts.ifscCode;
    sp.paymentRemarks = opts.paymentRemarks;
    sp.approvedBy = userId;
    sp.approvedAt = new Date();
    sp.updatedBy = userId;

    const saved = await this.salaryPaymentRepo.save(sp);

    // Auto-create Journal Entry (best-effort)
    await this.accountingIntegrationService.onSalaryPaid({
      id: saved.id,
      employeeName: employee
        ? (employee.fullName ?? sp.employeeId)
        : sp.employeeId,
      netSalary: Number(saved.netSalary),
      paymentDate: saved.paymentDate,
      paymentMonth: saved.paymentMonth,
      createdBy: userId,
    });

    return saved;
  }

  async cancel(id: string): Promise<SalaryPayment> {
    const sp = await this.findOne(id);
    if (sp.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid salary. Create a reversal instead.');
    }
    sp.paymentStatus = PaymentStatus.CANCELLED;
    return this.salaryPaymentRepo.save(sp);
  }

  async getMonthSummary(month: string): Promise<{
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    count: number;
    paid: number;
    pending: number;
  }> {
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const payments = await this.salaryPaymentRepo
      .createQueryBuilder('sp')
      .where('sp.paymentMonth BETWEEN :start AND :end', { start, end })
      .getMany();

    return {
      totalGross: payments.reduce((s, p) => s + Number(p.grossSalary), 0),
      totalDeductions: payments.reduce((s, p) => s + Number(p.totalDeductions), 0),
      totalNet: payments.reduce((s, p) => s + Number(p.netSalary), 0),
      count: payments.length,
      paid: payments.filter(p => p.paymentStatus === PaymentStatus.PAID).length,
      pending: payments.filter(p => p.paymentStatus !== PaymentStatus.PAID).length,
    };
  }
}
