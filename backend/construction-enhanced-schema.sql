-- ============================================================================
-- CONSTRUCTION MODULE - ENHANCED SCHEMA
-- Property-wise reporting, Tower/Flat progress tracking, Development updates
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ADD PROJECT ASSIGNMENTS TABLE (Engineers to Projects mapping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN (
        'PROJECT_MANAGER', 'SITE_ENGINEER', 'SUPERVISOR', 'FOREMAN', 'QUALITY_INSPECTOR'
    )),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    UNIQUE(construction_project_id, employee_id)
);

CREATE INDEX idx_project_assignments_project ON construction_project_assignments(construction_project_id);
CREATE INDEX idx_project_assignments_employee ON construction_project_assignments(employee_id);
CREATE INDEX idx_project_assignments_role ON construction_project_assignments(role);
CREATE INDEX idx_project_assignments_active ON construction_project_assignments(is_active);

-- ============================================================================
-- 2. ADD TOWER PROGRESS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_tower_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    phase VARCHAR(30) NOT NULL CHECK (phase IN (
        'FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'
    )),
    phase_progress DECIMAL(5, 2) DEFAULT 0 CHECK (phase_progress >= 0 AND phase_progress <= 100),
    overall_progress DECIMAL(5, 2) DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(construction_project_id, tower_id, phase)
);

CREATE INDEX idx_tower_progress_project ON construction_tower_progress(construction_project_id);
CREATE INDEX idx_tower_progress_tower ON construction_tower_progress(tower_id);
CREATE INDEX idx_tower_progress_phase ON construction_tower_progress(phase);
CREATE INDEX idx_tower_progress_status ON construction_tower_progress(status);

-- ============================================================================
-- 3. ADD FLAT PROGRESS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_flat_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    phase VARCHAR(30) NOT NULL CHECK (phase IN (
        'FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'
    )),
    phase_progress DECIMAL(5, 2) DEFAULT 0 CHECK (phase_progress >= 0 AND phase_progress <= 100),
    overall_progress DECIMAL(5, 2) DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(construction_project_id, flat_id, phase)
);

CREATE INDEX idx_flat_progress_project ON construction_flat_progress(construction_project_id);
CREATE INDEX idx_flat_progress_flat ON construction_flat_progress(flat_id);
CREATE INDEX idx_flat_progress_phase ON construction_flat_progress(phase);
CREATE INDEX idx_flat_progress_status ON construction_flat_progress(status);

-- ============================================================================
-- 4. ADD DEVELOPMENT UPDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_development_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    update_date DATE NOT NULL DEFAULT CURRENT_DATE,
    update_title VARCHAR(255) NOT NULL,
    update_description TEXT NOT NULL,
    feedback_notes TEXT,
    images JSONB DEFAULT '[]', -- Array of image URLs
    attachments JSONB DEFAULT '[]', -- Array of document URLs
    created_by UUID NOT NULL REFERENCES users(id),
    visibility VARCHAR(20) DEFAULT 'ALL' CHECK (visibility IN (
        'ALL', 'INTERNAL', 'MANAGEMENT_ONLY'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dev_updates_project ON construction_development_updates(construction_project_id);
CREATE INDEX idx_dev_updates_date ON construction_development_updates(update_date);
CREATE INDEX idx_dev_updates_creator ON construction_development_updates(created_by);

-- ============================================================================
-- 5. ENHANCE DAILY PROGRESS REPORTS WITH TODAY'S WORK FEATURES
-- ============================================================================
-- Add columns if they don't exist
ALTER TABLE daily_progress_reports 
    ADD COLUMN IF NOT EXISTS issues_faced TEXT,
    ADD COLUMN IF NOT EXISTS material_requirements TEXT,
    ADD COLUMN IF NOT EXISTS equipment_used TEXT,
    ADD COLUMN IF NOT EXISTS safety_notes TEXT,
    ADD COLUMN IF NOT EXISTS quality_notes TEXT,
    ADD COLUMN IF NOT EXISTS is_today_log BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 6. ADD CONSTRUCTION METRICS TABLE (for dashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS construction_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    construction_project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Progress metrics
    daily_progress_change DECIMAL(5, 2) DEFAULT 0,
    cumulative_progress DECIMAL(5, 2) DEFAULT 0,
    
    -- Resource metrics
    workers_count INTEGER DEFAULT 0,
    equipment_count INTEGER DEFAULT 0,
    
    -- Material metrics
    materials_consumed_value DECIMAL(15, 2) DEFAULT 0,
    materials_wasted_value DECIMAL(15, 2) DEFAULT 0,
    
    -- Budget metrics
    daily_spend DECIMAL(15, 2) DEFAULT 0,
    cumulative_spend DECIMAL(15, 2) DEFAULT 0,
    budget_variance DECIMAL(15, 2) DEFAULT 0,
    
    -- Schedule metrics
    days_behind_schedule INTEGER DEFAULT 0,
    days_ahead_schedule INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(construction_project_id, metric_date)
);

CREATE INDEX idx_metrics_project ON construction_metrics(construction_project_id);
CREATE INDEX idx_metrics_date ON construction_metrics(metric_date);

-- ============================================================================
-- 7. ADD PROPERTY-LEVEL SUMMARY VIEW
-- ============================================================================
CREATE OR REPLACE VIEW construction_property_summary AS
SELECT 
    p.id as property_id,
    p.name as property_name,
    COUNT(DISTINCT cp.id) as total_projects,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.status = 'IN_PROGRESS') as active_projects,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.status = 'COMPLETED') as completed_projects,
    AVG(cp.overall_progress) as average_progress,
    SUM(cp.budget_allocated) as total_budget_allocated,
    SUM(cp.budget_spent) as total_budget_spent,
    COUNT(DISTINCT cpa.employee_id) as total_engineers_assigned
