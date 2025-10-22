import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntryStatus } from './entities/journal-entry.entity';
export declare class JournalEntriesController {
    private readonly journalEntriesService;
    constructor(journalEntriesService: JournalEntriesService);
    create(createJournalEntryDto: CreateJournalEntryDto, req: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    findAll(status?: JournalEntryStatus, startDate?: string, endDate?: string, referenceType?: string): Promise<import("./entities/journal-entry.entity").JournalEntry[]>;
    findOne(id: string): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    update(id: string, updateJournalEntryDto: UpdateJournalEntryDto): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    post(id: string, req: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    void(id: string, voidDto: VoidJournalEntryDto, req: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    remove(id: string): Promise<void>;
}
