-- Create Employees Table
-- Run this SQL script in your PostgreSQL database to create the employees table

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone_number VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(50),
    marital_status VARCHAR(50),
    
    -- Address
    current_address TEXT NOT NULL,
    permanent_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    
    -- Employment Details
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(200) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    joining_date DATE NOT NULL,
    confirmation_date DATE,
    resignation_date DATE,
    last_working_date DATE,
    
    -- Reporting
    reporting_manager_id UUID,
    reporting_manager_name VARCHAR(200),
    
    -- Salary & Compensation
    basic_salary DECIMAL(15, 2) NOT NULL,
    house_rent_allowance DECIMAL(15, 2) DEFAULT 0,
    transport_allowance DECIMAL(15, 2) DEFAULT 0,
    medical_allowance DECIMAL(15, 2) DEFAULT 0,
    other_allowances DECIMAL(15, 2) DEFAULT 0,
    gross_salary DECIMAL(15, 2) NOT NULL,
    pf_deduction DECIMAL(15, 2) DEFAULT 0,
    esi_deduction DECIMAL(15, 2) DEFAULT 0,
    tax_deduction DECIMAL(15, 2) DEFAULT 0,
    other_deductions DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2) NOT NULL,
    
    -- Bank Details
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(50),
    branch_name VARCHAR(200),
    
    -- Documents
    aadhar_number VARCHAR(50),
    pan_number VARCHAR(50),
    pf_number VARCHAR(50),
    esi_number VARCHAR(50),
    uan_number VARCHAR(50),
    documents TEXT,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    
    -- Leave Management
    casual_leave_balance INTEGER DEFAULT 0,
    sick_leave_balance INTEGER DEFAULT 0,
    earned_leave_balance INTEGER DEFAULT 0,
    leave_taken INTEGER DEFAULT 0,
    
    -- Attendance
    total_present INTEGER DEFAULT 0,
    total_absent INTEGER DEFAULT 0,
    total_late_arrival INTEGER DEFAULT 0,
    
    -- Performance
    skills TEXT,
    qualifications TEXT,
    experience TEXT,
    performance_rating DECIMAL(3, 2),
    last_review_date TIMESTAMP,
    
    -- Additional Information
    notes TEXT,
    tags TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_phone_number ON employees(phone_number);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Success message
SELECT 'Employees table created successfully!' AS message;
