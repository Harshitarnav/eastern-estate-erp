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
exports.VendorPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_payment_entity_1 = require("./entities/vendor-payment.entity");
const vendor_entity_1 = require("./entities/vendor.entity");
const accounting_integration_service_1 = require("../accounting/accounting-integration.service");
const journal_entries_service_1 = require("../accounting/journal-entries.service");
let VendorPaymentsService = class VendorPaymentsService {
    constructor(paymentsRepository, vendorsRepository, dataSource, accountingIntegration, journalEntriesService) {
        this.paymentsRepository = paymentsRepository;
        this.vendorsRepository = vendorsRepository;
        this.dataSource = dataSource;
        this.accountingIntegration = accountingIntegration;
        this.journalEntriesService = journalEntriesService;
    }
    async create(createDto, userId) {
        if (userId)
            createDto.createdBy = userId;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let savedPayment;
        let vendorName;
        try {
            const payment = this.paymentsRepository.create(createDto);
            savedPayment = await queryRunner.manager.save(payment);
            const vendor = await queryRunner.manager.findOne(vendor_entity_1.Vendor, {
                where: { id: createDto.vendorId },
            });
            if (vendor) {
                vendorName = vendor.vendorName;
                vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - createDto.amount);
                await queryRunner.manager.save(vendor);
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        const je = await this.accountingIntegration.onVendorPaymentRecorded({
            id: savedPayment.id,
            amount: Number(savedPayment.amount),
            paymentDate: savedPayment.paymentDate instanceof Date
                ? savedPayment.paymentDate
                : new Date(savedPayment.paymentDate),
            vendorName,
            transactionReference: savedPayment.transactionReference ?? undefined,
            createdBy: savedPayment.createdBy,
            propertyId: savedPayment.propertyId ?? null,
        });
        if (je) {
            await this.paymentsRepository.update(savedPayment.id, { journalEntryId: je.id });
            savedPayment.journalEntryId = je.id;
        }
        return savedPayment;
    }
    async findAll(filters) {
        const query = this.paymentsRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.property', 'property');
        if (filters?.vendorId) {
            query.andWhere('payment.vendorId = :vendorId', { vendorId: filters.vendorId });
        }
        if (filters?.poId) {
            query.andWhere('payment.purchaseOrderId = :poId', { poId: filters.poId });
        }
        return await query.orderBy('payment.paymentDate', 'DESC').getMany();
    }
    async findOne(id) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async update(id, updateDto) {
        const payment = await this.findOne(id);
        if (payment.journalEntryId) {
            throw new common_1.BadRequestException('This payment is posted to the books. It cannot be edited. Delete the payment to void the journal entry and re-record, or ask an admin.');
        }
        Object.assign(payment, updateDto);
        return await this.paymentsRepository.save(payment);
    }
    async remove(id, userId) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.journalEntryId) {
            if (!userId) {
                throw new common_1.BadRequestException('Cannot delete a posted vendor payment without a user context to record the journal void.');
            }
            await this.journalEntriesService.void(payment.journalEntryId, userId, {
                voidReason: `Vendor payment deleted — payment ${id}`,
            });
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const vendor = await queryRunner.manager.findOne(vendor_entity_1.Vendor, {
                where: { id: payment.vendorId },
            });
            if (vendor) {
                vendor.outstandingAmount =
                    Math.round((Number(vendor.outstandingAmount || 0) + Number(payment.amount)) * 100) / 100;
                await queryRunner.manager.save(vendor);
            }
            await queryRunner.manager.delete(vendor_payment_entity_1.VendorPayment, id);
            await queryRunner.commitTransaction();
        }
        catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTotalPaidToVendor(vendorId) {
        const result = await this.paymentsRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.vendorId = :vendorId', { vendorId })
            .getRawOne();
        return Number(result.total) || 0;
    }
};
exports.VendorPaymentsService = VendorPaymentsService;
exports.VendorPaymentsService = VendorPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_payment_entity_1.VendorPayment)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        accounting_integration_service_1.AccountingIntegrationService,
        journal_entries_service_1.JournalEntriesService])
], VendorPaymentsService);
//# sourceMappingURL=vendor-payments.service.js.map