import { DocumentCategory, DocumentEntityType } from '../entities/document.entity';
export declare class CreateDocumentDto {
    name: string;
    category: DocumentCategory;
    entityType: DocumentEntityType;
    entityId: string;
    customerId?: string;
    bookingId?: string;
    fileUrl: string;
    fileName: string;
    mimeType?: string;
    fileSize?: number;
    notes?: string;
}
