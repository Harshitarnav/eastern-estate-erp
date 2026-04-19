-- ============================================================
-- v003: Production Schema Sync
-- Adds any columns/tables that production might be missing.
-- FULLY IDEMPOTENT - safe to run multiple times.
-- Run AFTER v002.
--
-- On the server:
--   docker exec -i $(docker ps -q --filter name=postgres) \
--     psql -U eastern_estate -d eastern_estate_erp < v003_prod_schema_sync.sql
-- ============================================================

-- ── payments: missing columns ────────────────────────────────────────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_date DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS remarks TEXT;

\echo '[v003] payments columns ensured'

-- ── flats: missing columns ───────────────────────────────────────────────────
-- Core entity columns that entity has but old schema SQL didn't
ALTER TABLE flats ADD COLUMN IF NOT EXISTS flat_code VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS floor INTEGER;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 2;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 2;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS servant_room BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS study_room BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS pooja_room BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS balcony_area NUMERIC(10,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS registration_charges NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS maintenance_charges NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS parking_charges NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS final_price NUMERIC(15,2) DEFAULT 0;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS expected_possession DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS vastu_compliant BOOLEAN DEFAULT TRUE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS corner_unit BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS road_facing BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS park_facing BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS covered_parking BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS special_features TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS sold_date DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS token_amount NUMERIC(15,2);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS payment_plan TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Data completeness tracking
ALTER TABLE flats ADD COLUMN IF NOT EXISTS flat_checklist JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS data_completion_pct NUMERIC(5,2) DEFAULT 0;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS issues JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS issues_count INTEGER DEFAULT 0;

-- Document URLs
ALTER TABLE flats ADD COLUMN IF NOT EXISTS sale_agreement_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS allotment_letter_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS possession_letter_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS payment_plan_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS registration_receipt_urls JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS payment_receipt_urls JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS demand_letter_urls JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS noc_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS rera_certificate_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS kyc_docs_urls JSONB;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS snag_list_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS handover_checklist_url TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS other_documents JSONB;

-- Status & dates
ALTER TABLE flats ADD COLUMN IF NOT EXISTS agreement_date DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS registration_date DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS handover_date DATE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS loan_status VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE flats ADD COLUMN IF NOT EXISTS handover_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE flats ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE flats ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Contacts
ALTER TABLE flats ADD COLUMN IF NOT EXISTS salesperson_id UUID;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS service_contact_id UUID;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS co_buyer_name TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS co_buyer_email TEXT;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS co_buyer_phone TEXT;

-- Inventory
ALTER TABLE flats ADD COLUMN IF NOT EXISTS parking_number VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS parking_type VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS storage_id VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS furnishing_pack VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS appliance_pack BOOLEAN DEFAULT FALSE;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS payment_plan_id UUID;

-- Construction tracking
ALTER TABLE flats ADD COLUMN IF NOT EXISTS construction_stage VARCHAR(50);
ALTER TABLE flats ADD COLUMN IF NOT EXISTS construction_progress NUMERIC(5,2) DEFAULT 0;
ALTER TABLE flats ADD COLUMN IF NOT EXISTS last_construction_update TIMESTAMP;

\echo '[v003] flats columns ensured'

-- ── flats: completeness_status enum ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_completeness_status_enum') THEN
    CREATE TYPE data_completeness_status_enum AS ENUM (
      'NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'NEEDS_REVIEW'
    );
    RAISE NOTICE '[v003] created enum data_completeness_status_enum';
  END IF;
END $$;

ALTER TABLE flats ADD COLUMN IF NOT EXISTS completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';

-- ── flats: amenities type fix (from v002, idempotent here too) ───────────────
DO $$
DECLARE col_type TEXT;
BEGIN
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema='public' AND table_name='flats' AND column_name='amenities';
  IF col_type = 'text' THEN
    ALTER TABLE flats ALTER COLUMN amenities TYPE text[]
      USING CASE WHEN amenities IS NULL OR trim(amenities)='' THEN NULL
                 ELSE string_to_array(amenities, ',') END;
    RAISE NOTICE '[v003] flats.amenities: TEXT → text[]';
  ELSIF col_type = 'jsonb' THEN
    ALTER TABLE flats ADD COLUMN amenities_new text[];
    UPDATE flats SET amenities_new = (
      SELECT array_agg(v) FROM jsonb_array_elements_text(amenities) v
    ) WHERE amenities IS NOT NULL AND jsonb_typeof(amenities)='array';
    ALTER TABLE flats DROP COLUMN amenities;
    ALTER TABLE flats RENAME COLUMN amenities_new TO amenities;
    RAISE NOTICE '[v003] flats.amenities: JSONB → text[]';
  ELSE
    RAISE NOTICE '[v003] flats.amenities: already text[], OK';
  END IF;
END $$;

-- ── flats: images type fix ───────────────────────────────────────────────────
DO $$
DECLARE col_type TEXT;
BEGIN
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema='public' AND table_name='flats' AND column_name='images';
  IF col_type = 'jsonb' THEN
    ALTER TABLE flats ALTER COLUMN images TYPE text
      USING CASE WHEN images IS NULL THEN NULL
                 WHEN jsonb_typeof(images)='array' THEN
                   (SELECT string_agg(v,',') FROM jsonb_array_elements_text(images) v)
                 ELSE NULL END;
    RAISE NOTICE '[v003] flats.images: JSONB → text';
  ELSE
    RAISE NOTICE '[v003] flats.images: already text, OK';
  END IF;
END $$;

-- ── towers: missing columns ──────────────────────────────────────────────────
ALTER TABLE towers ADD COLUMN IF NOT EXISTS tower_number VARCHAR(50);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS basement_levels INTEGER DEFAULT 0;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_per_floor VARCHAR(50);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS construction_status VARCHAR(50);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS construction_start_date DATE;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS completion_date DATE;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS rera_number VARCHAR(100);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS built_up_area NUMERIC(15,2);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS carpet_area NUMERIC(15,2);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS ceiling_height NUMERIC(10,2);
ALTER TABLE towers ADD COLUMN IF NOT EXISTS vastu_compliant BOOLEAN DEFAULT TRUE;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS special_features TEXT;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS floor_plans JSONB;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS images JSONB;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_planned INTEGER;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS units_defined INTEGER;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS tower_checklist JSONB;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS data_completion_pct NUMERIC(5,2) DEFAULT 0;
ALTER TABLE towers ADD COLUMN IF NOT EXISTS issues_count INTEGER DEFAULT 0;

-- towers completeness_status enum (same type, already created above)
ALTER TABLE towers ADD COLUMN IF NOT EXISTS data_completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';

\echo '[v003] towers columns ensured'

-- ── salary_payments: no known missing columns ────────────────────────────────
-- Already matches schema.sql

-- ── ra_bills: journal_entry_id (accounting integration) ─────────────────────
ALTER TABLE ra_bills ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- ── vendor_payments: journal_entry_id (accounting integration) ───────────────
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS journal_entry_id UUID;

-- ── expenses: journal_entry_id ───────────────────────────────────────────────
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS journal_entry_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account_id UUID;

\echo '[v003] accounting integration columns ensured'

-- ── properties: missing columns ──────────────────────────────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_towers_planned INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_units_planned INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS inventory_checklist JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS data_completion_pct NUMERIC(5,2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gstin VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS account_name VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS upi_id VARCHAR(50);

-- properties.data_completeness_status enum
ALTER TABLE properties ADD COLUMN IF NOT EXISTS data_completeness_status data_completeness_status_enum DEFAULT 'NOT_STARTED';

\echo '[v003] properties columns ensured'

-- ── employees: missing columns ───────────────────────────────────────────────
ALTER TABLE employees ADD COLUMN IF NOT EXISTS userId UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role_id UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS secondary_roles UUID[];
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT;

\echo '[v003] employees columns ensured'

-- ── users: missing columns (Google OAuth / domain) ───────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_domain VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_domain VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_domain_verified BOOLEAN DEFAULT FALSE;

\echo '[v003] users columns ensured'

-- ── demand_drafts: missing columns ───────────────────────────────────────────
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS payment_schedule_id UUID;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS flat_payment_plan_id UUID;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS construction_checkpoint_id UUID;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT FALSE;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS template_data JSONB;
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE demand_drafts ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;

\echo '[v003] demand_drafts columns ensured'

-- ── bookings: missing columns ─────────────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS loan_status VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS token_paid_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS token_receipt_number VARCHAR(100);

\echo '[v003] bookings columns ensured'

-- ── construction_flat_progress: accounting columns ────────────────────────────
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS demand_draft_id UUID;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS payment_schedule_id UUID;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_approved_by UUID;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS milestone_approved_at TIMESTAMP;
ALTER TABLE construction_flat_progress ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;

\echo '[v003] construction_flat_progress columns ensured'

-- ── FINAL VERIFICATION ────────────────────────────────────────────────────────
\echo ''
\echo '=== v003 COMPLETE. Verifying critical columns ==='

SELECT 'payments.verified_by' AS check, 
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='payments' AND column_name='verified_by')
  THEN 'OK' ELSE 'MISSING' END AS status
UNION ALL
SELECT 'flats.amenities (text[])',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='flats' AND column_name='amenities' AND udt_name='_text')
  THEN 'OK' ELSE 'WRONG TYPE OR MISSING' END
UNION ALL
SELECT 'flats.flat_code',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='flats' AND column_name='flat_code')
  THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'flats.type',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='flats' AND column_name='type')
  THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'ra_bills.journal_entry_id',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='ra_bills' AND column_name='journal_entry_id')
  THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'towers.tower_number',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns 
    WHERE table_name='towers' AND column_name='tower_number')
  THEN 'OK' ELSE 'MISSING' END;
