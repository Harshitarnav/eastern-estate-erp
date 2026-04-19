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
var DemandDraftsSchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandDraftsSchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const demand_draft_entity_1 = require("./entities/demand-draft.entity");
let DemandDraftsSchemaSyncService = DemandDraftsSchemaSyncService_1 = class DemandDraftsSchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DemandDraftsSchemaSyncService_1.name);
    }
    async onModuleInit() {
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
          status demand_draft_status_enum NOT NULL DEFAULT '${demand_draft_entity_1.DemandDraftStatus.DRAFT}',
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
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_flat_id ON demand_drafts(flat_id);`);
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_customer_id ON demand_drafts(customer_id);`);
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_booking_id ON demand_drafts(booking_id);`);
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_milestone_id ON demand_drafts(milestone_id);`);
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
            await qr.query(`ALTER TYPE demand_draft_status_enum ADD VALUE IF NOT EXISTS 'PAID';`);
            await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;`);
            await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS paid_payment_id UUID NULL;`);
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_paid_payment ON demand_drafts(paid_payment_id) WHERE paid_payment_id IS NOT NULL;`);
            await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS collector_user_id UUID NULL;`);
            await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP NULL;`);
            await qr.query(`ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS assigned_by UUID NULL;`);
            await qr.query(`CREATE INDEX IF NOT EXISTS idx_demand_drafts_collector_user ON demand_drafts(collector_user_id);`);
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
        }
        catch (error) {
            await qr.rollbackTransaction();
            this.logger.error('Failed to synchronize demand_drafts schema', error);
        }
        finally {
            await qr.release();
        }
    }
};
exports.DemandDraftsSchemaSyncService = DemandDraftsSchemaSyncService;
exports.DemandDraftsSchemaSyncService = DemandDraftsSchemaSyncService = DemandDraftsSchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DemandDraftsSchemaSyncService);
//# sourceMappingURL=demand-drafts.schema-sync.service.js.map