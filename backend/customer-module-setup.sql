-- =====================================================
-- CUSTOMER MODULE SETUP AND TEST DATA
-- =====================================================

-- Step 1: Add customer_code column if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code VARCHAR(50);

-- Step 2: Create unique index on customer_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);

-- Step 3: Generate customer codes for existing customers without one
DO $$
DECLARE
  rec RECORD;
  new_code VARCHAR(50);
  counter INT := 1;
BEGIN
  FOR rec IN SELECT id FROM customers WHERE customer_code IS NULL ORDER BY created_at
  LOOP
    new_code := 'CU' || TO_CHAR(CURRENT_DATE, 'YYMM') || LPAD(counter::TEXT, 4, '0');
    UPDATE customers SET customer_code = new_code WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Step 4: Make customer_code NOT NULL after populating existing records
ALTER TABLE customers ALTER COLUMN customer_code SET NOT NULL;

-- =====================================================
-- COMPREHENSIVE TEST DATA
-- =====================================================

-- Clear existing test customers (optional - comment out if you want to keep existing data)
-- DELETE FROM customers WHERE email LIKE '%@test.com' OR email LIKE '%@example.com';

-- Test Customer 1: Verified Individual Customer (VIP)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone, alternate_phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income, company, designation,
  kyc_status, pan_number, aadhar_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan, has_approved_loan, bank_name, approved_loan_amount,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  email_notifications, sms_notifications, whatsapp_notifications,
  total_bookings, total_purchases, total_spent, last_purchase_date,
  notes, tags, is_active, is_vip, created_at
) VALUES (
  'CU2510001', 'Rajesh', 'Kumar', 'rajesh.kumar@test.com', '9876543210', '9876543211',
  '1985-05-15', 'Male', 'Plot 123, Green Valley', 'Mumbai', 'Maharashtra', '400001', 'India',
  'INDIVIDUAL', 'Software Engineer', 1500000, 'Tech Corp', 'Senior Developer',
  'VERIFIED', 'ABCDE1234F', '123456789012',
  'END_USER', 'FLAT', 5000000, 8000000,
  ARRAY['Andheri', 'Powai', 'Bandra'], '3-6 months',
  true, true, 'HDFC Bank', 6000000,
  'Priya Kumar', '9876543299', 'Spouse',
  true, true, true,
  2, 1, 7500000, '2024-09-15',
  'Premium customer. Very responsive. Looking for 3BHK in good locality.', 
  ARRAY['premium', 'quick-decision', 'referral-source'],
  true, true, NOW() - INTERVAL '6 months'
);

-- Test Customer 2: Corporate Customer (Verified KYC)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  address, city, state, pincode, country,
  type, company, designation, annual_income,
  kyc_status, pan_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations,
  needs_home_loan,
  total_bookings, total_purchases, total_spent, last_purchase_date,
  notes, tags, is_active, created_at
) VALUES (
  'CU2510002', 'Amit', 'Enterprises', 'amit@business.test.com', '9123456789',
  '456 Corporate Plaza', 'Pune', 'Maharashtra', '411001', 'India',
  'CORPORATE', 'Amit Enterprises Pvt Ltd', 'Managing Director', 5000000,
  'VERIFIED', 'XYZAB5678C',
  'INVESTOR', 'COMMERCIAL', 15000000, 25000000,
  ARRAY['Hinjewadi', 'Baner', 'Wakad'],
  false,
  3, 2, 42000000, '2024-10-01',
  'Investment company. Looking for commercial properties. Multiple bookings expected.',
  ARRAY['corporate', 'investor', 'bulk-buyer'],
  true, NOW() - INTERVAL '4 months'
);

-- Test Customer 3: NRI Customer (KYC In Progress)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, country,
  type, occupation, annual_income,
  kyc_status, passport_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan,
  email_notifications, sms_notifications, whatsapp_notifications,
  total_bookings, notes, tags, is_active, created_at
) VALUES (
  'CU2510003', 'Priya', 'Sharma', 'priya.sharma@nri.test.com', '9988776655',
  '1990-08-20', 'Female', '789 NRI Complex', 'Bangalore', 'Karnataka', 'USA',
  'NRI', 'Business Analyst', 8000000,
  'IN_PROGRESS', 'Z9876543',
  'END_USER', 'VILLA', 12000000, 18000000,
  ARRAY['Whitefield', 'Electronic City', 'HSR Layout'], '6-12 months',
  false,
  true, true, true,
  1, 'NRI customer from USA. Prefers email communication. Looking for investment property.',
  ARRAY['nri', 'high-value', 'investment'],
  true, NOW() - INTERVAL '2 months'
);

