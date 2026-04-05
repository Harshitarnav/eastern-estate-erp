import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VendorPayment } from './entities/vendor-payment.entity';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { JournalEntriesService } from '../accounting/journal-entries.service';

@Injectable()
export class VendorPaymentsService {
  constructor(
    @InjectRepository(VendorPayment)
    private paymentsRepository: Repository<VendorPayment>,
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
    private dataSource: DataSource,
    private readonly accountingIntegration: AccountingIntegrationService,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateVendorPaymentDto, userId?: string): Promise<VendorPayment> {
    if (userId) createDto.createdBy = userId;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedPayment: VendorPayment;
    let vendorName: string | undefined;

    try {
      const payment = this.paymentsRepository.create(createDto);
      savedPayment = await queryRunner.manager.save(payment);

      const vendor = await queryRunner.manager.findOne(Vendor, {
        where: { id: createDto.vendorId },
      });
      if (vendor) {
        vendorName = vendor.vendorName;
        vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - createDto.amount);
        await queryRunner.manager.save(vendor);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // ── Auto Journal Entry: Dr Material Expense / Cr Bank (outside transaction) ──
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

    // Store JE reference on the payment (best-effort)
    if (je) {
      await this.paymentsRepository.update(savedPayment.id, { journalEntryId: je.id });
      savedPayment.journalEntryId = je.id;
    }

    return savedPayment;
  }

  async findAll(filters?: { vendorId?: string; poId?: string }): Promise<VendorPayment[]> {
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

  async findOne(id: string): Promise<VendorPayment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updateDto: UpdateVendorPaymentDto): Promise<VendorPayment> {
    const payment = await this.findOne(id);
    if (payment.journalEntryId) {
      throw new BadRequestException(
        'This payment is posted to the books. It cannot be edited. Delete the payment to void the journal entry and re-record, or ask an admin.',
      );
    }
    Object.assign(payment, updateDto);
    return await this.paymentsRepository.save(payment);
  }

  /**
   * Deletes the vendor payment row. If a journal entry was created, voids it (reverses COA balances)
   * and restores the vendor's outstanding amount.
   */
  async remove(id: string, userId?: string): Promise<void> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.journalEntryId) {
      if (!userId) {
        throw new BadRequestException(
          'Cannot delete a posted vendor payment without a user context to record the journal void.',
        );
      }
      await this.journalEntriesService.void(payment.journalEntryId, userId, {
        voidReason: `Vendor payment deleted — payment ${id}`,
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const vendor = await queryRunner.manager.findOne(Vendor, {
        where: { id: payment.vendorId },
      });
      if (vendor) {
        vendor.outstandingAmount =
          Math.round((Number(vendor.outstandingAmount || 0) + Number(payment.amount)) * 100) / 100;
        await queryRunner.manager.save(vendor);
      }
      await queryRunner.manager.delete(VendorPayment, id);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getTotalPaidToVendor(vendorId: string): Promise<number> {
    const result = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.vendorId = :vendorId', { vendorId })
      .getRawOne();
    
    return Number(result.total) || 0;
  }
}
