-- ============================================================================
-- EASTERN ESTATE ERP - TELEPHONY MODULE
-- Complete database schema for IVR, Round-Robin, Number Masking & AI
-- Provider: Exotel
-- ============================================================================

-- Create telephony schema
CREATE SCHEMA IF NOT EXISTS telephony;

-- ============================================================================
-- 1. AGENT AVAILABILITY TRACKING
-- ============================================================================
CREATE TABLE telephony.agent_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id), -- Agent assigned to specific property
    
    -- Availability status
    is_available BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_CALL, BREAK, OFFLINE
    
    -- Contact details
    phone_number VARCHAR(20) NOT NULL,
    alternate_number VARCHAR(20),
    extension VARCHAR(10),
    exotel_agent_id VARCHAR(100), -- Exotel's internal agent ID
    
    -- Capacity management
    max_concurrent_calls INTEGER DEFAULT 2,
    current_calls INTEGER DEFAULT 0,
    
    -- Daily statistics
    total_calls_today INTEGER DEFAULT 0,
    total_duration_today INTEGER DEFAULT 0, -- in seconds
    successful_calls_today INTEGER DEFAULT 0,
    missed_calls_today INTEGER DEFAULT 0,
    
    -- Round-robin tracking
    last_call_assigned_at TIMESTAMP,
    last_call_completed_at TIMESTAMP,
    priority_score INTEGER DEFAULT 100, -- Higher = more priority (for skill-based routing)
    
    -- Break management
    break_start_time TIMESTAMP,
    break_duration INTEGER, -- in minutes
    
    -- Metadata
    notes TEXT,
    settings JSONB DEFAULT '{}', -- Custom agent settings
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('AVAILABLE', 'ON_CALL', 'BREAK', 'OFFLINE')),
    CONSTRAINT valid_concurrent_calls CHECK (current_calls >= 0 AND current_calls <= max_concurrent_calls)
);

-- ============================================================================
-- 2. CALL LOGS (Main table for all call records)
-- ============================================================================
CREATE TABLE telephony.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Exotel identification
    call_sid VARCHAR(100) UNIQUE NOT NULL, -- Exotel's CallSid
    conversation_uuid VARCHAR(100), -- Exotel's conversation UUID
    
    -- Call direction and type
    direction VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND
    call_type VARCHAR(50) DEFAULT 'GENERAL', -- SALES, SUPPORT, GENERAL, CALLBACK, PROPERTY_INQUIRY
    
    -- Participants
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    masked_number VARCHAR(20), -- Virtual number shown (Exotel number)
    customer_id UUID REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    property_id UUID REFERENCES properties(id),
    assigned_agent_id UUID REFERENCES employees(id),
    
    -- Call flow details
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED', 
    -- QUEUED, RINGING, IN_PROGRESS, COMPLETED, FAILED, BUSY, NO_ANSWER, CANCELLED
    
    ivr_selection VARCHAR(50), -- Which IVR option: SALES, SUPPORT, PROPERTY_INFO, CALLBACK
    ivr_path JSONB, -- Full IVR journey: ["main_menu", "press_1_sales", "press_2_property_a"]
    
    -- Timing details
    duration INTEGER DEFAULT 0, -- Total call duration in seconds
    ring_duration INTEGER, -- Time spent ringing
    conversation_duration INTEGER, -- Actual talk time
    
    -- Queue management
    queue_position INTEGER,
    wait_time INTEGER DEFAULT 0, -- seconds in queue
    queue_name VARCHAR(50), -- SALES_QUEUE, SUPPORT_QUEUE
    
    -- Round-robin tracking
    round_robin_attempt INTEGER DEFAULT 1, -- How many agents we tried
    agents_tried UUID[], -- Array of agent IDs who were tried
    
    -- Call quality
    call_quality VARCHAR(20), -- EXCELLENT, GOOD, FAIR, POOR (from Exotel)
    disconnect_reason VARCHAR(100), -- Why call ended
    
    -- Recording & transcription
    recording_url TEXT,
    recording_sid VARCHAR(100),
    recording_duration INTEGER,
    recording_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, AVAILABLE, FAILED
    
    transcription_text TEXT,
    transcription_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    transcription_confidence DECIMAL(5,2), -- 0-100
    
    -- AI analysis
    ai_summary TEXT,
    ai_detailed_summary TEXT,
    sentiment VARCHAR(20), -- POSITIVE, NEUTRAL, NEGATIVE, MIXED
    sentiment_score DECIMAL(5,2), -- -1 to 1
    intent VARCHAR(100), -- NEW_INQUIRY, FOLLOW_UP, COMPLAINT, BOOKING, SITE_VISIT
    
    key_topics JSONB, -- ["pricing", "location", "2BHK", "amenities"]
    action_items JSONB, -- [{"action": "Send brochure", "priority": "high", "due_date": "2024-01-15"}]
    entities_extracted JSONB, -- {"budget": 5000000, "property_type": "apartment", "bhk": "2"}
    
    -- Lead scoring
    lead_quality_score INTEGER, -- 0-100
    conversion_probability DECIMAL(5,2), -- 0-100
    next_action_suggestion TEXT, -- AI-suggested next step
    
    -- Timestamps
    queued_at TIMESTAMP,
    ringing_started_at TIMESTAMP,
    answered_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    exotel_metadata JSONB, -- Full Exotel response data
    custom_data JSONB, -- Custom app data
    
    CONSTRAINT valid_direction CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    CONSTRAINT valid_call_status CHECK (status IN ('QUEUED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELLED')),
    CONSTRAINT valid_sentiment CHECK (sentiment IS NULL OR sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'))
);