FROM properties p
LEFT JOIN construction_projects cp ON p.id = cp.property_id
LEFT JOIN construction_project_assignments cpa ON cp.id = cpa.construction_project_id AND cpa.is_active = TRUE
GROUP BY p.id, p.name;

-- ============================================================================
-- 8. ADD TOWER-LEVEL SUMMARY VIEW
-- ============================================================================
CREATE OR REPLACE VIEW construction_tower_summary AS
SELECT 
    t.id as tower_id,
    t.name as tower_name,
    t.property_id,
    cp.id as construction_project_id,
    cp.project_name,
    AVG(ctp.overall_progress) as average_progress,
    COUNT(DISTINCT ctp.id) FILTER (WHERE ctp.status = 'COMPLETED') as completed_phases,
    COUNT(DISTINCT ctp.id) FILTER (WHERE ctp.status = 'IN_PROGRESS') as ongoing_phases,
    COUNT(DISTINCT f.id) as total_flats,
    AVG(cfp.overall_progress) as flats_average_progress
FROM towers t
LEFT JOIN construction_projects cp ON t.id = cp.tower_id
LEFT JOIN construction_tower_progress ctp ON cp.id = ctp.construction_project_id AND t.id = ctp.tower_id
LEFT JOIN flats f ON t.id = f.tower_id
LEFT JOIN construction_flat_progress cfp ON cp.id = cfp.construction_project_id AND f.id = cfp.flat_id
GROUP BY t.id, t.name, t.property_id, cp.id, cp.project_name;

-- ============================================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_project_assignments_updated_at BEFORE UPDATE ON construction_project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tower_progress_updated_at BEFORE UPDATE ON construction_tower_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flat_progress_updated_at BEFORE UPDATE ON construction_flat_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dev_updates_updated_at BEFORE UPDATE ON construction_development_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON construction_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. ADD USEFUL FUNCTIONS
-- ============================================================================

-- Function to calculate project overall progress based on tower/flat progress
CREATE OR REPLACE FUNCTION calculate_project_progress(project_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    tower_avg DECIMAL(5,2);
    flat_avg DECIMAL(5,2);
    result DECIMAL(5,2);
BEGIN
    -- Get average tower progress
    SELECT AVG(overall_progress) INTO tower_avg
    FROM construction_tower_progress
    WHERE construction_project_id = project_id;
    
    -- Get average flat progress
    SELECT AVG(overall_progress) INTO flat_avg
    FROM construction_flat_progress
    WHERE construction_project_id = project_id;
    
    -- Return weighted average (70% tower, 30% flat)
    IF tower_avg IS NOT NULL AND flat_avg IS NOT NULL THEN
        result := (tower_avg * 0.7) + (flat_avg * 0.3);
    ELSIF tower_avg IS NOT NULL THEN
        result := tower_avg;
    ELSIF flat_avg IS NOT NULL THEN
        result := flat_avg;
    ELSE
        result := 0;
    END IF;
    
    RETURN ROUND(result, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get engineer's assigned projects
CREATE OR REPLACE FUNCTION get_engineer_projects(engineer_id UUID)
RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR,
    role VARCHAR,
    property_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.project_name,
        cpa.role,
        p.name
    FROM construction_project_assignments cpa
    JOIN construction_projects cp ON cpa.construction_project_id = cp.id
    JOIN properties p ON cp.property_id = p.id
    WHERE cpa.employee_id = engineer_id
    AND cpa.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. INSERT SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: This assumes you have existing data in properties, towers, flats, employees, users tables
-- Sample data will be added in a separate file

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Construction module enhanced schema created successfully!' as status;

-- Verify new tables
SELECT 
    COUNT(*) FILTER (WHERE tablename = 'construction_project_assignments') as assignments_table,
    COUNT(*) FILTER (WHERE tablename = 'construction_tower_progress') as tower_progress_table,
    COUNT(*) FILTER (WHERE tablename = 'construction_flat_progress') as flat_progress_table,
    COUNT(*) FILTER (WHERE tablename = 'construction_development_updates') as dev_updates_table,
    COUNT(*) FILTER (WHERE tablename = 'construction_metrics') as metrics_table
FROM pg_tables 
WHERE schemaname = 'public';
