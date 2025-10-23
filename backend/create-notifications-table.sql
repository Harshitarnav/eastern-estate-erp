-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target User (specific user or null for role/department-based)
    user_id UUID,
    
    -- Role-Based Targeting (comma-separated role names)
    target_roles TEXT,
    
    -- Department-Based Targeting (comma-separated department names)
    target_departments TEXT,
    
    -- Notification Content
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT')),
    category VARCHAR(50) DEFAULT 'SYSTEM' CHECK (category IN ('BOOKING', 'PAYMENT', 'LEAD', 'CONSTRUCTION', 'EMPLOYEE', 'CUSTOMER', 'ACCOUNTING', 'SYSTEM', 'TASK', 'REMINDER')),
    
    -- Action Link (optional)
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Related Entity Reference
    related_entity_id UUID,
    related_entity_type VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Email Notification
    should_send_email BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority
    priority INTEGER DEFAULT 0,
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB,
    
    -- System Fields
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_target_roles ON notifications USING gin(to_tsvector('english', target_roles));
CREATE INDEX IF NOT EXISTS idx_notifications_target_departments ON notifications USING gin(to_tsvector('english', target_departments));
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Insert sample notifications (optional)
INSERT INTO notifications (title, message, type, category, target_roles, should_send_email, priority) VALUES
('Welcome to Eastern Estate ERP', 'Welcome to the Eastern Estate ERP system! Explore the features and start managing your real estate business efficiently.', 'INFO', 'SYSTEM', 'Admin,Manager', false, 5),
('New Feature: Notifications', 'We have launched a new notifications system to keep you updated on important events across the platform.', 'SUCCESS', 'SYSTEM', 'Admin,Manager,Sales Manager', false, 3);

COMMENT ON TABLE notifications IS 'Stores in-app notifications for users based on their roles and departments';
COMMENT ON COLUMN notifications.target_roles IS 'Comma-separated role names to target (e.g., "Admin,Sales Manager")';
COMMENT ON COLUMN notifications.target_departments IS 'Comma-separated department names to target (e.g., "SALES,MARKETING")';
COMMENT ON COLUMN notifications.metadata IS 'Additional metadata in JSON format';
