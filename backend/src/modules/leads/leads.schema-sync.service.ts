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

      await queryRunner.query(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS assignment_history JSONB;
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
