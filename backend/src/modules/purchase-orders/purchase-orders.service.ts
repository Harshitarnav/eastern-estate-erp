import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, OrderStatus } from './entities/purchase-order.entity';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrderDto,
  PurchaseOrderResponseDto,
  PaginatedPurchaseOrdersResponse,
} from './dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const existing = await this.purchaseOrderRepository.findOne({
      where: { orderNumber: createDto.orderNumber },
    });

    if (existing) {
      throw new ConflictException('Order number already exists');
    }

    // Calculate totals
    const calculatedOrder = this.calculateOrderTotals(createDto);
    
    const order = this.purchaseOrderRepository.create(calculatedOrder);
    const savedOrder = await this.purchaseOrderRepository.save(order);
    // Ensure savedOrder is not an array
    const orderResult = Array.isArray(savedOrder) ? savedOrder[0] : savedOrder;

    return PurchaseOrderResponseDto.fromEntity(orderResult);
  }

  private calculateOrderTotals(dto: any): any {
    let subtotal = 0;
    let totalTax = 0;

    const processedItems = dto.items.map((item: any) => {
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
      totalItemsOrdered: processedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    };
  }

  async findAll(query: QueryPurchaseOrderDto): Promise<PaginatedPurchaseOrdersResponse> {
    const {
      search,
      orderStatus,
      paymentStatus,
      supplierId,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.purchaseOrderRepository.createQueryBuilder('order');

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber ILIKE :search OR order.supplierName ILIKE :search)',
        { search: `%${search}%` },
      );
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
      data: PurchaseOrderResponseDto.fromEntities(orders),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    return PurchaseOrderResponseDto.fromEntity(order);
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (updateDto.items) {
      const calculatedOrder = this.calculateOrderTotals({ ...order, ...updateDto });
      Object.assign(order, calculatedOrder);
    } else {
      Object.assign(order, updateDto);
    }

    const updatedOrder = await this.purchaseOrderRepository.save(order);
    return PurchaseOrderResponseDto.fromEntity(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    order.isActive = false;
    await this.purchaseOrderRepository.save(order);
  }

  async approve(id: string, approvedBy: string, approvedByName: string): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    if (order.orderStatus !== OrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Order is not pending approval');
    }

    order.orderStatus = OrderStatus.APPROVED;
    order.approvedBy = approvedBy;
    order.approvedByName = approvedByName;
    order.approvedAt = new Date();

    const updatedOrder = await this.purchaseOrderRepository.save(order);
    return PurchaseOrderResponseDto.fromEntity(updatedOrder);
  }

  async reject(id: string, rejectedBy: string, rejectedByName: string, reason: string): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    order.orderStatus = OrderStatus.REJECTED;
    order.rejectedBy = rejectedBy;
    order.rejectedByName = rejectedByName;
    order.rejectedAt = new Date();
    order.rejectionReason = reason;

    const updatedOrder = await this.purchaseOrderRepository.save(order);
    return PurchaseOrderResponseDto.fromEntity(updatedOrder);
  }

  async receiveItems(id: string, receivedData: any): Promise<PurchaseOrderResponseDto> {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    // Update received items
    order.receivedItems = receivedData.items;
    order.totalItemsReceived = receivedData.items.reduce(
      (sum: number, item: any) => sum + item.quantityReceived,
      0,
    );

    // Update order status
    if (order.totalItemsReceived >= order.totalItemsOrdered) {
      order.orderStatus = OrderStatus.RECEIVED;
    } else if (order.totalItemsReceived > 0) {
      order.orderStatus = OrderStatus.PARTIALLY_RECEIVED;
    }

    order.actualDeliveryDate = new Date();

    const updatedOrder = await this.purchaseOrderRepository.save(order);
    return PurchaseOrderResponseDto.fromEntity(updatedOrder);
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
}
