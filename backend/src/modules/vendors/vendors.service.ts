import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const existing = await this.vendorsRepository.findOne({
      where: { vendorCode: createVendorDto.vendorCode },
    });

    if (existing) {
      throw new ConflictException(`Vendor with code ${createVendorDto.vendorCode} already exists`);
    }

    const vendor = this.vendorsRepository.create(createVendorDto);
    return await this.vendorsRepository.save(vendor);
  }

  async findAll(filters?: { isActive?: boolean; rating?: number }): Promise<Vendor[]> {
    const query = this.vendorsRepository.createQueryBuilder('vendor');

    if (filters?.isActive !== undefined) {
      query.andWhere('vendor.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.rating !== undefined) {
      query.andWhere('vendor.rating >= :rating', { rating: filters.rating });
    }

    return await query.orderBy('vendor.vendorName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, updateVendorDto);
    return await this.vendorsRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    vendor.isActive = false;
    await this.vendorsRepository.save(vendor);
  }

  async updateOutstanding(id: string, amount: number, operation: 'add' | 'subtract'): Promise<Vendor> {
    const vendor = await this.findOne(id);
    
    if (operation === 'add') {
      vendor.outstandingAmount = Number(vendor.outstandingAmount) + amount;
    } else {
      vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - amount);
    }

    if (vendor.isCreditLimitExceeded) {
      throw new ConflictException('Credit limit exceeded');
    }

    return await this.vendorsRepository.save(vendor);
  }

  async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    return await this.vendorsRepository
      .createQueryBuilder('vendor')
      .where('vendor.isActive = :isActive', { isActive: true })
      .orderBy('vendor.rating', 'DESC')
      .limit(limit)
      .getMany();
  }
}
