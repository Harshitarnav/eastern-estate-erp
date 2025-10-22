import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Calculate balance amount
    const balanceAmount = createDto.totalAmount - (createDto.advancePaid || 0);

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...createDto,
      balanceAmount,
      poDate: createDto.poDate ? new Date(createDto.poDate) : new Date(),
      expectedDeliveryDate: createDto.expectedDeliveryDate 
        ? new Date(createDto.expectedDeliveryDate) 
        : null,
    });

    return await this.purchaseOrderRepository.save(purchaseOrder);
  }

  async findAll(query: QueryPurchaseOrderDto) {
    const { page = 1, limit = 10, search, status, vendorId, propertyId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.property', 'property');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(po.poNumber ILIKE :search OR po.notes ILIKE :search OR vendor.vendorName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filters
    if (status) {
      queryBuilder.andWhere('po.status = :status', { status });
    }

    if (vendorId) {
      queryBuilder.andWhere('po.vendorId = :vendorId', { vendorId });
    }

    if (propertyId) {
      queryBuilder.andWhere('po.propertyId = :propertyId', { propertyId });
    }

    if (startDate) {
      queryBuilder.andWhere('po.poDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('po.poDate <= :endDate', { endDate });
    }

    // Sorting
    queryBuilder.orderBy(`po.${sortBy}`, sortOrder);

    // Pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['vendor', 'property'],
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return po;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findOne(id);

    Object.assign(po, updateDto);

    if (updateDto.expectedDeliveryDate) {
      po.expectedDeliveryDate = new Date(updateDto.expectedDeliveryDate);
    }

    // Recalculate balance if totalAmount or advancePaid changed
    if (updateDto.totalAmount !== undefined || updateDto.advancePaid !== undefined) {
      po.balanceAmount = po.totalAmount - po.advancePaid;
    }

    return await this.purchaseOrderRepository.save(po);
  }

  async updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    po.status = status;
    
    // If status is RECEIVED, set actual delivery date
    if (status === PurchaseOrderStatus.RECEIVED && !po.actualDeliveryDate) {
      po.actualDeliveryDate = new Date();
    }

    return await this.purchaseOrderRepository.save(po);
  }

  async remove(id: string): Promise<void> {
    const po = await this.findOne(id);
    await this.purchaseOrderRepository.remove(po);
  }

  async getStats() {
    const stats = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(po.totalAmount)', 'totalAmount')
      .where('po.isActive = :isActive', { isActive: true })
      .groupBy('po.status')
      .getRawMany();

    return stats;
  }
}
