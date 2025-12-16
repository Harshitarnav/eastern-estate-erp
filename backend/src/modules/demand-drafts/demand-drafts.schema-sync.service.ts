import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DemandDraftStatus } from './entities/demand-draft.entity';

@Injectable()
export class DemandDraftsSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(DemandDraftsSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();

    try {
      await qr.startTransaction();

      await qr.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demand_draft_status_enum') THEN
            CREATE TYPE demand_draft_status_enum AS ENUM ('DRAFT', 'READY', 'SENT', 'FAILED');
          END IF;
        END $$;
      `);

      await qr.query(`
        CREATE TABLE IF NOT EXISTS demand_drafts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          flat_id UUID NULL,
          customer_id UUID NULL,
          booking_id UUID NULL,
          milestone_id VARCHAR(200) NULL,
          amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          status demand_draft_status_enum NOT NULL DEFAULT '${DemandDraftStatus.DRAFT}',
          file_url TEXT NULL,
          content TEXT NULL,
          metadata JSONB NULL,
          generated_at TIMESTAMP NULL,
          sent_at TIMESTAMP NULL,
          created_by UUID NULL,
          updated_by UUID NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Ensure indexes exist
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_flat_id ON demand_drafts(flat_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_customer_id ON demand_drafts(customer_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_booking_id ON demand_drafts(booking_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_milestone_id ON demand_drafts(milestone_id);`);

      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error('Failed to synchronize demand_drafts schema', error as Error);
    } finally {
      await qr.release();
    }
  }
}
