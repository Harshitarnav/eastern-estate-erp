import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ConstructionSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(ConstructionSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    try {
      await runner.startTransaction();
      // Allow projects to exist without an immediate property link
      await runner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'construction_projects'
              AND column_name = 'property_id'
              AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE construction_projects ALTER COLUMN property_id DROP NOT NULL;
          END IF;
        END $$;
      `);
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      this.logger.error('Failed to sync construction_projects schema', error as Error);
    } finally {
      await runner.release();
    }
  }
}
