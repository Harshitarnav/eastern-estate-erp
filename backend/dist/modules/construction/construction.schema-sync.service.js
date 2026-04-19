"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ConstructionSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let ConstructionSchemaSyncService = ConstructionSchemaSyncService_1 = class ConstructionSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ConstructionSchemaSyncService_1.name);
    }
    async onModuleInit() {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        const runIsolated = async (label, fn) => {
            await runner.startTransaction();
            try {
                await fn(runner);
                await runner.commitTransaction();
                this.logger.log(`Construction schema [${label}] ✓`);
            }
            catch (error) {
                await runner.rollbackTransaction();
                this.logger.error(`Construction schema [${label}] failed`, error);
            }
        };
        try {
            await runIsolated('create ra_bills', async (qr) => {
                await qr.query(`
          CREATE TABLE IF NOT EXISTS ra_bills (
            id                           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ra_bill_number               VARCHAR(50) NOT NULL UNIQUE,
            vendor_id                    UUID NOT NULL,
            construction_project_id      UUID NOT NULL,
            property_id                  UUID,
            bill_date                    DATE NOT NULL,
            bill_period_start            DATE,
            bill_period_end              DATE,
            work_description             TEXT NOT NULL DEFAULT '',
            gross_amount                 NUMERIC(15,2) NOT NULL DEFAULT 0,
            previous_bills_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
            net_this_bill                NUMERIC(15,2) NOT NULL DEFAULT 0,
            retention_percentage         NUMERIC(5,2)  NOT NULL DEFAULT 0,
            retention_amount             NUMERIC(15,2) NOT NULL DEFAULT 0,
            advance_deduction            NUMERIC(15,2) NOT NULL DEFAULT 0,
            other_deductions             NUMERIC(15,2) NOT NULL DEFAULT 0,
            other_deductions_description VARCHAR(500),
            net_payable                  NUMERIC(15,2) NOT NULL DEFAULT 0,
            status                       VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
            certified_by                 UUID,
            certified_at                 TIMESTAMP,
            approved_by                  UUID,
            approved_at                  TIMESTAMP,
            paid_at                      TIMESTAMP,
            payment_reference            VARCHAR(255),
            notes                        TEXT,
            created_by                   UUID,
            created_at                   TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at                   TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `);
            });
            await runIsolated('create qc_checklists', async (qr) => {
                await qr.query(`
          CREATE TABLE IF NOT EXISTS qc_checklists (
            id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            construction_project_id   UUID         NOT NULL,
            phase                     VARCHAR(30)  NOT NULL,
            inspection_date           DATE         NOT NULL,
            inspector_name            VARCHAR(255) NOT NULL,
            location_description      VARCHAR(500),
            items                     JSONB        NOT NULL DEFAULT '[]',
            defects                   JSONB        NOT NULL DEFAULT '[]',
            overall_result            VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
            notes                     TEXT,
            next_inspection_date      DATE,
            created_by                UUID,
            created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at                TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `);
            });
            await runIsolated('nullable property_id on construction_projects', async (qr) => {
                await qr.query(`
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
            });
            await runIsolated('nullable columns on construction_progress_logs', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs'
                AND column_name = 'property_id' AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE construction_progress_logs ALTER COLUMN property_id DROP NOT NULL;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs'
                AND column_name = 'progress_type' AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE construction_progress_logs ALTER COLUMN progress_type DROP NOT NULL;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs'
                AND column_name = 'description' AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE construction_progress_logs ALTER COLUMN description DROP NOT NULL;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs'
                AND column_name = 'logged_by' AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE construction_progress_logs ALTER COLUMN logged_by DROP NOT NULL;
            END IF;
          END $$;
        `);
            });
            await runIsolated('new columns on construction_progress_logs', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'construction_progress_logs_shift_enum') THEN
              CREATE TYPE construction_progress_logs_shift_enum AS ENUM ('DAY', 'NIGHT');
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'shift'
            ) THEN
              ALTER TABLE construction_progress_logs
                ADD COLUMN shift construction_progress_logs_shift_enum;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'workers_present'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN workers_present INTEGER;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'workers_absent'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN workers_absent INTEGER;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'materials_used'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN materials_used TEXT;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'issues_delays'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN issues_delays TEXT;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'supervisor_name'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN supervisor_name VARCHAR(255);
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'next_day_plan'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN next_day_plan TEXT;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_progress_logs' AND column_name = 'remarks'
            ) THEN
              ALTER TABLE construction_progress_logs ADD COLUMN remarks TEXT;
            END IF;
          END $$;
        `);
            });
            await runIsolated('add journal_entry_id to ra_bills', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'ra_bills' AND column_name = 'journal_entry_id'
            ) THEN
              ALTER TABLE ra_bills ADD COLUMN journal_entry_id UUID;
            END IF;
          END $$;
        `);
            });
            await runIsolated('extend construction_development_updates columns', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            -- Make project_id optional so property-wide updates don't need a fake project.
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates'
                AND column_name = 'construction_project_id'
                AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE construction_development_updates
                ALTER COLUMN construction_project_id DROP NOT NULL;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates' AND column_name = 'property_id'
            ) THEN
              ALTER TABLE construction_development_updates ADD COLUMN property_id UUID;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates' AND column_name = 'tower_id'
            ) THEN
              ALTER TABLE construction_development_updates ADD COLUMN tower_id UUID;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates' AND column_name = 'scope_type'
            ) THEN
              ALTER TABLE construction_development_updates ADD COLUMN scope_type VARCHAR(30);
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates' AND column_name = 'common_area_label'
            ) THEN
              ALTER TABLE construction_development_updates ADD COLUMN common_area_label VARCHAR(200);
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates' AND column_name = 'category'
            ) THEN
              ALTER TABLE construction_development_updates ADD COLUMN category VARCHAR(40);
            END IF;
          END $$;
        `);
                await qr.query(`
          CREATE INDEX IF NOT EXISTS idx_dev_updates_property_date
            ON construction_development_updates (property_id, update_date DESC);
          CREATE INDEX IF NOT EXISTS idx_dev_updates_scope
            ON construction_development_updates (scope_type);
          CREATE INDEX IF NOT EXISTS idx_dev_updates_category
            ON construction_development_updates (category);
          CREATE INDEX IF NOT EXISTS idx_dev_updates_tower
            ON construction_development_updates (tower_id);
        `);
                await qr.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_development_updates'
                AND column_name = 'construction_project_id'
            ) THEN
              UPDATE construction_development_updates du
              SET property_id = cp.property_id
              FROM construction_projects cp
              WHERE du.construction_project_id = cp.id
                AND du.property_id IS NULL;
            END IF;
          END $$;
        `);
            });
            await runIsolated('add photos column to construction_flat_progress', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'construction_flat_progress' AND column_name = 'photos'
            ) THEN
              ALTER TABLE construction_flat_progress ADD COLUMN photos TEXT[];
            END IF;
          END $$;
        `);
            });
            await runIsolated('add journal_entry_id to vendor_payments', async (qr) => {
                await qr.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'vendor_payments' AND column_name = 'journal_entry_id'
            ) THEN
              ALTER TABLE vendor_payments ADD COLUMN journal_entry_id UUID;
            END IF;
          END $$;
        `);
            });
        }
        finally {
            await runner.release();
        }
    }
};
exports.ConstructionSchemaSyncService = ConstructionSchemaSyncService;
exports.ConstructionSchemaSyncService = ConstructionSchemaSyncService = ConstructionSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ConstructionSchemaSyncService);
//# sourceMappingURL=construction.schema-sync.service.js.map