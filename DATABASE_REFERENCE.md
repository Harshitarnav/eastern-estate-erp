# 💾 Eastern Estate ERP - Complete Database Reference

**Last Updated:** February 2026  
**Database:** PostgreSQL 16+  
**Total Tables:** 45+  
**Total Fields:** 900+

---

## 📋 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Authentication & Security](#authentication--security)
3. [Property & Inventory Management](#property--inventory-management)
4. [Customer Relationship Management](#customer-relationship-management)
5. [Sales & Bookings](#sales--bookings)
6. [Financial Management](#financial-management)
7. [Human Resources](#human-resources)
8. [Construction Management](#construction-management)
9. [Procurement & Materials](#procurement--materials)
10. [Communication & Collaboration](#communication--collaboration)
11. [Accounting Module](#accounting-module)
12. [Marketing](#marketing)
13. [Telephony & IVR](#telephony--ivr)
14. [Database Relationships Diagram](#database-relationships-diagram)
15. [Common Queries](#common-queries)

---

## 🎯 Quick Overview

### Core Business Tables
- **Properties:** `properties`, `towers`, `flats`
- **CRM:** `leads`, `followups`, `sales_tasks`, `customers`
- **Sales:** `bookings`, `payments`, `payment_schedules`, `payment_installments`, `payment_refunds`, `demand_drafts`
- **HR:** `employees`, `employee_documents`, `employee_reviews`, `employee_feedback`, `bonuses`, `salary_payments`, `sales_targets`
- **Construction:** `construction_projects`, `construction_teams`, `construction_flat_progress`, `construction_tower_progress`, `construction_development_updates`, `construction_progress_logs`, `construction_project_assignments`
- **Materials:** `materials`, `material_entries`, `material_exits`, `vendors`, `vendor_payments`, `purchase_orders`, `purchase_order_items`

### System Tables
- **Auth:** `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`
- **Communication:** `notifications`, `chat_groups`, `chat_participants`, `chat_messages`, `chat_attachments`
- **Accounting:** `accounts`, `journal_entries`, `journal_entry_lines`, `budgets`, `expenses`, `fiscal_years`, `bank_accounts`, `bank_statements`
- **Marketing:** `campaigns`
- **Telephony:** `call_logs`, `call_recordings`, `call_transcriptions`, `ai_insights`, `agent_availability`, `round_robin_config`

---

## 🔐 Authentication & Security

### users
**Purpose:** Core user authentication and profile management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| alternate_phone | VARCHAR(20) | | Alternate phone |
| date_of_birth | DATE | | Date of birth |
| gender | VARCHAR(20) | | Gender |
| profile_image | TEXT | | Profile image URL |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| is_verified | BOOLEAN | DEFAULT FALSE | Email verified |
| email_verified_at | TIMESTAMP | | Verification timestamp |
| last_login_at | TIMESTAMP | | Last login time |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed login count |
| locked_until | TIMESTAMP | | Account lock expiry |
| created_by | UUID | FK → users | Creator |
| updated_by | UUID | FK → users | Last updater |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_username` on `username`

---

### roles
**Purpose:** Role-based access control

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Role name (snake_case) |
| display_name | VARCHAR(200) | NOT NULL | Display name |
| description | TEXT | | Role description |
| is_system | BOOLEAN | DEFAULT FALSE | System role flag |
| is_system_role | BOOLEAN | DEFAULT FALSE | Alt system flag |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_by | UUID | FK → users | Creator |
| updated_by | UUID | FK → users | Last updater |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Pre-defined Roles:**
1. `super_admin` - Full system access
2. `admin` - Administrative access
3. `accountant` - Financial operations
4. `sales_manager` - Sales team management
5. `sales_executive` - Sales operations
6. `marketing_manager` - Marketing operations
7. `construction_manager` - Construction projects
8. `store_keeper` - Inventory management
9. `hr_manager` - HR operations
10. `customer` - Customer portal
11. `broker` - Broker/channel partner

---

### permissions
**Purpose:** Granular permission management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | UNIQUE | Permission name |
| display_name | VARCHAR(100) | | Display name |
| module | VARCHAR(100) | NOT NULL | Module name |
| action | VARCHAR(100) | | Action type (CREATE, READ, UPDATE, DELETE) |
| resource | VARCHAR(100) | | Resource name |
| description | TEXT | | Description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Unique Constraint:** `(module, action, resource)`

---

### user_roles
**Purpose:** Many-to-many relationship between users and roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users | User ID |
| role_id | UUID | PK, FK → roles | Role ID |
| assigned_at | TIMESTAMP | DEFAULT NOW() | Assignment time |
| assigned_by | UUID | FK → users | Assigner |

---

### role_permissions
**Purpose:** Many-to-many relationship between roles and permissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| role_id | UUID | FK → roles | Role ID |
| permission_id | UUID | FK → permissions | Permission ID |
| constraints | JSONB | | Additional constraints |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Unique Constraint:** `(role_id, permission_id)`

---

### refresh_tokens
**Purpose:** JWT refresh token management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users | User ID |
| token | VARCHAR(500) | UNIQUE, NOT NULL | Token value |
| expires_at | TIMESTAMP | NOT NULL | Expiration time |
| ip_address | VARCHAR(50) | | Client IP |
| user_agent | TEXT | | Client user agent |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

## 🏢 Property & Inventory Management

### properties
**Purpose:** Master property/project records

**Key Columns:**
- `property_code` (UNIQUE) - Property identifier
- `name` - Property name
- `address`, `city`, `state`, `pincode` - Location
- `latitude`, `longitude` - GPS coordinates
- `total_area`, `area_unit` - Area specifications
- `number_of_towers`, `number_of_units` - Inventory counts
- `launch_date`, `expected_completion_date` - Timeline
- `rera_number`, `rera_status` - Regulatory compliance
- `project_type`, `property_type`, `status` - Classification
- `price_min`, `price_max` - Price range
- `bhk_types` (ARRAY) - Unit types available
- `images`, `documents`, `amenities` (JSONB) - Rich media
- `data_completion_pct` - Completeness percentage
- `data_completeness_status` (ENUM) - Status tracking

**Total Columns:** 40+

**Relationships:**
- → `towers` (1:M)
- → `flats` (1:M)
- → `bookings` (1:M)

---

### towers
**Purpose:** Building towers within properties

**Key Columns:**
- `property_id` (FK → properties)
- `tower_code`, `name` - Tower identification
- `total_floors`, `flats_per_floor`, `total_flats` - Structure
- `facing`, `position` - Location details
- `has_lift`, `number_of_lifts`, `lift_capacity` - Lift details
- `parking_type`, `parking_capacity` - Parking facilities
- Amenities: `has_gym`, `has_garden`, `has_security_alarm`, etc.
- `layout_images`, `arial_view_images` (JSONB) - Visual data
- `amenities` (JSONB) - Additional features

**Total Columns:** 30+

**Relationships:**
- → `properties` (M:1)
- → `flats` (1:M)

---

### flats
**Purpose:** Individual residential units

**Key Columns:**
- `property_id` (FK → properties)
- `tower_id` (FK → towers)
- `flat_code`, `flat_number`, `flat_type` - Identification
- Area: `carpet_area`, `built_up_area`, `super_built_up_area`, `area_unit`
- Pricing: `base_rate_per_sqft`, `base_price`, `gst_amount`, `total_price`
- Configuration: `bedrooms`, `bathrooms`, `balconies`
- Special rooms: `has_study_room`, `has_servant_room`, `has_pooja_room`
- `room_details` (JSONB) - Detailed room info
- `facing`, `furnishing_status`, `flooring_type`, `kitchen_type`
- `images`, `floor_plan_image` - Visual data
- `status` - Available/Booked/Sold/Reserved
- `is_verified`, `verified_at`, `verified_by` - Verification

**Total Columns:** 40+

**Relationships:**
- → `properties` (M:1)
- → `towers` (M:1)
- → `bookings` (1:M)

---

## 👥 Customer Relationship Management

### leads
**Purpose:** Prospect tracking and lead management

**Key Columns:**
- `lead_code` (UNIQUE) - Lead identifier
- Contact: `full_name`, `email`, `phone_number`, `alternate_phone`
- Location: `address_line1`, `city`, `state`
- `status` - NEW/CONTACTED/QUALIFIED/CONVERTED/LOST
- `source` - Lead origin
- `priority` - HIGH/MEDIUM/LOW
- Requirements: `interested_in`, `requirement_type`, `property_preference`
- Budget: `budget_min`, `budget_max`, `preferred_location`
- `requirements` (ARRAY) - Specific requirements
- Timeline: `tentative_purchase_timeframe`, `timeline`
- Follow-up: `last_contact_date`, `follow_up_date`, `total_follow_ups`
- `assigned_to`, `assigned_at` - Sales person assignment
- Qualification: `is_qualified`, `is_first_time_buyer`, `has_existing_property`
- Financing: `needs_home_loan`, `has_approved_loan`
- Profile: `current_occupation`, `annual_income`
- Marketing: `campaign_name`, `utm_source`, `utm_medium`, `utm_campaign`
- `tags` (ARRAY) - Custom tags
- Referral: `referred_by`, `referral_name`, `referral_phone`
- Site visit: `has_site_visit`, `site_visit_status`, `total_site_visits`
- Activity: `total_calls`, `total_emails`, `total_meetings`
- Conversion: `converted_to_customer`, `converted_at`
- Loss: `lost_reason`, `lost_at`

**Total Columns:** 70+

**Relationships:**
- → `followups` (1:M)
- → `sales_tasks` (1:M)
- → `customers` (1:1 when converted)
- → `users` (M:1 for assignment)

---

### followups
**Purpose:** Lead follow-up activity tracking

**Key Columns:**
- `lead_id` (FK → leads)
- `follow_up_date`, `follow_up_type` - Schedule
- `duration_minutes` - Call/meeting duration
- `performed_by` (FK → users) - Sales person
- `outcome`, `feedback` - Follow-up results
- `customer_response`, `actions_taken` - Details
- Status tracking: `lead_status_before`, `lead_status_after`
- Planning: `next_follow_up_date`, `next_follow_up_plan`
- Site visit: `is_site_visit`, `site_visit_property`, `site_visit_rating`, `site_visit_feedback`
- Scoring: `interest_level`, `budget_fit`, `timeline_fit` (1-10)
- `reminder_sent`, `reminder_sent_at` - Reminder status

**Total Columns:** 25+

---

### sales_tasks
**Purpose:** Sales team task management

**Key Columns:**
- `title`, `description`, `task_type` - Task details
- `priority`, `status` - Priority and completion status
- Assignment: `assigned_to` (FK → users), `assigned_by`
- Timeline: `due_date`, `due_time`, `estimated_duration_minutes`
- Links: `lead_id`, `customer_id`, `property_id` - Related records
- Meeting: `location`, `location_details`, `attendees` (ARRAY), `meeting_link`
- Reminders: `send_reminder`, `reminder_before_minutes`, `reminder_sent`
- Completion: `completed_at`, `outcome`, `notes`
- `attachments` (ARRAY) - File attachments
- Recurring: `is_recurring`, `recurrence_pattern`, `parent_task_id`

**Total Columns:** 30+

---

### customers
**Purpose:** Customer master data and profile management

**Key Columns:**
- `customer_code` (UNIQUE) - Customer identifier
- Personal: `first_name`, `last_name`, `email`, `phone`, `alternate_phone`
- Demographics: `date_of_birth`, `gender`, `marital_status`
- Address: `address_line1`, `address_line2`, `city`, `state`, `pincode`, `country`
- KYC Documents:
  - `pan_number`, `pan_document`
  - `aadhar_number`, `aadhar_document`
  - `passport_number`, `passport_document`
- Professional: `occupation`, `company_name`, `annual_income`
- System: `portal_user_id` (FK → users) - Customer portal access
- Source tracking: `source`, `referred_by`, `broker_id`
- `notes` - Additional notes

**Total Columns:** 30+

**Relationships:**
- → `bookings` (1:M)
- → `payments` (1:M)
- → `users` (1:1 for portal access)

---

## 📝 Sales & Bookings

### bookings
**Purpose:** Property booking contracts and agreements

**Key Columns:**
- `booking_number` (UNIQUE) - Booking identifier
- Links: `customer_id` (FK), `flat_id` (FK), `property_id` (FK)
- `status` - TOKEN_PAID/CONFIRMED/CANCELLED/COMPLETED
- `booking_date` - Booking date
- Financial:
  - `total_amount`, `booking_amount`
  - `paid_amount`, `balance_amount`
- Token payment: `token_payment_mode`, `rtgs_number`, `utr_number`
- Cheque: `cheque_number`, `cheque_date`, `payment_bank`, `payment_branch`
- Agreement: `agreement_number`, `agreement_date`, `agreement_signed_date`, `agreement_document_url`
- Possession: `expected_possession_date`, `actual_possession_date`
- `registration_date` - Registry date
- Charges:
  - `discount_amount`, `discount_reason`
  - `stamp_duty`, `registration_charges`, `gst_amount`
  - `maintenance_deposit`, `parking_charges`, `other_charges`
- Broker: `is_broker_involved`, `broker_id`, `broker_commission_percent`, `broker_commission_amount`
- `sales_person_id` (FK → users) - Sales person
- Cancellation: `is_cancelled`, `cancelled_at`, `cancellation_reason`, `refund_amount`
- Payment plan: `payment_plan_type`, `emi_amount`, `loan_bank`, `loan_amount`
- Co-applicants: `co_applicant_name`, `co_applicant_relation`

**Total Columns:** 70+

**Relationships:**
- → `customers` (M:1)
- → `flats` (M:1)
- → `properties` (M:1)
- → `payments` (1:M)
- → `payment_schedules` (1:M)
- → `payment_installments` (1:M)

---

## 💰 Financial Management

### payments
**Purpose:** Payment transaction records

**Key Columns:**
- `payment_number` (UNIQUE) - Payment identifier
- Links: `booking_id` (FK), `customer_id` (FK)
- `amount`, `payment_date` - Basic details
- `payment_mode` - CASH/CHEQUE/UPI/CARD/BANK_TRANSFER/DD
- `status` - PENDING/VERIFIED/APPROVED/BOUNCED/REFUNDED
- `verification_status` - 3-step verification workflow
- Transaction details:
  - `transaction_reference`, `cheque_number`, `cheque_date`
  - `bank_name`, `branch_name`, `account_number`
  - `upi_id`, `card_last_four_digits`
- TDS: `tds_amount`, `tds_percentage`, `tds_certificate`
- Penalties: `late_payment_fee`, `penalty_amount`
- Receipt: `receipt_number`, `receipt_url`
- Verification: `verified_by`, `verified_at`, `approved_by`, `approved_at`
- Bounce handling: `bounced_at`, `bounce_reason`
- Refund: `refund_requested`, `refund_amount`, `refund_date`

**Total Columns:** 60+

---

### payment_schedules
**Purpose:** Payment installment plans

**Key Columns:**
- `booking_id` (FK → bookings)
- `installment_number`, `installment_name` - Schedule details
- `due_date`, `due_amount` - Due information
- `paid_amount`, `balance_amount` - Payment tracking
- `status` - PENDING/PAID/OVERDUE/CANCELLED
- `payment_id` (FK → payments) - Link to actual payment

---

### payment_installments
**Purpose:** Detailed installment tracking

Similar structure to `payment_schedules` with additional fields for recurring payment management.

---

### payment_refunds
**Purpose:** Refund processing and tracking

**Key Columns:**
- `payment_id` (FK → payments)
- `refund_amount`, `refund_reason`
- `refund_mode`, `refund_date`
- `refund_status` - REQUESTED/APPROVED/PROCESSED/REJECTED
- `approved_by`, `approved_at`
- `transaction_reference` - Bank transaction ref

---

### demand_drafts
**Purpose:** Demand draft payment tracking

**Key Columns:**
- `dd_number` (UNIQUE) - DD number
- Links: `booking_id` (FK), `customer_id` (FK)
- `amount`, `issue_date` - DD details
- Bank: `bank_name`, `branch_name`
- `payee_name` - Payee details
- `status` - ISSUED/DEPOSITED/CLEARED/BOUNCED
- Processing: `deposit_date`, `clearance_date`
- `return_reason` - If bounced

**Total Columns:** 30+

---

## 👔 Human Resources

### employees
**Purpose:** Comprehensive employee records

**Key Columns:**
- `employee_code` (UNIQUE) - Employee identifier
- Personal: `full_name`, `email`, `phone_number`, `alternate_phone`
- Demographics: `date_of_birth`, `gender`, `blood_group`, `marital_status`
- Address: `current_address`, `permanent_address`, `city`, `state`, `pincode`
- Job: `department`, `designation`
- Employment: `employment_type`, `employment_status`
- Dates: `joining_date`, `confirmation_date`, `resignation_date`, `last_working_date`
- Reporting: `reporting_manager_id`, `reporting_manager_name`
- Salary structure:
  - `basic_salary`, `house_rent_allowance`, `transport_allowance`
  - `medical_allowance`, `other_allowances`, `gross_salary`
  - Deductions: `pf_deduction`, `esi_deduction`, `tax_deduction`
  - `net_salary`
- Banking: `bank_name`, `bank_account_number`, `ifsc_code`, `branch_name`
- Documents: `aadhar_number`, `pan_number`, `pf_number`, `esi_number`, `uan_number`
- `documents` (ARRAY) - Document URLs
- Emergency: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`
- Leave balances: `casual_leave_balance`, `sick_leave_balance`, `earned_leave_balance`, `leave_taken`
- Attendance: `total_present`, `total_absent`, `total_late_arrival`
- Professional: `skills`, `qualifications`, `experience`
- Performance: `performance_rating`, `last_review_date`
- `notes`, `tags` (ARRAY)
- `user_id` (FK → users) - System account link

**Total Columns:** 80+

**Relationships:**
- → `employee_documents` (1:M)
- → `employee_reviews` (1:M)
- → `employee_feedback` (1:M)
- → `bonuses` (1:M)
- → `salary_payments` (1:M)

---

### employee_documents
**Purpose:** Employee document management

**Key Columns:**
- `employee_id` (FK → employees)
- `document_type`, `document_name` - Document info
- `document_number`, `document_description`
- `document_url`, `file_name`, `file_type`, `file_size` - File details
- `document_status` - PENDING/APPROVED/REJECTED
- Dates: `issue_date`, `expiry_date`
- `is_expirable`, `is_verified`
- Verification: `verified_by`, `verified_at`, `verification_remarks`
- Rejection: `rejected_by`, `rejected_at`, `rejection_reason`
- Reminders: `send_expiry_reminder`, `reminder_days_before`, `last_reminder_sent`

---

### employee_reviews
**Purpose:** Performance review tracking

**Key Columns:**
- `employee_id` (FK → employees)
- `review_type`, `review_title`, `review_date` - Review details
- `review_period_start`, `review_period_end` - Period covered
- `review_status` - SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED
- Reviewer: `reviewer_id`, `reviewer_name`, `reviewer_designation`
- Ratings (0-5):
  - `technical_skills_rating`, `communication_rating`
  - `teamwork_rating`, `leadership_rating`
  - `problem_solving_rating`, `initiative_rating`
  - `punctuality_rating`, `quality_of_work_rating`
  - `productivity_rating`, `attendance_rating`
  - `overall_rating`
- Feedback: `achievements`, `strengths`, `areas_of_improvement`
- Planning: `goals`, `training_needs`, `development_plan`
- Comments: `reviewer_comments`, `employee_comments`
- Targets: `target_achievement`, `actual_achievement`, `kpi_achievement_percentage`
- Recommendations:
  - `recommended_for_promotion`, `recommended_for_increment`, `recommended_increment_percentage`
  - `recommended_for_bonus`, `recommended_bonus_amount`
  - `recommended_for_training`, `training_recommendations`
- `action_items`, `next_review_date`
- Acknowledgment: `employee_acknowledged`, `employee_acknowledged_at`
- Approval: `manager_approved`, `manager_approved_by`, `manager_approved_at`

**Total Columns:** 50+

---

### employee_feedback
**Purpose:** 360-degree feedback collection

Similar structure to employee_reviews but focused on peer/subordinate feedback.

---

### bonuses
**Purpose:** Bonus and incentive management

**Key Columns:**
- `employee_id` (FK → employees)
- `bonus_type`, `bonus_title`, `bonus_description`
- `bonus_amount`, `bonus_date`, `payment_date`
- Performance: `performance_rating`, `target_amount`, `achieved_amount`, `achievement_percentage`
- `bonus_status` - PENDING/APPROVED/PAID/REJECTED
- Approval: `approved_by`, `approved_at`, `approval_remarks`
- Rejection: `rejected_by`, `rejected_at`, `rejection_reason`
- Payment: `transaction_reference`, `payment_mode`, `payment_remarks`
- `tax_deduction`, `net_bonus_amount`

---

### salary_payments
**Purpose:** Monthly salary processing

**Key Columns:**
- `employee_id` (FK → employees)
- `payment_month` - Month being paid
- Attendance: `working_days`, `present_days`, `absent_days`, `paid_leave_days`, `unpaid_leave_days`
- `overtime_hours`, `overtime_payment`
- Salary components (same as employees table)
- Deductions: including `advance_deduction`, `loan_deduction`
- `payment_status`, `payment_mode`, `payment_date`
- `transaction_reference`, `payment_remarks`
- Banking details for payment
- `approved_by`, `approved_at`

---

### sales_targets
**Purpose:** Sales person target and achievement tracking

**Key Columns:**
- `sales_person_id` (FK → users)
- `target_period`, `start_date`, `end_date` - Period
- Targets:
  - `target_leads`, `target_site_visits`, `target_conversions`
  - `target_bookings`, `target_revenue`
  - `self_target_bookings`, `self_target_revenue` - Self-set targets
- Achievements:
  - `achieved_leads`, `achieved_site_visits`, `achieved_conversions`
  - `achieved_bookings`, `achieved_revenue`
- Achievement percentages for each metric
- Incentives:
  - `base_incentive`, `earned_incentive`, `bonus_incentive`, `total_incentive`
  - `incentive_paid`, `incentive_paid_date`
- `motivational_message` - Auto-generated motivation
- `missed_by` - Gap to target
- `status` - IN_PROGRESS/COMPLETED/MISSED

**Total Columns:** 30+

---

## 🏗️ Construction Management

### construction_projects
**Purpose:** Construction project lifecycle tracking

**Key Columns:**
- `project_code` (UNIQUE), `project_name`
- `property_id` (FK → properties)
- `project_type`, `project_status`
- Timeline: `start_date`, `expected_end_date`, `actual_end_date`
- Budget: `total_budget`, `budget_spent`, `budget_remaining`
- Contractor: `contractor_name`, `contractor_company`, `contractor_phone`, `contractor_email`
- 13 Construction phases (each with status, dates, progress %):
  1. `foundation_status`, `foundation_start_date`, `foundation_end_date`, `foundation_progress`
  2. `plinth_status`, ...
  3. `basement_status`, ...
  4. `ground_floor_status`, ...
  5. `typical_floors_status`, ...
  6. `top_floor_status`, ...
  7. `terrace_status`, ...
  8. `external_plastering_status`, ...
  9. `internal_plastering_status`, ...
  10. `electrical_status`, ...
  11. `plumbing_status`, ...
  12. `flooring_status`, ...
  13. `finishing_status`, ...
- `overall_progress_percentage` - Overall completion
- Quality: `quality_rating`, `safety_rating`
- Workforce: `total_workforce`, `supervisors_count`
- `delays_in_days`, `delay_reason`
- `notes`, `attachments` (ARRAY)

**Total Columns:** 80+

**Relationships:**
- → `construction_teams` (1:M)
- → `construction_flat_progress` (1:M)
- → `construction_tower_progress` (1:M)
- → `construction_development_updates` (1:M)

---

### construction_teams
**Purpose:** Construction team management

**Key Columns:**
- `project_id` (FK → construction_projects)
- `team_name`, `team_type`, `team_lead_name`
- `total_members`, `active_members`
- `assigned_work`, `work_status`
- `start_date`, `end_date`

---

### construction_flat_progress
**Purpose:** Flat-level construction progress tracking

**Key Columns:**
- `project_id` (FK)
- `flat_id` (FK → flats)
- Progress for each construction phase
- `overall_completion_percentage`
- Quality checks per phase

---

### construction_tower_progress
**Purpose:** Tower-level construction progress tracking

Similar to flat progress but at tower level.

---

### construction_development_updates
**Purpose:** Progress updates and milestone tracking

**Key Columns:**
- `project_id` (FK)
- `update_date`, `update_type`, `update_title`
- `description`, `progress_percentage`
- `photos` (ARRAY), `videos` (ARRAY)
- `created_by` (FK → users)

---

### construction_progress_logs
**Purpose:** Detailed daily progress logs

**Key Columns:**
- `project_id` (FK)
- `log_date`, `log_type`
- Work done: `work_description`, `work_completed`
- Resources: `materials_used`, `equipment_used`
- Workforce: `workers_present`, `hours_worked`
- Issues: `issues_faced`, `solutions_applied`
- Weather conditions, safety incidents

---

### construction_project_assignments
**Purpose:** Assignment of personnel to projects

**Key Columns:**
- `project_id` (FK)
- `employee_id` (FK → employees)
- `role`, `responsibilities`
- `assignment_date`, `completion_date`

---

## 📦 Procurement & Materials

### materials
**Purpose:** Construction material catalog and inventory

**Key Columns:**
- `material_code` (UNIQUE), `material_name`
- Classification: `category`, `sub_category`
- `description`, `specifications`
- `unit_of_measurement` - kg, ltr, pcs, sqft, etc.
- Stock: `current_stock_quantity`, `reorder_level`, `min_stock_level`, `max_stock_level`
- Costing: `unit_cost`, `total_value`
- Supplier: `supplier_name`, `supplier_contact`
- Storage: `warehouse_location`, `storage_requirements`
- `quality_grade`, `is_perishable`, `shelf_life_days`
- Purchasing: `last_purchase_date`, `last_purchase_price`
- `tags` (ARRAY)

**Total Columns:** 50+

**Relationships:**
- → `material_entries` (1:M)
- → `material_exits` (1:M)

---

### material_entries
**Purpose:** Material stock-in records

**Key Columns:**
- `material_id` (FK → materials)
- `entry_date`, `entry_type` - PURCHASE/RETURN/ADJUSTMENT
- `quantity`, `unit_cost`, `total_cost`
- `supplier_name`, `invoice_number`
- `purchase_order_id` (FK)
- Quality: `quality_check_done`, `quality_rating`
- `received_by` (FK → users)

---

### material_exits
**Purpose:** Material stock-out records

**Key Columns:**
- `material_id` (FK → materials)
- `exit_date`, `exit_type` - CONSUMPTION/SALE/WASTAGE
- `quantity`, `unit_cost`, `total_cost`
- `project_id` (FK) - Where material was used
- `issued_to`, `issued_by`
- `remarks`

---

### vendors
**Purpose:** Vendor/supplier master data

**Key Columns:**
- `vendor_code` (UNIQUE), `vendor_name`
- Contact: `contact_person`, `email`, `phone`, `alternate_phone`
- Address: `address`, `city`, `state`, `pincode`, `country`
- Tax: `gst_number`, `pan_number`, `tan_number`
- Business: `vendor_type`, `business_category`
- Terms: `payment_terms`, `credit_limit`, `credit_period_days`
- Banking: `bank_name`, `account_number`, `ifsc_code`, `account_holder_name`
- `rating`, `is_active`, `is_blacklisted`, `blacklist_reason`

**Total Columns:** 40+

**Relationships:**
- → `purchase_orders` (1:M)
- → `vendor_payments` (1:M)

---

### purchase_orders
**Purpose:** Procurement order management

**Key Columns:**
- `po_number` (UNIQUE) - PO identifier
- `vendor_id` (FK → vendors)
- `property_id`, `project_id` - Project linking
- `po_date`, `delivery_date`, `expected_delivery_date`
- `status` - DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED/COMPLETED
- Pricing:
  - `subtotal`, `tax_amount`, `discount_amount`
  - `shipping_charges`, `other_charges`
  - `final_amount`
- Terms: `payment_terms`, `delivery_terms`, `warranty_terms`
- Approval workflow:
  - `submitted_by`, `submitted_at`
  - `reviewed_by`, `reviewed_at`
  - `approved_by`, `approved_at`
  - `rejection_reason`
- Delivery:
  - `delivered_date`, `received_by`
  - `quality_check_done`, `quality_rating`
- `notes`, `attachments` (ARRAY)

**Total Columns:** 60+

**Relationships:**
- → `purchase_order_items` (1:M)
- → `vendors` (M:1)

---

### purchase_order_items
**Purpose:** Line items in purchase orders

**Key Columns:**
- `purchase_order_id` (FK → purchase_orders)
- `material_id` (FK → materials)
- `item_description`, `quantity`, `unit_price`
- `tax_rate`, `tax_amount`, `total_amount`
- Delivery: `delivered_quantity`, `pending_quantity`
- `item_status` - PENDING/PARTIAL/DELIVERED

---

### vendor_payments
**Purpose:** Payments to vendors

**Key Columns:**
- `vendor_id` (FK → vendors)
- `purchase_order_id` (FK)
- `payment_number`, `payment_date`
- `amount`, `payment_mode`
- TDS: `tds_amount`, `tds_percentage`
- `net_payment_amount`
- `transaction_reference`, `payment_status`

---

## 💬 Communication & Collaboration

### notifications
**Purpose:** System-wide notification management

**Key Columns:**
- Targeting (one of):
  - `target_user_id` (FK → users) - Specific user
  - `target_roles` (comma-separated) - Role-based
  - `target_departments` (comma-separated) - Department-based
- `title`, `message` - Notification content
- `type` - INFO/SUCCESS/WARNING/ERROR/ALERT
- `category` - BOOKING/PAYMENT/LEAD/CONSTRUCTION/EMPLOYEE/CUSTOMER/ACCOUNTING/SYSTEM/TASK/REMINDER
- `priority` (1-10) - Priority level
- `is_read`, `read_at` - Read tracking
- `action_url` - Deep link to relevant page
- Email: `should_send_email`, `email_sent`, `email_sent_at`
- `created_at`, `created_by`

**Total Columns:** 20+

**Usage:**
- Real-time notifications in bell icon
- Email notifications (if configured)
- Role-based broadcasting
- Department-based messaging

---

### chat_groups
**Purpose:** Chat conversation management

**Key Columns:**
- `group_name`, `description`
- `is_direct_message` - TRUE for 1-on-1 chats
- `created_by` (FK → users)
- `last_message_at` - For sorting
- `is_active`

**Relationships:**
- → `chat_participants` (1:M)
- → `chat_messages` (1:M)

---

### chat_participants
**Purpose:** Chat group membership

**Key Columns:**
- `group_id` (FK → chat_groups)
- `user_id` (FK → users)
- `role` - ADMIN/MEMBER
- `joined_at`, `last_read_at` - Read tracking

---

### chat_messages
**Purpose:** Chat messages

**Key Columns:**
- `group_id` (FK → chat_groups)
- `sender_id` (FK → users)
- `message_text` - Message content
- `message_type` - TEXT/FILE/IMAGE
- `reply_to_message_id` - Threading support
- `mentioned_users` (ARRAY) - @mentions
- `is_edited`, `edited_at`
- `is_deleted`, `deleted_at`
- `created_at`

**Relationships:**
- → `chat_attachments` (1:M)

---

### chat_attachments
**Purpose:** File attachments in chat

**Key Columns:**
- `message_id` (FK → chat_messages)
- `file_name`, `file_type`, `file_size`
- `file_url`, `thumbnail_url`

---

## 📊 Accounting Module

### accounts
**Purpose:** Chart of accounts

**Key Columns:**
- `account_code` (UNIQUE), `account_name`
- `account_type` - ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE
- `parent_account_id` (self-referencing) - Account hierarchy
- `opening_balance`, `current_balance`
- `is_active`, `is_system_account`

**Relationships:**
- Self-referencing for account hierarchy
- → `journal_entries` (1:M)

---

### journal_entries
**Purpose:** Double-entry bookkeeping transactions

**Key Columns:**
- `entry_number` (UNIQUE)
- `entry_date`, `entry_type`
- `description`, `reference_number`
- `total_debit`, `total_credit` - Must be equal
- `status` - DRAFT/POSTED/CANCELLED
- `posted_by`, `posted_at`
- `fiscal_year_id` (FK → fiscal_years)

**Relationships:**
- → `journal_entry_lines` (1:M)

---

### journal_entry_lines
**Purpose:** Individual debit/credit lines in journal entries

**Key Columns:**
- `journal_entry_id` (FK → journal_entries)
- `account_id` (FK → accounts)
- `line_type` - DEBIT/CREDIT
- `amount`, `description`

---

### budgets
**Purpose:** Budget planning and tracking

**Key Columns:**
- `budget_name`, `fiscal_year_id` (FK)
- `account_id` (FK → accounts)
- `budget_period` - MONTHLY/QUARTERLY/ANNUAL
- `budget_amount`, `actual_amount`, `variance`
- `start_date`, `end_date`

---

### expenses
**Purpose:** Expense tracking

**Key Columns:**
- `expense_number`, `expense_date`
- `category`, `subcategory`
- `amount`, `tax_amount`, `total_amount`
- `vendor_id` (FK → vendors)
- `payment_mode`, `payment_status`
- `description`, `receipt_url`
- Approval: `approved_by`, `approved_at`

---

### fiscal_years
**Purpose:** Financial year management

**Key Columns:**
- `year_name`, `start_date`, `end_date`
- `is_closed`, `closed_by`, `closed_at`

---

### bank_accounts
**Purpose:** Company bank account management

**Key Columns:**
- `account_number`, `bank_name`, `branch_name`
- `account_holder_name`, `ifsc_code`
- `account_type`, `opening_balance`, `current_balance`

---

### bank_statements
**Purpose:** Bank statement reconciliation

**Key Columns:**
- `bank_account_id` (FK → bank_accounts)
- `transaction_date`, `transaction_type`
- `amount`, `balance`
- `reference_number`, `description`
- `is_reconciled`, `reconciled_with_entry_id`

---

## 📢 Marketing

### campaigns
**Purpose:** Marketing campaign tracking and ROI analysis

**Key Columns:**
- `campaign_code` (UNIQUE), `name`
- `description`, `objective`
- `channel` - 18+ channels: Google Ads, Facebook, Instagram, LinkedIn, YouTube, Email, SMS, WhatsApp, Print Media, Radio, TV, Outdoor/Hoarding, Events, Referral, Direct, Website, SEO, Content Marketing
- `campaign_type`, `target_audience` (JSONB)
- Timeline: `start_date`, `end_date`
- Budget: `total_budget`, `budget_spent`, `budget_remaining`
- Metrics:
  - `impressions`, `clicks`, `ctr` (click-through rate)
  - `leads_generated`, `qualified_leads`
  - `conversions`, `conversion_rate`
  - `cost_per_lead`, `cost_per_conversion`
  - `revenue_generated`, `roi`
- UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- `landing_page_url`, `tracking_url`
- Agency: `agency_name`, `agency_contact`
- `status` - PLANNED/ACTIVE/PAUSED/COMPLETED/CANCELLED

**Total Columns:** 70+

---

## 📞 Telephony & IVR

*Note: Telephony module is in a separate schema*

### call_logs
**Purpose:** Inbound/outbound call tracking

**Key Columns:**
- `call_id` (UNIQUE), `call_type` - INBOUND/OUTBOUND
- `caller_number`, `receiver_number`
- `lead_id` (FK → leads), `customer_id` (FK)
- `agent_id` (FK → users)
- Timeline: `start_time`, `end_time`, `duration_seconds`
- `call_status` - ANSWERED/MISSED/BUSY/FAILED
- IVR: `ivr_path`, `dtmf_inputs`
- Recording: `recording_url`, `recording_duration`
- `call_quality_rating`, `agent_notes`

---

### call_recordings
**Purpose:** Call recording storage

**Key Columns:**
- `call_id` (FK → call_logs)
- `recording_url`, `file_size`, `duration`
- `transcription_status`, `transcription_id`

---

### call_transcriptions
**Purpose:** AI-powered call transcriptions

**Key Columns:**
- `recording_id` (FK → call_recordings)
- `transcription_text`, `language`
- `transcription_provider` - Whisper/Google/Azure
- `confidence_score`
- `created_at`

---

### ai_insights
**Purpose:** AI-generated insights from calls

**Key Columns:**
- `call_id` (FK → call_logs)
- `sentiment` - POSITIVE/NEUTRAL/NEGATIVE
- `sentiment_score`, `intent`
- `key_phrases` (ARRAY), `action_items` (ARRAY)
- `summary`, `recommendations`

---

### agent_availability
**Purpose:** Call agent availability tracking

**Key Columns:**
- `agent_id` (FK → users)
- `status` - AVAILABLE/BUSY/AWAY/OFFLINE
- `current_call_id` (FK → call_logs)
- `total_calls_today`, `average_call_duration`

---

### round_robin_config
**Purpose:** Call routing configuration

**Key Columns:**
- `department`, `priority`
- `agent_ids` (ARRAY) - Agents in rotation
- `current_index` - Current position in rotation
- `is_active`

---

## 🔄 Database Relationships Diagram

### Core Entity Relationships

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       ├──→ user_roles ←──→ roles ←──→ role_permissions ←──→ permissions
       │
       ├──→ employees (1:1)
       ├──→ leads (assigned_to)
       ├──→ sales_tasks (assigned_to)
       └──→ notifications (target_user_id)

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  properties  │──→(M) │    towers    │──→(M) │    flats     │
└──────┬───────┘       └──────────────┘       └──────┬───────┘
       │                                              │
       ├──→ construction_projects (1:1)               │
       └──→ bookings (1:M)                            │
                      │                               │
                      └───────────────────────────────┘

┌──────────────┐       ┌──────────────┐
│    leads     │──→    │  customers   │
└──────┬───────┘       └──────┬───────┘
       │                      │
       ├──→ followups (1:M)   ├──→ bookings (1:M)
       └──→ sales_tasks (M:1) └──→ payments (1:M)

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   bookings   │──→(M) │   payments   │       │payment_schedule│
└──────────────┘       └──────────────┘       └──────────────┘
       │                      
       └──→ payment_schedules (1:M)
       └──→ payment_installments (1:M)
       └──→ demand_drafts (1:M)

┌──────────────────┐       ┌──────────────────┐
│construction_proj │──→(M) │construction_teams│
└────────┬─────────┘       └──────────────────┘
         │
         ├──→ construction_flat_progress (1:M)
         ├──→ construction_tower_progress (1:M)
         ├──→ construction_development_updates (1:M)
         └──→ construction_progress_logs (1:M)

┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  materials   │←──(M) │ material_entries │       │  material_exits  │
└──────────────┘       └──────────────────┘       └──────────────────┘

┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   vendors    │←──(M) │ purchase_orders  │──→(M) │ purchase_order   │
└──────────────┘       └──────────────────┘       │     _items       │
       │                                           └──────────────────┘
       └──→ vendor_payments (1:M)

┌──────────────┐       ┌──────────────────┐
│ chat_groups  │──→(M) │chat_participants │
└──────┬───────┘       └──────────────────┘
       │
       └──→ chat_messages (1:M) ──→ chat_attachments (1:M)

┌──────────────┐       ┌──────────────────┐
│  accounts    │←──(M) │journal_entry_lines│
└──────────────┘       └──────────────────┘
                                │
                                └──→ journal_entries (M:1)
```

---

## 📝 Common Queries

### Get all properties with tower and flat counts
```sql
SELECT 
  p.name,
  COUNT(DISTINCT t.id) as tower_count,
  COUNT(DISTINCT f.id) as flat_count,
  COUNT(CASE WHEN f.status = 'Available' THEN 1 END) as available_flats
FROM properties p
LEFT JOIN towers t ON t.property_id = p.id
LEFT JOIN flats f ON f.property_id = p.id
GROUP BY p.id, p.name
ORDER BY p.name;
```

### Get lead conversion rate
```sql
SELECT 
  COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END)::DECIMAL / COUNT(*) * 100 as conversion_rate,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END) as converted_leads
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Get booking revenue by month
```sql
SELECT 
  DATE_TRUNC('month', booking_date) as month,
  COUNT(*) as total_bookings,
  SUM(total_amount) as revenue,
  SUM(paid_amount) as collected,
  SUM(balance_amount) as pending
FROM bookings
WHERE status NOT IN ('CANCELLED')
GROUP BY month
ORDER BY month DESC;
```

### Get employee salary summary
```sql
SELECT 
  department,
  COUNT(*) as employee_count,
  AVG(gross_salary) as avg_gross,
  SUM(gross_salary) as total_gross,
  SUM(net_salary) as total_net
FROM employees
WHERE employment_status = 'ACTIVE'
GROUP BY department
ORDER BY total_gross DESC;
```

### Get construction project progress
```sql
SELECT 
  cp.project_name,
  p.name as property_name,
  cp.overall_progress_percentage,
  cp.budget_spent,
  cp.total_budget,
  CASE 
    WHEN cp.actual_end_date IS NOT NULL THEN 'Completed'
    WHEN cp.expected_end_date < CURRENT_DATE THEN 'Delayed'
    ELSE 'On Track'
  END as status
FROM construction_projects cp
JOIN properties p ON p.id = cp.property_id
ORDER BY cp.overall_progress_percentage DESC;
```

### Get sales performance
```sql
SELECT 
  u.first_name || ' ' || u.last_name as sales_person,
  COUNT(b.id) as bookings_count,
  SUM(b.total_amount) as revenue,
  AVG(b.total_amount) as avg_booking_value
FROM users u
JOIN bookings b ON b.sales_person_id = u.id
WHERE b.booking_date >= NOW() - INTERVAL '30 days'
  AND b.status != 'CANCELLED'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY revenue DESC;
```

---

## 🎓 Tips for Working with This Database

### 1. **Use Database Explorer UI**
- Navigate to `/database` in the application
- Browse all tables and their structures
- View live data with pagination
- Export data to CSV

### 2. **Understanding Naming Conventions**
- **Table names:** Lowercase, plural, underscores (e.g., `employee_documents`)
- **Column names:** Lowercase, underscores (snake_case)
- **Foreign keys:** `{referenced_table}_id` (e.g., `customer_id`)
- **Timestamps:** All tables have `created_at`, `updated_at`
- **Soft deletes:** Many tables have `is_active` or `status`

### 3. **Common Field Patterns**
- **Codes:** Most entities have unique codes (e.g., `property_code`, `lead_code`)
- **Audit fields:** `created_by`, `updated_by`, `created_at`, `updated_at`
- **JSONB fields:** Used for flexible data (images, amenities, room details)
- **Array fields:** Used for multiple values (tags, documents, requirements)

### 4. **Performance Tips**
- All tables have proper indexes on foreign keys
- Use `EXPLAIN ANALYZE` for slow queries
- Indexes exist on commonly filtered columns (status, dates, codes)
- Use pagination for large result sets

### 5. **Data Integrity**
- Foreign key constraints enforce referential integrity
- Unique constraints prevent duplicates
- Check constraints ensure valid data ranges
- Use transactions for multi-table operations

---

## 📞 Need Help?

- **Database UI:** `/database` - Visual explorer
- **API Docs:** `/api/docs` - Swagger documentation (if configured)
- **Onboarding Guide:** `ONBOARDING_GUIDE.md`
- **Deployment Guide:** `DEPLOYMENT.md`

---

**Generated:** February 2026  
**Version:** 1.0  
**Maintained by:** Eastern Estate Development Team
