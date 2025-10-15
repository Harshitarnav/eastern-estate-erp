"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderResponseDto = void 0;
class PurchaseOrderResponseDto {
    static fromEntity(order) {
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
    static fromEntities(orders) {
        return orders.map((order) => this.fromEntity(order));
    }
}
exports.PurchaseOrderResponseDto = PurchaseOrderResponseDto;
//# sourceMappingURL=purchase-order-response.dto.js.map