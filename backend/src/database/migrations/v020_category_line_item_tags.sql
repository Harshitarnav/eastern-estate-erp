-- v020: Tagged line-items for Miscellaneous and Tax categories
--
-- The Misc and Tax buckets often bundle several distinct charges
-- (parking + lift + club membership; GST + stamp duty adjustment).
-- Any amount collected above the base/primary price is classified into
-- Misc or Tax and carries a tag describing what it truly is.
--
-- Each breakdown column holds a JSON array of { "label": string, "amount": number }.
-- The sum of a breakdown equals the corresponding category total
-- (misc_amount / tax_amount), which is enforced in the service layer.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS misc_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_breakdown  JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE demand_drafts
  ADD COLUMN IF NOT EXISTS misc_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_breakdown  JSONB NOT NULL DEFAULT '[]'::jsonb;
