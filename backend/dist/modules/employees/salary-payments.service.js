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
exports.SalaryPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const salary_payment_entity_1 = require("./entities/salary-payment.entity");
const employee_entity_1 = require("./entities/employee.entity");
const accounting_integration_service_1 = require("../accounting/accounting-integration.service");
const journal_entries_service_1 = require("../accounting/journal-entries.service");
const typeorm_3 = require("typeorm");
let SalaryPaymentsService = class SalaryPaymentsService {
    constructor(salaryPaymentRepo, employeeRepo, accountingIntegrationService, journalEntriesService, dataSource) {
        this.salaryPaymentRepo = salaryPaymentRepo;
        this.employeeRepo = employeeRepo;
        this.accountingIntegrationService = accountingIntegrationService;
        this.journalEntriesService = journalEntriesService;
        this.dataSource = dataSource;
    }
    async create(dto, createdBy) {
        const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
        if (!employee)
            throw new common_1.NotFoundException(`Employee ${dto.employeeId} not found`);
        const grossSalary = Number(dto.basicSalary) +
            Number(dto.houseRentAllowance || 0) +
            Number(dto.transportAllowance || 0) +
            Number(dto.medicalAllowance || 0) +
            Number(dto.overtimePayment || 0) +
            Number(dto.otherAllowances || 0);
        const totalDeductions = Number(dto.pfDeduction || 0) +
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
            paymentStatus: salary_payment_entity_1.PaymentStatus.PENDING,
            createdBy,
        });
        return this.salaryPaymentRepo.save(payment);
    }
    async findAll(filters) {
        const qb = this.salaryPaymentRepo.createQueryBuilder('sp')
            .leftJoinAndSelect('sp.employee', 'employee')
            .orderBy('sp.paymentMonth', 'DESC');
        if (filters?.employeeId)
            qb.andWhere('sp.employeeId = :eid', { eid: filters.employeeId });
        if (filters?.status)
            qb.andWhere('sp.paymentStatus = :status', { status: filters.status });
        if (filters?.month) {
            const start = new Date(filters.month);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            qb.andWhere('sp.paymentMonth BETWEEN :start AND :end', { start, end });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const sp = await this.salaryPaymentRepo.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!sp)
            throw new common_1.NotFoundException(`Salary payment ${id} not found`);
        return sp;
    }
    async processPay(id, userId, opts) {
        const sp = await this.findOne(id);
        if (sp.paymentStatus === salary_payment_entity_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Salary payment is already processed');
        }
        if (sp.paymentStatus === salary_payment_entity_1.PaymentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cancelled salary payments cannot be processed');
        }
        const employee = await this.employeeRepo.findOne({ where: { id: sp.employeeId } });
        sp.paymentStatus = salary_payment_entity_1.PaymentStatus.PAID;
        sp.paymentDate = new Date();
        sp.paymentMode = opts.paymentMode;
        sp.transactionReference = opts.transactionReference;
        sp.bankName = opts.bankName;
        sp.accountNumber = opts.accountNumber;
        sp.ifscCode = opts.ifscCode;
        sp.paymentRemarks = opts.paymentRemarks;
        if (opts.propertyId)
            sp.propertyId = opts.propertyId;
        sp.approvedBy = userId;
        sp.approvedAt = new Date();
        sp.updatedBy = userId;
        const saved = await this.salaryPaymentRepo.save(sp);
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
        return Object.assign(saved, { journalEntryNumber: je?.entryNumber ?? null });
    }
    async retryJE(id, userId) {
        const sp = await this.findOne(id);
        if (sp.paymentStatus !== salary_payment_entity_1.PaymentStatus.PAID) {
            return { success: false, message: 'Journal Entry can only be created for PAID salary records.' };
        }
        const existing = await this.dataSource.query(`SELECT entry_number FROM journal_entries WHERE reference_type = 'SALARY' AND reference_id = $1 LIMIT 1`, [sp.id]);
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
        return { success: false, message: 'JE creation failed - ensure "Salary Expense" (EXPENSE type) and a Bank/Cash (ASSET type) account exist in Chart of Accounts.' };
    }
    async cancel(id) {
        const sp = await this.findOne(id);
        if (sp.paymentStatus === salary_payment_entity_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Cannot cancel a paid salary. Use “Reverse payment” to void the journal entry and return this record to pending.');
        }
        sp.paymentStatus = salary_payment_entity_1.PaymentStatus.CANCELLED;
        return this.salaryPaymentRepo.save(sp);
    }
    async reversePaidPayment(id, userId) {
        const sp = await this.findOne(id);
        if (sp.paymentStatus !== salary_payment_entity_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Only PAID salary records can be reversed.');
        }
        const rows = await this.dataSource.query(`SELECT id FROM journal_entries WHERE reference_type = $1 AND reference_id = $2 AND status = $3 ORDER BY created_at DESC LIMIT 1`, ['SALARY', sp.id, 'POSTED']);
        if (rows.length > 0) {
            await this.journalEntriesService.void(rows[0].id, userId, {
                voidReason: `Salary payment reversed to pending - record ${sp.id}`,
            });
        }
        sp.paymentStatus = salary_payment_entity_1.PaymentStatus.PENDING;
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
    async getMonthSummary(month) {
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
            paid: payments.filter(p => p.paymentStatus === salary_payment_entity_1.PaymentStatus.PAID).length,
            pending: payments.filter(p => p.paymentStatus !== salary_payment_entity_1.PaymentStatus.PAID).length,
        };
    }
};
exports.SalaryPaymentsService = SalaryPaymentsService;
exports.SalaryPaymentsService = SalaryPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(salary_payment_entity_1.SalaryPayment)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        accounting_integration_service_1.AccountingIntegrationService,
        journal_entries_service_1.JournalEntriesService,
        typeorm_3.DataSource])
], SalaryPaymentsService);
//# sourceMappingURL=salary-payments.service.js.map