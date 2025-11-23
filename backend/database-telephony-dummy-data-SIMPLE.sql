-- ============================================================================
-- TELEPHONY DUMMY DATA - SIMPLE VERSION
-- Matches actual database schema
-- ============================================================================

-- ============================================================================
-- 1. CALL LOGS (2100 simple calls)
-- ============================================================================

INSERT INTO telephony.call_logs (
    call_sid,
    direction,
    from_number,
    to_number,
    property_id,
    assigned_agent_id,
    status,
    duration,
    queued_at,
    answered_at,
    ended_at,
    recording_url,
    recording_sid,
    sentiment
)
SELECT
    'CA' || LPAD((ROW_NUMBER() OVER ())::text, 32, '0'),
    CASE WHEN RANDOM() < 0.8 THEN 'INBOUND' ELSE 'OUTBOUND' END,
    '+91' || (9000000000 + FLOOR(RANDOM() * 999999999))::bigint::text,
    '+918041' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
    (SELECT id FROM properties LIMIT 1 OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM properties))),
    (SELECT id FROM employees LIMIT 1 OFFSET FLOOR(RANDOM() * (SELECT COUNT(*) FROM employees))),
    CASE 
        WHEN RANDOM() < 0.75 THEN 'COMPLETED'
        WHEN RANDOM() < 0.90 THEN 'NO_ANSWER'
        ELSE 'FAILED'
    END,
    CASE 
        WHEN RANDOM() < 0.75 THEN (30 + FLOOR(RANDOM() * 600))::int
        ELSE 0
    END,
    NOW() - (RANDOM() * INTERVAL '90 days'),
    NOW() - (RANDOM() * INTERVAL '90 days') + (RANDOM() * INTERVAL '30 seconds'),
    NOW() - (RANDOM() * INTERVAL '90 days') + (RANDOM() * INTERVAL '10 minutes'),
    'https://s3.amazonaws.com/recordings/test-' || (ROW_NUMBER() OVER ())::text || '.mp3',
    'RE' || LPAD((ROW_NUMBER() OVER ())::text, 32, '0'),
    CASE 
        WHEN RANDOM() < 0.4 THEN 'POSITIVE'
        WHEN RANDOM() < 0.8 THEN 'NEUTRAL'
        ELSE 'NEGATIVE'
    END
FROM generate_series(1, 2100) i;

-- ============================================================================
-- 2. CALL TRANSCRIPTIONS (1500 for completed calls)
-- ============================================================================

INSERT INTO telephony.call_transcriptions (
    call_log_id,
    full_text,
    language,
    confidence_score,
    provider,
    model_used,
    processing_status
)
SELECT 
    id,
    CASE 
        WHEN RANDOM() < 0.33 THEN 
            'Hello, I am interested in purchasing a property in Bangalore. My budget is around 50 to 75 lakhs. I am looking for a 2 or 3 BHK apartment in Whitefield or Electronic City area. Do you have any available properties? I need good connectivity and prefer properties near metro stations.'
        WHEN RANDOM() < 0.66 THEN
            'Hi, I saw your advertisement for the new project. Can you tell me more about the amenities? I am looking for a property for investment purposes. What is the expected appreciation in the next 2-3 years? Also, what are the payment plans available?'
        ELSE
            'Good morning, I want to schedule a site visit for the property. I am interested in 3BHK apartments. My budget is up to 1 crore. I need possession within 6 months. Can you arrange a visit this weekend?'
    END,
    'en',
    (85 + RANDOM() * 14)::numeric(5,2),
    'openai-whisper',
    'whisper-1',
    'COMPLETED'
FROM telephony.call_logs
WHERE status = 'COMPLETED' AND duration > 30
LIMIT 1500;

-- ============================================================================
-- 3. AI INSIGHTS (1500 with lead information)
-- ============================================================================

