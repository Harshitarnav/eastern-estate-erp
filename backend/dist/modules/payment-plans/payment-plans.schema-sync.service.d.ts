import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DemandDraftTemplateService } from './services/demand-draft-template.service';
export declare class PaymentPlansSchemaSyncService implements OnModuleInit {
    private readonly dataSource;
    private readonly templateService;
    private readonly logger;
    constructor(dataSource: DataSource, templateService: DemandDraftTemplateService);
    onModuleInit(): Promise<void>;
}
