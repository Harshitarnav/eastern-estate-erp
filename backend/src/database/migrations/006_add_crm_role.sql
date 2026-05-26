-- ============================================================================
-- 006_add_crm_role.sql
-- CRM role: inventory master data + customer/booking paperwork
-- ============================================================================

INSERT INTO roles (name, display_name, description, is_system, is_system_role, is_active)
VALUES (
  'crm',
  'CRM',
  'Maintains towers, flats, customers, bookings, payment plans, and demand paperwork for assigned projects',
  TRUE,
  TRUE,
  TRUE
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_system = TRUE,
  is_system_role = TRUE,
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;
