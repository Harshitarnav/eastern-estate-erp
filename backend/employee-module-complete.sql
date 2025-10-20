-- =====================================================
-- EMPLOYEE MODULE COMPLETE MIGRATION
-- Creates: Salary Payments, Bonuses, Reviews, Feedback, Documents
-- Adds: User linking to employees
-- Includes: Comprehensive test data
-- =====================================================

-- Add userId column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "userId" UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_userId ON employees("userId");

-- =====================================================
-- CREATE SALARY PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  "paymentMonth" DATE NOT NULL,
  "workingDays" INTEGER NOT NULL,
  "presentDays" INTEGER NOT NULL,
  "absentDays" INTEGER DEFAULT 0,
  "paidLeaveDays" INTEGER DEFAULT 0,
  "unpaidLeaveDays" INTEGER DEFAULT 0,
  "overtimeHours" INTEGER DEFAULT 0,
  "basicSalary" DECIMAL(15,2) NOT NULL,
  "houseRentAllowance" DECIMAL(15,2) DEFAULT 0,
  "transportAllowance" DECIMAL(15,2) DEFAULT 0,
  "medicalAllowance" DECIMAL(15,2) DEFAULT 0,
  "overtimePayment" DECIMAL(15,2) DEFAULT 0,
  "otherAllowances" DECIMAL(15,2) DEFAULT 0,
  "grossSalary" DECIMAL(15,2) NOT NULL,
  "pfDeduction" DECIMAL(15,2) DEFAULT 0,
  "esiDeduction" DECIMAL(15,2) DEFAULT 0,
  "taxDeduction" DECIMAL(15,2) DEFAULT 0,
  "advanceDeduction" DECIMAL(15,2) DEFAULT 0,
  "loanDeduction" DECIMAL(15,2) DEFAULT 0,
  "otherDeductions" DECIMAL(15,2) DEFAULT 0,
  "totalDeductions" DECIMAL(15,2) NOT NULL,
  "netSalary" DECIMAL(15,2) NOT NULL,
  "paymentStatus" VARCHAR(50) DEFAULT 'PENDING',
  "paymentMode" VARCHAR(50),
  "paymentDate" DATE,
  "transactionReference" VARCHAR(100),
  "paymentRemarks" VARCHAR(200),
  "bankName" VARCHAR(200),
  "accountNumber" VARCHAR(50),
  "ifscCode" VARCHAR(50),
  notes TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID,
  "updatedBy" UUID,
  "approvedBy" UUID,
  "approvedAt" TIMESTAMP
);

CREATE INDEX idx_salary_payments_employee ON salary_payments("employeeId");
CREATE INDEX idx_salary_payments_month ON salary_payments("paymentMonth");
CREATE INDEX idx_salary_payments_status ON salary_payments("paymentStatus");

-- =====================================================
-- CREATE BONUSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  "bonusType" VARCHAR(50) NOT NULL,
  "bonusTitle" VARCHAR(200) NOT NULL,
  "bonusDescription" TEXT,
  "bonusAmount" DECIMAL(15,2) NOT NULL,
  "bonusDate" DATE NOT NULL,
  "paymentDate" DATE,
  "performanceRating" DECIMAL(5,2),
  "targetAmount" DECIMAL(15,2),
  "achievedAmount" DECIMAL(15,2),
  "achievementPercentage" DECIMAL(5,2),
  "bonusStatus" VARCHAR(50) DEFAULT 'PENDING',
  "approvedBy" UUID,
  "approvedByName" VARCHAR(200),
  "approvedAt" TIMESTAMP,
  "approvalRemarks" TEXT,
  "rejectedBy" UUID,
  "rejectedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "transactionReference" VARCHAR(100),
  "paymentMode" VARCHAR(200),
  "paymentRemarks" TEXT,
  "taxDeduction" DECIMAL(15,2) DEFAULT 0,
  "netBonusAmount" DECIMAL(15,2) NOT NULL,
  notes TEXT,
  attachments TEXT[],
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID,
  "updatedBy" UUID
);

