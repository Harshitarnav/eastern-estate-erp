import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProjectsSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsSchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          country VARCHAR(100),
          pincode VARCHAR(15),
          status VARCHAR(50),
          start_date DATE,
          end_date DATE,
          contact_person VARCHAR(150),
          contact_email VARCHAR(150),
          contact_phone VARCHAR(25),
          gst_number VARCHAR(25),
          pan_number VARCHAR(25),
          finance_entity_name VARCHAR(150),
          is_active BOOLEAN DEFAULT true,
          created_by UUID,
          updated_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code ON projects (project_code);
      `);

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects (is_active);
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to ensure projects table exists', error as Error);
    } finally {
      await queryRunner.release();
    }
  }
}
