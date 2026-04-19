import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class SchemaSyncService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private dropLegacyTables;
    private ensureForeignKeys;
    private ensureBookingsCollectionsSchema;
    private ensureCompanySettingsSchema;
    private ensureNotificationsSchema;
    private ensureAccountingSchema;
    private ensureVendorAndPurchaseSchema;
    private ensureVendorColumns;
    private ensureMarketingSchema;
    private ensureDocumentsSchema;
    private ensureCustomersSchema;
    private ensurePaymentsSchema;
}
