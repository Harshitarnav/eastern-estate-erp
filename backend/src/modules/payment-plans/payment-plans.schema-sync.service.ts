import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DemandDraftTemplateService } from './services/demand-draft-template.service';

/**
 * Ensures that the payment_plan_templates, flat_payment_plans, and
 * demand_draft_templates tables exist and are up-to-date.
 * This runs once on every application boot (idempotent DDL only).
 */
@Injectable()
export class PaymentPlansSchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(PaymentPlansSchemaSyncService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly templateService: DemandDraftTemplateService,
  ) {}

  async onModuleInit(): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // ── payment_plan_templates ──────────────────────────────────────────
      await qr.query(`
        CREATE TABLE IF NOT EXISTS payment_plan_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'CONSTRUCTION_LINKED',
          description TEXT,
          milestones JSONB NOT NULL DEFAULT '[]',
          total_percentage DECIMAL(5,2) NOT NULL DEFAULT 100,
          is_active BOOLEAN DEFAULT TRUE,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          created_by UUID NULL,
          updated_by UUID NULL
        );
      `);

      // ── flat_payment_plans ──────────────────────────────────────────────
      await qr.query(`
        CREATE TABLE IF NOT EXISTS flat_payment_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          flat_id UUID NOT NULL,
          booking_id UUID NOT NULL,
          customer_id UUID NOT NULL,
          payment_plan_template_id UUID NULL,
          total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          paid_amount DECIMAL(15,2) DEFAULT 0,
          balance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          milestones JSONB NOT NULL DEFAULT '[]',
          status VARCHAR(20) DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          created_by UUID NULL,
          updated_by UUID NULL
        );
      `);

      // ── demand_draft_templates ──────────────────────────────────────────
      await qr.query(`
        CREATE TABLE IF NOT EXISTS demand_draft_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(200) NOT NULL,
          description TEXT,
          subject VARCHAR(500) NOT NULL,
          html_content TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          created_by UUID NULL,
          updated_by UUID NULL
        );
      `);

      // ── indexes (all IF NOT EXISTS) ─────────────────────────────────────
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_ppt_active ON payment_plan_templates(is_active);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_flat ON flat_payment_plans(flat_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_booking ON flat_payment_plans(booking_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_customer ON flat_payment_plans(customer_id);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_status ON flat_payment_plans(status);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_ddt_active ON demand_draft_templates(is_active);`);

      // ── Add columns to demand_drafts that may have been added after initial creation ──
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

      // ── Legacy / collections columns on flat_payment_plans ──────────────
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS is_legacy_import BOOLEAN NOT NULL DEFAULT FALSE;`);
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS initial_escalation_level INT NOT NULL DEFAULT 0;`);
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE;`);
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS pause_reminders_until TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE flat_payment_plans ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(64) NULL;`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_is_legacy_import ON flat_payment_plans(is_legacy_import);`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_fpp_import_batch_id ON flat_payment_plans(import_batch_id);`);

      // ── Tone column on demand_draft_templates ───────────────────────────
      await qr.query(`ALTER TABLE demand_draft_templates ADD COLUMN IF NOT EXISTS tone VARCHAR(40) NOT NULL DEFAULT 'ON_TIME';`);
      await qr.query(`CREATE INDEX IF NOT EXISTS idx_ddt_tone ON demand_draft_templates(tone);`);

      // ── Add columns to construction_flat_progress ───────────────────────
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS is_payment_milestone BOOLEAN DEFAULT FALSE;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_triggered BOOLEAN DEFAULT FALSE;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_triggered_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS demand_draft_id UUID NULL;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS payment_schedule_id UUID NULL;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_approved_by UUID NULL;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_approved_at TIMESTAMP NULL;`);
      await qr.query(`ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT TRUE;`);

      await qr.commitTransaction();
      this.logger.log('Payment plans schema sync completed successfully');

      // Seed the 7 default DD templates (one per tone) if missing. We do
      // this after the commit so the new `tone` column definitely exists
      // before the service tries to read/write it.
      try {
        await this.templateService.seedDefaultTones();
        this.logger.log('Default DD tone templates ensured');
      } catch (err: any) {
        this.logger.warn(
          `Could not seed default DD tone templates (non-fatal): ${err?.message}`,
        );
      }
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error('Failed to synchronize payment plans schema', error as Error);
    } finally {
      await qr.release();
    }
  }
}
