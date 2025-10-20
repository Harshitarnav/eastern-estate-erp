-- Sample Sales & CRM Data for Eastern Estate ERP
-- Usage:
--   psql "$DATABASE_URL" -f backend/sample-sales-data.sql
--
-- The script picks the super admin by default. Change the email below if
-- you want to seed data for a different salesperson.

DO $$
DECLARE
  v_sales_user_id uuid;
  v_leads_seeded  integer := 0;
  v_tasks_seeded  integer := 0;
BEGIN
  SELECT id
    INTO v_sales_user_id
  FROM users
  WHERE email = 'superadmin@easternestates.com'
  LIMIT 1;

  IF v_sales_user_id IS NULL THEN
    SELECT id
      INTO v_sales_user_id
    FROM users
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF v_sales_user_id IS NULL THEN
    RAISE NOTICE 'No active users found. Please create a user before running sample data.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding demo data for sales user %', v_sales_user_id;

  ----------------------------------------------------------------------
  -- 1. Sales Target (current month)
  ----------------------------------------------------------------------
  BEGIN
    INSERT INTO sales_targets (
      id, sales_person_id, target_period, start_date, end_date,
      target_leads, target_site_visits, target_conversions, target_bookings, target_revenue,
      self_target_bookings, self_target_revenue,
      achieved_leads, achieved_site_visits, achieved_conversions, achieved_bookings, achieved_revenue,
      leads_achievement_pct, site_visits_achievement_pct, conversions_achievement_pct,
      bookings_achievement_pct, revenue_achievement_pct, overall_achievement_pct,
      base_incentive, earned_incentive, bonus_incentive, total_incentive,
      motivational_message, missed_by, status, notes, is_active,
      created_at, updated_at, updated_by
    )
    VALUES (
      gen_random_uuid(), v_sales_user_id, 'MONTHLY',
      date_trunc('month', CURRENT_DATE),
      date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day',
      45, 18, 8, 4, 45000000,
      5, 52000000,
      32, 12, 5, 2, 28000000,
      71.1, 66.7, 62.5, 50.0, 62.2, 62.5,
      50000, 31000, 8000, 89000,
      'Great momentum! Two more site visits to unlock your incentive.',
      2,
      'IN_PROGRESS',
      'Seeded demo target',
      true,
      NOW(), NOW(), v_sales_user_id
    );
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Sales target already present, skipping.';
  END;

  ----------------------------------------------------------------------
  -- 2. Demo leads assigned to the salesperson
  ----------------------------------------------------------------------
  WITH inserted_leads AS (
    INSERT INTO leads (
      id, lead_code, full_name, email, phone_number,
      status, source, priority,
      budget_min, budget_max,
      requirement_type, property_preference,
      tentative_purchase_timeframe,
      assigned_to, assigned_at,
      is_active, created_at, updated_at,
      site_visit_status, total_follow_ups,
      follow_up_date, last_contact_date, last_follow_up_feedback
    )
    VALUES
      (gen_random_uuid(), 'LEAD-DEMO-001', 'Rajesh Kumar', 'rajesh.kumar@example.com', '9876500010',
        'QUALIFIED', 'REFERRAL', 'HIGH',
        7000000, 11000000,
        'END_USER', 'FLAT',
        '1-3 months',
        v_sales_user_id, NOW() - interval '12 days',
        true, NOW() - interval '15 days', NOW(),
        'DONE', 4,
        CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '1 day', 'Ready for price closure'
      ),
      (gen_random_uuid(), 'LEAD-DEMO-002', 'Priya Sharma', 'priya.sharma@example.com', '9876500011',
        'NEGOTIATION', 'WEBSITE', 'URGENT',
        10000000, 16000000,
        'INVESTOR', 'DUPLEX',
        '1-3 months',
        v_sales_user_id, NOW() - interval '10 days',
        true, NOW() - interval '10 days', NOW(),
        'PENDING', 3,
        CURRENT_DATE, CURRENT_DATE - interval '2 days', 'Negotiating down-payment terms'
      ),
      (gen_random_uuid(), 'LEAD-DEMO-003', 'Amit Patel', 'amit.patel@example.com', '9876500012',
        'CONTACTED', 'SOCIAL_MEDIA', 'MEDIUM',
        6500000, 9500000,
        'END_USER', 'FLAT',
        '3-6 months',
        v_sales_user_id, NOW() - interval '7 days',
        true, NOW() - interval '7 days', NOW(),
        'SCHEDULED', 2,
        CURRENT_DATE + interval '2 days', CURRENT_DATE - interval '1 day', 'Needs parental approval'
      ),
      (gen_random_uuid(), 'LEAD-DEMO-004', 'Sneha Reddy', 'sneha.reddy@example.com', '9876500013',
        'CONTACTED', 'PHONE', 'HIGH',
        8500000, 12000000,
        'END_USER', 'FLAT',
        '3-6 months',
        v_sales_user_id, NOW() - interval '5 days',
        true, NOW() - interval '5 days', NOW(),
        'NOT_SCHEDULED', 1,
        CURRENT_DATE + interval '5 days', CURRENT_DATE - interval '5 days', 'Waiting on updated brochure'
      ),
      (gen_random_uuid(), 'LEAD-DEMO-005', 'Vikram Singh', 'vikram.singh@example.com', '9876500014',
        'QUALIFIED', 'BROKER', 'HIGH',
        14000000, 19000000,
        'INVESTOR', 'PENTHOUSE',
        '1-3 months',
        v_sales_user_id, NOW() - interval '9 days',
        true, NOW() - interval '9 days', NOW(),
        'DONE', 6,
        CURRENT_DATE - interval '3 days', CURRENT_DATE - interval '3 days', 'Shortlisted two towers'
      ),
      (gen_random_uuid(), 'LEAD-DEMO-006', 'Anita Desai', 'anita.desai@example.com', '9876500015',
        'NEW', 'WALK_IN', 'MEDIUM',
        6000000, 9000000,
        'END_USER', 'FLAT',
        '6-12 months',
        v_sales_user_id, NOW() - interval '1 day',
        true, NOW() - interval '1 day', NOW(),
        'NOT_SCHEDULED', 0,
        NULL, NULL, NULL
      )
    ON CONFLICT (lead_code) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_leads_seeded FROM inserted_leads;

  ----------------------------------------------------------------------
  -- 3. Follow-ups attached to a subset of the seeded leads
  ----------------------------------------------------------------------
  INSERT INTO followups (
    id, lead_id, follow_up_date, follow_up_type, duration_minutes,
    performed_by, outcome, feedback, customer_response,
    lead_status_after, next_follow_up_date, next_follow_up_plan,
    is_site_visit, interest_level, budget_fit, timeline_fit,
    created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    l.id,
    CURRENT_DATE - (idx * interval '1 day'),
    (ARRAY['CALL','WHATSAPP','SITE_VISIT','EMAIL'])[1 + (idx % 4)]::followup_type,
    15 + (idx * 5),
    v_sales_user_id,
    (ARRAY['INTERESTED','CALLBACK_REQUESTED','SITE_VISIT_SCHEDULED','PRICE_NEGOTIATION'])[1 + (idx % 4)]::followup_outcome,
    'Discussed pricing and shared brochure #' || (idx + 1),
    CASE WHEN idx % 2 = 0 THEN 'Customer requested more details' ELSE NULL END,
    CASE WHEN idx % 2 = 0 THEN 'NEGOTIATION' ELSE 'QUALIFIED' END,
    CURRENT_DATE + ((idx + 1) * interval '2 days'),
    CASE WHEN idx % 2 = 0 THEN 'Email cost sheet and schedule call' ELSE 'Confirm site visit slot' END,
    idx % 3 = 0,
    6 + idx,
    7,
    5,
    NOW(), NOW()
  FROM (
    SELECT id, row_number() OVER () - 1 AS idx
    FROM leads
    WHERE assigned_to = v_sales_user_id::text
    ORDER BY created_at DESC
    LIMIT 4
  ) AS l;

  ----------------------------------------------------------------------
  -- 4. Personal tasks for the salesperson
  ----------------------------------------------------------------------
  WITH inserted_tasks AS (
    INSERT INTO sales_tasks (
      id, assigned_to, assigned_by,
      title, description, task_type, priority, status,
      due_date, due_time, estimated_duration_minutes,
      lead_id, location, send_reminder, reminder_before_minutes,
      is_active, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      v_sales_user_id,
      v_sales_user_id,
      t.title,
      t.description,
      t.task_type::task_type,
      t.priority::task_priority,
      t.status::task_status,
      CURRENT_DATE + t.days_offset,
      t.due_time::time,
      t.duration,
      l.id,
      t.location,
      true,
      120,
      true,
      NOW() - interval '1 day',
      NOW()
    FROM (
      VALUES
        ('Call Rajesh - final pricing', 'Reconfirm booking value and payment break-up', 'FOLLOWUP_CALL', 'URGENT', 'PENDING', 0, '10:00:00', 20, 'Eastern Estate Sales Lounge'),
        ('Send investment deck to Priya', 'Email duplex ROI numbers and appreciation charts', 'EMAIL_FOLLOWUP', 'HIGH', 'PENDING', 1, '11:30:00', 30, 'Email'),
        ('Site visit with Vikram', 'Arrange chauffeur pick-up and showcase Tower A penthouse', 'SITE_VISIT', 'HIGH', 'PENDING', 2, '15:00:00', 120, 'Tower A Concierge'),
        ('Team stand-up', 'Daily sync on hot leads and blockers', 'INTERNAL_MEETING', 'MEDIUM', 'PENDING', 0, '09:30:00', 15, 'War Room'),
        ('Send thank-you note', 'Share thank-you note with Sneha after showroom walkthrough', 'FOLLOWUP_CALL', 'LOW', 'COMPLETED', -1, '18:30:00', 10, 'Phone call'),
        ('Price negotiation review', 'Internal prep before closing call with Priya', 'MEETING', 'HIGH', 'IN_PROGRESS', 0, '13:15:00', 45, 'Zoom')
    ) AS t(title, description, task_type, priority, status, days_offset, due_time, duration, location)
    LEFT JOIN LATERAL (
      SELECT id
      FROM leads
      WHERE assigned_to = v_sales_user_id::text
      ORDER BY created_at DESC
      LIMIT 1
    ) AS l ON true
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_tasks_seeded FROM inserted_tasks;

  RAISE NOTICE 'Inserted % demo leads and % tasks for user %', v_leads_seeded, v_tasks_seeded, v_sales_user_id;
  RAISE NOTICE 'Sample data inserted successfully.';
END;
$$;
