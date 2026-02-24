import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SchemaSyncService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private ensureNotificationsSchema;
    private ensureAccountingSchema;
    private ensureVendorAndPurchaseSchema;
    private ensureVendorColumns;
    private ensureMarketingSchema;
}
