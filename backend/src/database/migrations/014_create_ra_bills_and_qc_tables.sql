-- ============================================================
-- Migration 014: Create RA Bills and QC Checklists tables
-- Run in psql: \i /path/to/014_create_ra_bills_and_qc_tables.sql
-- ============================================================

BEGIN;

-- ── RA Bills table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ra_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ra_bill_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID NOT NULL,
    construction_project_id UUID NOT NULL,
    property_id UUID,
    bill_date DATE NOT NULL,
    bill_period_start DATE,
    bill_period_end DATE,
    work_description TEXT NOT NULL,
    gross_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    previous_bills_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_this_bill NUMERIC(15, 2) NOT NULL DEFAULT 0,
    retention_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    retention_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    advance_deduction NUMERIC(15, 2) NOT NULL DEFAULT 0,
    other_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
    other_deductions_description VARCHAR(500),
    net_payable NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','SUBMITTED','CERTIFIED','APPROVED','PAID','REJECTED')),
    certified_by UUID,
    certified_at TIMESTAMP WITHOUT TIME ZONE,
    approved_by UUID,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    payment_reference VARCHAR(255),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_ra_bills_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ra_bills_project FOREIGN KEY (construction_project_id) REFERENCES construction_projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ra_bills_project ON ra_bills(construction_project_id);
CREATE INDEX IF NOT EXISTS idx_ra_bills_vendor ON ra_bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ra_bills_status ON ra_bills(status);
CREATE INDEX IF NOT EXISTS idx_ra_bills_date ON ra_bills(bill_date DESC);

-- ── QC Checklists table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS qc_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    construction_project_id UUID NOT NULL,
    phase VARCHAR(30) NOT NULL
        CHECK (phase IN ('FOUNDATION','STRUCTURE','MEP','FINISHING','HANDOVER')),
    inspection_date DATE NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    location_description VARCHAR(500),
    items JSONB NOT NULL DEFAULT '[]',
    defects JSONB NOT NULL DEFAULT '[]',
    overall_result VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (overall_result IN ('PASS','FAIL','PARTIAL','PENDING')),
    notes TEXT,
    next_inspection_date DATE,
    created_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_qc_project FOREIGN KEY (construction_project_id) REFERENCES construction_projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qc_project ON qc_checklists(construction_project_id);
CREATE INDEX IF NOT EXISTS idx_qc_phase ON qc_checklists(phase);
CREATE INDEX IF NOT EXISTS idx_qc_result ON qc_checklists(overall_result);
CREATE INDEX IF NOT EXISTS idx_qc_date ON qc_checklists(inspection_date DESC);

COMMIT;

-- ── Verification ─────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ra_bills')
    THEN RAISE NOTICE 'ra_bills table created successfully';
    ELSE RAISE WARNING 'ra_bills table was NOT created!';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'qc_checklists')
    THEN RAISE NOTICE 'qc_checklists table created successfully';
    ELSE RAISE WARNING 'qc_checklists table was NOT created!';
    END IF;
END $$;
