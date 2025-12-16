-- ============================================================================
-- TELEPHONY DUMMY DATA - FIXED VERSION
-- Compatible with Eastern Estate ERP existing schema
-- ============================================================================

-- First, let's check what we have
DO $$
DECLARE
    property_count INT;
    employee_count INT;
BEGIN
    SELECT COUNT(*) INTO property_count FROM properties WHERE status = 'ACTIVE';
    SELECT COUNT(*) INTO employee_count FROM employees WHERE status = 'ACTIVE';
    
    RAISE NOTICE '✅ Found % active properties', property_count;
    RAISE NOTICE '✅ Found % active employees', employee_count;
    
    IF property_count = 0 THEN
        RAISE EXCEPTION 'No active properties found. Please create properties first.';
    END IF;
    
    IF employee_count = 0 THEN
        RAISE EXCEPTION 'No active employees found. Please create employees first.';
    END IF;
END $$;

-- ============================================================================
-- 1. AGENT AVAILABILITY (Use actual employees)
-- ============================================================================

INSERT INTO telephony.agent_availability (
    employee_id,
    property_id,
    is_available,
    status,
    max_concurrent_calls,
    current_calls,
    skills,
    total_calls_today,
    successful_calls_today,
    last_call_at
)
SELECT 
    e.id,
    p.id,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY e.id) <= 1 THEN true ELSE false END,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY e.id) <= 1 THEN 'AVAILABLE' ELSE 'OFFLINE' END,
    2,
    0,
    ARRAY['sales', 'customer_service', 'property_consultation'],
    FLOOR(RANDOM() * 20)::int,
    FLOOR(RANDOM() * 15)::int,
    NOW() - (RANDOM() * INTERVAL '2 hours')
FROM employees e
CROSS JOIN properties p
WHERE e.status = 'ACTIVE' 
  AND p.status = 'ACTIVE'
LIMIT 20;

-- ============================================================================
-- 2. SIMPLE CALL LOGS (2000+ records)
-- ============================================================================

INSERT INTO telephony.call_logs (
    call_sid,
    property_id,
    agent_id,
    from_number,
    to_number,
    direction,
    status,
    duration,
    start_time,
    end_time,
    recording_url,
    recording_sid,
    sentiment
)
SELECT
    'CA' || LPAD((ROW_NUMBER() OVER ())::text, 32, '0'),
    (SELECT id FROM properties WHERE status = 'ACTIVE' ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM employees WHERE status = 'ACTIVE' ORDER BY RANDOM() LIMIT 1),
    '+91' || (9000000000 + FLOOR(RANDOM() * 999999999))::bigint::text,
    '+918041' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
    CASE WHEN RANDOM() < 0.8 THEN 'INBOUND' ELSE 'OUTBOUND' END,
    CASE 
        WHEN RANDOM() < 0.75 THEN 'COMPLETED'
        WHEN RANDOM() < 0.90 THEN 'MISSED'
        ELSE 'FAILED'
    END,
    CASE 
        WHEN RANDOM() < 0.75 THEN (30 + FLOOR(RANDOM() * 600))::int
        ELSE 0
    END,
    NOW() - (RANDOM() * INTERVAL '90 days'),
    NOW() - (RANDOM() * INTERVAL '90 days') + (RANDOM() * INTERVAL '10 minutes'),
    'https://s3.amazonaws.com/recordings/test-' || (ROW_NUMBER() OVER ())::text || '.mp3',
    'RE' || LPAD((ROW_NUMBER() OVER ())::text, 32, '0'),
    CASE 
        WHEN RANDOM() < 0.4 THEN 'POSITIVE'
        WHEN RANDOM() < 0.8 THEN 'NEUTRAL'
        ELSE 'NEGATIVE'
    END
FROM generate_series(1, 2100) i;

RAISE NOTICE '✅ Created 2100 call logs';

-- ============================================================================
-- 3. CALL TRANSCRIPTIONS (for completed calls)
-- ============================================================================

INSERT INTO telephony.call_transcriptions (
    call_sid,
    transcript_text,
    language,
    confidence,
    duration,
    word_count
)
SELECT 
    call_sid,
    CASE 
        WHEN RANDOM() < 0.33 THEN 
            'Hello, I am interested in purchasing a property in Bangalore. My budget is around 50 to 75 lakhs. I am looking for a 2 or 3 BHK apartment in Whitefield or Electronic City area. Do you have any available properties? I need good connectivity and prefer properties near metro stations.'
        WHEN RANDOM() < 0.66 THEN
            'Hi, I saw your advertisement for the new project. Can you tell me more about the amenities? I am looking for a property for investment purposes. What is the expected appreciation in the next 2-3 years? Also, what are the payment plans available? I would prefer a construction-linked payment plan.'
        ELSE
            'Good morning, I want to schedule a site visit for the Prestige Lake View project. I am interested in 3BHK apartments. My budget is up to 1 crore. I need possession within 6 months. Can you arrange a visit this weekend? Also, please share the floor plans and pricing details.'
    END,
    'en',
    0.85 + (RANDOM() * 0.14),
    duration,
    CASE 
        WHEN RANDOM() < 0.33 THEN 45
        WHEN RANDOM() < 0.66 THEN 62
        ELSE 55
    END
FROM telephony.call_logs
WHERE status = 'COMPLETED' AND duration > 30
LIMIT 1500;

