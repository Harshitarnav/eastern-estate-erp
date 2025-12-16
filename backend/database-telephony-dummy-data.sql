-- ============================================================================
-- EASTERN ESTATE ERP - TELEPHONY DUMMY DATA
-- Realistic test data for IVR, Round-Robin, AI features
-- Generated: 2000+ calls across multiple properties and agents
-- ============================================================================

-- ============================================================================
-- 1. SETUP: Get existing property and employee IDs
-- ============================================================================

DO $$
DECLARE
    property_count INTEGER;
    employee_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO property_count FROM properties WHERE is_active = true;
    SELECT COUNT(*) INTO employee_count FROM employees WHERE is_active = true;
    
    IF property_count = 0 THEN
        RAISE EXCEPTION 'No active properties found! Please create properties first.';
    END IF;
    
    IF employee_count < 4 THEN
        RAISE EXCEPTION 'Need at least 4 employees! Current count: %. Please add more employees.', employee_count;
    END IF;
    
    RAISE NOTICE '✅ Found % active properties', property_count;
    RAISE NOTICE '✅ Found % active employees', employee_count;
END $$;

-- ============================================================================
-- 2. AGENT AVAILABILITY (4 agents per property)
-- ============================================================================

-- First, let's create agent availability records
INSERT INTO telephony.agent_availability (
    employee_id,
    property_id,
    is_available,
    status,
    phone_number,
    extension,
    max_concurrent_calls,
    current_calls,
    total_calls_today,
    successful_calls_today,
    priority_score
)
SELECT 
    e.id as employee_id,
    p.id as property_id,
    CASE WHEN random() < 0.8 THEN true ELSE false END as is_available,
    CASE 
        WHEN random() < 0.7 THEN 'AVAILABLE'
        WHEN random() < 0.85 THEN 'ON_CALL'
        WHEN random() < 0.95 THEN 'BREAK'
        ELSE 'OFFLINE'
    END as status,
    '+91' || (9000000000 + floor(random() * 99999999)::bigint)::text as phone_number,
    (100 + floor(random() * 900))::text as extension,
    2 as max_concurrent_calls,
    CASE WHEN random() < 0.3 THEN 1 ELSE 0 END as current_calls,
    floor(random() * 50)::int as total_calls_today,
    floor(random() * 40)::int as successful_calls_today,
    (80 + floor(random() * 20))::int as priority_score
FROM 
    employees e
    CROSS JOIN properties p
WHERE 
    e.is_active = true 
    AND p.is_active = true
    AND e.position IN ('Sales Executive', 'Sales Manager', 'Property Consultant', 'Senior Sales Executive')
LIMIT 16; -- 4 agents per property (assuming 4 properties)

RAISE NOTICE '✅ Created agent availability records';

-- ============================================================================
-- 3. ROUND-ROBIN CONFIGURATION
-- ============================================================================

INSERT INTO telephony.round_robin_config (
    property_id,
    name,
    department,
    algorithm,
    max_queue_size,
    max_wait_time,
    max_ring_time,
    overflow_action,
    business_hours,
    timezone,
    active
)
SELECT 
    id as property_id,
    name || ' - Sales Queue' as name,
    'SALES',
    'ROUND_ROBIN',
    100,
    300,
    30,
    'VOICEMAIL',
    '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}, "saturday": {"start": "10:00", "end": "16:00"}, "sunday": {"start": "10:00", "end": "14:00"}}'::jsonb,
    'Asia/Kolkata',
    true
FROM properties 
WHERE is_active = true;

RAISE NOTICE '✅ Created round-robin configurations';

-- ============================================================================
-- 4. IVR MENU CONFIGURATION
-- ============================================================================

-- Main IVR menu for each property
INSERT INTO telephony.ivr_menus (
    property_id,
    menu_name,
    menu_level,
    welcome_message,
    language,
    options,
    timeout_seconds,
    max_retries,
    active
)
SELECT 
    id as property_id,
    'Main Menu - ' || name,
    1,
    'Welcome to ' || name || '. For sales inquiries, press 1. For support, press 2. For property information, press 3. To speak with an operator, press 0.',
    'en',
    '[
        {"key": "1", "label": "Sales Inquiry", "action": "route_to_queue", "queue": "sales"},
        {"key": "2", "label": "Support", "action": "route_to_queue", "queue": "support"},
        {"key": "3", "label": "Property Information", "action": "play_message", "message": "For property details, please visit our website or speak to our sales team."},
        {"key": "9", "label": "Repeat Menu", "action": "repeat"},
        {"key": "0", "label": "Speak to Operator", "action": "transfer", "number": "+919999999999"}
    ]'::jsonb,
    10,
    3,
    true
