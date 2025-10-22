import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VendorPayment } from './entities/vendor-payment.entity';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';

@Injectable()
export class VendorPaymentsService {
  constructor(
    @InjectRepository(VendorPayment)
    private paymentsRepository: Repository<VendorPayment>,
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateVendorPaymentDto): Promise<VendorPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = this.paymentsRepository.create(createDto);
      await queryRunner.manager.save(payment);

      const vendor = await queryRunner.manager.findOne(Vendor, {
        where: { id: createDto.vendorId },
      });
      if (vendor) {
        vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - createDto.amount);
        await queryRunner.manager.save(vendor);
      }

      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: { vendorId?: string; poId?: string }): Promise<VendorPayment[]> {
    const query = this.paymentsRepository.createQueryBuilder('payment');

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
    Object.assign(payment, updateDto);
    return await this.paymentsRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    await this.paymentsRepository.delete(id);
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
