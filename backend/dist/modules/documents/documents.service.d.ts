import { Repository } from 'typeorm';
import { Document, DocumentEntityType } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { IStorageService } from '../../common/upload/storage/storage.interface';
export declare class DocumentsService {
    private readonly repo;
    private readonly storage;
    constructor(repo: Repository<Document>, storage: IStorageService);
    create(file: Express.Multer.File, dto: CreateDocumentDto, userId: string): Promise<Document>;
    findByEntity(entityType: DocumentEntityType, entityId: string): Promise<Document[]>;
    findByCustomer(customerId: string): Promise<Document[]>;
    findByBooking(bookingId: string): Promise<Document[]>;
    findOne(id: string): Promise<Document>;
    remove(id: string, userId: string): Promise<void>;
    update(id: string, updates: {
        name?: string;
        notes?: string;
    }): Promise<Document>;
}