-- Test Customer 4: First Time Buyer (KYC Pending)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income,
  kyc_status,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan, has_approved_loan, bank_name, approved_loan_amount,
  notes, tags, is_active, created_at
) VALUES (
  'CU2510004', 'Sneha', 'Reddy', 'sneha.reddy@test.com', '8765432109',
  '1995-03-10', 'Female', '234 Green Park', 'Hyderabad', 'Telangana', '500001', 'India',
  'INDIVIDUAL', 'Marketing Manager', 900000,
  'PENDING',
  'END_USER', 'FLAT', 3500000, 5000000,
  ARRAY['Gachibowli', 'Madhapur', 'Hi-Tech City'], '1-3 months',
  true, true, 'SBI', 4000000,
  'First time buyer. Pre-approved loan. Ready to book immediately.',
  ARRAY['first-time-buyer', 'urgent', 'loan-approved'],
  true, NOW() - INTERVAL '1 month'
);

-- Test Customer 5: Investor Customer (Verified, Multiple Properties)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone, alternate_phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income, company,
  kyc_status, pan_number, aadhar_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations,
  needs_home_loan,
  total_bookings, total_purchases, total_spent, last_purchase_date, last_booking_date,
  notes, tags, is_active, is_vip, created_at
) VALUES (
  'CU2510005', 'Vikram', 'Patel', 'vikram.patel@test.com', '7654321098', '7654321099',
  '1978-11-25', 'Male', '567 Investor Heights', 'Ahmedabad', 'Gujarat', '380001', 'India',
  'INDIVIDUAL', 'Business Owner', 3000000, 'Patel Industries',
  'VERIFIED', 'PQRST9876X', '987654321098',
  'INVESTOR', 'ANY', 10000000, 50000000,
  ARRAY['Satellite', 'Prahlad Nagar', 'Bodakdev'],
  false,
  5, 3, 85000000, '2024-09-20', '2024-10-10',
  'Serial investor. Multiple properties. Excellent payment history. VIP treatment required.',
  ARRAY['vip', 'investor', 'repeat-customer', 'high-value'],
  true, true, NOW() - INTERVAL '8 months'
);

-- Test Customer 6: Young Professional (Verified)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income, company, designation,
  kyc_status, pan_number, aadhar_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan, has_approved_loan, bank_name, approved_loan_amount,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  notes, tags, is_active, created_at
) VALUES (
  'CU2510006', 'Arjun', 'Mehta', 'arjun.mehta@test.com', '6543210987',
  '1992-07-18', 'Male', '890 Tech Park', 'Bangalore', 'Karnataka', '560001', 'India',
  'INDIVIDUAL', 'Product Manager', 1800000, 'StartupXYZ', 'Senior Product Manager',
  'VERIFIED', 'LMNOP4567Q', '456789012345',
  'END_USER', 'FLAT', 6000000, 9000000,
  ARRAY['Koramangala', 'Indiranagar', 'BTM Layout'], '3-6 months',
  true, true, 'ICICI Bank', 7000000,
  'Neha Mehta', '6543210988', 'Sibling',
  'Young professional. Tech-savvy. Prefers modern amenities. Interested in smart homes.',
  ARRAY['young-professional', 'tech-savvy', 'modern-amenities'],
  true, NOW() - INTERVAL '3 months'
);

-- Test Customer 7: Senior Citizen (Verified, Special Requirements)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone, alternate_phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income,
  kyc_status, pan_number, aadhar_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations,
  needs_home_loan,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  total_bookings, total_purchases, total_spent,
  notes, tags, is_active, created_at
) VALUES (
  'CU2510007', 'Ramesh', 'Iyer', 'ramesh.iyer@test.com', '5432109876', '5432109877',
  '1955-04-12', 'Male', '321 Senior Residency', 'Chennai', 'Tamil Nadu', '600001', 'India',
  'INDIVIDUAL', 'Retired', 1200000,
  'VERIFIED', 'FGHIJ7890K', '234567890123',
  'END_USER', 'FLAT', 4000000, 6000000,
  ARRAY['T Nagar', 'Adyar', 'Velachery'],
  false,
  'Lakshmi Iyer', '5432109888', 'Daughter',
  1, 1, 5200000,
  'Senior citizen. Requires ground floor or lift facility. Medical facilities nearby preferred.',
  ARRAY['senior-citizen', 'special-requirements', 'medical-proximity'],
  true, NOW() - INTERVAL '5 months'
);

