-- v011: Drop document URL columns from flats table
-- Documents are now managed through the documents module (entity-linked file uploads).
-- These URL columns are no longer used anywhere in the application.

ALTER TABLE flats
  DROP COLUMN IF EXISTS sale_agreement_url,
  DROP COLUMN IF EXISTS allotment_letter_url,
  DROP COLUMN IF EXISTS possession_letter_url,
  DROP COLUMN IF EXISTS payment_plan_url,
  DROP COLUMN IF EXISTS registration_receipt_urls,
  DROP COLUMN IF EXISTS payment_receipt_urls,
  DROP COLUMN IF EXISTS demand_letter_urls,
  DROP COLUMN IF EXISTS noc_url,
  DROP COLUMN IF EXISTS rera_certificate_url,
  DROP COLUMN IF EXISTS kyc_docs_urls,
  DROP COLUMN IF EXISTS snag_list_url,
  DROP COLUMN IF EXISTS handover_checklist_url,
  DROP COLUMN IF EXISTS other_documents;
