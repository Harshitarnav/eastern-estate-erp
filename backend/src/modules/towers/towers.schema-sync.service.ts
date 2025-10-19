import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TowersSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(TowersSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_completeness_status_enum') THEN
            CREATE TYPE data_completeness_status_enum AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'COMPLETE');
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tower_construction_status') THEN
            CREATE TYPE tower_construction_status AS ENUM ('PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE');
          END IF;
        END $$;
      `);

      const alterQueries = [
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS total_floors INTEGER;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS total_units INTEGER;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_planned INTEGER DEFAULT 0;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_defined INTEGER DEFAULT 0;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS basement_levels INTEGER DEFAULT 0;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_per_floor VARCHAR(200);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS amenities JSONB;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS construction_status tower_construction_status DEFAULT 'PLANNED';`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS construction_start_date DATE;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS completion_date DATE;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS rera_number VARCHAR(100);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS built_up_area DECIMAL(10,2);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS carpet_area DECIMAL(10,2);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS ceiling_height DECIMAL(4,2);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS number_of_lifts INTEGER DEFAULT 1;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS vastu_compliant BOOLEAN DEFAULT true;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS facing VARCHAR(50);`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS special_features TEXT;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS images JSONB;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS floor_plans JSONB;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS tower_checklist JSONB;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS data_completion_pct DECIMAL(5,2) DEFAULT 0;`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS data_completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';`,
        `ALTER TABLE towers ADD COLUMN IF NOT EXISTS issues_count INTEGER DEFAULT 0;`,
      ];

      for (const query of alterQueries) {
        await queryRunner.query(query);
      }

      const jsonColumns = ['amenities', 'images', 'floor_plans'];
      for (const column of jsonColumns) {
        const columnInfo = await queryRunner.query(
          `SELECT udt_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'towers' AND column_name = $1`,
          [column],
        );

        const udtName: string | undefined = columnInfo?.[0]?.udt_name;
        if (udtName && udtName !== 'jsonb') {
          await queryRunner.query(
            `ALTER TABLE towers ALTER COLUMN ${column} TYPE jsonb USING CASE WHEN ${column} IS NULL THEN NULL ELSE to_jsonb(${column}) END;`,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to synchronize towers table schema', error as Error);
    } finally {
      await queryRunner.release();
    }
  }
}
