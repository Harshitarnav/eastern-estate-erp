-- ============================================================
-- PRODUCTION SCHEMA DIAGNOSTIC
-- Run this on the production server to see what differs from local.
--
-- SSH to server, then:
--   docker exec -i $(docker ps -q --filter name=postgres) \
--     psql -U eastern_estate -d eastern_estate_erp < check-prod-schema.sql
-- ============================================================

\echo '=== MISSING TABLES (exist in local, not in prod) ==='
SELECT t.table_name
FROM (VALUES
  ('accounts'), ('bank_accounts'), ('bank_statements'), ('budgets'),
  ('expenses'), ('fiscal_years'), ('flat_payment_plans'), ('journal_entries'),
  ('journal_entry_lines'), ('ra_bills'), ('demand_drafts'), ('demand_draft_templates'),
  ('payment_plan_templates'), ('qc_checklists'), ('construction_teams'),
  ('construction_flat_progress'), ('construction_tower_progress'),
  ('construction_development_updates'), ('salary_payments'), ('vendor_payments')
) AS t(table_name)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = t.table_name
);

\echo ''
\echo '=== MISSING COLUMNS IN CRITICAL TABLES ==='

-- payments table
\echo 'payments table:'
SELECT col FROM (VALUES
  ('verified_by'), ('verified_at'), ('is_active'), ('receipt_date'),
  ('notes'), ('milestone_id'), ('created_by'), ('metadata'), ('remarks')
) AS t(col)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='payments' AND column_name=t.col
);

-- flats table
\echo 'flats table:'
SELECT col FROM (VALUES
  ('amenities'), ('flat_code'), ('type'), ('floor'), ('bedrooms'), ('servant_room'),
  ('study_room'), ('pooja_room'), ('flat_checklist'), ('data_completion_pct'),
  ('completeness_status'), ('issues'), ('issues_count'), ('final_price'),
  ('is_available'), ('vastu_compliant'), ('corner_unit'), ('road_facing'),
  ('park_facing'), ('covered_parking'), ('display_order'), ('sale_agreement_url'),
  ('allotment_letter_url'), ('possession_letter_url'), ('payment_plan_url'),
  ('registration_receipt_urls'), ('payment_receipt_urls'), ('demand_letter_urls'),
  ('noc_url'), ('rera_certificate_url'), ('kyc_docs_urls'), ('snag_list_url'),
  ('handover_checklist_url'), ('other_documents'), ('agreement_date'),
  ('registration_date'), ('handover_date'), ('loan_status'), ('handover_status'),
  ('verification_status'), ('verified_at'), ('verified_by'), ('salesperson_id'),
  ('service_contact_id'), ('co_buyer_name'), ('co_buyer_email'), ('co_buyer_phone'),
  ('parking_number'), ('parking_type'), ('storage_id'), ('furnishing_pack'),
  ('appliance_pack'), ('construction_stage'), ('construction_progress'),
  ('last_construction_update')
) AS t(col)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='flats' AND column_name=t.col
);

-- accounts table (entire module)
\echo 'accounts table:'
SELECT col FROM (VALUES
  ('account_code'), ('account_name'), ('account_type'), ('account_category'),
  ('opening_balance'), ('current_balance'), ('is_active'), ('description')
) AS t(col)
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='accounts' AND column_name=t.col
);

\echo ''
\echo '=== COLUMN TYPE MISMATCHES ==='
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='flats'
  AND column_name IN ('amenities', 'images', 'issues', 'flat_checklist')
ORDER BY column_name;

-- Expected:
--  amenities    | ARRAY  | _text   ← text[]
--  images       | text   | text
--  issues       | jsonb  | jsonb
--  flat_checklist | jsonb | jsonb

\echo ''
\echo '=== ENUM TYPES PRESENT ==='
SELECT typname FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;

\echo ''
\echo '=== DONE - share this output to diagnose missing migrations ==='
