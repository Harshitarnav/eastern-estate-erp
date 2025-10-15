"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItemResponseDto = void 0;
class InventoryItemResponseDto {
    static fromEntity(item) {
        const dto = new InventoryItemResponseDto();
        dto.id = item.id;
        dto.itemCode = item.itemCode;
        dto.itemName = item.itemName;
        dto.description = item.description;
        dto.category = item.category;
        dto.brand = item.brand;
        dto.model = item.model;
        dto.quantity = Number(item.quantity);
        dto.unit = item.unit;
        dto.minimumStock = Number(item.minimumStock);
        dto.maximumStock = Number(item.maximumStock);
        dto.reorderPoint = Number(item.reorderPoint);
        dto.stockStatus = item.stockStatus;
        dto.unitPrice = Number(item.unitPrice);
        dto.totalValue = Number(item.totalValue);
        dto.lastPurchasePrice = item.lastPurchasePrice ? Number(item.lastPurchasePrice) : undefined;
        dto.lastPurchaseDate = item.lastPurchaseDate?.toString();
        dto.supplierName = item.supplierName;
        dto.supplierEmail = item.supplierEmail;
        dto.supplierPhone = item.supplierPhone;
        dto.propertyId = item.propertyId;
        dto.warehouseLocation = item.warehouseLocation;
        dto.specification = item.specification;
        dto.batchNumber = item.batchNumber;
        dto.serialNumber = item.serialNumber;
        dto.totalIssued = Number(item.totalIssued);
        dto.totalReceived = Number(item.totalReceived);
        dto.lastIssuedDate = item.lastIssuedDate?.toString();
        dto.lastReceivedDate = item.lastReceivedDate?.toString();
        dto.images = item.images;
        dto.notes = item.notes;
        dto.tags = item.tags;
        dto.isActive = item.isActive;
        dto.createdAt = item.createdAt?.toString();
        dto.updatedAt = item.updatedAt?.toString();
        if (item.property) {
            dto.property = item.property;
        }
        return dto;
    }
    static fromEntities(items) {
        return items.map((item) => this.fromEntity(item));
    }
}
exports.InventoryItemResponseDto = InventoryItemResponseDto;
//# sourceMappingURL=inventory-item-response.dto.js.map