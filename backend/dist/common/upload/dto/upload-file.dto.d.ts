export declare enum FileCategory {
    DOCUMENT = "document",
    IMAGE = "image",
    RECEIPT = "receipt",
    KYC = "kyc",
    AVATAR = "avatar",
    PROPERTY = "property",
    CONSTRUCTION = "construction",
    OTHER = "other"
}
export declare class UploadFileDto {
    category: FileCategory;
    entityId?: string;
    entityType?: string;
    description?: string;
}
export declare class FileResponseDto {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    category?: FileCategory;
    entityId?: string;
    entityType?: string;
    description?: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    uploadedBy?: string;
}