FROM properties 
WHERE is_active = true;

RAISE NOTICE '✅ Created IVR menu configurations';

-- ============================================================================
-- 5. MASKED NUMBERS
-- ============================================================================

INSERT INTO telephony.masked_numbers (
    virtual_number,
    property_id,
    status,
    purpose,
    valid_from,
    valid_until,
    calls_made,
    calls_received
)
SELECT 
    '+918041' || (100000 + floor(random() * 899999)::int)::text as virtual_number,
    id as property_id,
    'ACTIVE',
    'SALES_CALL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    floor(random() * 100)::int,
    floor(random() * 150)::int
FROM properties 
WHERE is_active = true;

RAISE NOTICE '✅ Created masked number configurations';

-- ============================================================================
-- 6. GENERATE 2000+ CALL LOGS WITH REALISTIC DATA
-- ============================================================================

-- Create a temporary table for call generation
CREATE TEMP TABLE temp_call_data AS
WITH RECURSIVE dates AS (
    -- Generate last 30 days of data
    SELECT CURRENT_DATE - INTERVAL '30 days' as call_date
    UNION ALL
    SELECT call_date + INTERVAL '1 day'
    FROM dates
    WHERE call_date < CURRENT_DATE
),
call_times AS (
    -- Generate 70-80 calls per day (2100-2400 calls total)
    SELECT 
        call_date,
        generate_series(1, 70 + floor(random() * 10)::int) as call_num
    FROM dates
)
SELECT 
    gen_random_uuid() as id,
    'CALL_' || floor(random() * 9000000000 + 1000000000)::bigint::text as call_sid,
    'CONV_' || floor(random() * 9000000000 + 1000000000)::bigint::text as conversation_uuid,
    CASE WHEN random() < 0.95 THEN 'INBOUND' ELSE 'OUTBOUND' END as direction,
    CASE 
        WHEN random() < 0.7 THEN 'SALES'
        WHEN random() < 0.85 THEN 'PROPERTY_INQUIRY'
        WHEN random() < 0.95 THEN 'SUPPORT'
        ELSE 'CALLBACK'
    END as call_type,
    '+91' || (9000000000 + floor(random() * 999999999)::bigint)::text as from_number,
    '+918041' || (100000 + floor(random() * 899999)::int)::text as to_number,
    '+918041' || (100000 + floor(random() * 899999)::int)::text as masked_number,
    CASE 
        WHEN random() < 0.85 THEN 'COMPLETED'
        WHEN random() < 0.92 THEN 'NO_ANSWER'
        WHEN random() < 0.97 THEN 'BUSY'
        ELSE 'FAILED'
    END as status,
    CASE 
        WHEN random() < 0.5 THEN 'SALES'
        WHEN random() < 0.75 THEN 'PROPERTY_INFO'
        WHEN random() < 0.9 THEN 'SUPPORT'
        ELSE 'CALLBACK'
    END as ivr_selection,
    '[("main_menu", "press_1_sales")]'::jsonb as ivr_path,
    floor(random() * 600 + 60)::int as duration, -- 1-10 minutes
    floor(random() * 30 + 5)::int as ring_duration,
    floor(random() * 550 + 60)::int as conversation_duration,
    floor(random() * 5 + 1)::int as queue_position,
    floor(random() * 120)::int as wait_time,
    'SALES_QUEUE' as queue_name,
    1 as round_robin_attempt,
    CASE 
        WHEN random() < 0.7 THEN 'GOOD'
        WHEN random() < 0.9 THEN 'EXCELLENT'
        ELSE 'FAIR'
    END as call_quality,
    CASE status
        WHEN 'COMPLETED' THEN 'Normal call completion'
        WHEN 'NO_ANSWER' THEN 'Customer did not answer'
        WHEN 'BUSY' THEN 'Customer line busy'
        ELSE 'Network error'
    END as disconnect_reason,
    'AVAILABLE' as recording_status,
    'COMPLETED' as transcription_status,
    (80 + random() * 20)::decimal(5,2) as transcription_confidence,
    CASE 
        WHEN random() < 0.4 THEN 'POSITIVE'
        WHEN random() < 0.8 THEN 'NEUTRAL'
        ELSE 'NEGATIVE'
    END as sentiment,
    CASE sentiment
        WHEN 'POSITIVE' THEN (0.3 + random() * 0.7)::decimal(5,2)
        WHEN 'NEUTRAL' THEN (-0.2 + random() * 0.4)::decimal(5,2)
        ELSE (-1.0 + random() * 0.5)::decimal(5,2)
    END as sentiment_score,
    CASE 
        WHEN random() < 0.4 THEN 'NEW_INQUIRY'
        WHEN random() < 0.6 THEN 'FOLLOW_UP'
        WHEN random() < 0.75 THEN 'SITE_VISIT'
        WHEN random() < 0.9 THEN 'BOOKING'
        ELSE 'COMPLAINT'
    END as intent,
    floor(random() * 100)::int as lead_quality_score,
    (random() * 100)::decimal(5,2) as conversion_probability,
    call_date + (call_num::text || ' minutes')::interval + (floor(random() * 540 + 540)::text || ' minutes')::interval as created_at
