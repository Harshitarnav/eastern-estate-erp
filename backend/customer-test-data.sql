-- =====================================================
-- CUSTOMER TEST DATA (Matching Actual Schema)
-- =====================================================

-- Insert 5 diverse test customers

-- Customer 1: Verified Individual (VIP)
INSERT INTO customers (
  customer_code, full_name, email, phone_number, alternate_phone,
  date_of_birth, gender, occupation, company_name,
  address_line1, city, state, pincode, country,
  pan_number, aadhar_number, customer_type, kyc_status,
  requirement_type, property_preference,
  total_bookings, total_purchases, is_active, created_at
) VALUES (
  'CU2510001', 'Rajesh Kumar', 'rajesh.kumar@test.com', '9876543210', '9876543211',
  '1985-05-15', 'Male', 'Software Engineer', 'Tech Corp',
  'Plot 123, Green Valley', 'Mumbai', 'Maharashtra', '400001', 'India',
  'ABCDE1234F', '123456789012', 'INDIVIDUAL', 'VERIFIED',
  'END_USER', 'FLAT',
  2, 7500000, true, NOW() - INTERVAL '6 months'
) ON CONFLICT (customer_code) DO NOTHING;

-- Customer 2: Corporate Customer
INSERT INTO customers (
  customer_code, full_name, email, phone_number,
  address_line1, city, state, pincode, country,
  company_name, customer_type, kyc_status,
  requirement_type, property_preference,
  total_bookings, total_purchases, is_active, created_at
) VALUES (
  'CU2510002', 'Amit Enterprises', 'amit@business.test.com', '9123456789',
  '456 Corporate Plaza', 'Pune', 'Maharashtra', '411001', 'India',
  'Amit Enterprises Pvt Ltd', 'CORPORATE', 'VERIFIED',
  'INVESTOR', 'COMMERCIAL',
  3, 42000000, true, NOW() - INTERVAL '4 months'
) ON CONFLICT (customer_code) DO NOTHING;

-- Customer 3: NRI Customer
INSERT INTO customers (
  customer_code, full_name, email, phone_number,
  date_of_birth, gender, occupation,
  address_line1, city, state, country,
  customer_type, kyc_status,
  requirement_type, property_preference,
  total_bookings, is_active, created_at
) VALUES (
  'CU2510003', 'Priya Sharma', 'priya.sharma@nri.test.com', '9988776655',
  '1990-08-20', 'Female', 'Business Analyst',
  '789 NRI Complex', 'Bangalore', 'Karnataka', 'USA',
  'NRI', 'IN_PROGRESS',
  'END_USER', 'VILLA',
  1, true, NOW() - INTERVAL '2 months'
) ON CONFLICT (customer_code) DO NOTHING;

-- Customer 4: Young Professional
INSERT INTO customers (
  customer_code, full_name, email, phone_number,
  date_of_birth, gender, occupation, company_name,
  address_line1, city, state, pincode, country,
  pan_number, aadhar_number, customer_type, kyc_status,
  requirement_type, property_preference,
  is_active, created_at
) VALUES (
  'CU2510004', 'Sneha Reddy', 'sneha.reddy@test.com', '8765432109',
  '1995-03-10', 'Female', 'Marketing Manager', 'Startup Inc',
  '234 Green Park', 'Hyderabad', 'Telangana', '500001', 'India',
  'LMNOP4567Q', '456789012345', 'INDIVIDUAL', 'VERIFIED',
  'END_USER', 'FLAT',
  true, NOW() - INTERVAL '1 month'
) ON CONFLICT (customer_code) DO NOTHING;

-- Customer 5: Senior Investor (VIP)
INSERT INTO customers (
  customer_code, full_name, email, phone_number, alternate_phone,
  date_of_birth, gender, occupation, company_name,
  address_line1, city, state, pincode, country,
  pan_number, aadhar_number, customer_type, kyc_status,
  requirement_type, property_preference,
  total_bookings, total_purchases, is_active, created_at
) VALUES (
  'CU2510005', 'Vikram Patel', 'vikram.patel@test.com', '7654321098', '7654321099',
  '1978-11-25', 'Male', 'Business Owner', 'Patel Industries',
  '567 Investor Heights', 'Ahmedabad', 'Gujarat', '380001', 'India',
  'PQRST9876X', '987654321098', 'INDIVIDUAL', 'VERIFIED',
  'INVESTOR', 'ANY',
  5, 85000000, true, NOW() - INTERVAL '8 months'
) ON CONFLICT (customer_code) DO NOTHING;

-- Display results
SELECT 
  customer_code,
  full_name,
  email,
  phone_number,
  city,
  customer_type,
  kyc_status,
  requirement_type,
  property_preference,
  total_bookings,
  total_purchases,
  created_at
FROM customers
WHERE customer_code LIKE 'CU2510%'
ORDER BY customer_code;

-- Summary statistics
SELECT 
  COUNT(*) as total_test_customers,
  COUNT(CASE WHEN kyc_status = 'VERIFIED' THEN 1 END) as verified,
  COUNT(CASE WHEN customer_type = 'INDIVIDUAL' THEN 1 END) as individual,
  COUNT(CASE WHEN customer_type = 'CORPORATE' THEN 1 END) as corporate,
  COUNT(CASE WHEN customer_type = 'NRI' THEN 1 END) as nri
FROM customers
WHERE customer_code LIKE 'CU2510%';
