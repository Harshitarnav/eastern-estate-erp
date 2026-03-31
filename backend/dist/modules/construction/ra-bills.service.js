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
exports.RABillsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ra_bill_entity_1 = require("./entities/ra-bill.entity");
const accounting_integration_service_1 = require("../accounting/accounting-integration.service");
let RABillsService = class RABillsService {
    constructor(raBillRepository, accountingIntegration) {
        this.raBillRepository = raBillRepository;
        this.accountingIntegration = accountingIntegration;
    }
    async generateBillNumber() {
        const year = new Date().getFullYear();
        const count = await this.raBillRepository.count();
        return `RA-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async create(createDto, userId) {
        const raBillNumber = await this.generateBillNumber();
        const netThisBill = Number(createDto.grossAmount || 0) - Number(createDto.previousBillsAmount || 0);
        const retentionAmount = Math.round(netThisBill * (Number(createDto.retentionPercentage || 0) / 100) * 100) / 100;
        const netPayable = netThisBill - retentionAmount - Number(createDto.advanceDeduction || 0) - Number(createDto.otherDeductions || 0);
        const bill = this.raBillRepository.create({
            ...createDto,
            raBillNumber,
            netThisBill: Math.max(0, netThisBill),
            retentionAmount,
            netPayable: Math.max(0, netPayable),
            createdBy: userId || null,
            billDate: createDto.billDate ? new Date(createDto.billDate) : new Date(),
            billPeriodStart: createDto.billPeriodStart ? new Date(createDto.billPeriodStart) : null,
            billPeriodEnd: createDto.billPeriodEnd ? new Date(createDto.billPeriodEnd) : null,
        });
        return (await this.raBillRepository.save(bill));
    }
    async findAll(filters) {
        const qb = this.raBillRepository.createQueryBuilder('bill')
            .leftJoinAndSelect('bill.vendor', 'vendor')
            .leftJoinAndSelect('bill.constructionProject', 'project')
            .leftJoinAndSelect('bill.property', 'property')
            .orderBy('bill.billDate', 'DESC');
        if (filters?.constructionProjectId) {
            qb.andWhere('bill.constructionProjectId = :projectId', { projectId: filters.constructionProjectId });
        }
        if (filters?.vendorId) {
            qb.andWhere('bill.vendorId = :vendorId', { vendorId: filters.vendorId });
        }
        if (filters?.status) {
            qb.andWhere('bill.status = :status', { status: filters.status });
        }
        if (filters?.propertyId) {
            qb.andWhere('bill.propertyId = :propertyId', { propertyId: filters.propertyId });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const bill = await this.raBillRepository.findOne({
            where: { id },
            relations: ['vendor', 'constructionProject', 'property', 'certifier', 'approver', 'creator'],
        });
        if (!bill) {
            throw new common_1.NotFoundException(`RA Bill with ID ${id} not found`);
        }
        return bill;
    }
    async update(id, updateDto) {
        const bill = await this.findOne(id);
        if ([ra_bill_entity_1.RABillStatus.APPROVED, ra_bill_entity_1.RABillStatus.PAID].includes(bill.status) && !updateDto.status) {
            throw new common_1.BadRequestException('Cannot edit an approved or paid RA Bill. Change status first.');
        }
        Object.assign(bill, updateDto);
        if (updateDto.grossAmount !== undefined || updateDto.previousBillsAmount !== undefined ||
            updateDto.retentionPercentage !== undefined || updateDto.advanceDeduction !== undefined ||
            updateDto.otherDeductions !== undefined) {
            const netThisBill = Number(bill.grossAmount) - Number(bill.previousBillsAmount);
            const retentionAmount = Math.round(netThisBill * (Number(bill.retentionPercentage) / 100) * 100) / 100;
            bill.netThisBill = Math.max(0, netThisBill);
            bill.retentionAmount = retentionAmount;
            bill.netPayable = Math.max(0, netThisBill - retentionAmount - Number(bill.advanceDeduction) - Number(bill.otherDeductions));
        }
        if (updateDto.billDate)
            bill.billDate = new Date(updateDto.billDate);
        if (updateDto.billPeriodStart)
            bill.billPeriodStart = new Date(updateDto.billPeriodStart);
        if (updateDto.billPeriodEnd)
            bill.billPeriodEnd = new Date(updateDto.billPeriodEnd);
        return await this.raBillRepository.save(bill);
    }
    async submit(id) {
        const bill = await this.findOne(id);
        if (bill.status !== ra_bill_entity_1.RABillStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT bills can be submitted');
        }
        bill.status = ra_bill_entity_1.RABillStatus.SUBMITTED;
        return await this.raBillRepository.save(bill);
    }
    async certify(id, userId) {
        const bill = await this.findOne(id);
        if (bill.status !== ra_bill_entity_1.RABillStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only SUBMITTED bills can be certified');
        }
        bill.status = ra_bill_entity_1.RABillStatus.CERTIFIED;
        bill.certifiedBy = userId;
        bill.certifiedAt = new Date();
        return await this.raBillRepository.save(bill);
    }
    async approve(id, userId) {
        const bill = await this.findOne(id);
        if (bill.status !== ra_bill_entity_1.RABillStatus.CERTIFIED) {
            throw new common_1.BadRequestException('Only CERTIFIED bills can be approved');
        }
        bill.status = ra_bill_entity_1.RABillStatus.APPROVED;
        bill.approvedBy = userId;
        bill.approvedAt = new Date();
        return await this.raBillRepository.save(bill);
    }
    async markPaid(id, paymentReference, userId) {
        const bill = await this.findOne(id);
        if (bill.status !== ra_bill_entity_1.RABillStatus.APPROVED) {
            throw new common_1.BadRequestException('Only APPROVED bills can be marked as paid');
        }
        bill.status = ra_bill_entity_1.RABillStatus.PAID;
        bill.paidAt = new Date();
        if (paymentReference)
            bill.paymentReference = paymentReference;
        const savedBill = await this.raBillRepository.save(bill);
        const je = await this.accountingIntegration.onRABillPaid({
            id: savedBill.id,
            raBillNumber: savedBill.raBillNumber,
            netPayable: Number(savedBill.netPayable),
            paidAt: savedBill.paidAt,
            vendorName: savedBill.vendor?.vendorName,
            projectName: savedBill.constructionProject?.projectName,
            createdBy: userId,
        });
        if (je) {
            await this.raBillRepository.update(savedBill.id, { journalEntryId: je.id });
            savedBill.journalEntryId = je.id;
        }
        return savedBill;
    }
    async reject(id, notes) {
        const bill = await this.findOne(id);
        if ([ra_bill_entity_1.RABillStatus.PAID].includes(bill.status)) {
            throw new common_1.BadRequestException('Paid bills cannot be rejected');
        }
        bill.status = ra_bill_entity_1.RABillStatus.REJECTED;
        if (notes)
            bill.notes = notes;
        return await this.raBillRepository.save(bill);
    }
    async remove(id) {
        const bill = await this.findOne(id);
        if (bill.status !== ra_bill_entity_1.RABillStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT bills can be deleted');
        }
        await this.raBillRepository.remove(bill);
    }
    async getSummaryByProject(constructionProjectId) {
        const bills = await this.findAll({ constructionProjectId });
        return {
            total: bills.length,
            totalGrossAmount: bills.reduce((s, b) => s + Number(b.grossAmount), 0),
            totalNetPayable: bills.reduce((s, b) => s + Number(b.netPayable), 0),
            totalRetention: bills.reduce((s, b) => s + Number(b.retentionAmount), 0),
            pendingApproval: bills.filter(b => [ra_bill_entity_1.RABillStatus.SUBMITTED, ra_bill_entity_1.RABillStatus.CERTIFIED].includes(b.status)).length,
            totalPaid: bills.filter(b => b.status === ra_bill_entity_1.RABillStatus.PAID).reduce((s, b) => s + Number(b.netPayable), 0),
            bills,
        };
    }
};
exports.RABillsService = RABillsService;
exports.RABillsService = RABillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ra_bill_entity_1.RABill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accounting_integration_service_1.AccountingIntegrationService])
], RABillsService);
//# sourceMappingURL=ra-bills.service.js.map