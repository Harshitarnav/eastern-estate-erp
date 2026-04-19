import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LeadsSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(LeadsSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      await queryRunner.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS property_id UUID;
      `);

      await queryRunner.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS tower_id UUID;
      `);

      await queryRunner.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS flat_id UUID;
      `);

      // Convert legacy text columns to UUID so comparisons don't blow up with
      // "operator does not exist: text = uuid". Safe to re-run: the DO block
      // checks actual column type before altering.
      for (const col of ['property_id', 'tower_id', 'flat_id']) {
        await queryRunner.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
               WHERE table_name = 'leads'
                 AND column_name = '${col}'
                 AND data_type IN ('character varying', 'text')
            ) THEN
              UPDATE leads SET ${col} = NULL
               WHERE ${col} IS NOT NULL
                 AND ${col} !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
              ALTER TABLE leads ALTER COLUMN ${col} TYPE uuid USING ${col}::uuid;
            END IF;
          END $$;
        `);
      }

      await queryRunner.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS assignment_history JSONB;
      `);

      // Convert assigned_to from varchar to uuid so it can JOIN with users.id
      // Safe to run repeatedly - DO block checks actual column type first
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
             WHERE table_name = 'leads'
               AND column_name = 'assigned_to'
               AND data_type = 'character varying'
          ) THEN
            -- Clear any non-UUID values first to avoid cast errors
            UPDATE leads SET assigned_to = NULL
             WHERE assigned_to IS NOT NULL
               AND assigned_to !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
            ALTER TABLE leads ALTER COLUMN assigned_to TYPE uuid USING assigned_to::uuid;
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = current_schema()
              AND indexname = 'idx_leads_property_id'
          ) THEN
            CREATE INDEX idx_leads_property_id ON leads (property_id);
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = current_schema()
              AND indexname = 'idx_leads_tower_id'
          ) THEN
            CREATE INDEX idx_leads_tower_id ON leads (tower_id);
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = current_schema()
              AND indexname = 'idx_leads_flat_id'
          ) THEN
            CREATE INDEX idx_leads_flat_id ON leads (flat_id);
          END IF;
        END $$;
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to synchronize leads table schema', error as Error);
    } finally {
      await queryRunner.release();
    }
  }
}
