import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly svc;
    constructor(svc: DocumentsService);
    upload(file: Express.Multer.File, body: any, req: any): Promise<import("./entities/document.entity").Document>;
    findByEntity(entityType: string, entityId: string): Promise<import("./entities/document.entity").Document[]>;
    findByBooking(bookingId: string): Promise<import("./entities/document.entity").Document[]>;
    findByCustomer(customerId: string): Promise<import("./entities/document.entity").Document[]>;
    findOne(id: string): Promise<import("./entities/document.entity").Document>;
    update(id: string, body: {
        name?: string;
        notes?: string;
    }): Promise<import("./entities/document.entity").Document>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