-- ============================================================================
-- 3. CALL RECORDINGS
-- ============================================================================
CREATE TABLE telephony.call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID NOT NULL REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    
    -- Recording details
    recording_url TEXT NOT NULL,
    recording_sid VARCHAR(100) UNIQUE, -- Exotel's RecordingSid
    
    -- File information
    duration INTEGER NOT NULL, -- in seconds
    file_size INTEGER, -- in bytes
    format VARCHAR(10) DEFAULT 'mp3', -- mp3, wav
    
    -- Storage
    storage_provider VARCHAR(20) DEFAULT 'aws', -- aws, exotel, local
    s3_bucket VARCHAR(255),
    s3_key TEXT,
    local_path TEXT,
    
    -- Processing
    is_downloaded BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    is_transcribed BOOLEAN DEFAULT false,
    
    -- Timestamps
    recorded_at TIMESTAMP,
    downloaded_at TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CALL TRANSCRIPTIONS
-- ============================================================================
CREATE TABLE telephony.call_transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID NOT NULL REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    recording_id UUID REFERENCES telephony.call_recordings(id),
    
    -- Transcription data
    full_text TEXT NOT NULL,
    segments JSONB, -- [{"speaker": "agent", "text": "Hello...", "start": 0, "end": 3.5}]
    language VARCHAR(10) DEFAULT 'en',
    confidence_score DECIMAL(5,2), -- 0-100
    
    -- Speaker identification
    speakers_detected INTEGER,
    agent_segments JSONB,
    customer_segments JSONB,
    
    -- Processing details
    provider VARCHAR(50) DEFAULT 'openai-whisper', -- openai-whisper, google, assemblyai
    model_used VARCHAR(50), -- whisper-1, whisper-large-v3
    processing_status VARCHAR(20) DEFAULT 'PENDING',
    processing_time INTEGER, -- milliseconds
    cost DECIMAL(10,4), -- Processing cost in USD
    
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_transcription_status CHECK (processing_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'))
);

