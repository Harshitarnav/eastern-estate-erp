import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PropertiesSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(PropertiesSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const queries = [
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS country VARCHAR(100);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS location TEXT;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS nearby_landmarks TEXT;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_area DECIMAL(15,2);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_unit VARCHAR(20) DEFAULT 'sqft';`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS built_up_area DECIMAL(15,2);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS number_of_towers INTEGER;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS number_of_units INTEGER;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_towers_planned INTEGER;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_units_planned INTEGER;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors_per_tower VARCHAR(50);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS launch_date DATE;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS expected_completion_date DATE;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS actual_completion_date DATE;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS rera_number VARCHAR(100);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS rera_status VARCHAR(50);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(50) DEFAULT 'General';`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_min DECIMAL(15,2);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_max DECIMAL(15,2);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS expected_revenue DECIMAL(18,2);`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS bhk_types TEXT;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS images JSONB;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS documents JSONB;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities JSONB;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_by UUID;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_by UUID;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS project_id UUID;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS inventory_checklist JSONB;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS data_completion_pct DECIMAL(5,2) DEFAULT 0;`,
      `ALTER TABLE properties ADD COLUMN IF NOT EXISTS data_completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';`,
    ];

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
      for (const query of queries) {
        await queryRunner.query(query);
      }

      // Create materialized view without nested dollar quotes
      await queryRunner.query(`
        DO $body$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_matviews WHERE matviewname = 'vw_property_inventory_summary'
          ) THEN
            CREATE MATERIALIZED VIEW vw_property_inventory_summary AS
            SELECT
              p.id AS property_id,
              COALESCE(p.total_towers_planned, p.number_of_towers, 0) AS towers_planned,
              COUNT(DISTINCT t.id) FILTER (WHERE t.is_active = true) AS towers_defined,
              COALESCE(p.total_units_planned, p.number_of_units, 0) AS units_planned,
              COUNT(DISTINCT f.id) FILTER (WHERE f.is_active = true) AS units_defined,
              COALESCE(p.data_completion_pct, 0) AS data_completion_pct,
              COALESCE(p.data_completeness_status::text, 'NOT_STARTED') AS data_completeness_status,
              GREATEST(COALESCE(p.total_towers_planned, p.number_of_towers, 0) - COUNT(DISTINCT t.id) FILTER (WHERE t.is_active = true), 0) AS missing_towers,
              GREATEST(COALESCE(p.total_units_planned, p.number_of_units, 0) - COUNT(DISTINCT f.id) FILTER (WHERE f.is_active = true), 0) AS missing_units
            FROM properties p
            LEFT JOIN towers t ON t.property_id = p.id
            LEFT JOIN flats f ON f.tower_id = t.id
            GROUP BY p.id;
          END IF;
        END $body$;
      `);

      await queryRunner.query(`
        DO $body$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_matviews WHERE matviewname = 'vw_tower_inventory_summary'
          ) THEN
            CREATE MATERIALIZED VIEW vw_tower_inventory_summary AS
            WITH flat_counts AS (
              SELECT tower_id, COUNT(*) AS units_defined
              FROM flats
              WHERE is_active = true
              GROUP BY tower_id
            ),
            flat_status_breakdown AS (
              SELECT tower_id,
                jsonb_object_agg(status, cnt ORDER BY status) AS units_by_status
              FROM (
                SELECT tower_id, status, COUNT(*) AS cnt
                FROM flats
                WHERE is_active = true
                GROUP BY tower_id, status
              ) breakdown
              GROUP BY tower_id
            )
            SELECT
              t.id AS tower_id,
              t.property_id,
              COALESCE(t.units_planned, 0) AS units_planned,
              COALESCE(t.total_units, 0) AS units_total,
              COALESCE(fc.units_defined, 0) AS units_defined,
              COALESCE(t.data_completion_pct, 0) AS data_completion_pct,
              COALESCE(t.data_completeness_status::text, 'NOT_STARTED') AS data_completeness_status,
              COALESCE(t.issues_count, 0) AS issues_count,
              COALESCE(fs.units_by_status, '{}'::jsonb) AS units_by_status
            FROM towers t
            LEFT JOIN flat_counts fc ON fc.tower_id = t.id
            LEFT JOIN flat_status_breakdown fs ON fs.tower_id = t.id;
          END IF;
        END $body$;
      `);

      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS idx_properties_project_id ON properties (project_id);`,
      );

      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_type = 'FOREIGN KEY'
              AND table_name = 'properties'
              AND constraint_name = 'fk_properties_project'
          ) THEN
            ALTER TABLE properties
              ADD CONSTRAINT fk_properties_project
              FOREIGN KEY (project_id)
              REFERENCES construction_projects(id)
              ON DELETE SET NULL;
          END IF;
        END
        $$;
      `);
      const jsonColumns = ['images', 'documents', 'amenities'];
      for (const column of jsonColumns) {
        const columnInfo = await queryRunner.query(
          `SELECT udt_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'properties' AND column_name = $1`,
          [column],
        );

        const udtName: string | undefined = columnInfo?.[0]?.udt_name;
        if (udtName && udtName !== 'jsonb') {
          await queryRunner.query(
            `ALTER TABLE properties ALTER COLUMN ${column} TYPE jsonb USING CASE WHEN ${column} IS NULL THEN NULL ELSE to_jsonb(${column}) END;`,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to synchronize properties table schema', error as Error);
    } finally {
      await queryRunner.release();
    }
  }
}
