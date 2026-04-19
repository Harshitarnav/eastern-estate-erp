import type { Request as ExpressRequest } from 'express';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntryStatus } from './entities/journal-entry.entity';
export declare class JournalEntriesController {
    private readonly journalEntriesService;
    constructor(journalEntriesService: JournalEntriesService);
    create(createJournalEntryDto: CreateJournalEntryDto, req: ExpressRequest): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    findAll(req: ExpressRequest, status?: JournalEntryStatus, startDate?: string, endDate?: string, referenceType?: string, propertyId?: string): any[] | Promise<import("./entities/journal-entry.entity").JournalEntry[]>;
    findOne(id: string, req: ExpressRequest): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    findLines(id: string, req: ExpressRequest): Promise<import("./entities/journal-entry-line.entity").JournalEntryLine[]>;
    update(id: string, updateJournalEntryDto: UpdateJournalEntryDto, req: ExpressRequest): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    post(id: string, req: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    void(id: string, voidDto: VoidJournalEntryDto, req: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    remove(id: string, req: ExpressRequest): Promise<void>;
}