RAISE NOTICE '✅ Created 1500 call transcriptions';

-- ============================================================================
-- 4. AI INSIGHTS (for transcribed calls)
-- ============================================================================

INSERT INTO telephony.ai_insights (
    call_sid,
    summary,
    sentiment,
    lead_quality_score,
    hot_lead,
    conversion_probability,
    key_topics,
    pain_points,
    objections,
    next_best_action,
    customer_name,
    customer_phone,
    customer_email,
    budget_min,
    budget_max,
    preferred_location,
    bhk_requirement,
    purpose_of_purchase,
    timeline,
    financing_needed,
    property_types
)
SELECT 
    ct.call_sid,
    CASE 
        WHEN RANDOM() < 0.25 THEN 'High-quality lead with clear budget and requirements. Customer is actively looking for property in preferred location.'
        WHEN RANDOM() < 0.50 THEN 'Potential investor seeking property appreciation information. Interested in payment plans and ROI.'
        WHEN RANDOM() < 0.75 THEN 'End-user looking for immediate possession. Has specific area and BHK requirements. Ready for site visit.'
        ELSE 'Exploratory call. Customer gathering information about projects. Needs follow-up with detailed brochure.'
    END,
    CASE 
        WHEN RANDOM() < 0.5 THEN 'POSITIVE'
        WHEN RANDOM() < 0.85 THEN 'NEUTRAL'
        ELSE 'NEGATIVE'
    END,
    (60 + FLOOR(RANDOM() * 40))::int,
    RANDOM() < 0.25,
    (50 + FLOOR(RANDOM() * 50))::int,
    ARRAY['budget', 'location', 'amenities', 'payment_plan', 'possession'],
    ARRAY['distance_from_workplace', 'traffic_concerns', 'availability'],
    ARRAY['price_too_high', 'possession_timeline'],
    CASE 
        WHEN RANDOM() < 0.33 THEN 'Schedule site visit within 48 hours'
        WHEN RANDOM() < 0.66 THEN 'Send detailed brochure and floor plans via email'
        ELSE 'Follow up with payment plan options and bank tie-ups'
    END,
    CASE 
        WHEN RANDOM() < 0.8 THEN 
            (ARRAY['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vijay Singh'])[FLOOR(1 + RANDOM() * 5)]
        ELSE NULL
    END,
    cl.from_number,
    CASE 
        WHEN RANDOM() < 0.3 THEN 
            LOWER((ARRAY['rahul', 'priya', 'amit', 'sneha', 'vijay'])[FLOOR(1 + RANDOM() * 5)]) || '@gmail.com'
        ELSE NULL
    END,
    (3000000 + FLOOR(RANDOM() * 7000000))::bigint,
    (5000000 + FLOOR(RANDOM() * 15000000))::bigint,
    ARRAY[(ARRAY['Whitefield', 'Electronic City', 'Marathahalli', 'HSR Layout', 'Sarjapur Road'])[FLOOR(1 + RANDOM() * 5)]],
    (ARRAY['2BHK', '3BHK', '4BHK'])[FLOOR(1 + RANDOM() * 3)],
    (ARRAY['INVESTMENT', 'END_USE', 'RESALE'])[FLOOR(1 + RANDOM() * 3)],
    (ARRAY['IMMEDIATE', '1-3_MONTHS', '3-6_MONTHS', '6-12_MONTHS'])[FLOOR(1 + RANDOM() * 4)],
    RANDOM() < 0.6,
    ARRAY['APARTMENT']
FROM telephony.call_transcriptions ct
JOIN telephony.call_logs cl ON ct.call_sid = cl.call_sid
LIMIT 1500;

RAISE NOTICE '✅ Created 1500 AI insights';

-- ============================================================================
-- 5. UPDATE CALL LOGS WITH INSIGHTS
-- ============================================================================

UPDATE telephony.call_logs cl
SET 
    insight_id = ai.id,
    sentiment = ai.sentiment
FROM telephony.ai_insights ai
WHERE cl.call_sid = ai.call_sid;

RAISE NOTICE '✅ Updated call logs with AI data';

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
    total_calls INT;
    total_agents INT;
    total_transcriptions INT;
    total_insights INT;
    hot_leads INT;
BEGIN
    SELECT COUNT(*) INTO total_calls FROM telephony.call_logs;
    SELECT COUNT(*) INTO total_agents FROM telephony.agent_availability WHERE is_available = true;
    SELECT COUNT(*) INTO total_transcriptions FROM telephony.call_transcriptions;
    SELECT COUNT(*) INTO total_insights FROM telephony.ai_insights;
    SELECT COUNT(*) INTO hot_leads FROM telephony.ai_insights WHERE hot_lead = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '       TELEPHONY DUMMY DATA - COMPLETED';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ Total Call Logs:          %', total_calls;
    RAISE NOTICE '✅ Active Agents:             %', total_agents;
    RAISE NOTICE '✅ Transcriptions:            %', total_transcriptions;
    RAISE NOTICE '✅ AI Insights:               %', total_insights;
    RAISE NOTICE '🔥 Hot Leads Identified:      %', hot_leads;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Start backend: cd backend && npm run start:dev';
    RAISE NOTICE '2. Start frontend: cd frontend && npm run dev';
    RAISE NOTICE '3. Visit: http://localhost:3000/telephony/dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;


