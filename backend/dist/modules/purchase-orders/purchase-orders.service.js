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
const dto_1 = require("./dto");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }
    async create(createDto) {
        const existing = await this.purchaseOrderRepository.findOne({
            where: { orderNumber: createDto.orderNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('Order number already exists');
        }
        const calculatedOrder = this.calculateOrderTotals(createDto);
        const order = this.purchaseOrderRepository.create(calculatedOrder);
        const savedOrder = await this.purchaseOrderRepository.save(order);
        const orderResult = Array.isArray(savedOrder) ? savedOrder[0] : savedOrder;
        return dto_1.PurchaseOrderResponseDto.fromEntity(orderResult);
    }
    calculateOrderTotals(dto) {
        let subtotal = 0;
        let totalTax = 0;
        const processedItems = dto.items.map((item) => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const discount = item.discount || 0;
            const taxPercent = item.taxPercent || 0;
            const afterDiscount = itemSubtotal - discount;
            const taxAmount = (afterDiscount * taxPercent) / 100;
            const totalAmount = afterDiscount + taxAmount;
            subtotal += itemSubtotal;
            totalTax += taxAmount;
            return {
                ...item,
                discount,
                taxPercent,
                taxAmount,
                totalAmount,
            };
        });
        const discountAmount = dto.discountAmount || 0;
        const shippingCost = dto.shippingCost || 0;
        const otherCharges = dto.otherCharges || 0;
        const totalAmount = subtotal - discountAmount + totalTax + shippingCost + otherCharges;
        return {
            ...dto,
            items: processedItems,
            subtotal,
            taxAmount: totalTax,
            totalAmount,
            balanceAmount: totalAmount,
            totalItemsOrdered: processedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
    }
    async findAll(query) {
        const { search, orderStatus, paymentStatus, supplierId, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.purchaseOrderRepository.createQueryBuilder('order');
        if (search) {
            queryBuilder.andWhere('(order.orderNumber ILIKE :search OR order.supplierName ILIKE :search)', { search: `%${search}%` });
        }
        if (orderStatus) {
            queryBuilder.andWhere('order.orderStatus = :orderStatus', { orderStatus });
        }
        if (paymentStatus) {
            queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
        }
        if (supplierId) {
            queryBuilder.andWhere('order.supplierId = :supplierId', { supplierId });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('order.isActive = :isActive', { isActive });
        }
        queryBuilder.orderBy(`order.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const orders = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.PurchaseOrderResponseDto.fromEntities(orders),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        return dto_1.PurchaseOrderResponseDto.fromEntity(order);
    }
    async update(id, updateDto) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        if (updateDto.items) {
            const calculatedOrder = this.calculateOrderTotals({ ...order, ...updateDto });
            Object.assign(order, calculatedOrder);
        }
        else {
            Object.assign(order, updateDto);
        }
        const updatedOrder = await this.purchaseOrderRepository.save(order);
        return dto_1.PurchaseOrderResponseDto.fromEntity(updatedOrder);
    }
    async remove(id) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        order.isActive = false;
        await this.purchaseOrderRepository.save(order);
    }
    async approve(id, approvedBy, approvedByName) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        if (order.orderStatus !== purchase_order_entity_1.OrderStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Order is not pending approval');
        }
        order.orderStatus = purchase_order_entity_1.OrderStatus.APPROVED;
        order.approvedBy = approvedBy;
        order.approvedByName = approvedByName;
        order.approvedAt = new Date();
        const updatedOrder = await this.purchaseOrderRepository.save(order);
        return dto_1.PurchaseOrderResponseDto.fromEntity(updatedOrder);
    }
    async reject(id, rejectedBy, rejectedByName, reason) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        order.orderStatus = purchase_order_entity_1.OrderStatus.REJECTED;
        order.rejectedBy = rejectedBy;
        order.rejectedByName = rejectedByName;
        order.rejectedAt = new Date();
        order.rejectionReason = reason;
        const updatedOrder = await this.purchaseOrderRepository.save(order);
        return dto_1.PurchaseOrderResponseDto.fromEntity(updatedOrder);
    }
    async receiveItems(id, receivedData) {
        const order = await this.purchaseOrderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        order.receivedItems = receivedData.items;
        order.totalItemsReceived = receivedData.items.reduce((sum, item) => sum + item.quantityReceived, 0);
        if (order.totalItemsReceived >= order.totalItemsOrdered) {
            order.orderStatus = purchase_order_entity_1.OrderStatus.RECEIVED;
        }
        else if (order.totalItemsReceived > 0) {
            order.orderStatus = purchase_order_entity_1.OrderStatus.PARTIALLY_RECEIVED;
        }
        order.actualDeliveryDate = new Date();
        const updatedOrder = await this.purchaseOrderRepository.save(order);
        return dto_1.PurchaseOrderResponseDto.fromEntity(updatedOrder);
    }
    async getStatistics() {
        const orders = await this.purchaseOrderRepository.find({ where: { isActive: true } });
        const total = orders.length;
        const draft = orders.filter((o) => o.orderStatus === 'DRAFT').length;
        const pending = orders.filter((o) => o.orderStatus === 'PENDING_APPROVAL').length;
        const approved = orders.filter((o) => o.orderStatus === 'APPROVED').length;
        const received = orders.filter((o) => o.orderStatus === 'RECEIVED').length;
        const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const paidAmount = orders.reduce((sum, o) => sum + Number(o.paidAmount), 0);
        const balanceAmount = orders.reduce((sum, o) => sum + Number(o.balanceAmount), 0);
        return {
            total,
            draft,
            pending,
            approved,
            received,
            totalAmount,
            paidAmount,
            balanceAmount,
        };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map