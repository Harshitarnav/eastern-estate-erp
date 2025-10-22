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
exports.PurchaseOrderItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_item_entity_1 = require("./entities/purchase-order-item.entity");
let PurchaseOrderItemsService = class PurchaseOrderItemsService {
    constructor(purchaseOrderItemRepository) {
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
    }
    async create(createDto) {
        const item = this.purchaseOrderItemRepository.create(createDto);
        return await this.purchaseOrderItemRepository.save(item);
    }
    async findByPurchaseOrder(purchaseOrderId) {
        return await this.purchaseOrderItemRepository.find({
            where: { purchaseOrderId },
            relations: ['material', 'purchaseOrder'],
            order: { createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const item = await this.purchaseOrderItemRepository.findOne({
            where: { id },
            relations: ['material', 'purchaseOrder'],
        });
        if (!item) {
            throw new common_1.NotFoundException(`Purchase Order Item with ID ${id} not found`);
        }
        return item;
    }
    async update(id, updateDto) {
        const item = await this.findOne(id);
        Object.assign(item, updateDto);
        return await this.purchaseOrderItemRepository.save(item);
    }
    async remove(id) {
        const item = await this.findOne(id);
        await this.purchaseOrderItemRepository.remove(item);
    }
    async getTotalByPurchaseOrder(purchaseOrderId) {
        const result = await this.purchaseOrderItemRepository
            .createQueryBuilder('item')
            .select('SUM(item.totalAmount)', 'total')
            .where('item.purchaseOrderId = :purchaseOrderId', { purchaseOrderId })
            .getRawOne();
        return result?.total || 0;
    }
};
exports.PurchaseOrderItemsService = PurchaseOrderItemsService;
exports.PurchaseOrderItemsService = PurchaseOrderItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_item_entity_1.PurchaseOrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PurchaseOrderItemsService);
//# sourceMappingURL=purchase-order-items.service.js.map