FROM call_times;

-- Insert call logs with property and agent assignments
INSERT INTO telephony.call_logs (
    id, call_sid, conversation_uuid, direction, call_type, from_number, to_number,
    masked_number, property_id, assigned_agent_id, status, ivr_selection, ivr_path,
    duration, ring_duration, conversation_duration, queue_position, wait_time,
    queue_name, round_robin_attempt, call_quality, disconnect_reason,
    recording_status, transcription_status, transcription_confidence,
    sentiment, sentiment_score, intent, lead_quality_score, conversion_probability,
    queued_at, ringing_started_at, answered_at, ended_at, created_at
)
SELECT 
    t.id,
    t.call_sid,
    t.conversation_uuid,
    t.direction,
    t.call_type,
    t.from_number,
    t.to_number,
    t.masked_number,
    p.id as property_id,
    aa.employee_id as assigned_agent_id,
    t.status,
    t.ivr_selection,
    t.ivr_path,
    t.duration,
    t.ring_duration,
    t.conversation_duration,
    t.queue_position,
    t.wait_time,
    t.queue_name,
    t.round_robin_attempt,
    t.call_quality,
    t.disconnect_reason,
    t.recording_status,
    t.transcription_status,
    t.transcription_confidence,
    t.sentiment,
    t.sentiment_score,
    t.intent,
    t.lead_quality_score,
    t.conversion_probability,
    t.created_at as queued_at,
    t.created_at + (t.wait_time::text || ' seconds')::interval as ringing_started_at,
    CASE WHEN t.status = 'COMPLETED' 
        THEN t.created_at + (t.wait_time + t.ring_duration::text || ' seconds')::interval
        ELSE NULL 
    END as answered_at,
    t.created_at + (t.duration::text || ' seconds')::interval as ended_at,
    t.created_at
FROM temp_call_data t
CROSS JOIN LATERAL (
    SELECT id FROM properties WHERE is_active = true ORDER BY random() LIMIT 1
) p
CROSS JOIN LATERAL (
    SELECT employee_id FROM telephony.agent_availability 
    WHERE property_id = p.id
    ORDER BY random() LIMIT 1
) aa;

RAISE NOTICE '✅ Created 2000+ call logs';

-- ============================================================================
-- 7. GENERATE CALL RECORDINGS
-- ============================================================================

