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
var FlatsSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatsSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let FlatsSchemaSyncService = FlatsSchemaSyncService_1 = class FlatsSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(FlatsSchemaSyncService_1.name);
    }
    async onModuleInit() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        const queries = [
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS name VARCHAR(100);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS description TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT '2BHK';`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS floor INT NOT NULL DEFAULT 1;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS bedrooms INT NOT NULL DEFAULT 2;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS bathrooms INT NOT NULL DEFAULT 2;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS balconies INT NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS servant_room BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS study_room BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS pooja_room BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS super_built_up_area DECIMAL(10,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS built_up_area DECIMAL(10,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS carpet_area DECIMAL(10,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS balcony_area DECIMAL(10,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS base_price DECIMAL(15,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS price_per_sqft DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS registration_charges DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS maintenance_charges DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS parking_charges DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS total_price DECIMAL(15,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS final_price DECIMAL(15,2) NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'UNDER_CONSTRUCTION';`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS available_from DATE;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS expected_possession DATE;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS facing VARCHAR(50);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS vastu_compliant BOOLEAN NOT NULL DEFAULT true;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS corner_unit BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS road_facing BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS park_facing BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS parking_slots INT NOT NULL DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS covered_parking BOOLEAN NOT NULL DEFAULT false;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS furnishing_status VARCHAR(50);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS amenities TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS special_features TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS images TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS customer_id UUID;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS booking_date DATE;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS sold_date DATE;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS token_amount DECIMAL(15,2);`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS payment_plan TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS remarks TEXT;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 1;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS created_by UUID;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS updated_by UUID;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS tower_id UUID;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS property_id UUID;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS flat_checklist JSONB;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS data_completion_pct DECIMAL(5,2) DEFAULT 0;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS issues JSONB;`,
            `ALTER TABLE flats ADD COLUMN IF NOT EXISTS issues_count INT DEFAULT 0;`,
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
            await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'flats'
              AND column_name = 'propertyId'
          ) THEN
            EXECUTE 'UPDATE "flats"
                     SET "property_id" = "propertyId"
                     WHERE "property_id" IS NULL
                       AND "propertyId" IS NOT NULL';
          END IF;

          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'flats'
              AND column_name = 'towerId'
          ) THEN
            EXECUTE 'UPDATE "flats"
                     SET "tower_id" = "towerId"
                     WHERE "tower_id" IS NULL
                       AND "towerId" IS NOT NULL';
          END IF;
        END $$;
      `);
            await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flat_status_enum') THEN
            CREATE TYPE flat_status_enum AS ENUM ('AVAILABLE', 'BLOCKED', 'BOOKED', 'SOLD', 'UNDER_CONSTRUCTION');
          END IF;
        END $$;
      `);
            await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flat_status_enum') THEN
            IF NOT EXISTS (
              SELECT 1
              FROM pg_enum
              WHERE enumtypid = 'flat_status_enum'::regtype
                AND enumlabel = 'ON_HOLD'
            ) THEN
              ALTER TYPE flat_status_enum ADD VALUE 'ON_HOLD';
            END IF;
          END IF;
        END $$;
      `);
            await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flat_type_enum') THEN
            CREATE TYPE flat_type_enum AS ENUM ('STUDIO', '1BHK', '2BHK', '3BHK', '4BHK', 'PENTHOUSE', 'DUPLEX', 'VILLA');
          END IF;
        END $$;
      `);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to synchronize flats table schema', error);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.FlatsSchemaSyncService = FlatsSchemaSyncService;
exports.FlatsSchemaSyncService = FlatsSchemaSyncService = FlatsSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], FlatsSchemaSyncService);
//# sourceMappingURL=flats.schema-sync.service.js.map