-- ============================================================================
-- 5. AI INSIGHTS
-- ============================================================================
CREATE TABLE telephony.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID NOT NULL REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    transcription_id UUID REFERENCES telephony.call_transcriptions(id),
    
    -- AI-generated summaries
    summary TEXT, -- Brief 2-3 line summary
    detailed_summary TEXT, -- Comprehensive summary
    key_points TEXT[], -- Bullet points of main topics
    
    -- Sentiment analysis
    overall_sentiment VARCHAR(20),
    sentiment_score DECIMAL(5,2), -- -1 to 1
    sentiment_by_segment JSONB, -- Sentiment for each conversation segment
    customer_emotion VARCHAR(50), -- happy, frustrated, curious, excited
    
    -- Intent detection
    primary_intent VARCHAR(100),
    secondary_intents TEXT[],
    intent_confidence DECIMAL(5,2),
    
    -- Information extraction
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_alternate_phone VARCHAR(20),
    
    -- Property requirements
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    budget_currency VARCHAR(10) DEFAULT 'INR',
    preferred_location TEXT,
    property_type VARCHAR(50), -- apartment, villa, plot
    bhk_requirement VARCHAR(20), -- 1BHK, 2BHK, 3BHK, 4BHK+
    property_requirements JSONB, -- {"parking": 2, "floor": "high", "facing": "east"}
    
    -- Timeline & urgency
    timeline VARCHAR(50), -- IMMEDIATE, 1_MONTH, 3_MONTHS, 6_MONTHS, 1_YEAR, NOT_SPECIFIED
    urgency_level VARCHAR(20), -- LOW, MEDIUM, HIGH, URGENT
    ready_to_visit BOOLEAN,
    preferred_visit_date DATE,
    
    -- Topics discussed
    key_topics TEXT[], -- ["pricing", "location", "amenities", "payment_plan"]
    mentioned_properties TEXT[], -- Properties discussed by name
    mentioned_competitors TEXT[], -- Competitor properties mentioned
    
    -- Questions & objections
    customer_questions JSONB, -- [{"question": "What's the price?", "answered": true}]
    objections JSONB, -- [{"objection": "Too expensive", "resolved": false}]
    
    -- Action items & follow-up
    action_items JSONB, 
    -- [{"action": "Send brochure", "assigned_to": "agent_id", "due_date": "2024-01-15", "priority": "high"}]
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_reason TEXT,
    
    -- Lead assessment
    lead_quality_score INTEGER, -- 0-100
    conversion_probability DECIMAL(5,2), -- 0-100
    hot_lead BOOLEAN DEFAULT false,
    
    -- Recommendations
    next_best_action TEXT, -- AI-suggested next step
    recommended_properties UUID[], -- Property IDs to recommend
    talking_points TEXT[], -- Points to cover in next interaction
    
    -- AI model details
    model_used VARCHAR(50) DEFAULT 'gpt-4-turbo-preview',
    processing_cost DECIMAL(10,4), -- in USD
    processing_time INTEGER, -- milliseconds
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. ROUND-ROBIN CONFIGURATION
-- ============================================================================
CREATE TABLE telephony.round_robin_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id), -- Config per property
    
    -- Configuration
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL, -- SALES, SUPPORT, PROPERTY_INQUIRY
    algorithm VARCHAR(20) DEFAULT 'ROUND_ROBIN', -- ROUND_ROBIN, LEAST_BUSY, SKILL_BASED, PRIORITY
    
    -- Queue settings
    max_queue_size INTEGER DEFAULT 100,
    max_wait_time INTEGER DEFAULT 300, -- seconds (5 minutes)
    max_ring_time INTEGER DEFAULT 30, -- seconds
    
    -- Overflow handling
    overflow_action VARCHAR(50) DEFAULT 'VOICEMAIL', -- VOICEMAIL, CALLBACK, TRANSFER, HANGUP
    overflow_number VARCHAR(20),
    overflow_message TEXT,
    
    -- Business hours
    business_hours JSONB, 
    -- {"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {...}}
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- Priority rules
    priority_rules JSONB,
    -- {"vip_customers": {"priority": 1}, "returning_customers": {"priority": 2}}
    
    -- Active status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_algorithm CHECK (algorithm IN ('ROUND_ROBIN', 'LEAST_BUSY', 'SKILL_BASED', 'PRIORITY')),
    CONSTRAINT valid_overflow CHECK (overflow_action IN ('VOICEMAIL', 'CALLBACK', 'TRANSFER', 'HANGUP'))
);

