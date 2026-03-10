import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentEntityType } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { LocalStorageService } from '../../common/upload/storage/local-storage.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
    private readonly storage: LocalStorageService,
  ) {}

  /** Upload a new document file + save metadata */
  async create(
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    userId: string,
  ): Promise<Document> {
    const doc = this.repo.create({
      ...dto,
      fileUrl: this.storage.getUrl(file.filename),
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId,
    });
    return this.repo.save(doc);
  }

  /** List documents for any entity */
  async findByEntity(
    entityType: DocumentEntityType,
    entityId: string,
  ): Promise<Document[]> {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  /** List all documents for a customer (across all entity types) */
  async findByCustomer(customerId: string): Promise<Document[]> {
    return this.repo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  /** List all documents for a booking */
  async findByBooking(bookingId: string): Promise<Document[]> {
    return this.repo.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findOne(id);

    // Try to delete the physical file (best-effort)
    try {
      const filename = path.basename(doc.fileUrl);
      await this.storage.delete(filename);
    } catch {
      // File might already be gone — continue
    }

    await this.repo.remove(doc);
  }

  /** Update notes / name for a document */
  async update(
    id: string,
    updates: { name?: string; notes?: string },
  ): Promise<Document> {
    const doc = await this.findOne(id);
    Object.assign(doc, updates);
    return this.repo.save(doc);
  }
}
