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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
const dto_1 = require("./dto");
let InventoryService = class InventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }
    async create(createDto) {
        const existing = await this.inventoryRepository.findOne({
            where: { itemCode: createDto.itemCode },
        });
        if (existing) {
            throw new common_1.ConflictException('Item code already exists');
        }
        const item = this.inventoryRepository.create(createDto);
        const savedItem = await this.inventoryRepository.save(item);
        return dto_1.InventoryItemResponseDto.fromEntity(savedItem);
    }
    async findAll(query) {
        const { search, category, stockStatus, propertyId, supplierName, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.inventoryRepository
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.property', 'property');
        if (search) {
            queryBuilder.andWhere('(item.itemCode ILIKE :search OR item.itemName ILIKE :search OR item.brand ILIKE :search OR item.model ILIKE :search)', { search: `%${search}%` });
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
            data: dto_1.InventoryItemResponseDto.fromEntities(items),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const item = await this.inventoryRepository.findOne({
            where: { id },
            relations: ['property'],
        });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        return dto_1.InventoryItemResponseDto.fromEntity(item);
    }
    async update(id, updateDto) {
        const item = await this.inventoryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        if (updateDto.itemCode && updateDto.itemCode !== item.itemCode) {
            const existing = await this.inventoryRepository.findOne({
                where: { itemCode: updateDto.itemCode },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Item code already exists');
            }
        }
        Object.assign(item, updateDto);
        const updatedItem = await this.inventoryRepository.save(item);
        return dto_1.InventoryItemResponseDto.fromEntity(updatedItem);
    }
    async remove(id) {
        const item = await this.inventoryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        item.isActive = false;
        await this.inventoryRepository.save(item);
    }
    async issueItem(id, quantity) {
        const item = await this.inventoryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        if (Number(item.quantity) < quantity) {
            throw new common_1.ConflictException('Insufficient stock');
        }
        item.quantity = Number(item.quantity) - quantity;
        item.totalIssued = Number(item.totalIssued) + quantity;
        item.lastIssuedDate = new Date();
        if (Number(item.quantity) <= 0) {
            item.stockStatus = inventory_item_entity_1.StockStatus.OUT_OF_STOCK;
        }
        else if (Number(item.quantity) <= Number(item.reorderPoint)) {
            item.stockStatus = inventory_item_entity_1.StockStatus.LOW_STOCK;
        }
        const updatedItem = await this.inventoryRepository.save(item);
        return dto_1.InventoryItemResponseDto.fromEntity(updatedItem);
    }
    async receiveItem(id, quantity) {
        const item = await this.inventoryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        item.quantity = Number(item.quantity) + quantity;
        item.totalReceived = Number(item.totalReceived) + quantity;
        item.lastReceivedDate = new Date();
        if (Number(item.quantity) > Number(item.reorderPoint)) {
            item.stockStatus = inventory_item_entity_1.StockStatus.IN_STOCK;
        }
        const updatedItem = await this.inventoryRepository.save(item);
        return dto_1.InventoryItemResponseDto.fromEntity(updatedItem);
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map