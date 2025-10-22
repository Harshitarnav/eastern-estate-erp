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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_entity_1 = require("./entities/purchase-order.entity");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }
    async create(createDto) {
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
    async findAll(query) {
        const { page = 1, limit = 10, search, status, vendorId, propertyId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const queryBuilder = this.purchaseOrderRepository
            .createQueryBuilder('po')
            .leftJoinAndSelect('po.vendor', 'vendor')
            .leftJoinAndSelect('po.property', 'property');
        if (search) {
            queryBuilder.andWhere('(po.poNumber ILIKE :search OR po.notes ILIKE :search OR vendor.vendorName ILIKE :search)', { search: `%${search}%` });
        }
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
        queryBuilder.orderBy(`po.${sortBy}`, sortOrder);
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
    async findOne(id) {
        const po = await this.purchaseOrderRepository.findOne({
            where: { id },
            relations: ['vendor', 'property'],
        });
        if (!po) {
            throw new common_1.NotFoundException(`Purchase Order with ID ${id} not found`);
        }
        return po;
    }
    async update(id, updateDto) {
        const po = await this.findOne(id);
        Object.assign(po, updateDto);
        if (updateDto.expectedDeliveryDate) {
            po.expectedDeliveryDate = new Date(updateDto.expectedDeliveryDate);
        }
        if (updateDto.totalAmount !== undefined || updateDto.advancePaid !== undefined) {
            po.balanceAmount = po.totalAmount - po.advancePaid;
        }
        return await this.purchaseOrderRepository.save(po);
    }
    async updateStatus(id, status) {
        const po = await this.findOne(id);
        po.status = status;
        if (status === purchase_order_entity_1.PurchaseOrderStatus.RECEIVED && !po.actualDeliveryDate) {
            po.actualDeliveryDate = new Date();
        }
        return await this.purchaseOrderRepository.save(po);
    }
    async remove(id) {
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
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map