CREATE INDEX idx_bonuses_employee ON bonuses("employeeId");
CREATE INDEX idx_bonuses_type ON bonuses("bonusType");
CREATE INDEX idx_bonuses_status ON bonuses("bonusStatus");
CREATE INDEX idx_bonuses_date ON bonuses("bonusDate");

-- =====================================================
-- CREATE EMPLOYEE REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  "reviewType" VARCHAR(50) NOT NULL,
  "reviewTitle" VARCHAR(200) NOT NULL,
  "reviewDate" DATE NOT NULL,
  "reviewPeriodStart" DATE NOT NULL,
  "reviewPeriodEnd" DATE NOT NULL,
  "reviewStatus" VARCHAR(50) DEFAULT 'SCHEDULED',
  "reviewerId" UUID,
  "reviewerName" VARCHAR(200),
  "reviewerDesignation" VARCHAR(200),
  "technicalSkillsRating" DECIMAL(3,2),
  "communicationRating" DECIMAL(3,2),
  "teamworkRating" DECIMAL(3,2),
  "leadershipRating" DECIMAL(3,2),
  "problemSolvingRating" DECIMAL(3,2),
  "initiativeRating" DECIMAL(3,2),
  "punctualityRating" DECIMAL(3,2),
  "qualityOfWorkRating" DECIMAL(3,2),
  "productivityRating" DECIMAL(3,2),
  "attendanceRating" DECIMAL(3,2),
  "overallRating" DECIMAL(3,2) NOT NULL,
  achievements TEXT,
  strengths TEXT,
  "areasOfImprovement" TEXT,
  goals TEXT,
  "trainingNeeds" TEXT,
  "developmentPlan" TEXT,
  "reviewerComments" TEXT,
  "employeeComments" TEXT,
  "targetAchievement" DECIMAL(15,2),
  "actualAchievement" DECIMAL(15,2),
  "kpiAchievementPercentage" DECIMAL(5,2),
  "recommendedForPromotion" BOOLEAN DEFAULT FALSE,
  "recommendedForIncrement" BOOLEAN DEFAULT FALSE,
  "recommendedIncrementPercentage" DECIMAL(5,2),
  "recommendedForBonus" BOOLEAN DEFAULT FALSE,
  "recommendedBonusAmount" DECIMAL(15,2),
  "recommendedForTraining" BOOLEAN DEFAULT FALSE,
  "trainingRecommendations" TEXT,
  "actionItems" TEXT,
  "nextReviewDate" DATE,
  "employeeAcknowledged" BOOLEAN DEFAULT FALSE,
  "employeeAcknowledgedAt" TIMESTAMP,
  "managerApproved" BOOLEAN DEFAULT FALSE,
  "managerApprovedBy" UUID,
  "managerApprovedAt" TIMESTAMP,
  attachments TEXT[],
  notes TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID,
  "updatedBy" UUID
);

CREATE INDEX idx_employee_reviews_employee ON employee_reviews("employeeId");
CREATE INDEX idx_employee_reviews_type ON employee_reviews("reviewType");
CREATE INDEX idx_employee_reviews_status ON employee_reviews("reviewStatus");
CREATE INDEX idx_employee_reviews_date ON employee_reviews("reviewDate");