-- ============================================================================
-- 7. IVR MENU CONFIGURATION
-- ============================================================================
CREATE TABLE telephony.ivr_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    
    -- Menu details
    menu_name VARCHAR(100) NOT NULL,
    menu_level INTEGER DEFAULT 1, -- 1 = main menu, 2 = submenu, etc.
    parent_menu_id UUID REFERENCES telephony.ivr_menus(id),
    
    -- Audio prompts
    welcome_message TEXT NOT NULL,
    audio_url TEXT, -- URL to audio file
    language VARCHAR(10) DEFAULT 'en',
    
    -- Menu options
    options JSONB NOT NULL,
    -- [
    --   {"key": "1", "label": "Sales Inquiry", "action": "route_to_queue", "queue": "sales"},
    --   {"key": "2", "label": "Support", "action": "route_to_queue", "queue": "support"},
    --   {"key": "3", "label": "Property Info", "action": "play_message", "message": "..."},
    --   {"key": "9", "label": "Repeat Menu", "action": "repeat"},
    --   {"key": "0", "label": "Speak to Operator", "action": "transfer", "number": "+919999999999"}
    -- ]
    
    -- Timeout & retry
    timeout_seconds INTEGER DEFAULT 10,
    max_retries INTEGER DEFAULT 3,
    invalid_option_message TEXT DEFAULT 'Invalid option. Please try again.',
    timeout_message TEXT DEFAULT 'We didn''t receive your input. Please try again.',
    
    -- Active status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. NUMBER MASKING CONFIGURATION
-- ============================================================================
CREATE TABLE telephony.masked_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Virtual number details
    virtual_number VARCHAR(20) NOT NULL UNIQUE, -- Exotel virtual number
    exotel_number_sid VARCHAR(100),
    
    -- Association
    property_id UUID REFERENCES properties(id),
    agent_id UUID REFERENCES employees(id),
    customer_id UUID REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, EXPIRED
    purpose VARCHAR(50), -- SALES_CALL, CUSTOMER_CALLBACK, SUPPORT
    
    -- Expiry
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP, -- Auto-expire after X days
    
    -- Usage tracking
    calls_made INTEGER DEFAULT 0,
    calls_received INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_masking_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agent availability indexes
CREATE INDEX idx_agent_availability_employee ON telephony.agent_availability(employee_id);
CREATE INDEX idx_agent_availability_property ON telephony.agent_availability(property_id);
CREATE INDEX idx_agent_availability_status ON telephony.agent_availability(status) WHERE is_available = true;
CREATE INDEX idx_agent_availability_calls ON telephony.agent_availability(current_calls, max_concurrent_calls);

