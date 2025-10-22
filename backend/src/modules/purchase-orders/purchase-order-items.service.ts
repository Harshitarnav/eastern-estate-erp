import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';

@Injectable()
export class PurchaseOrderItemsService {
  constructor(
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async create(createDto: CreatePurchaseOrderItemDto): Promise<PurchaseOrderItem> {
    const item = this.purchaseOrderItemRepository.create(createDto);
    return await this.purchaseOrderItemRepository.save(item);
  }

  async findByPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    return await this.purchaseOrderItemRepository.find({
      where: { purchaseOrderId },
      relations: ['material', 'purchaseOrder'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PurchaseOrderItem> {
    const item = await this.purchaseOrderItemRepository.findOne({
      where: { id },
      relations: ['material', 'purchaseOrder'],
    });

    if (!item) {
      throw new NotFoundException(`Purchase Order Item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderItemDto): Promise<PurchaseOrderItem> {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    return await this.purchaseOrderItemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.purchaseOrderItemRepository.remove(item);
  }

  async getTotalByPurchaseOrder(purchaseOrderId: string): Promise<number> {
    const result = await this.purchaseOrderItemRepository
      .createQueryBuilder('item')
      .select('SUM(item.totalAmount)', 'total')
      .where('item.purchaseOrderId = :purchaseOrderId', { purchaseOrderId })
      .getRawOne();

    return result?.total || 0;
  }
}
