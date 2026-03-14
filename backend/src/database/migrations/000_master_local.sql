-- ============================================================================
-- MASTER LOCAL SETUP MIGRATION
-- Eastern Estate ERP
-- Run once after the initial database-schema.sql to apply ALL missing
-- tables and columns that are NOT auto-created by the backend schema-sync services.
--
-- Safe to re-run: every statement uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
--
-- Run with:
--   Get-Content backend\src\database\migrations\000_master_local_setup.sql | docker exec -i erp-postgres psql -U eastern_estate -d eastern_estate_erp
-- ============================================================================

-- ============================================================================
-- 1. EMPLOYEES — profile_picture column (add-employee-profile-picture.sql)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'profile_picture'
  ) THEN
    ALTER TABLE employees ADD COLUMN profile_picture TEXT NULL;
    RAISE NOTICE 'Column profile_picture added to employees';
  ELSE
    RAISE NOTICE 'Column profile_picture already exists in employees';
  END IF;
END $$;

-- ============================================================================
-- 2. FLATS — construction tracking columns (migration 002)
-- ============================================================================
ALTER TABLE flats
  ADD COLUMN IF NOT EXISTS construction_stage    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS construction_progress DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_construction_update TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_flats_construction_stage    ON flats(construction_stage);
CREATE INDEX IF NOT EXISTS idx_flats_construction_progress ON flats(construction_progress);

-- ============================================================================
-- 3. FLATS — payment_plan_id (migration 001 item 7; NOT in FlatsSchemaSyncService)
-- ============================================================================
ALTER TABLE flats
  ADD COLUMN IF NOT EXISTS payment_plan_id UUID;

CREATE INDEX IF NOT EXISTS idx_flats_payment_plan ON flats(payment_plan_id);

-- ============================================================================
-- 4. USERS — email domain columns (migration 003 partial; may already exist)
-- ============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_domain      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS allowed_domain    VARCHAR(100) DEFAULT 'eecd.in',
  ADD COLUMN IF NOT EXISTS is_domain_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email_domain ON users(email_domain);

-- Populate email_domain for any existing users
UPDATE users
SET email_domain = SUBSTRING(email FROM '@(.*)$')
WHERE email IS NOT NULL AND email_domain IS NULL;

UPDATE users
SET is_domain_verified = TRUE
WHERE email_domain = 'eecd.in' AND is_domain_verified = FALSE;