-- =====================================================
-- CREATE EMPLOYEE FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  "providerId" UUID,
  "providerName" VARCHAR(200),
  "providerDesignation" VARCHAR(200),
  "providerRelationship" VARCHAR(200),
  "feedbackType" VARCHAR(50) NOT NULL,
  "feedbackTitle" VARCHAR(200) NOT NULL,
  "feedbackDate" DATE NOT NULL,
  "feedbackStatus" VARCHAR(50) DEFAULT 'DRAFT',
  "positiveAspects" TEXT,
  "areasForImprovement" TEXT,
  "specificExamples" TEXT,
  recommendations TEXT,
  "generalComments" TEXT,
  "technicalSkillsRating" DECIMAL(3,2),
  "communicationRating" DECIMAL(3,2),
  "teamworkRating" DECIMAL(3,2),
  "leadershipRating" DECIMAL(3,2),
  "problemSolvingRating" DECIMAL(3,2),
  "reliabilityRating" DECIMAL(3,2),
  "professionalismRating" DECIMAL(3,2),
  "overallRating" DECIMAL(3,2),
  "isAnonymous" BOOLEAN DEFAULT FALSE,
  "employeeAcknowledged" BOOLEAN DEFAULT FALSE,
  "employeeAcknowledgedAt" TIMESTAMP,
  "employeeResponse" TEXT,
  "managerReviewed" BOOLEAN DEFAULT FALSE,
  "managerReviewedBy" UUID,
  "managerReviewedAt" TIMESTAMP,
  "managerComments" TEXT,
  attachments TEXT[],
  notes TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID,
  "updatedBy" UUID
);

CREATE INDEX idx_employee_feedback_employee ON employee_feedback("employeeId");
CREATE INDEX idx_employee_feedback_type ON employee_feedback("feedbackType");
CREATE INDEX idx_employee_feedback_status ON employee_feedback("feedbackStatus");
CREATE INDEX idx_employee_feedback_date ON employee_feedback("feedbackDate");

-- =====================================================
-- CREATE EMPLOYEE DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  "documentType" VARCHAR(50) NOT NULL,
  "documentName" VARCHAR(200) NOT NULL,
  "documentNumber" VARCHAR(100),
  "documentDescription" TEXT,
  "documentUrl" VARCHAR(500) NOT NULL,
  "fileName" VARCHAR(100),
  "fileType" VARCHAR(50),
  "fileSize" INTEGER,
  "documentStatus" VARCHAR(50) DEFAULT 'PENDING',
  "issueDate" DATE,
  "expiryDate" DATE,
  "isExpirable" BOOLEAN DEFAULT FALSE,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verifiedBy" UUID,
  "verifiedByName" VARCHAR(200),
  "verifiedAt" TIMESTAMP,
  "verificationRemarks" TEXT,
  "rejectedBy" UUID,
  "rejectedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "submittedDate" DATE,
  "submissionRemarks" TEXT,
  "sendExpiryReminder" BOOLEAN DEFAULT FALSE,
  "reminderDaysBefore" INTEGER,
  "lastReminderSent" TIMESTAMP,
  notes TEXT,
  tags TEXT[],
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID,
  "updatedBy" UUID
);

CREATE INDEX idx_employee_documents_employee ON employee_documents("employeeId");
CREATE INDEX idx_employee_documents_type ON employee_documents("documentType");
CREATE INDEX idx_employee_documents_status ON employee_documents("documentStatus");

-- =====================================================
-- TEST DATA - EMPLOYEES
-- =====================================================

