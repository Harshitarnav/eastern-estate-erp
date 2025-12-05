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
var LeadsSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let LeadsSchemaSyncService = LeadsSchemaSyncService_1 = class LeadsSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(LeadsSchemaSyncService_1.name);
    }
    async onModuleInit() {
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to synchronize leads table schema', error);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.LeadsSchemaSyncService = LeadsSchemaSyncService;
exports.LeadsSchemaSyncService = LeadsSchemaSyncService = LeadsSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], LeadsSchemaSyncService);
//# sourceMappingURL=leads.schema-sync.service.js.map