INSERT INTO telephony.ai_insights (
    call_log_id,
    transcription_id,
    summary,
    overall_sentiment,
    sentiment_score,
    customer_name,
    customer_phone,
    customer_email,
    budget_min,
    budget_max,
    preferred_location,
    bhk_requirement,
    timeline,
    key_topics,
    lead_quality_score,
    conversion_probability,
    hot_lead,
    next_best_action
)
SELECT 
    ct.call_log_id,
    ct.id,
    CASE 
        WHEN RANDOM() < 0.25 THEN 'High-quality lead with clear budget and requirements. Customer actively looking in preferred location.'
        WHEN RANDOM() < 0.50 THEN 'Potential investor seeking property appreciation information. Interested in payment plans and ROI.'
        WHEN RANDOM() < 0.75 THEN 'End-user looking for immediate possession. Has specific area and BHK requirements. Ready for site visit.'
        ELSE 'Exploratory call. Customer gathering information. Needs follow-up with detailed brochure.'
    END,
    CASE 
        WHEN RANDOM() < 0.5 THEN 'POSITIVE'
        WHEN RANDOM() < 0.85 THEN 'NEUTRAL'
        ELSE 'NEGATIVE'
    END,
    (RANDOM() * 2 - 1)::numeric(5,2),
    (ARRAY['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vijay Singh', 'Anita Desai', 'Rajesh Kumar', 'Kavita Nair'])[FLOOR(1 + RANDOM() * 8)],
    cl.from_number,
    CASE 
        WHEN RANDOM() < 0.3 THEN 
            LOWER((ARRAY['rahul', 'priya', 'amit', 'sneha', 'vijay'])[FLOOR(1 + RANDOM() * 5)]) || (1000 + FLOOR(RANDOM() * 9000))::text || '@gmail.com'
        ELSE NULL
    END,
    (3000000 + FLOOR(RANDOM() * 7000000))::numeric(15,2),
    (5000000 + FLOOR(RANDOM() * 15000000))::numeric(15,2),
    (ARRAY['Whitefield', 'Electronic City', 'Marathahalli', 'HSR Layout', 'Sarjapur Road', 'Indiranagar', 'Koramangala'])[FLOOR(1 + RANDOM() * 7)],
    (ARRAY['2BHK', '3BHK', '4BHK', '4BHK+'])[FLOOR(1 + RANDOM() * 4)],
    (ARRAY['IMMEDIATE', '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR'])[FLOOR(1 + RANDOM() * 5)],
    ARRAY['budget', 'location', 'amenities', 'payment_plan', 'possession'],
    (60 + FLOOR(RANDOM() * 40))::int,
    (50 + FLOOR(RANDOM() * 50))::numeric(5,2),
    RANDOM() < 0.25,
    CASE 
        WHEN RANDOM() < 0.33 THEN 'Schedule site visit within 48 hours'
        WHEN RANDOM() < 0.66 THEN 'Send detailed brochure and floor plans via email'
        ELSE 'Follow up with payment plan options and bank tie-ups'
    END
FROM telephony.call_transcriptions ct
JOIN telephony.call_logs cl ON ct.call_log_id = cl.id
LIMIT 1500;

-- ============================================================================
-- 4. AGENT AVAILABILITY (Basic setup for existing employees)
-- ============================================================================

INSERT INTO telephony.agent_availability (
    employee_id,
    property_id,
    phone_number,
    is_available,
    status,
    max_concurrent_calls,
    current_calls,
    total_calls_today,
    successful_calls_today
)
SELECT 
    e.id,
    p.id,
    COALESCE(e.mobile_number, '+919999999999'),
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY e.id) <= 1 THEN true ELSE false END,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY e.id) <= 1 THEN 'AVAILABLE' ELSE 'OFFLINE' END,
    2,
    0,
    FLOOR(RANDOM() * 20)::int,
    FLOOR(RANDOM() * 15)::int
FROM employees e
CROSS JOIN properties p
LIMIT 20;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
    total_calls INT;
    total_transcriptions INT;
    total_insights INT;
    hot_leads INT;
    total_agents INT;
BEGIN
    SELECT COUNT(*) INTO total_calls FROM telephony.call_logs;
    SELECT COUNT(*) INTO total_transcriptions FROM telephony.call_transcriptions;
    SELECT COUNT(*) INTO total_insights FROM telephony.ai_insights;
    SELECT COUNT(*) INTO hot_leads FROM telephony.ai_insights WHERE hot_lead = true;
    SELECT COUNT(*) INTO total_agents FROM telephony.agent_availability WHERE is_available = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '     ✅ TELEPHONY DUMMY DATA LOADED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📞 Total Call Logs:       %', total_calls;
    RAISE NOTICE '📝 Transcriptions:         %', total_transcriptions;
    RAISE NOTICE '🤖 AI Insights:            %', total_insights;
    RAISE NOTICE '🔥 Hot Leads:              %', hot_leads;
    RAISE NOTICE '👥 Available Agents:       %', total_agents;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. cd backend && npm run start:dev';
    RAISE NOTICE '2. cd frontend && npm run dev';
    RAISE NOTICE '3. Visit: http://localhost:3000/telephony/dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
END $$;

