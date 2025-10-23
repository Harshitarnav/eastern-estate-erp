-- Complete fix for chat system to work without employee table dependencies
-- This removes all foreign key constraints to the employees table

-- 1. Fix chat_groups table
ALTER TABLE chat_groups 
DROP CONSTRAINT IF EXISTS fk_chat_group_creator;

ALTER TABLE chat_groups 
ALTER COLUMN created_by_employee_id DROP NOT NULL;

-- Don't add the foreign key back - just store the ID as a string

-- 2. Fix chat_participants table  
ALTER TABLE chat_participants
DROP CONSTRAINT IF EXISTS fk_chat_participant_employee;

ALTER TABLE chat_participants
ALTER COLUMN employee_id DROP NOT NULL;

-- Don't add the foreign key back - just store the ID as a string

-- 3. Fix chat_messages table
ALTER TABLE chat_messages
DROP CONSTRAINT IF EXISTS fk_chat_message_sender;

ALTER TABLE chat_messages
ALTER COLUMN sender_employee_id DROP NOT NULL;

-- Don't add the foreign key back - just store the ID as a string

-- Verify all constraints are removed
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid IN ('chat_groups'::regclass, 'chat_participants'::regclass, 'chat_messages'::regclass)
AND conname LIKE '%employee%';
