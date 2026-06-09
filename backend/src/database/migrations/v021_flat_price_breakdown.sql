-- v021: Flat price breakdown — tagged Misc / Tax line-items
--
-- The flat's base_price represents the Primary (construction) cost. The Misc
-- and Tax components of the inventory price are now itemised with tags so the
-- same Primary / Miscellaneous / Tax distinction used for payments and demand
-- drafts is defined once at the inventory level and flows into bookings.
--
-- Additive only: all 8 existing pricing columns (base_price, total_price,
-- final_price, parking_charges, registration_charges, maintenance_charges,
-- discount_amount, price_per_sqft) are left intact. total_price / final_price
-- remain the authoritative totals read by reports and inventory valuation.

ALTER TABLE flats
  ADD COLUMN IF NOT EXISTS misc_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_breakdown  JSONB NOT NULL DEFAULT '[]'::jsonb;