INSERT INTO telephony.call_recordings (
    call_log_id,
    recording_url,
    recording_sid,
    duration,
    file_size,
    format,
    storage_provider,
    s3_bucket,
    s3_key,
    is_downloaded,
    is_processed,
    is_transcribed,
    recorded_at,
    downloaded_at,
    processed_at
)
SELECT 
    id as call_log_id,
    'https://eastern-estate-recordings.s3.ap-south-1.amazonaws.com/calls/' || call_sid || '.mp3' as recording_url,
    'REC_' || call_sid as recording_sid,
    conversation_duration as duration,
    floor(random() * 5000000 + 500000)::int as file_size,
    'mp3',
    'aws',
    'eastern-estate-recordings',
    'calls/' || call_sid || '.mp3' as s3_key,
    true,
    CASE WHEN random() < 0.9 THEN true ELSE false END as is_processed,
    CASE WHEN random() < 0.8 THEN true ELSE false END as is_transcribed,
    created_at as recorded_at,
    created_at + interval '1 minute' as downloaded_at,
    CASE WHEN random() < 0.9 THEN created_at + interval '5 minutes' ELSE NULL END as processed_at
FROM telephony.call_logs
WHERE status = 'COMPLETED' AND conversation_duration > 30;

RAISE NOTICE '✅ Created call recordings';

-- ============================================================================
-- 8. GENERATE CALL TRANSCRIPTIONS
-- ============================================================================

-- Sample conversation templates
CREATE TEMP TABLE conversation_templates (
    template_id INT,
    template_text TEXT
);

