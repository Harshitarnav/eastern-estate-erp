-- v012: Make optional employee columns nullable to match DTO
-- Safe to re-run (DROP NOT NULL on already-nullable column is a no-op)

ALTER TABLE employees ALTER COLUMN phone_number    DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN date_of_birth   DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN gender          DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN department      DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN designation     DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN employment_type DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN joining_date    DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN current_address DROP NOT NULL;

-- Add defaults to salary decimals so they never fail on omission
ALTER TABLE employees ALTER COLUMN basic_salary  SET DEFAULT 0;
ALTER TABLE employees ALTER COLUMN gross_salary  SET DEFAULT 0;
ALTER TABLE employees ALTER COLUMN net_salary    SET DEFAULT 0;

-- Update any existing NULL salary rows to 0
UPDATE employees SET basic_salary = 0 WHERE basic_salary IS NULL;
UPDATE employees SET gross_salary = 0 WHERE gross_salary IS NULL;
UPDATE employees SET net_salary   = 0 WHERE net_salary   IS NULL;
