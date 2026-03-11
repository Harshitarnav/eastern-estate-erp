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
var SchemaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let SchemaSyncService = SchemaSyncService_1 = class SchemaSyncService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SchemaSyncService_1.name);
    }
    async onModuleInit() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        }
        finally {
        }
        const runIsolated = async (label, fn) => {
            await queryRunner.startTransaction();
            try {
                await fn(queryRunner);
                await queryRunner.commitTransaction();
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                this.logger.error(`Failed to synchronize ${label} schema`, error);
            }
        };
        try {
            await runIsolated('notifications', (qr) => this.ensureNotificationsSchema(qr));
            await runIsolated('accounting', (qr) => this.ensureAccountingSchema(qr));
            await runIsolated('vendor/purchase', (qr) => this.ensureVendorAndPurchaseSchema(qr));
            await runIsolated('marketing', (qr) => this.ensureMarketingSchema(qr));
            await runIsolated('documents', (qr) => this.ensureDocumentsSchema(qr));
            await runIsolated('company_settings', (qr) => this.ensureCompanySettingsSchema(qr));
            await runIsolated('customers', (qr) => this.ensureCustomersSchema(qr));
            await runIsolated('payments_columns', (qr) => this.ensurePaymentsSchema(qr));
        }
        finally {
            await queryRunner.release();
        }
    }
    async ensureCompanySettingsSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_name  VARCHAR(255) NOT NULL DEFAULT 'Eastern Estate',
        tagline       VARCHAR(255) DEFAULT 'Construction & Development',
        address       TEXT,
        city          VARCHAR(100),
        state         VARCHAR(100),
        pincode       VARCHAR(20),
        phone         VARCHAR(50),
        email         VARCHAR(255),
        website       VARCHAR(255),
        gstin         VARCHAR(50),
        rera_number   VARCHAR(100),
        bank_name     VARCHAR(255),
        account_name  VARCHAR(255),
        account_number VARCHAR(100),
        ifsc_code     VARCHAR(50),
        branch        VARCHAR(255),
        upi_id        VARCHAR(255),
        smtp_host     VARCHAR(255),
        smtp_port     INTEGER DEFAULT 587,
        smtp_user     VARCHAR(255),
        smtp_pass     VARCHAR(255),
        smtp_from     VARCHAR(255),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      INSERT INTO company_settings (company_name, tagline)
      SELECT 'Eastern Estate', 'Construction & Development'
      WHERE NOT EXISTS (SELECT 1 FROM company_settings)
    `);
        const newCols = [
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)`,
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255)`,
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587`,
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255)`,
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR(255)`,
            `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS smtp_from VARCHAR(255)`,
        ];
        for (const sql of newCols) {
            await queryRunner.query(sql);
        }
    }
    async ensureNotificationsSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id             UUID         NULL,
        target_roles        TEXT         NULL,
        target_departments  TEXT         NULL,
        title               VARCHAR(500) NOT NULL,
        message             TEXT         NOT NULL,
        type                TEXT         NOT NULL DEFAULT 'INFO',
        category            TEXT         NOT NULL DEFAULT 'SYSTEM',
        action_url          TEXT         NULL,
        action_label        VARCHAR(100) NULL,
        related_entity_id   UUID         NULL,
        related_entity_type VARCHAR(100) NULL,
        is_read             BOOLEAN      NOT NULL DEFAULT false,
        read_at             TIMESTAMP    NULL,
        should_send_email   BOOLEAN      NOT NULL DEFAULT false,
        email_sent          BOOLEAN      NOT NULL DEFAULT false,
        email_sent_at       TIMESTAMP    NULL,
        priority            INTEGER      NOT NULL DEFAULT 0,
        expires_at          TIMESTAMP    NULL,
        metadata            JSONB        NULL,
        created_by          UUID         NULL,
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read
        ON notifications (user_id, is_read);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_target_roles
        ON notifications (target_roles);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_target_departments
        ON notifications (target_departments);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
        ON notifications (created_at);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_category
        ON notifications (category);
    `);
        this.logger.log('Notifications schema ensured');
    }
    async ensureAccountingSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        account_code VARCHAR(50) UNIQUE NOT NULL,
        account_name VARCHAR(200) NOT NULL,
        account_type VARCHAR(50) NOT NULL,
        account_category VARCHAR(100) NOT NULL,
        parent_account_id UUID,
        is_active BOOLEAN DEFAULT TRUE,
        opening_balance DECIMAL(15,2) DEFAULT 0,
        current_balance DECIMAL(15,2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        entry_number VARCHAR(50) UNIQUE NOT NULL,
        entry_date DATE NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        description TEXT NOT NULL,
        total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
        total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'DRAFT',
        created_by UUID,
        approved_by UUID,
        approved_at TIMESTAMP,
        voided_by UUID,
        voided_at TIMESTAMP,
        void_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES accounts(id),
        debit_amount DECIMAL(15,2) DEFAULT 0,
        credit_amount DECIMAL(15,2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        expense_code VARCHAR(50) UNIQUE NOT NULL,
        expense_category VARCHAR(100) NOT NULL,
        expense_type VARCHAR(100) NOT NULL,
        expense_sub_category VARCHAR(100),
        amount DECIMAL(15,2) NOT NULL,
        expense_date DATE NOT NULL,
        vendor_id UUID,
        employee_id UUID,
        property_id UUID,
        construction_project_id UUID,
        payment_method VARCHAR(50),
        payment_reference VARCHAR(200),
        payment_status VARCHAR(50) DEFAULT 'PENDING',
        description TEXT NOT NULL,
        receipt_url TEXT,
        invoice_number VARCHAR(100),
        invoice_date DATE,
        status VARCHAR(50) DEFAULT 'PENDING',
        approved_by UUID,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        account_id UUID REFERENCES accounts(id),
        journal_entry_id UUID REFERENCES journal_entries(id),
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        budget_name VARCHAR(200) NOT NULL,
        budget_code VARCHAR(50) UNIQUE NOT NULL,
        fiscal_year INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        account_id UUID REFERENCES accounts(id),
        department VARCHAR(100),
        budgeted_amount DECIMAL(15,2) NOT NULL,
        actual_amount DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'DRAFT',
        notes TEXT,
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fiscal_years (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        year INTEGER UNIQUE NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    }
    async ensureVendorAndPurchaseSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_code VARCHAR(50) UNIQUE NOT NULL,
        vendor_name VARCHAR(255),
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone_number VARCHAR(50),
        alternate_phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        gst_number VARCHAR(30),
        pan_number VARCHAR(20),
        bank_name VARCHAR(255),
        bank_account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        materials_supplied JSONB DEFAULT '[]',
        payment_terms TEXT,
        credit_limit DECIMAL(15,2) DEFAULT 0,
        outstanding_amount DECIMAL(15,2) DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vendor_payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        payment_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100),
        status VARCHAR(20) DEFAULT 'PENDING',
        remarks TEXT,
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await this.ensureVendorColumns(queryRunner);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        po_date DATE NOT NULL,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        property_id UUID,
        construction_project_id UUID,
        status VARCHAR(30) DEFAULT 'DRAFT',
        expected_delivery_date DATE,
        actual_delivery_date DATE,
        subtotal DECIMAL(15,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        discount_amount DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL,
        payment_terms VARCHAR(255),
        advance_paid DECIMAL(15,2) DEFAULT 0,
        balance_amount DECIMAL(15,2) DEFAULT 0,
        approved_by UUID,
        approved_at TIMESTAMP,
        delivery_address TEXT,
        delivery_contact VARCHAR(255),
        delivery_phone VARCHAR(20),
        notes TEXT,
        terms_and_conditions TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
        material_id UUID,
        quantity DECIMAL(15,3) NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        subtotal DECIMAL(15,2) NOT NULL,
        tax_percentage DECIMAL(5,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0
      );
    `);
        await queryRunner.query(`
      ALTER TABLE purchase_order_items
        ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS quantity_received DECIMAL(15,3) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS quantity_pending DECIMAL(15,3) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    }
    async ensureVendorColumns(queryRunner) {
        const columnExists = async (table, column) => {
            const result = await queryRunner.query(`SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2`, [table, column]);
            return result.length > 0;
        };
        await queryRunner.query(`
      ALTER TABLE vendors
        ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS materials_supplied JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS outstanding_amount DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
        if (await columnExists('vendors', 'name')) {
            await queryRunner.query(`
        UPDATE vendors SET vendor_name = name
        WHERE vendor_name IS NULL AND name IS NOT NULL;
      `);
        }
        if (await columnExists('vendors', 'phone')) {
            await queryRunner.query(`
        UPDATE vendors SET phone_number = phone
        WHERE phone_number IS NULL AND phone IS NOT NULL;
      `);
        }
        await queryRunner.query(`
      ALTER TABLE vendors
        ALTER COLUMN rating SET DEFAULT 0;
    `);
    }
    async ensureMarketingSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'GENERAL',
        status VARCHAR(50) DEFAULT 'PLANNED',
        budget DECIMAL(15,2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        notes TEXT,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        const campaignsTable = await queryRunner.query(`SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1`, ['campaigns']);
        if (campaignsTable.length > 0) {
            const hasCampaignNameCol = await queryRunner.query(`SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'campaigns'
           AND column_name = 'campaign_name'`);
            const hasNameCol = await queryRunner.query(`SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'campaigns'
           AND column_name = 'name'`);
            if (hasCampaignNameCol.length > 0) {
                const hasCampaignTypeCol = await queryRunner.query(`SELECT 1 FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = 'campaigns'
             AND column_name = 'campaign_type'`);
                const typeExpr = hasCampaignTypeCol.length > 0 ? `COALESCE(campaign_type, 'OTHER')` : `'OTHER'`;
                await queryRunner.query(`
          INSERT INTO marketing_campaigns (name, description, type, status, budget, start_date, end_date)
          SELECT campaign_name, description, ${typeExpr}, COALESCE(status, 'PLANNED'), COALESCE(budget, 0), start_date, end_date
          FROM campaigns
          ON CONFLICT DO NOTHING;
        `);
            }
            else if (hasNameCol.length > 0) {
                const hasTypeCol = await queryRunner.query(`SELECT 1 FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = 'campaigns'
             AND column_name = 'type'`);
                const typeExpr = hasTypeCol.length > 0 ? `COALESCE(type, 'OTHER')` : `'OTHER'`;
                await queryRunner.query(`
          INSERT INTO marketing_campaigns (name, description, type, status, budget, start_date, end_date)
          SELECT name, description, ${typeExpr}, COALESCE(status, 'PLANNED'), COALESCE(budget, 0), start_date, end_date
          FROM campaigns
          ON CONFLICT DO NOTHING;
        `);
            }
        }
    }
    async ensureDocumentsSchema(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(255)  NOT NULL,
        category      VARCHAR(50)   NOT NULL DEFAULT 'OTHER',
        entity_type   VARCHAR(50)   NOT NULL,
        entity_id     UUID          NOT NULL,
        customer_id   UUID          NULL,
        booking_id    UUID          NULL,
        file_url      TEXT          NOT NULL,
        file_name     VARCHAR(255)  NOT NULL,
        mime_type     VARCHAR(100)  NULL,
        file_size     BIGINT        NULL,
        notes         TEXT          NULL,
        uploaded_by   UUID          NULL,
        created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_entity
        ON documents (entity_type, entity_id);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_customer
        ON documents (customer_id) WHERE customer_id IS NOT NULL;
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_booking
        ON documents (booking_id) WHERE booking_id IS NOT NULL;
    `);
    }
    async ensureCustomersSchema(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS customer_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS full_name     VARCHAR(255),
        ADD COLUMN IF NOT EXISTS email         VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone_number  VARCHAR(20),
        ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS date_of_birth DATE,
        ADD COLUMN IF NOT EXISTS gender        VARCHAR(20),
        ADD COLUMN IF NOT EXISTS occupation    VARCHAR(100);
    `);
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS company_name  VARCHAR(255),
        ADD COLUMN IF NOT EXISTS address_line1 TEXT,
        ADD COLUMN IF NOT EXISTS address_line2 TEXT,
        ADD COLUMN IF NOT EXISTS city          VARCHAR(100),
        ADD COLUMN IF NOT EXISTS state         VARCHAR(100),
        ADD COLUMN IF NOT EXISTS pincode       VARCHAR(10),
        ADD COLUMN IF NOT EXISTS country       VARCHAR(100) DEFAULT 'India';
    `);
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS pan_number    VARCHAR(20),
        ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(20),
        ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS kyc_status    VARCHAR(50),
        ADD COLUMN IF NOT EXISTS kyc_documents JSONB;
    `);
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS notes         TEXT,
        ADD COLUMN IF NOT EXISTS metadata      JSONB,
        ADD COLUMN IF NOT EXISTS requirement_type VARCHAR,
        ADD COLUMN IF NOT EXISTS property_preference VARCHAR,
        ADD COLUMN IF NOT EXISTS tentative_purchase_timeframe VARCHAR(100),
        ADD COLUMN IF NOT EXISTS lead_source   VARCHAR(100),
        ADD COLUMN IF NOT EXISTS assigned_sales_person VARCHAR(255);
    `);
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS credit_limit        DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS total_bookings      INTEGER,
        ADD COLUMN IF NOT EXISTS total_purchases     DECIMAL(15,2);
    `);
        await queryRunner.query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'first_name'
             AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE customers ALTER COLUMN first_name DROP NOT NULL;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'last_name'
             AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE customers ALTER COLUMN last_name DROP NOT NULL;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'phone'
             AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'first_name'
        ) THEN
          UPDATE customers
             SET full_name = TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,''))
           WHERE (full_name IS NULL OR full_name = '')
             AND (first_name IS NOT NULL OR last_name IS NOT NULL);
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'phone'
        ) THEN
          UPDATE customers
             SET phone_number = phone
           WHERE phone_number IS NULL AND phone IS NOT NULL;
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'customers' AND column_name = 'address'
        ) THEN
          UPDATE customers
             SET address_line1 = address
           WHERE address_line1 IS NULL AND address IS NOT NULL;
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      UPDATE customers
         SET customer_code = 'CUST-' || SUBSTRING(id::text, 1, 8)
       WHERE customer_code IS NULL;
    `);
        await queryRunner.query(`
      UPDATE customers
         SET full_name = COALESCE(
               NULLIF(TRIM(full_name), ''),
               SPLIT_PART(email, '@', 1),
               'Customer'
             )
       WHERE full_name IS NULL OR full_name = '';
    `);
        this.logger.log('Customers schema ensured — all columns up to date');
    }
    async ensurePaymentsSchema(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS payment_number   VARCHAR UNIQUE,
        ADD COLUMN IF NOT EXISTS payment_type     VARCHAR,
        ADD COLUMN IF NOT EXISTS payment_mode     VARCHAR,
        ADD COLUMN IF NOT EXISTS bank_name        VARCHAR,
        ADD COLUMN IF NOT EXISTS transaction_id   VARCHAR,
        ADD COLUMN IF NOT EXISTS cheque_number    VARCHAR,
        ADD COLUMN IF NOT EXISTS cheque_date      DATE,
        ADD COLUMN IF NOT EXISTS utr_number       VARCHAR,
        ADD COLUMN IF NOT EXISTS payment_status   VARCHAR DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS receipt_number   VARCHAR,
        ADD COLUMN IF NOT EXISTS notes            TEXT,
        ADD COLUMN IF NOT EXISTS milestone_id     UUID,
        ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT TRUE;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'payments' AND column_name = 'type'
        ) THEN
          UPDATE payments SET payment_type = type WHERE payment_type IS NULL AND type IS NOT NULL;
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name = 'payments' AND column_name = 'payment_method'
        ) THEN
          UPDATE payments SET payment_mode = payment_method WHERE payment_mode IS NULL AND payment_method IS NOT NULL;
        END IF;
      END $$;
    `);
        this.logger.log('Payments schema ensured — all columns up to date');
    }
};
exports.SchemaSyncService = SchemaSyncService;
exports.SchemaSyncService = SchemaSyncService = SchemaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SchemaSyncService);
//# sourceMappingURL=schema-sync.service.js.map