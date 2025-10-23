-- Fix chat_groups foreign key constraint to allow nullable created_by_employee_id
-- This allows chat groups to be created even if the employee doesn't exist in employees table

-- Drop the existing foreign key constraint
ALTER TABLE chat_groups 
DROP CONSTRAINT IF EXISTS fk_chat_group_creator;

-- Alter the column to allow NULL
ALTER TABLE chat_groups 
ALTER COLUMN created_by_employee_id DROP NOT NULL;

-- Add the foreign key constraint back with ON DELETE SET NULL
ALTER TABLE chat_groups 
ADD CONSTRAINT fk_chat_group_creator 
FOREIGN KEY (created_by_employee_id) 
REFERENCES employees(id) 
ON DELETE SET NULL;

-- Verify the changes
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'chat_groups'::regclass
AND conname = 'fk_chat_group_creator';
