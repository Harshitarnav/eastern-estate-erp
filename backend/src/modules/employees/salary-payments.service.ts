import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryPayment, PaymentStatus } from './entities/salary-payment.entity';
import { Employee } from './entities/employee.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { JournalEntriesService } from '../accounting/journal-entries.service';
import { DataSource } from 'typeorm';

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
    private readonly journalEntriesService: JournalEntriesService,
    private readonly dataSource: DataSource,
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
    propertyId?: string;
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
    if (opts.propertyId) sp.propertyId = opts.propertyId;
    sp.approvedBy = userId;
    sp.approvedAt = new Date();
    sp.updatedBy = userId;

    const saved = await this.salaryPaymentRepo.save(sp);

    // Auto-create Journal Entry (best-effort)
    const je = await this.accountingIntegrationService.onSalaryPaid({
      id: saved.id,
      employeeName: employee
        ? (employee.fullName ?? sp.employeeId)
        : sp.employeeId,
      netSalary: Number(saved.netSalary),
      paymentDate: saved.paymentDate,
      paymentMonth: saved.paymentMonth,
      createdBy: userId,
      propertyId: saved.propertyId ?? opts.propertyId ?? null,
    });

    return Object.assign(saved, { journalEntryNumber: je?.entryNumber ?? null }) as SalaryPayment & { journalEntryNumber: string | null };
  }

  /** Retry JE creation for a PAID salary that is missing a Journal Entry */
  async retryJE(id: string, userId: string): Promise<{ success: boolean; journalEntryNumber?: string; message: string }> {
    const sp = await this.findOne(id);

    if (sp.paymentStatus !== PaymentStatus.PAID) {
      return { success: false, message: 'Journal Entry can only be created for PAID salary records.' };
    }

    // Check if JE already exists for this salary
    const existing = await this.dataSource.query(
      `SELECT entry_number FROM journal_entries WHERE reference_type = 'SALARY' AND reference_id = $1 LIMIT 1`,
      [sp.id],
    );
    if (existing.length > 0) {
      return { success: true, journalEntryNumber: existing[0].entry_number, message: `Journal Entry ${existing[0].entry_number} already exists.` };
    }

    if (Number(sp.netSalary) <= 0) {
      return { success: false, message: `Cannot create JE: net salary is ₹${sp.netSalary} (must be > 0).` };
    }

    const employee = await this.employeeRepo.findOne({ where: { id: sp.employeeId } });
    const je = await this.accountingIntegrationService.onSalaryPaid({
      id: sp.id,
      employeeName: employee ? (employee.fullName ?? sp.employeeId) : sp.employeeId,
      netSalary: Number(sp.netSalary),
      paymentDate: sp.paymentDate instanceof Date ? sp.paymentDate : new Date(sp.paymentDate),
      paymentMonth: sp.paymentMonth,
      createdBy: userId,
    });

    if (je) {
      return { success: true, journalEntryNumber: je.entryNumber, message: `Journal Entry ${je.entryNumber} created successfully.` };
    }
    return { success: false, message: 'JE creation failed — ensure "Salary Expense" (EXPENSE type) and a Bank/Cash (ASSET type) account exist in Chart of Accounts.' };
  }

  async cancel(id: string): Promise<SalaryPayment> {
    const sp = await this.findOne(id);
    if (sp.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Cannot cancel a paid salary. Use “Reverse payment” to void the journal entry and return this record to pending.',
      );
    }
    sp.paymentStatus = PaymentStatus.CANCELLED;
    return this.salaryPaymentRepo.save(sp);
  }

  /**
   * Voids the auto-posted SALARY journal entry (if any) and sets the record back to PENDING
   * so payroll can be corrected and re-processed.
   */
  async reversePaidPayment(id: string, userId: string): Promise<SalaryPayment> {
    const sp = await this.findOne(id);
    if (sp.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Only PAID salary records can be reversed.');
    }

    const rows = await this.dataSource.query(
      `SELECT id FROM journal_entries WHERE reference_type = $1 AND reference_id = $2 AND status = $3 ORDER BY created_at DESC LIMIT 1`,
      ['SALARY', sp.id, 'POSTED'],
    );

    if (rows.length > 0) {
      await this.journalEntriesService.void(rows[0].id, userId, {
        voidReason: `Salary payment reversed to pending — record ${sp.id}`,
      });
    }

    sp.paymentStatus = PaymentStatus.PENDING;
    sp.paymentDate = null;
    sp.paymentMode = null;
    sp.transactionReference = null;
    sp.paymentRemarks = null;
    sp.bankName = null;
    sp.accountNumber = null;
    sp.ifscCode = null;
    sp.approvedBy = null;
    sp.approvedAt = null;
    sp.updatedBy = userId;

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
