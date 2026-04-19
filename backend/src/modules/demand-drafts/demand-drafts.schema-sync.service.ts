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

      // Add columns introduced after initial table creation
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS title VARCHAR(500) NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS due_date TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS payment_schedule_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS flat_payment_plan_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS construction_checkpoint_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN NOT NULL DEFAULT FALSE;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT TRUE;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reviewed_by UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS review_notes TEXT NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS template_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS template_data JSONB NULL;`);

      // ── Escalation / collections columns (added in PR1: construction→collections flow) ──
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS tone VARCHAR(40) NOT NULL DEFAULT 'ON_TIME';`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS next_reminder_due_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS escalation_level INT NOT NULL DEFAULT 0;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS days_overdue INT NOT NULL DEFAULT 0;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS cancellation_warning_issued_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS parent_demand_draft_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(64) NULL;`);

      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_tone ON demand_drafts(tone);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_next_reminder ON demand_drafts(next_reminder_due_at) WHERE next_reminder_due_at IS NOT NULL;`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_parent ON demand_drafts(parent_demand_draft_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_import_batch ON demand_drafts(import_batch_id);`);

      // ── DD closure when milestone is paid (PR: link payment → DD close) ──
      // Extend the status enum to include PAID so verified payments can
      // automatically close the DDs they settle. Adding a new label to
      // an existing enum has to be done outside of a transaction in some
      // postgres versions, so we use ALTER TYPE ... ADD VALUE IF NOT EXISTS
      // which is idempotent and transaction-safe since PG 12.
      await qr.query(
        `ALTER TYPE demand_draft_status_enum ADD VALUE IF NOT EXISTS 'PAID';`,
      );
      await qr.query(
        `ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;`,
      );
      await qr.query(
        `ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS paid_payment_id UUID NULL;`,
      );
      await qr.query(
        `CREATE INDEX IF NOT EXISTS idx_demand_drafts_paid_payment ON demand_drafts(paid_payment_id) WHERE paid_payment_id IS NOT NULL;`,
      );

      // ── Collector queues / assignment (PR: collector queues) ──
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS collector_user_id UUID NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS assigned_by UUID NULL;`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_collector_user ON demand_drafts(collector_user_id);`);

      // FK is added only if the users table exists (it does in this
      // project, but guard anyway so sync doesn't fail on fresh DBs
      // where users hasn't been created yet).
      await qr.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
             AND NOT EXISTS (
               SELECT 1 FROM information_schema.table_constraints
               WHERE constraint_name = 'fk_demand_drafts_collector_user'
             ) THEN
            ALTER TABLE demand_drafts
              ADD CONSTRAINT fk_demand_drafts_collector_user
              FOREIGN KEY (collector_user_id) REFERENCES users(id) ON DELETE SET NULL;
          END IF;
        END $$;
      `);

      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error('Failed to synchronize demand_drafts schema', error as Error);
    } finally {
      await qr.release();
    }
  }
}
