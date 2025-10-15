import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, StockStatus } from './entities/inventory-item.entity';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  QueryInventoryItemDto,
  InventoryItemResponseDto,
  PaginatedInventoryItemsResponse,
} from './dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createDto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    const existing = await this.inventoryRepository.findOne({
      where: { itemCode: createDto.itemCode },
    });

    if (existing) {
      throw new ConflictException('Item code already exists');
    }

    const item = this.inventoryRepository.create(createDto);
    const savedItem = await this.inventoryRepository.save(item);

    return InventoryItemResponseDto.fromEntity(savedItem);
  }

  async findAll(query: QueryInventoryItemDto): Promise<PaginatedInventoryItemsResponse> {
    const {
      search,
      category,
      stockStatus,
      propertyId,
      supplierName,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.property', 'property');

    if (search) {
      queryBuilder.andWhere(
        '(item.itemCode ILIKE :search OR item.itemName ILIKE :search OR item.brand ILIKE :search OR item.model ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (stockStatus) {
      queryBuilder.andWhere('item.stockStatus = :stockStatus', { stockStatus });
    }

    if (propertyId) {
      queryBuilder.andWhere('item.propertyId = :propertyId', { propertyId });
    }

    if (supplierName) {
      queryBuilder.andWhere('item.supplierName ILIKE :supplierName', {
        supplierName: `%${supplierName}%`,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('item.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`item.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: InventoryItemResponseDto.fromEntities(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return InventoryItemResponseDto.fromEntity(item);
  }

  async update(id: string, updateDto: UpdateInventoryItemDto): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    if (updateDto.itemCode && updateDto.itemCode !== item.itemCode) {
      const existing = await this.inventoryRepository.findOne({
        where: { itemCode: updateDto.itemCode },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Item code already exists');
      }
    }

    Object.assign(item, updateDto);
    const updatedItem = await this.inventoryRepository.save(item);

    return InventoryItemResponseDto.fromEntity(updatedItem);
  }

  async remove(id: string): Promise<void> {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    item.isActive = false;
    await this.inventoryRepository.save(item);
  }

  async issueItem(id: string, quantity: number): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    if (Number(item.quantity) < quantity) {
      throw new ConflictException('Insufficient stock');
    }

    item.quantity = Number(item.quantity) - quantity;
    item.totalIssued = Number(item.totalIssued) + quantity;
    item.lastIssuedDate = new Date();

    // Update stock status
    if (Number(item.quantity) <= 0) {
      item.stockStatus = StockStatus.OUT_OF_STOCK;
    } else if (Number(item.quantity) <= Number(item.reorderPoint)) {
      item.stockStatus = StockStatus.LOW_STOCK;
    }

    const updatedItem = await this.inventoryRepository.save(item);
    return InventoryItemResponseDto.fromEntity(updatedItem);
  }

  async receiveItem(id: string, quantity: number): Promise<InventoryItemResponseDto> {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    item.quantity = Number(item.quantity) + quantity;
    item.totalReceived = Number(item.totalReceived) + quantity;
    item.lastReceivedDate = new Date();

    // Update stock status
    if (Number(item.quantity) > Number(item.reorderPoint)) {
      item.stockStatus = StockStatus.IN_STOCK;
    }

    const updatedItem = await this.inventoryRepository.save(item);
    return InventoryItemResponseDto.fromEntity(updatedItem);
  }

  async getStatistics() {
    const items = await this.inventoryRepository.find({ where: { isActive: true } });

    const total = items.length;
    const inStock = items.filter((i) => i.stockStatus === 'IN_STOCK').length;
    const lowStock = items.filter((i) => i.stockStatus === 'LOW_STOCK').length;
    const outOfStock = items.filter((i) => i.stockStatus === 'OUT_OF_STOCK').length;

    const totalValue = items.reduce((sum, i) => sum + Number(i.totalValue), 0);
    const totalIssued = items.reduce((sum, i) => sum + Number(i.totalIssued), 0);
    const totalReceived = items.reduce((sum, i) => sum + Number(i.totalReceived), 0);

    const byCategory = {
      constructionMaterial: items.filter((i) => i.category === 'CONSTRUCTION_MATERIAL').length,
      electrical: items.filter((i) => i.category === 'ELECTRICAL').length,
      plumbing: items.filter((i) => i.category === 'PLUMBING').length,
      hardware: items.filter((i) => i.category === 'HARDWARE').length,
      paint: items.filter((i) => i.category === 'PAINT').length,
      tiles: items.filter((i) => i.category === 'TILES').length,
      other: items.filter((i) => i.category === 'OTHER').length,
    };

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
      totalIssued,
      totalReceived,
      byCategory,
      stockHealthRate: total > 0 ? (inStock / total) * 100 : 0,
    };
  }
}
