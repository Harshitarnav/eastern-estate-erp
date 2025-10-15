import { PurchaseOrder } from '../entities/purchase-order.entity';

export class PurchaseOrderResponseDto {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  items: any[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  paymentTerms: string;
  paidAmount: number;
  balanceAmount: number;
  paymentDueDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalItemsOrdered: number;
  totalItemsReceived: number;
  invoiceNumber?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  static fromEntity(order: PurchaseOrder): PurchaseOrderResponseDto {
    const dto = new PurchaseOrderResponseDto();
    dto.id = order.id;
    dto.orderNumber = order.orderNumber;
    dto.orderDate = order.orderDate?.toString();
    dto.orderStatus = order.orderStatus;
    dto.supplierId = order.supplierId;
    dto.supplierName = order.supplierName;
    dto.supplierEmail = order.supplierEmail;
    dto.supplierPhone = order.supplierPhone;
    dto.items = order.items;
    dto.subtotal = Number(order.subtotal);
    dto.discountAmount = Number(order.discountAmount);
    dto.taxAmount = Number(order.taxAmount);
    dto.shippingCost = Number(order.shippingCost);
    dto.totalAmount = Number(order.totalAmount);
    dto.paymentStatus = order.paymentStatus;
    dto.paymentTerms = order.paymentTerms;
    dto.paidAmount = Number(order.paidAmount);
    dto.balanceAmount = Number(order.balanceAmount);
    dto.paymentDueDate = order.paymentDueDate?.toString();
    dto.expectedDeliveryDate = order.expectedDeliveryDate?.toString();
    dto.actualDeliveryDate = order.actualDeliveryDate?.toString();
    dto.totalItemsOrdered = order.totalItemsOrdered;
    dto.totalItemsReceived = order.totalItemsReceived;
    dto.invoiceNumber = order.invoiceNumber;
    dto.notes = order.notes;
    dto.tags = order.tags;
    dto.isActive = order.isActive;
    dto.createdAt = order.createdAt?.toString();
    dto.updatedAt = order.updatedAt?.toString();
    return dto;
  }

  static fromEntities(orders: PurchaseOrder[]): PurchaseOrderResponseDto[] {
    return orders.map((order) => this.fromEntity(order));
  }
}

export interface PaginatedPurchaseOrdersResponse {
  data: PurchaseOrderResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