-- Test Customer 8: Luxury Segment (VIP, Verified)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone, alternate_phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income, company, designation,
  kyc_status, pan_number, aadhar_number, passport_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  total_bookings, total_purchases, total_spent, last_purchase_date,
  notes, tags, is_active, is_vip, created_at
) VALUES (
  'CU2510008', 'Sanjay', 'Kapoor', 'sanjay.kapoor@luxury.test.com', '4321098765', '4321098766',
  '1972-09-30', 'Male', '999 Luxury Towers', 'Delhi', 'Delhi', '110001', 'India',
  'INDIVIDUAL', 'Business Owner', 10000000, 'Kapoor Group', 'Chairman',
  'VERIFIED', 'STUVW1234M', '345678901234', 'L1234567',
  'BOTH', 'PENTHOUSE', 50000000, 100000000,
  ARRAY['Golf Course Road', 'Vasant Vihar', 'Diplomatic Enclave'], '6-12 months',
  false,
  'Kavita Kapoor', '4321098777', 'Spouse',
  4, 2, 125000000, '2024-08-15',
  'Ultra luxury segment. VIP customer. Requires premium locations only. Interior customization expected.',
  ARRAY['vip', 'luxury', 'high-net-worth', 'penthouse'],
  true, true, NOW() - INTERVAL '10 months'
);

-- Test Customer 9: Corporate Lease (Bulk Requirements)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  address, city, state, pincode, country,
  type, company, designation, annual_income,
  kyc_status, pan_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations,
  needs_home_loan,
  total_bookings, notes, tags, is_active, created_at
) VALUES (
  'CU2510009', 'Corporate', 'Solutions', 'leasing@corporate.test.com', '3210987654',
  '111 Business District', 'Bangalore', 'Karnataka', '560100', 'India',
  'CORPORATE', 'Global Tech Corp', 'Facility Manager', 0,
  'VERIFIED', 'YZABC8901N',
  'BOTH', 'COMMERCIAL', 100000000, 200000000,
  ARRAY['CBD', 'Outer Ring Road', 'IT Corridor'],
  false,
  8, 'Bulk leasing for employee housing. Looking for 50+ units. Corporate lease agreement.',
  ARRAY['corporate', 'bulk-requirement', 'long-term-lease'],
  true, NOW() - INTERVAL '7 months'
);

-- Test Customer 10: Young Couple (In Progress KYC)
INSERT INTO customers (
  customer_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, city, state, pincode, country,
  type, occupation, annual_income, company, designation,
  kyc_status, pan_number,
  requirement_type, property_preference, budget_min, budget_max,
  preferred_locations, tentative_purchase_timeframe,
  needs_home_loan, has_approved_loan, bank_name, approved_loan_amount,
  notes, tags, is_active, created_at
) VALUES (
  'CU2510010', 'Rohan', 'Desai', 'rohan.desai@test.com', '2109876543',
  '1994-02-14', 'Male', '222 New Colony', 'Surat', 'Gujarat', '395001', 'India',
  'INDIVIDUAL', 'Chartered Accountant', 1200000, 'CA Firm', 'Associate',
  'IN_PROGRESS', 'DEFGH5678P',
  'END_USER', 'FLAT', 3000000, 4500000,
  ARRAY['Vesu', 'Pal', 'Adajan'], '1-3 months',
  true, false, 'Bank of Baroda', 3500000,
  'Young couple. First home. Budget conscious. Looking for 2BHK with good schools nearby.',
  ARRAY['young-couple', 'first-home', 'budget-conscious', 'family-oriented'],
  true, NOW() - INTERVAL '6 weeks'
);

-- =====================================================
-- VERIFY TEST DATA
-- =====================================================

-- Count customers by type
SELECT 
  type,
  COUNT(*) as count,
  SUM(total_spent) as total_revenue
FROM customers 
WHERE is_active = true
GROUP BY type
ORDER BY count DESC;

-- Count customers by KYC status
SELECT 
  kyc_status,
  COUNT(*) as count
FROM customers 
WHERE is_active = true
GROUP BY kyc_status
ORDER BY count DESC;

-- VIP customers summary
SELECT 
  COUNT(*) as vip_count,
  SUM(total_spent) as vip_revenue,
  AVG(total_spent) as avg_vip_spend
FROM customers 
WHERE is_vip = true AND is_active = true;

-- Recent customers (last 30 days)
SELECT 
  COUNT(*) as recent_customers
FROM customers 
WHERE created_at >= NOW() - INTERVAL '30 days' 
  AND is_active = true;

-- Overall statistics
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN kyc_status = 'VERIFIED' THEN 1 END) as verified_customers,
  COUNT(CASE WHEN is_vip = true THEN 1 END) as vip_customers,
  SUM(total_spent) as total_revenue,
  AVG(total_spent) as avg_customer_value
FROM customers 
WHERE is_active = true;