-- Call logs indexes
CREATE INDEX idx_call_logs_customer ON telephony.call_logs(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_call_logs_lead ON telephony.call_logs(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_call_logs_property ON telephony.call_logs(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX idx_call_logs_agent ON telephony.call_logs(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
CREATE INDEX idx_call_logs_created ON telephony.call_logs(created_at DESC);
CREATE INDEX idx_call_logs_status ON telephony.call_logs(status);
CREATE INDEX idx_call_logs_direction ON telephony.call_logs(direction);
CREATE INDEX idx_call_logs_call_type ON telephony.call_logs(call_type);
CREATE INDEX idx_call_logs_date_range ON telephony.call_logs(created_at, status);

-- Recording indexes
CREATE INDEX idx_call_recordings_call ON telephony.call_recordings(call_log_id);
CREATE INDEX idx_call_recordings_status ON telephony.call_recordings(is_processed, is_transcribed);

-- Transcription indexes
CREATE INDEX idx_call_transcriptions_call ON telephony.call_transcriptions(call_log_id);
CREATE INDEX idx_call_transcriptions_status ON telephony.call_transcriptions(processing_status);

-- AI insights indexes
CREATE INDEX idx_ai_insights_call ON telephony.ai_insights(call_log_id);
CREATE INDEX idx_ai_insights_quality ON telephony.ai_insights(lead_quality_score DESC);
CREATE INDEX idx_ai_insights_hot_leads ON telephony.ai_insights(hot_lead) WHERE hot_lead = true;

-- Round-robin config indexes
CREATE INDEX idx_round_robin_property ON telephony.round_robin_config(property_id) WHERE active = true;
CREATE INDEX idx_round_robin_department ON telephony.round_robin_config(department) WHERE active = true;

-- IVR menu indexes
CREATE INDEX idx_ivr_menus_property ON telephony.ivr_menus(property_id) WHERE active = true;
CREATE INDEX idx_ivr_menus_level ON telephony.ivr_menus(menu_level, parent_menu_id);

-- Masked numbers indexes
CREATE INDEX idx_masked_numbers_virtual ON telephony.masked_numbers(virtual_number) WHERE status = 'ACTIVE';
CREATE INDEX idx_masked_numbers_property ON telephony.masked_numbers(property_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_masked_numbers_agent ON telephony.masked_numbers(agent_id) WHERE status = 'ACTIVE';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_availability_updated_at 
    BEFORE UPDATE ON telephony.agent_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_logs_updated_at 
    BEFORE UPDATE ON telephony.call_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_transcriptions_updated_at 
    BEFORE UPDATE ON telephony.call_transcriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at 
    BEFORE UPDATE ON telephony.ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_round_robin_config_updated_at 
    BEFORE UPDATE ON telephony.round_robin_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ivr_menus_updated_at 
    BEFORE UPDATE ON telephony.ivr_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masked_numbers_updated_at 
    BEFORE UPDATE ON telephony.masked_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset daily stats at midnight
CREATE OR REPLACE FUNCTION reset_daily_agent_stats()
RETURNS void AS $$
BEGIN
    UPDATE telephony.agent_availability
    SET 
        total_calls_today = 0,
        total_duration_today = 0,
        successful_calls_today = 0,
        missed_calls_today = 0
    WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- You can schedule this using pg_cron or run it via cron job
-- SELECT cron.schedule('reset-daily-stats', '0 0 * * *', 'SELECT reset_daily_agent_stats()');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Available agents view
CREATE OR REPLACE VIEW telephony.v_available_agents AS
SELECT 
    aa.*,
    e.first_name,
    e.last_name,
    e.email,
    e.position,
    p.name as property_name,
    p.location as property_location
FROM telephony.agent_availability aa
JOIN employees e ON aa.employee_id = e.id
LEFT JOIN properties p ON aa.property_id = p.id
WHERE aa.is_available = true 
  AND aa.status = 'AVAILABLE'
  AND aa.current_calls < aa.max_concurrent_calls;

-- Call analytics view
CREATE OR REPLACE VIEW telephony.v_call_analytics AS
SELECT 
    cl.*,
    c.full_name as customer_name,
    c.email as customer_email,
    l.lead_name,
    l.status as lead_status,
    p.name as property_name,
    e.first_name || ' ' || e.last_name as agent_name,
    ai.lead_quality_score,
    ai.conversion_probability,
    ai.summary as ai_summary
FROM telephony.call_logs cl
LEFT JOIN customers c ON cl.customer_id = c.id
LEFT JOIN leads l ON cl.lead_id = l.id
LEFT JOIN properties p ON cl.property_id = p.id
LEFT JOIN employees e ON cl.assigned_agent_id = e.id
LEFT JOIN telephony.ai_insights ai ON cl.id = ai.call_log_id;

-- Hot leads view
CREATE OR REPLACE VIEW telephony.v_hot_leads AS
SELECT 
    ai.*,
    cl.from_number,
    cl.created_at as call_date,
    l.lead_name,
    l.status as lead_status,
    l.assigned_to,
    p.name as property_name
FROM telephony.ai_insights ai
JOIN telephony.call_logs cl ON ai.call_log_id = cl.id
LEFT JOIN leads l ON cl.lead_id = l.id
LEFT JOIN properties p ON cl.property_id = p.id
WHERE ai.hot_lead = true 
  OR ai.lead_quality_score >= 80
ORDER BY ai.conversion_probability DESC, cl.created_at DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA telephony TO PUBLIC;

-- Grant select, insert, update on all tables
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA telephony TO PUBLIC;

-- Grant select on views
GRANT SELECT ON ALL TABLES IN SCHEMA telephony TO PUBLIC;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Telephony schema created successfully!';
    RAISE NOTICE '📞 Tables created: 8';
    RAISE NOTICE '📊 Indexes created: 20+';
    RAISE NOTICE '🔄 Triggers created: 7';
    RAISE NOTICE '👁️  Views created: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run the dummy data script: database-telephony-dummy-data.sql';
    RAISE NOTICE '2. Configure Exotel credentials in backend/.env';
    RAISE NOTICE '3. Start the backend server';
    RAISE NOTICE '4. Test with dummy calls!';
END $$;

