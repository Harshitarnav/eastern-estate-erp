-- =============================================
-- EASTERN ESTATE ERP - CHAT SYSTEM SCHEMA
-- =============================================
-- Creates tables for group chats, direct messages, 
-- participants, messages, and attachments
-- =============================================

-- Chat Groups Table
CREATE TABLE IF NOT EXISTS chat_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    group_type VARCHAR(50) NOT NULL DEFAULT 'GROUP', -- GROUP, DIRECT
    avatar_url VARCHAR(500),
    created_by_employee_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_chat_group_creator FOREIGN KEY (created_by_employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE
);

-- Chat Participants Table
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_group_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER', -- ADMIN, MEMBER
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_chat_participant_group FOREIGN KEY (chat_group_id) 
        REFERENCES chat_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_participant_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT unique_group_employee UNIQUE (chat_group_id, employee_id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_group_id UUID NOT NULL,
    sender_employee_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    mentioned_employee_ids TEXT[], -- Array of employee IDs for @mentions
    reply_to_message_id UUID,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_chat_message_group FOREIGN KEY (chat_group_id) 
        REFERENCES chat_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_sender FOREIGN KEY (sender_employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_reply FOREIGN KEY (reply_to_message_id) 
        REFERENCES chat_messages(id) ON DELETE SET NULL
);

-- Chat Attachments Table
CREATE TABLE IF NOT EXISTS chat_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(200),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_chat_attachment_message FOREIGN KEY (message_id) 
        REFERENCES chat_messages(id) ON DELETE CASCADE
);

-- Chat Message Reactions Table (Optional - for future enhancement)
CREATE TABLE IF NOT EXISTS chat_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    reaction_type VARCHAR(50) NOT NULL, -- LIKE, LOVE, LAUGH, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reaction_message FOREIGN KEY (message_id) 
        REFERENCES chat_messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_reaction_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT unique_message_employee_reaction UNIQUE (message_id, employee_id, reaction_type)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Chat Groups indexes
CREATE INDEX IF NOT EXISTS idx_chat_groups_created_by ON chat_groups(created_by_employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_groups_type ON chat_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_chat_groups_active ON chat_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_groups_created_at ON chat_groups(created_at DESC);

-- Chat Participants indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_group ON chat_participants(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_employee ON chat_participants(employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants_last_read ON chat_participants(last_read_at);

-- Chat Messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_employee_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted ON chat_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply ON chat_messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_mentions ON chat_messages USING GIN (mentioned_employee_ids);

-- Chat Attachments indexes
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_uploaded ON chat_attachments(uploaded_at DESC);

-- Chat Reactions indexes
CREATE INDEX IF NOT EXISTS idx_chat_reactions_message ON chat_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_employee ON chat_message_reactions(employee_id);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =============================================

-- Update chat_groups.updated_at trigger
CREATE OR REPLACE FUNCTION update_chat_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_groups_updated_at
BEFORE UPDATE ON chat_groups
FOR EACH ROW
EXECUTE FUNCTION update_chat_groups_updated_at();

-- Update chat_messages.updated_at trigger
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_messages_updated_at();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert a general group chat (will need actual employee IDs from your database)
-- Replace these UUIDs with actual employee IDs from your employees table
-- Example:
-- INSERT INTO chat_groups (id, name, description, group_type, created_by_employee_id)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'General Discussion',
--     'Company-wide general discussion group',
--     'GROUP',
--     'your-employee-uuid-here'
-- );

-- =============================================
-- VIEWS FOR EASY QUERYING
-- =============================================

-- View for unread message counts per employee
CREATE OR REPLACE VIEW chat_unread_counts AS
SELECT 
    cp.employee_id,
    cp.chat_group_id,
    cg.name as group_name,
    COUNT(cm.id) as unread_count
FROM chat_participants cp
JOIN chat_groups cg ON cp.chat_group_id = cg.id
LEFT JOIN chat_messages cm ON cm.chat_group_id = cp.chat_group_id 
    AND cm.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamp)
    AND cm.sender_employee_id != cp.employee_id
    AND cm.is_deleted = FALSE
WHERE cp.is_active = TRUE AND cg.is_active = TRUE
GROUP BY cp.employee_id, cp.chat_group_id, cg.name;

-- View for recent messages with sender info
CREATE OR REPLACE VIEW chat_recent_messages AS
SELECT 
    cm.id,
    cm.chat_group_id,
    cm.message_text,
    cm.created_at,
    cm.sender_employee_id,
    e.full_name as sender_name,
    e.email as sender_email,
    cg.name as group_name,
    cg.group_type,
    (SELECT COUNT(*) FROM chat_attachments WHERE message_id = cm.id) as attachment_count
FROM chat_messages cm
JOIN employees e ON cm.sender_employee_id = e.id
JOIN chat_groups cg ON cm.chat_group_id = cg.id
WHERE cm.is_deleted = FALSE
ORDER BY cm.created_at DESC;

-- =============================================
-- GRANT PERMISSIONS (adjust as needed)
-- =============================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_database_user;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Chat system tables created successfully!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - chat_groups';
    RAISE NOTICE '  - chat_participants';
    RAISE NOTICE '  - chat_messages';
    RAISE NOTICE '  - chat_attachments';
    RAISE NOTICE '  - chat_message_reactions';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes: 16 performance indexes created';
    RAISE NOTICE 'Triggers: 2 auto-update triggers created';
    RAISE NOTICE 'Views: 2 helper views created';
    RAISE NOTICE '=================================================';
END $$;
