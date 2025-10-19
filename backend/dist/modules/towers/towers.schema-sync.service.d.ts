import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class TowersSchemaSyncService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
}
