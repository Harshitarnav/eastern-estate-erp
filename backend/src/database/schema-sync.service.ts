import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class SchemaSyncService implements OnModuleInit {
  private readonly logger = new Logger(SchemaSyncService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

      await queryRunner.startTransaction();
      await this.ensureAccountingSchema(queryRunner);
      await this.ensureVendorAndPurchaseSchema(queryRunner);
      await this.ensureMarketingSchema(queryRunner);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to synchronize database schema', error as Error);
    } finally {
      await queryRunner.release();
    }
  }

  private async ensureAccountingSchema(queryRunner: QueryRunner) {
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

  private async ensureVendorAndPurchaseSchema(queryRunner: QueryRunner) {
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

  private async ensureVendorColumns(queryRunner: QueryRunner) {
    const columnExists = async (table: string, column: string) => {
      const result = await queryRunner.query(
        `SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
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

  private async ensureMarketingSchema(queryRunner: QueryRunner) {
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

    const campaignsTable = await queryRunner.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = $1`,
      ['campaigns'],
    );

    if (campaignsTable.length > 0) {
      await queryRunner.query(`
        INSERT INTO marketing_campaigns (name, description, status, budget, start_date, end_date)
        SELECT name, description, COALESCE(status, 'PLANNED'), COALESCE(budget, 0), start_date, end_date
        FROM campaigns
        ON CONFLICT DO NOTHING;
      `);
    }
  }
}
