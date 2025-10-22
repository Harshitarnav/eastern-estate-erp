import { User } from '../../users/entities/user.entity';
export declare enum MaterialCategory {
    CEMENT = "CEMENT",
    STEEL = "STEEL",
    SAND = "SAND",
    AGGREGATE = "AGGREGATE",
    BRICKS = "BRICKS",
    TILES = "TILES",
    ELECTRICAL = "ELECTRICAL",
    PLUMBING = "PLUMBING",
    PAINT = "PAINT",
    HARDWARE = "HARDWARE",
    OTHER = "OTHER"
}
export declare enum UnitOfMeasurement {
    KG = "KG",
    TONNE = "TONNE",
    BAG = "BAG",
    PIECE = "PIECE",
    LITRE = "LITRE",
    CUBIC_METER = "CUBIC_METER",
    SQUARE_METER = "SQUARE_METER",
    BOX = "BOX",
    SET = "SET"
}
export declare class Material {
    id: string;
    materialCode: string;
    materialName: string;
    category: MaterialCategory;
    unitOfMeasurement: UnitOfMeasurement;
    currentStock: number;
    minimumStockLevel: number;
    maximumStockLevel: number;
    unitPrice: number;
    gstPercentage: number;
    specifications: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creator: User;
    updatedBy: string;
    updater: User;
    get isLowStock(): boolean;
    get stockValue(): number;
}
