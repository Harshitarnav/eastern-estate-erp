import { InventoryItem } from '../entities/inventory-item.entity';

export class InventoryItemResponseDto {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  stockStatus: string;
  unitPrice: number;
  totalValue: number;
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  propertyId?: string;
  warehouseLocation?: string;
  specification?: string;
  batchNumber?: string;
  serialNumber?: string;
  totalIssued: number;
  totalReceived: number;
  lastIssuedDate?: string;
  lastReceivedDate?: string;
  images?: string[];
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: any;

  static fromEntity(item: InventoryItem): InventoryItemResponseDto {
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

  static fromEntities(items: InventoryItem[]): InventoryItemResponseDto[] {
    return items.map((item) => this.fromEntity(item));
  }
}

export interface PaginatedInventoryItemsResponse {
  data: InventoryItemResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