-- Insert test employees if they don't exist
INSERT INTO employees (
  id, "employeeCode", "fullName", email, "phoneNumber", "dateOfBirth", gender,
  "currentAddress", department, designation, "employmentType", "employmentStatus",
  "joiningDate", "basicSalary", "houseRentAllowance", "transportAllowance",
  "grossSalary", "netSalary", "isActive"
) VALUES
  (gen_random_uuid(), 'EMP001', 'Rajesh Kumar', 'rajesh.kumar@eastern-estate.com', '9876543210', '1985-03-15', 'Male',
   '123 MG Road, Ranchi, Jharkhand', 'SALES', 'Sales Manager', 'FULL_TIME', 'ACTIVE',
   '2020-01-15', 50000, 20000, 5000, 75000, 68000, TRUE),
  
  (gen_random_uuid(), 'EMP002', 'Priya Singh', 'priya.singh@eastern-estate.com', '9876543211', '1990-07-20', 'Female',
   '456 Main Street, Ranchi, Jharkhand', 'MARKETING', 'Marketing Executive', 'FULL_TIME', 'ACTIVE',
   '2021-03-01', 35000, 14000, 3000, 52000, 47500, TRUE),
  
  (gen_random_uuid(), 'EMP003', 'Amit Sharma', 'amit.sharma@eastern-estate.com', '9876543212', '1988-11-10', 'Male',
   '789 Park Avenue, Ranchi, Jharkhand', 'FINANCE', 'Accountant', 'FULL_TIME', 'ACTIVE',
   '2019-06-01', 40000, 16000, 4000, 60000, 54500, TRUE),
  
  (gen_random_uuid(), 'EMP004', 'Sneha Patel', 'sneha.patel@eastern-estate.com', '9876543213', '1992-04-25', 'Female',
   '321 Lake View, Ranchi, Jharkhand', 'HR', 'HR Executive', 'FULL_TIME', 'ACTIVE',
   '2021-09-15', 32000, 12800, 2500, 47300, 43000, TRUE),
  
  (gen_random_uuid(), 'EMP005', 'Vikram Reddy', 'vikram.reddy@eastern-estate.com', '9876543214', '1987-08-30', 'Male',
   '654 Hill Station Road, Ranchi, Jharkhand', 'CONSTRUCTION', 'Site Engineer', 'FULL_TIME', 'ACTIVE',
   '2020-11-01', 45000, 18000, 4500, 67500, 61200, TRUE)
ON CONFLICT (employee_code) DO NOTHING;

-- Get employee IDs for test data
DO $$
DECLARE
  emp1_id UUID;
  emp2_id UUID;
  emp3_id UUID;
  emp4_id UUID;
  emp5_id UUID;
