import { Repository, DataSource } from 'typeorm';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Account } from './entities/account.entity';
import { Property } from '../properties/entities/property.entity';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';
export declare class JournalEntriesService {
    private journalEntriesRepository;
    private journalEntryLinesRepository;
    private accountsRepository;
    private propertyRepository;
    private dataSource;
    constructor(journalEntriesRepository: Repository<JournalEntry>, journalEntryLinesRepository: Repository<JournalEntryLine>, accountsRepository: Repository<Account>, propertyRepository: Repository<Property>, dataSource: DataSource);
    private generateEntryNumber;
    create(createJournalEntryDto: CreateJournalEntryDto, userId: string, opts?: {
        allowOrgWideWithoutProperty?: boolean;
    }): Promise<JournalEntry>;
    findAll(filters?: {
        status?: JournalEntryStatus;
        startDate?: Date;
        endDate?: Date;
        referenceType?: string;
        propertyId?: string;
        accessiblePropertyIds?: string[] | null;
    }): Promise<JournalEntry[]>;
    findOne(id: string): Promise<JournalEntry>;
    update(id: string, updateJournalEntryDto: UpdateJournalEntryDto): Promise<JournalEntry>;
    post(id: string, userId: string): Promise<JournalEntry>;
    void(id: string, userId: string, voidDto: VoidJournalEntryDto): Promise<JournalEntry>;
    remove(id: string): Promise<void>;
}
