import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
export declare class AccountsBootstrapService implements OnModuleInit {
    private readonly accountsRepo;
    private readonly logger;
    constructor(accountsRepo: Repository<Account>);
    onModuleInit(): Promise<void>;
    private ensureDefaults;
    private findMatching;
    private pickFreeCode;
}
