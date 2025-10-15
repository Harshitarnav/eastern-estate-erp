import { Property } from '../../properties/entities/property.entity';
export declare enum ItemCategory {
    CONSTRUCTION_MATERIAL = "CONSTRUCTION_MATERIAL",
    ELECTRICAL = "ELECTRICAL",
    PLUMBING = "PLUMBING",
    HARDWARE = "HARDWARE",
    PAINT = "PAINT",
    TILES = "TILES",
    FIXTURES = "FIXTURES",
    TOOLS = "TOOLS",
    SAFETY_EQUIPMENT = "SAFETY_EQUIPMENT",
    OTHER = "OTHER"
}
export declare enum Unit {
    KG = "KG",
    LITRE = "LITRE",
    METER = "METER",
    SQ_METER = "SQ_METER",
    PIECE = "PIECE",
    BOX = "BOX",
    BAG = "BAG",
    ROLL = "ROLL",
    SET = "SET",
    UNIT = "UNIT"
}
export declare enum StockStatus {
    IN_STOCK = "IN_STOCK",
    LOW_STOCK = "LOW_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    ORDERED = "ORDERED",
    DISCONTINUED = "DISCONTINUED"
}
export declare class InventoryItem {
    id: string;
    itemCode: string;
    itemName: string;
    description: string;
    category: ItemCategory;
    brand: string;
    model: string;
    quantity: number;
    unit: Unit;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    stockStatus: StockStatus;
    unitPrice: number;
    totalValue: number;
    lastPurchasePrice: number;
    lastPurchaseDate: Date;
    supplierName: string;
    supplierEmail: string;
    supplierPhone: string;
    supplierAddress: string;
    propertyId: string;
    property: Property;
    warehouseLocation: string;
    rackNumber: string;
    binNumber: string;
    specification: string;
    grade: string;
    manufacturingDate: Date;
    expiryDate: Date;
    batchNumber: string;
    serialNumber: string;
    totalIssued: number;
    totalReceived: number;
    totalReturned: number;
    lastIssuedDate: Date;
    lastReceivedDate: Date;
    images: string[];
    documents: string[];
    notes: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