BEGIN
  SELECT id INTO emp1_id FROM employees WHERE "employeeCode" = 'EMP001' LIMIT 1;
  SELECT id INTO emp2_id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1;
  SELECT id INTO emp3_id FROM employees WHERE "employeeCode" = 'EMP003' LIMIT 1;
  SELECT id INTO emp4_id FROM employees WHERE "employeeCode" = 'EMP004' LIMIT 1;
  SELECT id INTO emp5_id FROM employees WHERE "employeeCode" = 'EMP005' LIMIT 1;

  -- =====================================================
  -- TEST DATA - SALARY PAYMENTS
  -- =====================================================
  IF emp1_id IS NOT NULL THEN
    INSERT INTO salary_payments (
      "employeeId", "paymentMonth", "workingDays", "presentDays", "absentDays",
      "basicSalary", "houseRentAllowance", "transportAllowance", "grossSalary",
      "pfDeduction", "taxDeduction", "totalDeductions", "netSalary",
      "paymentStatus", "paymentMode", "paymentDate"
    ) VALUES
      (emp1_id, '2024-09-01', 26, 26, 0, 50000, 20000, 5000, 75000, 3600, 3400, 7000, 68000, 'PAID', 'BANK_TRANSFER', '2024-10-01'),
      (emp1_id, '2024-10-01', 27, 27, 0, 50000, 20000, 5000, 75000, 3600, 3400, 7000, 68000, 'PAID', 'BANK_TRANSFER', '2024-11-01'),
      (emp1_id, '2024-11-01', 26, 25, 1, 50000, 20000, 5000, 75000, 3600, 3400, 7000, 68000, 'PENDING', NULL, NULL);
  END IF;

  IF emp2_id IS NOT NULL THEN
    INSERT INTO salary_payments (
      "employeeId", "paymentMonth", "workingDays", "presentDays", "absentDays",
      "basicSalary", "houseRentAllowance", "transportAllowance", "grossSalary",
      "pfDeduction", "taxDeduction", "totalDeductions", "netSalary",
      "paymentStatus", "paymentMode", "paymentDate"
    ) VALUES
      (emp2_id, '2024-10-01', 27, 27, 0, 35000, 14000, 3000, 52000, 2520, 2000, 4520, 47480, 'PAID', 'BANK_TRANSFER', '2024-11-01');
  END IF;

  -- =====================================================
  -- TEST DATA - BONUSES
  -- =====================================================
  IF emp1_id IS NOT NULL THEN
    INSERT INTO bonuses (
      "employeeId", "bonusType", "bonusTitle", "bonusDescription", "bonusAmount",
      "bonusDate", "performanceRating", "netBonusAmount", "bonusStatus"
    ) VALUES
      (emp1_id, 'PERFORMANCE', 'Q3 2024 Performance Bonus', 'Exceptional sales performance', 25000,
       '2024-10-15', 4.5, 25000, 'APPROVED'),
      (emp1_id, 'FESTIVAL', 'Diwali Bonus 2024', 'Festival bonus', 10000,
       '2024-11-01', NULL, 10000, 'PAID');
  END IF;

  -- =====================================================
  -- TEST DATA - EMPLOYEE REVIEWS
  -- =====================================================
  IF emp1_id IS NOT NULL THEN
    INSERT INTO employee_reviews (
      "employeeId", "reviewType", "reviewTitle", "reviewDate",
      "reviewPeriodStart", "reviewPeriodEnd", "reviewStatus",
      "technicalSkillsRating", "communicationRating", "teamworkRating",
      "leadershipRating", "problemSolvingRating", "overallRating",
      achievements, strengths, "areasOfImprovement"
    ) VALUES
      (emp1_id, 'QUARTERLY', 'Q3 2024 Performance Review', '2024-10-01',
       '2024-07-01', '2024-09-30', 'COMPLETED',
       4.5, 4.0, 4.5, 4.0, 4.5, 4.3,
       'Exceeded sales targets by 25%, Closed 15 major deals',
       'Excellent client relationship management, Strong negotiation skills',
       'Can improve on documentation and reporting');
  END IF;

  -- =====================================================
  -- TEST DATA - EMPLOYEE FEEDBACK
  -- =====================================================
  IF emp1_id IS NOT NULL AND emp2_id IS NOT NULL THEN
    INSERT INTO employee_feedback (
      "employeeId", "providerId", "providerName", "feedbackType",
      "feedbackTitle", "feedbackDate", "feedbackStatus",
      "positiveAspects", "areasForImprovement", "overallRating"
    ) VALUES
      (emp1_id, emp2_id, 'Priya Singh', 'PEER_TO_PEER',
       'Peer Feedback - October 2024', '2024-10-15', 'SUBMITTED',
       'Very collaborative and always willing to help team members',
       'Could be more proactive in team meetings', 4.0);
  END IF;

  -- =====================================================
  -- TEST DATA - EMPLOYEE DOCUMENTS
  -- =====================================================
  IF emp1_id IS NOT NULL THEN
    INSERT INTO employee_documents (
      "employeeId", "documentType", "documentName", "documentNumber",
      "documentUrl", "documentStatus", "issueDate", "isVerified"
    ) VALUES
      (emp1_id, 'AADHAR_CARD', 'Aadhar Card', '1234-5678-9012',
       '/uploads/documents/emp001_aadhar.pdf', 'VERIFIED', '2015-01-01', TRUE),
      (emp1_id, 'PAN_CARD', 'PAN Card', 'ABCDE1234F',
       '/uploads/documents/emp001_pan.pdf', 'VERIFIED', '2015-06-01', TRUE),
      (emp1_id, 'APPOINTMENT_LETTER', 'Appointment Letter', NULL,
       '/uploads/documents/emp001_appointment.pdf', 'VERIFIED', '2020-01-15', TRUE);
  END IF;

END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
SELECT 'Employee module migration completed successfully!' AS status;
SELECT COUNT(*) AS employees_count FROM employees;
SELECT COUNT(*) AS salary_payments_count FROM salary_payments;
SELECT COUNT(*) AS bonuses_count FROM bonuses;
SELECT COUNT(*) AS reviews_count FROM employee_reviews;
SELECT COUNT(*) AS feedback_count FROM employee_feedback;
SELECT COUNT(*) AS documents_count FROM employee_documents;
