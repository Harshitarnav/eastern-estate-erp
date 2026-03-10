import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
export declare class SettingsService implements OnModuleInit {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<CompanySettings>);
    onModuleInit(): Promise<void>;
    get(): Promise<CompanySettings>;
    update(dto: Partial<CompanySettings>): Promise<CompanySettings>;
}