INSERT INTO conversation_templates VALUES
(1, 'Agent: Good morning! Thank you for calling Eastern Estate. This is [Agent Name]. How may I assist you today?
Customer: Hi, I''m looking for information about your 2BHK apartments.
Agent: Absolutely! I''d be happy to help you with that. May I have your name, please?
Customer: Yes, it''s Rajesh Kumar.
Agent: Thank you, Mr. Kumar. Are you looking for a specific location?
Customer: I''m interested in properties near Whitefield area, around 50 lakhs budget.
Agent: Great! We have several excellent options in Whitefield within your budget. Would you like to schedule a site visit this weekend?
Customer: Yes, that would be perfect. Saturday morning works for me.
Agent: Wonderful! I''ll send you the details via WhatsApp. Is this the best number to reach you?
Customer: Yes, this is my number.
Agent: Perfect! You''ll receive the confirmation shortly. Is there anything else I can help you with?
Customer: No, that''s all for now. Thank you!
Agent: You''re welcome, Mr. Kumar. Looking forward to seeing you on Saturday. Have a great day!'),

(2, 'Agent: Hello, Eastern Estate sales team. How can I help you today?
Customer: I called yesterday about the 3BHK villa. I wanted to know more about the payment plan.
Agent: Of course! Let me pull up your details. May I have your name?
Customer: Priya Sharma.
Agent: Thank you, Ms. Sharma. For our 3BHK villas, we offer flexible payment plans. We have a 20-80 plan where you pay 20% upfront and the rest during construction.
Customer: That sounds good. What about the amenities?
Agent: Our villas come with a clubhouse, swimming pool, gym, children''s play area, and 24/7 security.
Customer: When is the possession date?
Agent: The project is scheduled for possession in December 2025. We also offer a ready-to-move option if you''re looking for immediate possession.
Customer: I need to discuss with my family. Can you send me the brochure?
Agent: Absolutely! I''ll email you the complete brochure along with the floor plans and pricing details. Would you also like to schedule a site visit?
Customer: Let me review the brochure first, then I''ll call back.
Agent: Perfect! Take your time. Feel free to call me directly if you have any questions. My number is on the brochure.
Customer: Thank you!
Agent: Thank you for your interest, Ms. Sharma. Have a wonderful day!'),

(3, 'Agent: Eastern Estate, good afternoon. This is [Agent Name] speaking.
Customer: Hi, I''m calling about your ongoing offer. Is it still valid?
Agent: Yes, absolutely! We''re currently running a special festive offer with zero registration charges. Which property are you interested in?
Customer: The apartments in HSR Layout.
Agent: Excellent choice! Those are our premium 2 and 3BHK apartments. The offer includes zero registration and we''re also providing a modular kitchen worth 3 lakhs free of cost.
Customer: That''s interesting. What''s the price range?
Agent: Our 2BHK starts at 75 lakhs and 3BHK at 1.1 crores. Both options have excellent ventilation and natural lighting.
Customer: I''m looking for something around 80 lakhs maximum.
Agent: Perfect! We have a few 2BHK units available at 78 lakhs. These are on the 5th and 7th floors with a park-facing view.
Customer: Can I see the property this weekend?
Agent: Definitely! Would Saturday at 11 AM work for you?
Customer: Yes, please book it.
Agent: Great! Can I have your email to send the confirmation?
Customer: Sure, it''s amit.patel@email.com
Agent: Thank you, Mr. Patel. You''ll receive all the details shortly. See you on Saturday!
Customer: Thank you!'),

(4, 'Agent: Good evening, thank you for calling Eastern Estate. How may I help you?
Customer: I visited your site last week. I wanted to follow up on the villa I liked.
Agent: Of course! May I have your name to pull up your details?
Customer: Ananya Reddy.
Agent: Thank you, Ms. Reddy. Yes, I see you were interested in our 4BHK villa in the premium block. Have you made a decision?
Customer: I''m very interested, but I need some clarifications on the home loan process.
Agent: Absolutely! We have tie-ups with 5 major banks including HDFC, ICICI, and SBI. Our financial advisor can help you with the entire process.
Customer: What''s the interest rate?
Agent: Current rates are around 8.5% to 9%. Our financial advisor can help you get the best rate based on your profile.
Customer: That sounds good. Also, I wanted to know about the parking.
Agent: Each villa comes with covered parking for 2 cars. Additional parking is available at a nominal cost.
Customer: Perfect. I think we''re ready to book. What''s the next step?
Agent: Wonderful! We need to schedule a booking formality meeting. Can you come tomorrow?
Customer: Yes, I can come at 4 PM.
Agent: Perfect! Please bring one ID proof and a cheque for the token amount of 1 lakh.
Customer: Sure, I''ll be there.
Agent: Excellent! Looking forward to seeing you tomorrow, Ms. Reddy!'),

(5, 'Agent: Eastern Estate customer support. How may I assist you?
Customer: I have a complaint about the maintenance work in my apartment.
Agent: I''m sorry to hear that. Can you please provide your flat number?
Customer: It''s B-404 in Silver Heights.
Agent: Thank you. Could you please describe the issue?
Customer: The plumbing work was supposed to be done last week, but no one showed up.
Agent: I apologize for the inconvenience. Let me check the maintenance schedule. I see the work order here. It seems there was a delay due to material shortage.
Customer: When will it be done?
Agent: The materials have arrived, and I''m scheduling the work for tomorrow between 10 AM to 2 PM. Will someone be available at home?
Customer: Yes, I''ll be home.
Agent: Perfect! I''ll also follow up with you tomorrow evening to ensure the work is completed satisfactorily.
Customer: Thank you for helping.
Agent: You''re welcome! Is there anything else I can help you with?
Customer: No, that''s all.
Agent: Great! We apologize again for the delay. Have a good day!');

-- Insert transcriptions for completed calls
INSERT INTO telephony.call_transcriptions (
    call_log_id,
    recording_id,
    full_text,
    segments,
    language,
    confidence_score,
    speakers_detected,
    provider,
    model_used,
    processing_status,
    processing_time,
    cost
)
SELECT 
    cl.id as call_log_id,
    cr.id as recording_id,
    ct.template_text as full_text,
    '[
        {"speaker": "agent", "text": "Good morning! Thank you for calling Eastern Estate.", "start": 0, "end": 3.5},
        {"speaker": "customer", "text": "Hi, I am looking for information about apartments.", "start": 4.0, "end": 7.2}
    ]'::jsonb as segments,
    'en',
    (85 + random() * 15)::decimal(5,2),
    2,
    'openai-whisper',
    'whisper-1',
    'COMPLETED',
    floor(random() * 30000 + 5000)::int,
    (cl.duration * 0.006 / 60)::decimal(10,4)
FROM telephony.call_logs cl
JOIN telephony.call_recordings cr ON cl.id = cr.call_log_id
CROSS JOIN LATERAL (
    SELECT * FROM conversation_templates ORDER BY random() LIMIT 1
) ct
WHERE cl.status = 'COMPLETED' 
  AND cr.is_transcribed = true
LIMIT 1500; -- Transcribe ~1500 calls

RAISE NOTICE '✅ Created call transcriptions';

-- ============================================================================
-- 9. GENERATE AI INSIGHTS
-- ============================================================================

-- Insert AI insights for transcribed calls
INSERT INTO telephony.ai_insights (
    call_log_id,
    transcription_id,
    summary,
    detailed_summary,
    key_points,
    overall_sentiment,
    sentiment_score,
    customer_emotion,
    primary_intent,
    secondary_intents,
    intent_confidence,
    customer_name,
    budget_min,
    budget_max,
    budget_currency,
    preferred_location,
    property_type,
    bhk_requirement,
    property_requirements,
    timeline,
    urgency_level,
    ready_to_visit,
    key_topics,
    customer_questions,
    objections,
    action_items,
    follow_up_required,
    follow_up_date,
    lead_quality_score,
    conversion_probability,
    hot_lead,
    next_best_action,
    recommended_properties,
    model_used,
    processing_cost,
    processing_time
)
SELECT 
    ct.call_log_id,
    ct.id as transcription_id,
    CASE floor(random() * 5)::int
        WHEN 0 THEN 'Customer inquired about 2BHK apartments in Whitefield with budget of 50 lakhs. Interested in site visit this weekend. High conversion probability.'
        WHEN 1 THEN 'Follow-up call regarding 3BHK villa. Customer asked about payment plans and amenities. Requested brochure. Medium interest level.'
        WHEN 2 THEN 'New inquiry for HSR Layout apartments. Customer interested in ongoing offers. Budget around 80 lakhs. Site visit scheduled for Saturday.'
        WHEN 3 THEN 'Customer ready to book 4BHK villa. Discussed home loan options. Booking meeting scheduled for tomorrow. Hot lead!'
        ELSE 'Maintenance complaint call. Issue with plumbing work. Work rescheduled for tomorrow. Customer satisfied with resolution.'
    END as summary,
    'This call demonstrates strong customer interest with specific requirements clearly communicated. The customer showed positive engagement throughout the conversation and expressed willingness to proceed with next steps. Key decision factors include location preference, budget alignment, and amenity requirements. The agent effectively addressed all queries and maintained professional communication. Follow-up actions have been clearly defined with specific timelines.' as detailed_summary,
    ARRAY[
        'Customer showed interest in ' || CASE floor(random() * 3)::int WHEN 0 THEN '2BHK' WHEN 1 THEN '3BHK' ELSE '4BHK' END || ' apartments',
        'Budget range discussed: ' || (40 + floor(random() * 100))::text || ' lakhs to ' || (60 + floor(random() * 120))::text || ' lakhs',
        'Preferred location: ' || CASE floor(random() * 5)::int WHEN 0 THEN 'Whitefield' WHEN 1 THEN 'HSR Layout' WHEN 2 THEN 'Electronic City' WHEN 3 THEN 'Sarjapur Road' ELSE 'Marathahalli' END,
        CASE WHEN random() < 0.6 THEN 'Site visit scheduled' ELSE 'Brochure requested' END,
        CASE WHEN random() < 0.4 THEN 'Hot lead - immediate buying intent' ELSE 'Warm lead - researching options' END
    ] as key_points,
    cl.sentiment as overall_sentiment,
    cl.sentiment_score,
    CASE floor(random() * 6)::int
        WHEN 0 THEN 'excited'
        WHEN 1 THEN 'curious'
        WHEN 2 THEN 'satisfied'
        WHEN 3 THEN 'interested'
        WHEN 4 THEN 'neutral'
        ELSE 'cautious'
    END as customer_emotion,
    cl.intent as primary_intent,
    ARRAY[
        CASE WHEN random() < 0.5 THEN 'PRICE_INQUIRY' ELSE 'LOCATION_PREFERENCE' END,
        CASE WHEN random() < 0.5 THEN 'AMENITY_CHECK' ELSE 'VISIT_REQUEST' END
    ] as secondary_intents,
    (70 + random() * 30)::decimal(5,2) as intent_confidence,
    CASE floor(random() * 10)::int
        WHEN 0 THEN 'Rajesh Kumar'
        WHEN 1 THEN 'Priya Sharma'
        WHEN 2 THEN 'Amit Patel'
        WHEN 3 THEN 'Ananya Reddy'
        WHEN 4 THEN 'Vikram Singh'
        WHEN 5 THEN 'Sneha Iyer'
        WHEN 6 THEN 'Arjun Mehta'
        WHEN 7 THEN 'Kavya Nair'
        WHEN 8 THEN 'Rohan Desai'
        ELSE 'Meera Krishnan'
    END as customer_name,
    (3000000 + floor(random() * 7000000))::decimal(15,2) as budget_min,
    (5000000 + floor(random() * 15000000))::decimal(15,2) as budget_max,
    'INR',
    CASE floor(random() * 5)::int
        WHEN 0 THEN 'Whitefield'
        WHEN 1 THEN 'HSR Layout'
        WHEN 2 THEN 'Electronic City'
        WHEN 3 THEN 'Sarjapur Road'
        ELSE 'Marathahalli'
    END as preferred_location,
    CASE floor(random() * 3)::int
        WHEN 0 THEN 'apartment'
        WHEN 1 THEN 'villa'
        ELSE 'penthouse'
    END as property_type,
    CASE floor(random() * 5)::int
        WHEN 0 THEN '1BHK'
        WHEN 1 THEN '2BHK'
        WHEN 2 THEN '3BHK'
        WHEN 3 THEN '4BHK'
        ELSE '4BHK+'
    END as bhk_requirement,
    '{"parking": 2, "floor_preference": "high", "facing": "east", "balcony": true}'::jsonb as property_requirements,
    CASE floor(random() * 5)::int
        WHEN 0 THEN 'IMMEDIATE'
        WHEN 1 THEN '1_MONTH'
        WHEN 2 THEN '3_MONTHS'
        WHEN 3 THEN '6_MONTHS'
        ELSE '1_YEAR'
    END as timeline,
    CASE 
        WHEN cl.lead_quality_score >= 80 THEN 'URGENT'
        WHEN cl.lead_quality_score >= 60 THEN 'HIGH'
        WHEN cl.lead_quality_score >= 40 THEN 'MEDIUM'
        ELSE 'LOW'
    END as urgency_level,
    CASE WHEN random() < 0.6 THEN true ELSE false END as ready_to_visit,
    ARRAY['pricing', 'location', 'amenities', 'payment_plan', 'possession_date'] as key_topics,
    '[
        {"question": "What is the per sqft rate?", "answered": true},
        {"question": "When is possession?", "answered": true},
        {"question": "Are there any offers?", "answered": true}
    ]'::jsonb as customer_questions,
    CASE WHEN random() < 0.3 THEN 
        '[{"objection": "Price seems high", "resolved": true}]'::jsonb
    ELSE '[]'::jsonb END as objections,
    '[
        {"action": "Send property brochure", "assigned_to": null, "due_date": "' || (CURRENT_DATE + 1)::text || '", "priority": "high"},
        {"action": "Schedule site visit", "assigned_to": null, "due_date": "' || (CURRENT_DATE + 3)::text || '", "priority": "high"},
        {"action": "Follow up on decision", "assigned_to": null, "due_date": "' || (CURRENT_DATE + 7)::text || '", "priority": "medium"}
    ]'::jsonb as action_items,
    CASE WHEN random() < 0.8 THEN true ELSE false END as follow_up_required,
    CURRENT_DATE + floor(random() * 7 + 1)::int as follow_up_date,
    cl.lead_quality_score,
    cl.conversion_probability,
    CASE WHEN cl.lead_quality_score >= 80 AND cl.conversion_probability >= 70 THEN true ELSE false END as hot_lead,
    CASE floor(random() * 5)::int
        WHEN 0 THEN 'Send personalized property recommendations via WhatsApp'
        WHEN 1 THEN 'Schedule site visit within 48 hours'
        WHEN 2 THEN 'Connect with home loan consultant'
        WHEN 3 THEN 'Share virtual tour and floor plans'
        ELSE 'Invite to upcoming property showcase event'
    END as next_best_action,
    ARRAY(SELECT id FROM properties ORDER BY random() LIMIT 3) as recommended_properties,
    'gpt-4-turbo-preview',
    (0.001 + random() * 0.009)::decimal(10,4) as processing_cost,
    floor(random() * 5000 + 2000)::int as processing_time
FROM telephony.call_transcriptions ct
JOIN telephony.call_logs cl ON ct.call_log_id = cl.id
WHERE ct.processing_status = 'COMPLETED';

RAISE NOTICE '✅ Created AI insights';

-- ============================================================================
-- 10. UPDATE CALL LOGS WITH AI DATA
-- ============================================================================

UPDATE telephony.call_logs cl
SET 
    ai_summary = ai.summary,
    key_topics = ai.key_topics::jsonb,
    action_items = ai.action_items,
    lead_quality_score = ai.lead_quality_score,
    conversion_probability = ai.conversion_probability
FROM telephony.ai_insights ai
WHERE cl.id = ai.call_log_id;

RAISE NOTICE '✅ Updated call logs with AI data';

-- ============================================================================
-- 11. CREATE SOME LEADS FROM HOT CALLS
-- ============================================================================

-- Create leads for high-quality calls
INSERT INTO leads (
    property_id,
    lead_name,
    email,
    phone,
    source,
    status,
    budget,
    requirement_type,
    notes,
    assigned_to,
    is_active,
    lead_score,
    created_at
)
SELECT 
    cl.property_id,
    ai.customer_name,
    lower(replace(ai.customer_name, ' ', '.')) || '@email.com',
    cl.from_number,
    'PHONE_CALL',
    CASE 
        WHEN ai.hot_lead THEN 'INTERESTED'
        WHEN ai.lead_quality_score >= 60 THEN 'CONTACTED'
        ELSE 'NEW'
    END,
    ai.budget_max,
    ai.bhk_requirement,
    'Lead generated from phone call. ' || ai.summary,
    cl.assigned_agent_id,
    true,
    ai.lead_quality_score,
    cl.created_at
FROM telephony.call_logs cl
JOIN telephony.ai_insights ai ON cl.id = ai.call_log_id
WHERE ai.hot_lead = true 
  OR ai.lead_quality_score >= 70
  AND cl.lead_id IS NULL
LIMIT 200;

-- Update call logs with new lead IDs
UPDATE telephony.call_logs cl
SET lead_id = l.id
FROM leads l
WHERE l.phone = cl.from_number
  AND l.property_id = cl.property_id
  AND cl.lead_id IS NULL
  AND l.source = 'PHONE_CALL';

RAISE NOTICE '✅ Created leads from hot calls';

-- ============================================================================
-- 12. SUMMARY STATISTICS
-- ============================================================================

DO $$
DECLARE
    total_calls INTEGER;
    total_agents INTEGER;
    total_recordings INTEGER;
    total_transcriptions INTEGER;
    total_ai_insights INTEGER;
    hot_leads INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_calls FROM telephony.call_logs;
    SELECT COUNT(*) INTO total_agents FROM telephony.agent_availability;
    SELECT COUNT(*) INTO total_recordings FROM telephony.call_recordings;
    SELECT COUNT(*) INTO total_transcriptions FROM telephony.call_transcriptions;
    SELECT COUNT(*) INTO total_ai_insights FROM telephony.ai_insights;
    SELECT COUNT(*) INTO hot_leads FROM telephony.ai_insights WHERE hot_lead = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '       TELEPHONY DUMMY DATA SUMMARY';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ Total Call Logs:          %', total_calls;
    RAISE NOTICE '✅ Active Agents:             %', total_agents;
    RAISE NOTICE '✅ Call Recordings:           %', total_recordings;
    RAISE NOTICE '✅ Transcriptions:            %', total_transcriptions;
    RAISE NOTICE '✅ AI Insights:               %', total_ai_insights;
    RAISE NOTICE '🔥 Hot Leads Identified:      %', hot_leads;
    RAISE NOTICE '';
    RAISE NOTICE 'Call Distribution:';
    RAISE NOTICE '  - Last 30 days: % calls', total_calls;
    RAISE NOTICE '  - Avg per day: % calls', total_calls / 30;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Configure Exotel in backend/.env';
    RAISE NOTICE '2. Start backend: cd backend && npm run start:dev';
    RAISE NOTICE '3. Access telephony dashboard: http://localhost:3000/telephony/dashboard';
    RAISE NOTICE '4. View hot leads: http://localhost:3000/telephony/calls?quality=hot';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;

-- Clean up temporary tables
DROP TABLE IF EXISTS temp_call_data;
DROP TABLE IF EXISTS conversation_templates;