-- ============================================================================
-- 5. USER_PROPERTY_ACCESS table (migration 003 partial)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_property_access (
  id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID      NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  role        VARCHAR(50) NOT NULL,
  is_active   BOOLEAN   DEFAULT TRUE,
  assigned_by UUID      REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_property_role UNIQUE(user_id, property_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_property_access_user     ON user_property_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_property_access_property ON user_property_access(property_id);
CREATE INDEX IF NOT EXISTS idx_user_property_access_role     ON user_property_access(role);
CREATE INDEX IF NOT EXISTS idx_user_property_access_active   ON user_property_access(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 6. PROPERTY_ROLE_TEMPLATES table (migration 003 partial)
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_role_templates (
  id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID      NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  role           VARCHAR(50) NOT NULL,
  email_pattern  VARCHAR(255),
  auto_assign    BOOLEAN   DEFAULT FALSE,
  description    TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_property_role_template UNIQUE(property_id, role, email_pattern)
);

CREATE INDEX IF NOT EXISTS idx_property_role_templates_property ON property_role_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_property_role_templates_auto     ON property_role_templates(auto_assign) WHERE auto_assign = TRUE;

-- ============================================================================
-- 7. ROLES — ensure the 8 simplified roles exist (migration 004 safe subset)
-- ============================================================================
INSERT INTO roles (name, display_name, description, is_system, is_active) VALUES
  ('super_admin',       'Super Admin',       'Full system access',                        TRUE, TRUE),
  ('admin',             'Admin',             'Administrative access',                      TRUE, TRUE),
  ('hr',                'HR',                'Human Resources access',                     TRUE, TRUE),
  ('construction_team', 'Construction Team', 'Construction module access',                 TRUE, TRUE),
  ('marketing_team',    'Marketing Team',    'Marketing module access',                    TRUE, TRUE),
  ('sales_team',        'Sales Team',        'Sales and leads access',                     TRUE, TRUE),
  ('staff',             'Staff',             'General staff access',                       TRUE, TRUE),
  ('customer',          'Customer',          'Customer portal access',                     TRUE, TRUE),
  ('GM_SALES',          'GM Sales',          'GM Sales for specific property',             TRUE, TRUE),
  ('GM_MARKETING',      'GM Marketing',      'GM Marketing for specific property',         TRUE, TRUE),
  ('GM_CONSTRUCTION',   'GM Construction',   'GM Construction for specific property',      TRUE, TRUE),
  ('PROPERTY_ADMIN',    'Property Admin',    'Full access to specific property',           TRUE, TRUE),
  ('PROPERTY_VIEWER',   'Property Viewer',   'Read-only access to specific property',      TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 8. CHAT TABLES (create-chat-tables.sql — NOT in any schema-sync service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_groups (
  id                      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    VARCHAR(200) NOT NULL,
  description             TEXT,
  group_type              VARCHAR(50) NOT NULL DEFAULT 'GROUP',
  avatar_url              VARCHAR(500),
  created_by_employee_id  UUID,
  is_active               BOOLEAN   DEFAULT TRUE,
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_group_id UUID      NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  employee_id   UUID      NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role          VARCHAR(50) DEFAULT 'MEMBER',
  joined_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at  TIMESTAMP,
  is_active     BOOLEAN   DEFAULT TRUE,
  CONSTRAINT unique_group_employee UNIQUE(chat_group_id, employee_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id                    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_group_id         UUID      NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  sender_employee_id    UUID      NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  message_text          TEXT      NOT NULL,
  mentioned_employee_ids TEXT[],
  reply_to_message_id   UUID      REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited             BOOLEAN   DEFAULT FALSE,
  edited_at             TIMESTAMP,
  is_deleted            BOOLEAN   DEFAULT FALSE,
  deleted_at            TIMESTAMP,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_attachments (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID      NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name   VARCHAR(500) NOT NULL,
  file_path   VARCHAR(1000) NOT NULL,
  file_type   VARCHAR(100) NOT NULL,
  file_size   BIGINT    NOT NULL,
  mime_type   VARCHAR(200),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_groups_type       ON chat_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_chat_groups_active     ON chat_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants_group ON chat_participants(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_emp   ON chat_participants(employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group    ON chat_messages(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender   ON chat_messages(sender_employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created  ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_msg   ON chat_attachments(message_id);

-- ============================================================================
-- 9. BANK_ACCOUNTS table (accounting module — NOT in SchemaSyncService)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id               UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number   VARCHAR(100) UNIQUE NOT NULL,
  account_name     VARCHAR(255) NOT NULL,
  bank_name        VARCHAR(255) NOT NULL,
  branch_name      VARCHAR(255) NOT NULL,
  ifsc_code        VARCHAR(50)  NOT NULL,
  account_type     VARCHAR(50)  NOT NULL,
  opening_balance  DECIMAL(15,2) DEFAULT 0,
  current_balance  DECIMAL(15,2) DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  description      TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. BANK_STATEMENTS table (accounting module — NOT in SchemaSyncService)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_statements (
  id                        UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id           UUID      NOT NULL REFERENCES bank_accounts(id),
  statement_date            DATE      NOT NULL,
  transaction_date          DATE      NOT NULL,
  transaction_id            VARCHAR(255) NOT NULL,
  description               TEXT      NOT NULL,
  reference_number          VARCHAR(255),
  debit_amount              DECIMAL(15,2) DEFAULT 0,
  credit_amount             DECIMAL(15,2) DEFAULT 0,
  balance                   DECIMAL(15,2) DEFAULT 0,
  transaction_type          VARCHAR(100),
  is_reconciled             BOOLEAN DEFAULT FALSE,
  reconciled_with_entry_id  VARCHAR(255),
  reconciled_date           DATE,
  uploaded_file             VARCHAR(500),
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_statements_account ON bank_statements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_date    ON bank_statements(statement_date);

-- ============================================================================
-- DONE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Master local setup migration complete.';
END $$;
