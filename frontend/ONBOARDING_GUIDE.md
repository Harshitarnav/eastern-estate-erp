# 🚀 Eastern Estate ERP - Complete Onboarding Guide for Newcomers

**Welcome to the Team!** This guide will help you understand the codebase, set up your environment, and start contributing effectively.

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack Deep Dive](#technology-stack-deep-dive)
3. [Architecture & Code Organization](#architecture--code-organization)
4. [Database Schema Complete Reference](#database-schema-complete-reference)
5. [Setting Up Development Environment](#setting-up-development-environment)
6. [Understanding the Codebase](#understanding-the-codebase)
7. [How to Add New Features](#how-to-add-new-features)
8. [Common Development Tasks](#common-development-tasks)
9. [Debugging & Troubleshooting](#debugging--troubleshooting)
10. [Best Practices & Coding Standards](#best-practices--coding-standards)
11. [Testing Guidelines](#testing-guidelines)
12. [Deployment Process](#deployment-process)

---

## 📖 Project Overview

### What is Eastern Estate ERP?

Eastern Estate ERP is a **comprehensive Real Estate Management System** that handles:
- Property & inventory management
- Lead generation & CRM
- Customer relationship management
- Booking & payment processing
- Construction project tracking
- HR & employee management
- Accounting & financial operations
- Marketing campaign analytics
- Internal team communication (Chat & Notifications)

### Key Statistics
- **60+ Entity Files** representing database tables
- **400+ TypeScript Files** in backend
- **220+ React Components** in frontend
- **150+ API Endpoints**
- **45+ Database Tables** including all modules
- **900+ Database Fields** across all tables
- **16 Complete Modules** with full CRUD operations

---

## 🛠️ Technology Stack Deep Dive

### Backend (NestJS)

```
Location: /backend/
Entry Point: /backend/src/main.ts
Port: 3001
```

#### Core Technologies
- **NestJS 11.x**: Modern TypeScript framework with dependency injection
- **TypeORM 0.3.x**: Database ORM with entity-based architecture
- **PostgreSQL 16+**: Primary database
- **JWT Authentication**: Token-based auth with refresh tokens
- **Passport.js**: Authentication middleware
- **Multer**: File upload handling
- **bcrypt**: Password hashing
- **class-validator**: Request validation
- **class-transformer**: DTO transformations

#### Backend Structure
```
backend/src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module (imports all other modules)
│
├── auth/                       # Authentication module
│   ├── auth.controller.ts      # Login, register, refresh token endpoints
│   ├── auth.service.ts         # Auth business logic
│   ├── strategies/             # JWT & Local strategies
│   ├── guards/                 # Auth guards (JWT, Roles)
│   └── decorators/             # Custom decorators (@Public, @Roles)
│
├── common/                     # Shared utilities
│   ├── guards/                 # Permissions guard
│   ├── filters/                # Exception filters
│   ├── interceptors/           # Logging, caching interceptors
│   └── upload/                 # File upload service
│
├── config/                     # Configuration files
│   ├── configuration.ts        # Environment config
│   └── validation.ts           # Env validation schema
│
├── database/                   # Database utilities
│   ├── schema-sync.service.ts  # Schema synchronization
│   └── seeds/                  # Database seeders
│
└── modules/                    # Business modules
    ├── accounting/             # Accounting & finance
    ├── bookings/               # Property bookings
    ├── chat/                   # Team chat system
    ├── construction/           # Construction projects
    ├── customers/              # Customer management
    ├── demand-drafts/          # Demand drafts
    ├── employees/              # HR & employee management
    ├── flats/                  # Flat/unit management
    ├── leads/                  # Lead & CRM
    ├── marketing/              # Marketing campaigns
    ├── materials/              # Material management
    ├── notifications/          # Notification system
    ├── payments/               # Payment processing
    ├── properties/             # Property management
    ├── purchase-orders/        # Procurement
    ├── roles/                  # Role & permissions
    ├── telephony/              # Call management system
    ├── towers/                 # Building towers
    ├── users/                  # User management
    └── vendors/                # Vendor management
```

### Frontend (Next.js)

```
Location: /frontend/
Entry Point: /frontend/src/app/layout.tsx
Port: 3000
```

#### Core Technologies
- **Next.js 15.x**: React framework with App Router
- **React 19.x**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Headless UI components
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Axios**: HTTP client
- **Zustand**: State management
- **Lucide React**: Icon library
- **Recharts**: Data visualization

#### Frontend Structure
```
frontend/src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # Auth pages (login, register)
│   └── (dashboard)/            # Protected dashboard pages
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # Dashboard home
│       ├── properties/         # Properties pages
│       ├── leads/              # Leads pages
│       ├── customers/          # Customers pages
│       ├── bookings/           # Bookings pages
│       ├── payments/           # Payments pages
│       ├── employees/          # Employees pages
│       ├── construction/       # Construction pages
│       ├── marketing/          # Marketing pages
│       ├── accounting/         # Accounting pages
│       └── settings/           # Settings pages
│
├── components/                 # React components
│   ├── layout/                 # Layout components
│   │   ├── Sidebar.tsx         # Main navigation sidebar
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   └── NotificationBell.tsx # Notification center
│   ├── forms/                  # Form components
│   ├── tables/                 # Data table components
│   ├── modals/                 # Modal dialogs
│   ├── charts/                 # Chart components
│   └── ui/                     # Reusable UI components
│
├── services/                   # API service layer
│   ├── api.ts                  # Axios instance & interceptors
│   ├── auth.service.ts         # Auth API calls
│   ├── properties.service.ts   # Properties API calls
│   ├── leads.service.ts        # Leads API calls
│   └── ... (one per module)
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── usePermissions.ts       # Permissions hook
│   └── useProperties.ts        # Properties data hook
│
├── store/                      # Zustand stores
│   ├── authStore.ts            # Auth state
│   └── propertyStore.ts        # Property state
│
├── types/                      # TypeScript type definitions
│   ├── auth.types.ts
│   ├── property.types.ts
│   └── ... (one per module)
│
├── lib/                        # Utility functions
│   └── utils.ts                # Helper functions
│
└── utils/                      # More utilities
    ├── formatters.ts           # Data formatters
    ├── validators.ts           # Validation helpers
    └── constants.ts            # Constants
```

### Database (PostgreSQL)

```
Location: PostgreSQL Server
Schema Files: /database-schema.sql, /backend/*.sql
```

#### Database Extensions
- **uuid-ossp**: UUID generation
- **pgcrypto**: Encryption functions
- **pg_trgm**: Text search optimization

---

## 🏗️ Architecture & Code Organization

### Module-Based Architecture

Each business module follows this structure:

```
modules/<module-name>/
├── <module>.module.ts          # NestJS module definition
├── <module>.controller.ts      # HTTP endpoints
├── <module>.service.ts         # Business logic
├── entities/                   # TypeORM entities (database models)
│   └── <entity>.entity.ts
├── dto/                        # Data Transfer Objects
│   ├── create-<entity>.dto.ts  # Creation payload
│   ├── update-<entity>.dto.ts  # Update payload
│   ├── query-<entity>.dto.ts   # Query parameters
│   └── <entity>-response.dto.ts # Response format
└── guards/                     # Module-specific guards (optional)
```

### Request Flow

```
1. Frontend Component
   ↓ (makes API call via service)
2. Frontend Service (e.g., leads.service.ts)
   ↓ (HTTP request with JWT token)
3. Backend Controller (e.g., leads.controller.ts)
   ↓ (validates JWT, checks permissions)
4. Backend Service (e.g., leads.service.ts)
   ↓ (business logic, data transformation)
5. TypeORM Repository
   ↓ (SQL queries)
6. PostgreSQL Database
   ↓ (returns data)
7. Response flows back through the same layers
```

### Authentication Flow

```
1. User submits login credentials
   ↓
2. AuthController.login()
   ↓
3. AuthService.validateUser()
   ↓
4. Check password with bcrypt
   ↓
5. Generate JWT access token + refresh token
   ↓
6. Store refresh token in database
   ↓
7. Return tokens to frontend
   ↓
8. Frontend stores tokens (localStorage)
   ↓
9. All subsequent requests include: Authorization: Bearer <token>
   ↓
10. JwtAuthGuard validates token on each request
```

---

## 💾 Database Schema Complete Reference

### Core Tables (45+ Tables Total)

#### 1. **Authentication & Authorization**

**users** (22 columns)
```sql
Primary Table for all system users
- id (UUID, PK)
- email, username (unique)
- password_hash
- first_name, last_name, phone
- profile_image, is_active, is_verified
- last_login_at, failed_login_attempts
- created_at, updated_at, created_by, updated_by
```

**roles** (10 columns)
```sql
Role definitions (Super Admin, Admin, Sales Manager, etc.)
- id (UUID, PK)
- name (unique), display_name, description
- is_system, is_active
```

**permissions** (8 columns)
```sql
Granular permissions (module, action, resource)
- id (UUID, PK)
- module, action, resource
- name, display_name, description
```

**user_roles** (Junction table)
```sql
Many-to-many: users ↔ roles
- user_id (FK users)
- role_id (FK roles)
- assigned_at, assigned_by
```

**role_permissions** (Junction table)
```sql
Many-to-many: roles ↔ permissions
- role_id (FK roles)
- permission_id (FK permissions)
- constraints (JSONB for additional rules)
```

**refresh_tokens** (7 columns)
```sql
JWT refresh token storage
- id (UUID, PK)
- user_id (FK users)
- token (unique)
- expires_at, ip_address, user_agent
```

#### 2. **Properties & Inventory**

**properties** (40+ columns)
```sql
Master property/project records
- id (UUID, PK)
- property_code (unique), name, description
- address, city, state, pincode
- latitude, longitude, total_area
- number_of_towers, number_of_units
- launch_date, expected_completion_date
- rera_number, rera_status
- project_type, property_type, status
- price_min, price_max
- bhk_types (array), images (JSONB), amenities (JSONB)
- data_completion_pct, data_completeness_status
- created_at, updated_at, created_by, updated_by
```

**towers** (30+ columns)
```sql
Building towers within properties
- id (UUID, PK)
- property_id (FK properties)
- tower_code, name, description
- total_floors, flats_per_floor, total_flats
- facing, has_lift, number_of_lifts
- parking_type, parking_capacity
- amenities (JSONB), layout_images (JSONB)
- status, is_active
```

**flats** (40+ columns)
```sql
Individual units/apartments
- id (UUID, PK)
- property_id (FK properties)
- tower_id (FK towers)
- flat_code, flat_number, flat_type
- carpet_area, built_up_area, super_built_up_area
- base_rate_per_sqft, base_price
- gst_amount, registration_charges, total_price
- bedrooms, bathrooms, balconies
- has_study_room, has_servant_room, has_pooja_room
- facing, furnishing_status, flooring_type
- room_details (JSONB), images (JSONB)
- status (Available/Booked/Sold)
- is_verified, verified_at, verified_by
```

#### 3. **CRM & Leads**

**leads** (70+ columns)
```sql
Prospect tracking and lead management
- id (UUID, PK)
- lead_code (unique), full_name
- email, phone_number, alternate_phone
- address, city, state
- status (NEW/CONTACTED/QUALIFIED/CONVERTED/LOST)
- source, priority (HIGH/MEDIUM/LOW)
- interested_in, requirement_type
- property_preference, budget_min, budget_max
- preferred_location, requirements (array)
- tentative_purchase_timeframe, timeline
- last_contact_date, follow_up_date
- total_follow_ups, send_follow_up_reminder
- assigned_to, assigned_at
- is_qualified, is_first_time_buyer
- needs_home_loan, has_approved_loan
- annual_income, current_occupation
- campaign_name, utm_source, utm_medium, utm_campaign
- tags (array)
- has_site_visit, site_visit_status
- total_site_visits, total_calls, total_emails, total_meetings
- converted_to_customer, converted_at
- lost_reason, lost_at
```

**followups** (25+ columns)
```sql
Lead follow-up activities
- id (UUID, PK)
- lead_id (FK leads)
- follow_up_date, follow_up_type
- performed_by (FK users)
- outcome, feedback, customer_response
- lead_status_before, lead_status_after
- next_follow_up_date, next_follow_up_plan
- is_site_visit, site_visit_property
- interest_level, budget_fit, timeline_fit
- reminder_sent, reminder_sent_at
```

**sales_tasks** (30+ columns)
```sql
Sales team task management
- id (UUID, PK)
- title, description, task_type
- priority, status (PENDING/IN_PROGRESS/COMPLETED)
- assigned_to (FK users), assigned_by
- due_date, due_time, estimated_duration_minutes
- lead_id, customer_id, property_id
- location, attendees (array), meeting_link
- send_reminder, reminder_before_minutes
- outcome, notes, attachments (array)
- is_recurring, recurrence_pattern
```

#### 4. **Customers**

**customers** (30+ columns)
```sql
Customer master data
- id (UUID, PK)
- customer_code (unique)
- first_name, last_name, email, phone
- date_of_birth, gender, marital_status
- address_line1, address_line2, city, state, pincode
- pan_number, pan_document
- aadhar_number, aadhar_document
- passport_number, passport_document
- occupation, company_name, annual_income
- portal_user_id (FK users)
- source, referred_by, broker_id
- notes, is_active
```

#### 5. **Bookings & Payments**

**bookings** (70+ columns)
```sql
Property booking contracts
- id (UUID, PK)
- booking_number (unique)
- customer_id (FK customers)
- flat_id (FK flats)
- property_id (FK properties)
- status (TOKEN_PAID/CONFIRMED/CANCELLED/COMPLETED)
- booking_date
- total_amount, booking_amount, paid_amount, balance_amount
- payment details: token_payment_mode, rtgs_number, utr_number
- cheque_number, cheque_date, payment_bank
- agreement_number, agreement_date, agreement_document_url
- expected_possession_date, actual_possession_date
- discount_amount, discount_reason
- stamp_duty, registration_charges, gst_amount
- maintenance_deposit, parking_charges
- broker details: is_broker_involved, broker_id, broker_commission
- sales_person_id
- cancellation details: cancelled_at, cancellation_reason
```

**payments** (60+ columns)
```sql
Payment transactions
- id (UUID, PK)
- payment_number (unique)
- booking_id (FK bookings)
- customer_id (FK customers)
- amount, payment_date
- payment_mode (CASH/CHEQUE/UPI/CARD/BANK_TRANSFER/DD)
- status (PENDING/VERIFIED/APPROVED/BOUNCED/REFUNDED)
- verification_status (3-step: unverified → verified → approved)
- transaction details: transaction_reference, cheque_number
- bank_name, branch_name, account_number
- upi_id, card_last_four_digits
- tds_amount, tds_percentage
- late_payment_fee, penalty_amount
- receipt_number, receipt_url
- verified_by, verified_at, approved_by, approved_at
```

**payment_schedules** (20+ columns)
```sql
Payment installment plans
- id (UUID, PK)
- booking_id (FK bookings)
- installment_number, installment_name
- due_date, due_amount
- paid_amount, balance_amount
- status (PENDING/PAID/OVERDUE/CANCELLED)
- payment_id (FK payments - if paid)
- notes
```

**payment_installments** (Additional installment tracking)
**payment_refunds** (Refund processing)

#### 6. **HR & Employees**

**employees** (80+ columns)
```sql
Comprehensive employee records
- id (UUID, PK)
- employee_code (unique), full_name
- email, phone_number, alternate_phone
- date_of_birth, gender, blood_group, marital_status
- current_address, permanent_address, city, state, pincode
- department, designation
- employment_type (FULL_TIME/PART_TIME/CONTRACT/INTERN)
- employment_status (ACTIVE/ON_LEAVE/TERMINATED/RESIGNED)
- joining_date, confirmation_date, resignation_date
- reporting_manager_id, reporting_manager_name
- Salary structure:
  - basic_salary, house_rent_allowance
  - transport_allowance, medical_allowance
  - other_allowances, gross_salary
  - pf_deduction, esi_deduction, tax_deduction
  - net_salary
- Bank details: bank_name, account_number, ifsc_code
- Documents: aadhar_number, pan_number, pf_number, esi_number
- Leave balances: casual_leave, sick_leave, earned_leave
- Attendance: total_present, total_absent, total_late_arrival
- skills, qualifications, experience
- performance_rating, last_review_date
- user_id (FK users - if system user)
```

**employee_documents** (Employee document management)
**employee_feedback** (Performance feedback)
**employee_reviews** (Performance reviews)
**bonuses** (Bonus management)
**salary_payments** (Monthly salary tracking)

**sales_targets** (30+ columns)
```sql
Sales person targets and achievements
- id (UUID, PK)
- sales_person_id (FK users)
- target_period, start_date, end_date
- target_leads, target_site_visits, target_conversions
- target_bookings, target_revenue
- achieved_leads, achieved_site_visits, achieved_conversions
- achieved_bookings, achieved_revenue
- Achievement percentages for each metric
- base_incentive, earned_incentive, bonus_incentive
- incentive_paid, incentive_paid_date
- status (IN_PROGRESS/COMPLETED/MISSED)
```

#### 7. **Construction Management**

**construction_projects** (80+ columns)
```sql
Construction project tracking
- id (UUID, PK)
- project_code (unique), project_name
- property_id (FK properties)
- project_type, project_status
- start_date, expected_end_date, actual_end_date
- total_budget, budget_spent, budget_remaining
- contractor_name, contractor_company, contractor_phone
- Project phases (13 phases):
  - foundation, plinth, basement, ground_floor
  - typical_floors, top_floor, terrace
  - external_plastering, internal_plastering
  - electrical, plumbing, flooring, finishing
- Each phase has: status, start_date, end_date, progress_pct
- overall_progress_percentage
- quality_rating, safety_rating
- total_workforce, supervisors_count
- delays_in_days, delay_reason
- notes, attachments (array)
```

**construction_project_assignments** (Team assignments)
**construction_teams** (Team management)
**construction_flat_progress** (Flat-level progress)
**construction_tower_progress** (Tower-level progress)
**construction_development_updates** (Progress updates)
**construction_progress_logs** (Detailed logs)

#### 8. **Materials & Procurement**

**materials** (50+ columns)
```sql
Construction material catalog
- id (UUID, PK)
- material_code (unique), material_name
- category, sub_category
- description, specifications
- unit_of_measurement
- current_stock_quantity, reorder_level, min_stock_level
- unit_cost, total_value
- supplier_name, supplier_contact
- warehouse_location, storage_requirements
- quality_grade, is_perishable
- last_purchase_date, last_purchase_price
- tags (array)
```

**material_entries** (Stock in)
**material_exits** (Stock out)

**purchase_orders** (60+ columns)
```sql
Procurement orders
- id (UUID, PK)
- po_number (unique)
- vendor_id (FK vendors)
- property_id, project_id
- po_date, delivery_date
- status (DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED/COMPLETED)
- total_amount, tax_amount, discount_amount, final_amount
- payment_terms, delivery_terms
- approved_by, approved_at
- rejection_reason
- created_by, updated_by
```

**purchase_order_items** (Line items)

**vendors** (40+ columns)
```sql
Vendor/supplier management
- id (UUID, PK)
- vendor_code (unique), vendor_name
- contact_person, email, phone
- address, city, state, pincode
- gst_number, pan_number
- vendor_type, business_category
- payment_terms, credit_limit
- bank_name, account_number, ifsc_code
- rating, is_active
```

**vendor_payments** (Vendor payment tracking)

#### 9. **Accounting & Finance**

**accounts** (Chart of accounts)
```sql
- id (UUID, PK)
- account_code (unique), account_name
- account_type (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE)
- parent_account_id (self-referencing)
- is_active, opening_balance, current_balance
```

**journal_entries** (Accounting transactions)
**journal_entry_lines** (Transaction lines)
**budgets** (Budget planning)
**expenses** (Expense tracking)
**fiscal_years** (Financial year management)
**bank_accounts** (Bank account management)
**bank_statements** (Bank reconciliation)

#### 10. **Demand Drafts**

**demand_drafts** (30+ columns)
```sql
DD tracking for payments
- id (UUID, PK)
- dd_number (unique)
- booking_id (FK bookings)
- customer_id (FK customers)
- amount, issue_date
- bank_name, branch_name
- payee_name, status
- deposit_date, clearance_date
- return_reason (if bounced)
```

#### 11. **Marketing**

**campaigns** (40+ columns)
```sql
Marketing campaign tracking
- id (UUID, PK)
- campaign_code (unique), name
- description, objective
- channel (18+ channels: Google Ads, Facebook, Instagram, etc.)
- campaign_type, target_audience (JSONB)
- start_date, end_date
- total_budget, budget_spent
- impressions, clicks, ctr (click-through rate)
- leads_generated, conversions
- cost_per_lead, cost_per_conversion
- revenue_generated, roi
- status (PLANNED/ACTIVE/PAUSED/COMPLETED)
```

#### 12. **Notifications**

**notifications** (20+ columns)
```sql
System notifications
- id (UUID, PK)
- target_user_id (FK users) - for specific user
- target_roles (comma-separated) - for role-based
- target_departments (comma-separated) - for dept-based
- title, message
- type (INFO/SUCCESS/WARNING/ERROR/ALERT)
- category (BOOKING/PAYMENT/LEAD/CONSTRUCTION/etc.)
- priority (1-10)
- is_read, read_at
- action_url (link to relevant page)
- should_send_email, email_sent, email_sent_at
- created_at
```

#### 13. **Chat System**

**chat_groups** (Group/conversation management)
```sql
- id (UUID, PK)
- group_name, description
- is_direct_message (true for 1-on-1 chats)
- created_by
- last_message_at
```

**chat_participants** (Group members)
```sql
- id (UUID, PK)
- group_id (FK chat_groups)
- user_id (FK users)
- role (ADMIN/MEMBER)
- joined_at, last_read_at
```

**chat_messages** (Messages)
```sql
- id (UUID, PK)
- group_id (FK chat_groups)
- sender_id (FK users)
- message_text
- message_type (TEXT/FILE/IMAGE)
- reply_to_message_id (for threading)
- mentioned_users (array)
- is_edited, edited_at
- is_deleted, deleted_at
- created_at
```

**chat_attachments** (File attachments)

#### 14. **Telephony (Call Management)**

**call_logs** (Inbound/outbound calls)
**call_recordings** (Call recordings)
**call_transcriptions** (AI transcriptions)
**ai_insights** (AI-generated insights)
**agent_availability** (Agent status)
**round_robin_config** (Call routing)

### Database Relationships

```
Core Relationships:

properties (1) ──→ (M) towers ──→ (M) flats
                                      │
                                      │
customers (1) ──→ (M) bookings ──→ (1) flats
                       │
                       ├──→ (M) payments
                       └──→ (M) payment_schedules

leads (1) ──→ (M) followups
leads (1) ──→ (M) sales_tasks
leads (1) ──→ (1) customers (when converted)

users (M) ←──→ (M) roles ←──→ (M) permissions
users (1) ──→ (M) employees (linked via user_id)
users (1) ──→ (1) sales_targets

construction_projects (1) ──→ (1) properties
construction_projects (1) ──→ (M) construction_teams
construction_projects (1) ──→ (M) construction_flat_progress
construction_projects (1) ──→ (M) construction_tower_progress

purchase_orders (1) ──→ (1) vendors
purchase_orders (1) ──→ (M) purchase_order_items
purchase_orders (1) ──→ (M) vendor_payments

materials (1) ──→ (M) material_entries
materials (1) ──→ (M) material_exits

chat_groups (1) ──→ (M) chat_participants ──→ (1) users
chat_groups (1) ──→ (M) chat_messages ──→ (1) users (sender)
```

---

## 🔧 Setting Up Development Environment

### Prerequisites

Install the following before starting:
- **Node.js** v18+ (Download from nodejs.org)
- **npm** v9+ (comes with Node.js)
- **PostgreSQL** 16+ (Download from postgresql.org)
- **Git** (Download from git-scm.com)
- **VS Code** or your preferred IDE
- **Postman** or **Thunder Client** (for API testing)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd eastern-estate-erp
```

#### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb eastern_estate_erp

# Or using psql:
psql -U postgres
CREATE DATABASE eastern_estate_erp;
\q
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required .env variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_DATABASE=eastern_estate_erp
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRES_IN=30d

# Server
PORT=3001
NODE_ENV=development

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:3000

# Email (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@easternstate.com
```

```bash
# Run database schema
cd ..  # back to root
psql -U postgres -d eastern_estate_erp -f database-schema.sql

# Go back to backend
cd backend

# Start development server
npm run start:dev

# Server should now be running on http://localhost:3001
```

#### 4. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Required .env.local variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# Start development server
npm run dev

# Frontend should now be running on http://localhost:3000
```

#### 5. Create First Admin User

**Option A: Using API (recommended)**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@easternstate.com",
    "username": "admin",
    "password": "Admin@123",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

**Option B: Using database seed**
```bash
cd backend
npm run seed:users
```

**Assign super_admin role:**
```bash
psql -U postgres -d eastern_estate_erp

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@easternstate.com'
AND r.name = 'super_admin';

\q
```

#### 6. Test Login

1. Go to http://localhost:3000
2. Login with:
   - Email: admin@easternstate.com
   - Password: Admin@123
3. You should see the dashboard

---

## 📖 Understanding the Codebase

### How to Read the Code

#### Backend: Understanding a Module

Let's take **Leads Module** as an example:

**1. Start with the Entity** (`backend/src/modules/leads/entities/lead.entity.ts`)
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('leads')  // This maps to 'leads' table in database
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  leadCode: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ default: 'NEW' })
  status: string;

  // ... more columns

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```
**Key points:**
- `@Entity('leads')` links this class to the `leads` database table
- Each `@Column()` represents a database column
- TypeORM automatically handles the mapping between camelCase (TypeScript) and snake_case (database)

**2. Check the DTOs** (`backend/src/modules/leads/dto/`)

DTOs (Data Transfer Objects) define the shape of data for API requests/responses:

```typescript
// create-lead.dto.ts
export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  source?: string;

  // ... more fields
}
```
**Key points:**
- Uses `class-validator` decorators for validation
- `@IsOptional()` means the field is not required
- Backend automatically validates incoming requests against these DTOs

**3. Review the Service** (`backend/src/modules/leads/leads.service.ts`)

Services contain business logic:

```typescript
@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    // Generate lead code
    const leadCode = await this.generateLeadCode();

    // Create entity
    const lead = this.leadsRepository.create({
      ...createLeadDto,
      leadCode,
    });

    // Save to database
    return await this.leadsRepository.save(lead);
  }

  async findAll(query: QueryLeadDto): Promise<{ data: Lead[], total: number }> {
    const queryBuilder = this.leadsRepository.createQueryBuilder('lead');

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('lead.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(lead.fullName ILIKE :search OR lead.email ILIKE :search OR lead.phoneNumber ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Pagination
    const total = await queryBuilder.getCount();
    queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);

    const data = await queryBuilder.getMany();
    return { data, total };
  }

  // ... more methods
}
```
**Key points:**
- `@InjectRepository(Lead)` injects the TypeORM repository
- `Repository` provides methods like `create()`, `save()`, `find()`, `update()`, `delete()`
- `createQueryBuilder()` is used for complex queries

**4. Check the Controller** (`backend/src/modules/leads/leads.controller.ts`)

Controllers define API endpoints:

```typescript
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles('super_admin', 'admin', 'sales_manager', 'sales_executive')
  async create(@Body() createLeadDto: CreateLeadDto) {
    return await this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles('super_admin', 'admin', 'sales_manager', 'sales_executive')
  async findAll(@Query() query: QueryLeadDto) {
    return await this.leadsService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'sales_manager', 'sales_executive')
  async findOne(@Param('id') id: string) {
    return await this.leadsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'sales_manager', 'sales_executive')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return await this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin', 'sales_manager')
  async remove(@Param('id') id: string) {
    return await this.leadsService.remove(id);
  }
}
```
**Key points:**
- `@Controller('leads')` sets base route to `/leads`
- `@Post()`, `@Get()`, `@Patch()`, `@Delete()` define HTTP methods
- `@UseGuards(JwtAuthGuard, RolesGuard)` protects all routes
- `@Roles()` specifies which roles can access each endpoint
- `@Body()` extracts request body
- `@Query()` extracts query parameters
- `@Param('id')` extracts URL parameters

**5. Check the Module** (`backend/src/modules/leads/leads.module.ts`)

Modules tie everything together:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Lead, Followup, SalesTask])],
  controllers: [LeadsController],
  providers: [LeadsService, FollowupService, SalesTaskService],
  exports: [LeadsService],
})
export class LeadsModule {}
```
**Key points:**
- `imports`: Registers entities with TypeORM
- `controllers`: Lists HTTP controllers
- `providers`: Lists services (dependency injection)
- `exports`: Makes services available to other modules

#### Frontend: Understanding a Page

Let's take **Leads Page** as an example:

**1. Page Component** (`frontend/src/app/(dashboard)/leads/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { leadsService } from '@/services/leads.service';
import { Lead } from '@/types/leads.types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, [page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsService.getLeads({ page, limit: 10 });
      setLeads(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = () => {
    // Open create modal
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button onClick={handleCreateLead}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <LeadsTable leads={leads} onRefresh={fetchLeads} />
      )}
    </div>
  );
}
```

**2. Service Layer** (`frontend/src/services/leads.service.ts`)

```typescript
import { api } from './api';
import { Lead, CreateLeadDto, UpdateLeadDto } from '@/types/leads.types';

export const leadsService = {
  async getLeads(params?: any) {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  async getLead(id: string) {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  async createLead(data: CreateLeadDto) {
    const response = await api.post('/leads', data);
    return response.data;
  },

  async updateLead(id: string, data: UpdateLeadDto) {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id: string) {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};
```

**3. API Configuration** (`frontend/src/services/api.ts`)

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh or logout
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);
```

**4. Types** (`frontend/src/types/leads.types.ts`)

```typescript
export interface Lead {
  id: string;
  leadCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  source: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  // ... more fields
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  source?: string;
  priority?: string;
  // ... more fields
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}
```

### Common Code Patterns

#### 1. **Error Handling (Backend)**

```typescript
async findOne(id: string): Promise<Lead> {
  const lead = await this.leadsRepository.findOne({ where: { id } });
  
  if (!lead) {
    throw new NotFoundException(`Lead with ID ${id} not found`);
  }
  
  return lead;
}
```

#### 2. **Error Handling (Frontend)**

```typescript
const handleSubmit = async (data: CreateLeadDto) => {
  try {
    setLoading(true);
    await leadsService.createLead(data);
    toast.success('Lead created successfully');
    router.push('/leads');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to create lead');
  } finally {
    setLoading(false);
  }
};
```

#### 3. **Pagination (Backend)**

```typescript
async findAll(query: QueryDto) {
  const skip = (query.page - 1) * query.limit;
  const [data, total] = await this.repository.findAndCount({
    skip,
    take: query.limit,
    order: { [query.sortBy]: query.sortOrder },
  });
  
  return {
    data,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
```

#### 4. **Authentication (Frontend)**

```typescript
// useAuth hook
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await authService.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}
```

---

## 🆕 How to Add New Features

### Adding a New Module (Full Stack)

Let's say you want to add a "Vendors" module (if not already present).

#### Backend Steps

**1. Generate Module Structure**

```bash
cd backend
nest g module modules/vendors
nest g service modules/vendors
nest g controller modules/vendors
```

**2. Create Entity** (`backend/src/modules/vendors/entities/vendor.entity.ts`)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  vendorCode: string;

  @Column()
  vendorName: string;

  @Column()
  contactPerson: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  gstNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
```

**3. Create DTOs**

`dto/create-vendor.dto.ts`:
```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  vendorName: string;

  @IsString()
  contactPerson: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;
}
```

`dto/update-vendor.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}
```

`dto/query-vendor.dto.ts`:
```typescript
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVendorDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
```

**4. Implement Service** (`vendors.service.ts`)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto, QueryVendorDto } from './dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto, userId: string): Promise<Vendor> {
    const vendorCode = await this.generateVendorCode();
    
    const vendor = this.vendorsRepository.create({
      ...createVendorDto,
      vendorCode,
      createdBy: userId,
    });

    return await this.vendorsRepository.save(vendor);
  }

  async findAll(query: QueryVendorDto) {
    const queryBuilder = this.vendorsRepository.createQueryBuilder('vendor');

    if (query.search) {
      queryBuilder.where(
        '(vendor.vendorName ILIKE :search OR vendor.email ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .orderBy('vendor.createdAt', 'DESC');

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto, userId: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    
    Object.assign(vendor, {
      ...updateVendorDto,
      updatedBy: userId,
    });

    return await this.vendorsRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorsRepository.remove(vendor);
  }

  private async generateVendorCode(): Promise<string> {
    const count = await this.vendorsRepository.count();
    return `VND${String(count + 1).padStart(6, '0')}`;
  }
}
```

**5. Implement Controller** (`vendors.controller.ts`)

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, QueryVendorDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles('super_admin', 'admin', 'procurement_manager')
  create(@Body() createVendorDto: CreateVendorDto, @Request() req) {
    return this.vendorsService.create(createVendorDto, req.user.id);
  }

  @Get()
  @Roles('super_admin', 'admin', 'procurement_manager', 'store_keeper')
  findAll(@Query() query: QueryVendorDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'procurement_manager', 'store_keeper')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'procurement_manager')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto, @Request() req) {
    return this.vendorsService.update(id, updateVendorDto, req.user.id);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
```

**6. Update Module** (`vendors.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor])],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
```

**7. Register in App Module** (`app.module.ts`)

```typescript
import { VendorsModule } from './modules/vendors/vendors.module';

@Module({
  imports: [
    // ... other modules
    VendorsModule,
  ],
})
export class AppModule {}
```

#### Frontend Steps

**1. Create Types** (`frontend/src/types/vendor.types.ts`)

```typescript
export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}
```

**2. Create Service** (`frontend/src/services/vendors.service.ts`)

```typescript
import { api } from './api';
import { Vendor, CreateVendorDto, UpdateVendorDto } from '@/types/vendor.types';

export const vendorsService = {
  async getVendors(params?: any) {
    const response = await api.get('/vendors', { params });
    return response.data;
  },

  async getVendor(id: string): Promise<Vendor> {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  async createVendor(data: CreateVendorDto): Promise<Vendor> {
    const response = await api.post('/vendors', data);
    return response.data;
  },

  async updateVendor(id: string, data: UpdateVendorDto): Promise<Vendor> {
    const response = await api.patch(`/vendors/${id}`, data);
    return response.data;
  },

  async deleteVendor(id: string): Promise<void> {
    await api.delete(`/vendors/${id}`);
  },
};
```

**3. Create Page** (`frontend/src/app/(dashboard)/vendors/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { vendorsService } from '@/services/vendors.service';
import { Vendor } from '@/types/vendor.types';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchVendors();
  }, [page, search]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorsService.getVendors({ page, limit: 10, search });
      setVendors(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Button onClick={() => router.push('/vendors/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{vendor.vendorCode}</td>
                  <td className="px-6 py-4 text-sm font-medium">{vendor.vendorName}</td>
                  <td className="px-6 py-4 text-sm">{vendor.contactPerson}</td>
                  <td className="px-6 py-4 text-sm">{vendor.email}</td>
                  <td className="px-6 py-4 text-sm">{vendor.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/vendors/${vendor.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

**4. Add to Navigation** (`frontend/src/components/layout/Sidebar.tsx`)

```typescript
// Add vendors link
{
  name: 'Vendors',
  href: '/vendors',
  icon: <Users className="w-5 h-5" />,
  roles: ['super_admin', 'admin', 'procurement_manager'],
},
```

---

## 🔍 Common Development Tasks

### 1. Running the Application

```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 2. Viewing Logs

**Backend logs:**
- Console output shows all requests and errors
- TypeORM queries are logged if `DB_LOGGING=true`

**Frontend logs:**
- Browser console (F12 → Console)
- Network tab for API calls

### 3. Database Operations

**View all tables:**
```bash
psql -U postgres -d eastern_estate_erp -c "\dt"
```

**View table structure:**
```bash
psql -U postgres -d eastern_estate_erp -c "\d+ users"
```

**Query data:**
```bash
psql -U postgres -d eastern_estate_erp -c "SELECT * FROM users LIMIT 5;"
```

**Backup database:**
```bash
pg_dump -U postgres eastern_estate_erp > backup_$(date +%Y%m%d).sql
```

**Restore database:**
```bash
psql -U postgres -d eastern_estate_erp < backup_20240101.sql
```

### 4. Testing APIs

**Using curl:**
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@easternstate.com", "password": "Admin@123"}'

# Get leads (with JWT token)
curl http://localhost:3001/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Using Postman:**
1. Create a new request
2. Set method and URL
3. Add Authorization header: `Bearer <token>`
4. Send request

### 5. Adding New Database Columns

**Option 1: Manual SQL (recommended for production)**
```sql
ALTER TABLE leads ADD COLUMN priority_score INTEGER DEFAULT 0;
```

**Option 2: TypeORM Synchronization (development only)**
1. Add column to entity:
```typescript
@Column({ default: 0 })
priorityScore: number;
```
2. Set `DB_SYNCHRONIZE=true` in .env
3. Restart backend (TypeORM will auto-update schema)
4. ⚠️ **NEVER use in production!**

### 6. Debugging Backend

**Add console logs:**
```typescript
console.log('Lead created:', lead);
console.log('User ID:', req.user.id);
```

**Use VS Code debugger:**
1. Add breakpoint (click left of line number)
2. Run → Start Debugging (F5)
3. Choose "Node.js"

### 7. Debugging Frontend

**Use browser DevTools:**
- F12 → Console
- Network tab for API calls
- React DevTools extension

**Add console logs:**
```typescript
console.log('Leads fetched:', leads);
```

---

## 🐛 Debugging & Troubleshooting

### Common Backend Issues

#### 1. **"Cannot connect to database"**

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
- Check PostgreSQL is running: `pg_ctl status`
- Verify .env database credentials
- Try: `psql -U postgres` to test connection
- Check port 5432 is not used by another process

#### 2. **"JWT expired"**

**Symptoms:**
```
401 Unauthorized: Token has expired
```

**Solutions:**
- Frontend: Clear localStorage and login again
- Check JWT_EXPIRES_IN in backend .env
- Implement refresh token logic

#### 3. **"Column does not exist"**

**Symptoms:**
```
QueryFailedError: column "lead_code" does not exist
```

**Solutions:**
- Run database migration
- Check entity column names match database
- TypeORM uses camelCase → snake_case conversion

#### 4. **"Circular dependency detected"**

**Symptoms:**
```
Nest can't resolve dependencies of the LeadsService (?, UsersService)
```

**Solutions:**
- Use `forwardRef()` in module imports
- Restructure dependencies to avoid circular references

### Common Frontend Issues

#### 1. **"Network Error" when calling API**

**Symptoms:**
```
AxiosError: Network Error
```

**Solutions:**
- Check backend is running on correct port
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check CORS settings in backend
- Open Network tab to see actual error

#### 2. **"Hydration failed"**

**Symptoms:**
```
Error: Hydration failed because the initial UI does not match...
```

**Solutions:**
- Don't use `localStorage` directly in component body
- Use `useEffect` for client-side only code
- Check for SSR/CSR mismatches

#### 3. **"Module not found"**

**Symptoms:**
```
Module not found: Can't resolve '@/services/vendors.service'
```

**Solutions:**
- Check file path and name
- Restart Next.js dev server
- Check tsconfig.json paths configuration

#### 4. **Infinite re-renders**

**Symptoms:**
```
Error: Too many re-renders
```

**Solutions:**
- Check `useEffect` dependencies
- Don't call `setState` in component body
- Use `useCallback` for functions passed as props

---

## ✅ Best Practices & Coding Standards

### Backend Best Practices

1. **Always use DTOs for validation**
   ```typescript
   // ✅ Good
   @Post()
   create(@Body() createDto: CreateLeadDto) {
     return this.service.create(createDto);
   }

   // ❌ Bad
   @Post()
   create(@Body() data: any) {
     return this.service.create(data);
   }
   ```

2. **Use transactions for multiple operations**
   ```typescript
   async createBooking(dto: CreateBookingDto) {
     const queryRunner = this.dataSource.createQueryRunner();
     await queryRunner.connect();
     await queryRunner.startTransaction();

     try {
       const booking = await queryRunner.manager.save(Booking, dto);
       const payment = await queryRunner.manager.save(Payment, { bookingId: booking.id });
       await queryRunner.commitTransaction();
       return booking;
     } catch (err) {
       await queryRunner.rollbackTransaction();
       throw err;
     } finally {
       await queryRunner.release();
     }
   }
   ```

3. **Use proper HTTP status codes**
   ```typescript
   // 200 OK - successful GET, PATCH
   // 201 Created - successful POST
   // 204 No Content - successful DELETE
   // 400 Bad Request - validation error
   // 401 Unauthorized - not authenticated
   // 403 Forbidden - not authorized
   // 404 Not Found - resource not found
   // 500 Internal Server Error - server error
   ```

4. **Log errors properly**
   ```typescript
   try {
     // ... code
   } catch (error) {
     this.logger.error(`Failed to create lead: ${error.message}`, error.stack);
     throw new InternalServerErrorException('Failed to create lead');
   }
   ```

### Frontend Best Practices

1. **Use TypeScript types everywhere**
   ```typescript
   // ✅ Good
   const [leads, setLeads] = useState<Lead[]>([]);

   // ❌ Bad
   const [leads, setLeads] = useState([]);
   ```

2. **Handle loading and error states**
   ```typescript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   try {
     setLoading(true);
     setError(null);
     await service.create(data);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
   ```

3. **Use environment variables for config**
   ```typescript
   // ✅ Good
   const API_URL = process.env.NEXT_PUBLIC_API_URL;

   // ❌ Bad
   const API_URL = 'http://localhost:3001';
   ```

4. **Memoize expensive computations**
   ```typescript
   const sortedLeads = useMemo(() => {
     return leads.sort((a, b) => a.priority.localeCompare(b.priority));
   }, [leads]);
   ```

### General Coding Standards

1. **Naming Conventions**
   - Files: `kebab-case.ts`
   - Classes: `PascalCase`
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Interfaces: `PascalCase` (with or without `I` prefix)

2. **Code Organization**
   - Max 300 lines per file
   - One component/class per file
   - Group related functions together
   - Use barrel exports (`index.ts`)

3. **Comments**
   ```typescript
   // ✅ Good - explain WHY, not WHAT
   // Calculate priority score based on engagement metrics
   // Higher scores indicate more engaged leads
   const priorityScore = calculatePriority(lead);

   // ❌ Bad - obvious comments
   // Set the name
   const name = lead.fullName;
   ```

4. **Git Commits**
   ```bash
   # ✅ Good
   git commit -m "feat: add vendor management module"
   git commit -m "fix: resolve lead pagination bug"
   git commit -m "docs: update API documentation"

   # ❌ Bad
   git commit -m "changes"
   git commit -m "fix stuff"
   ```

---

## 🧪 Testing Guidelines

### Backend Testing

**Unit Tests** (Service methods)
```typescript
describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
  });

  it('should create a lead', async () => {
    const dto = { fullName: 'John Doe', email: 'john@example.com', phoneNumber: '1234567890' };
    const lead = { id: '123', ...dto, leadCode: 'LEAD000001' };

    jest.spyOn(repository, 'create').mockReturnValue(lead as any);
    jest.spyOn(repository, 'save').mockResolvedValue(lead as any);

    const result = await service.create(dto);
    expect(result).toEqual(lead);
  });
});
```

**Integration Tests** (API endpoints)
```typescript
describe('LeadsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/leads (POST)', () => {
    return request(app.getHttpServer())
      .post('/leads')
      .send({ fullName: 'John Doe', email: 'john@example.com', phoneNumber: '1234567890' })
      .expect(201)
      .expect((res) => {
        expect(res.body.leadCode).toBeDefined();
      });
  });
});
```

### Frontend Testing

**Component Tests** (React Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import VendorsPage from './page';

describe('VendorsPage', () => {
  it('renders vendor list', async () => {
    render(<VendorsPage />);
    
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Add Vendor')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<VendorsPage />);
    
    const button = screen.getByText('Add Vendor');
    fireEvent.click(button);
    
    expect(screen.getByText('Create Vendor')).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment Process

See the main `DEPLOYMENT.md` file for detailed deployment instructions.

**Quick overview:**
1. Build backend: `npm run build`
2. Build frontend: `npm run build`
3. Set production environment variables
4. Run migrations: `psql -f database-schema.sql`
5. Start backend: `npm run start:prod`
6. Start frontend: `npm start`
7. Configure nginx/Caddy for reverse proxy
8. Set up SSL certificates
9. Configure CI/CD pipeline (if applicable)

---

## 📞 Getting Help

### Resources

1. **Documentation**
   - This onboarding guide
   - README.md
   - DEPLOYMENT.md
   - API documentation (coming soon)

2. **Code Comments**
   - Read inline comments in complex functions
   - Check entity files for database structure

3. **Team Communication**
   - Use internal chat system
   - Ask senior developers
   - Join team meetings

### Learning Resources

**NestJS:**
- Official docs: https://docs.nestjs.com
- YouTube: Net Ninja NestJS tutorial

**Next.js:**
- Official docs: https://nextjs.org/docs
- YouTube: Traversy Media Next.js crash course

**TypeORM:**
- Official docs: https://typeorm.io
- GitHub examples

**PostgreSQL:**
- Official docs: https://www.postgresql.org/docs
- PostgreSQL Tutorial: https://www.postgresqltutorial.com

---

## 🎉 You're Ready!

Congratulations! You now have a comprehensive understanding of the Eastern Estate ERP codebase. 

### Next Steps

1. ✅ Set up your development environment
2. ✅ Explore existing modules
3. ✅ Try adding a simple feature
4. ✅ Review code with a senior developer
5. ✅ Start contributing!

**Remember:**
- Don't be afraid to ask questions
- Read the code - it's the best documentation
- Test your changes thoroughly
- Follow coding standards
- Document your work

**Welcome to the team! Happy coding! 🚀**




# 🎯 New Team Member Onboarding Flow - Eastern Estate ERP

## 📊 Overview

This document explains the complete flow for onboarding a new team member, including which roles have access to which steps, and how the system handles authentication, authorization, and property-level access control.

---

## 🔐 Role Hierarchy & Permissions

### **1. Super Admin** (`super_admin`)
- **Full System Access** - Can do everything
- **User Count**: 1-2 (Company owners/IT heads)
- **Permissions**:
  - ✅ Create/Edit/Delete any user
  - ✅ Create/Edit/Delete any employee
  - ✅ Assign any role to anyone
  - ✅ Grant property access to anyone
  - ✅ Access all modules and data
  - ✅ System settings and configurations

### **2. Admin** (`admin`)
- **Administrative Access** - Can manage users and employees
- **User Count**: 2-5 (Operations heads, Department heads)
- **Permissions**:
  - ✅ Create/Edit/Delete users
  - ✅ Create/Edit/Delete employees
  - ✅ Assign roles (except super_admin)
  - ✅ Grant property access
  - ✅ Access most modules
  - ❌ Cannot modify super_admin accounts
  - ❌ Cannot change system settings

### **3. HR Manager** (`hr_manager`)
- **HR Operations** - Can manage employee records
- **User Count**: 1-3 (HR department staff)
- **Permissions**:
  - ✅ Create/Edit employee records
  - ✅ View all employees
  - ✅ Manage employee documents, reviews, bonuses
  - ❌ Cannot create user accounts (login access)
  - ❌ Cannot assign roles
  - ❌ Cannot grant property access
  - ❌ Cannot delete employees

### **4. Property-Level Roles** (GM Sales, GM Marketing, GM Construction)
- **Property-Specific Access** - Can only access assigned properties
- **User Count**: 3-10 per property
- **Permissions**:
  - ✅ View/Edit data for assigned properties only
  - ✅ View employees
  - ❌ Cannot create employees
  - ❌ Cannot assign roles
  - ❌ Cannot grant property access

### **5. Regular Staff** (`staff`, `agent`, etc.)
- **Basic Access** - Can view data, limited edit permissions
- **User Count**: Unlimited
- **Permissions**:
  - ✅ View data for assigned properties
  - ✅ View own employee profile
  - ❌ Cannot edit employee records
  - ❌ Cannot create users
  - ❌ Very limited access

---

## 🚀 Complete Onboarding Flow

### **Scenario: Hiring a New GM Sales for "Sunshine Apartments"**

#### **Step 1: HR Manager Creates Employee Record** 

**Actor**: HR Manager (Sarah)  
**Access Required**: `hr_manager`, `admin`, or `super_admin` role  
**Page**: Employees → Create New

**What Happens:**
```
1. Sarah navigates to: HR → Employee Login → Create New
2. Fills out form:
   - Employee Code: EMP001
   - Full Name: John Doe
   - Email: john.doe@eecd.in
   - Phone: +91 9876543210
   - Department: SALES
   - Designation: GM Sales
   - Joining Date: 2026-02-17
   - Employment Type: FULL_TIME
   - Basic Salary: ₹80,000
   - (Other fields...)
3. Clicks "Create Employee"
4. Backend validates:
   ✓ HR Manager has permission (@Roles('hr_manager', 'admin', 'super_admin'))
   ✓ Employee code is unique
   ✓ Email domain is valid
5. Employee record created in database
6. Status: ✅ Employee has HR profile, ❌ NO login access yet
```

**Database State:**
```sql
-- employees table
INSERT INTO employees (
  id, employee_code, full_name, email, phone_number,
  department, designation, user_id
) VALUES (
  'emp-uuid-123', 'EMP001', 'John Doe', 'john.doe@eecd.in', '+91 9876543210',
  'SALES', 'GM Sales', NULL  -- ← NO user_id yet!
);
```

**What John Can Do Now:**
- ❌ NOTHING - He cannot log in to the system
- ❌ No user account exists
- ✅ HR can see his record in employee list

---

#### **Step 2: Admin Creates User Account**

**Actor**: Admin (Arnav)  
**Access Required**: `admin` or `super_admin` role  
**Page**: Settings → Users → Create New  
(Or directly from Settings → Team Members)

**What Happens:**
```
1. Arnav navigates to: Settings (gear icon) → Users
2. Clicks "Create New User"
3. Fills out form:
   - Email: john.doe@eecd.in  (MUST match employee email)
   - Username: johndoe
   - Password: TempPass123!
   - First Name: John
   - Last Name: Doe
   - Phone: +91 9876543210
   - Roles: (Leave empty for now, will assign later)
4. Clicks "Create User"
5. Backend validates:
   ✓ Admin has permission (@Roles('admin', 'super_admin'))
   ✓ Email domain is @eecd.in (enforced by EmailDomainGuard)
   ✓ Email is unique
   ✓ Username is unique
6. User account created
7. Status: ✅ User account exists, ❌ NOT linked to employee yet
```

**Database State:**
```sql
-- users table
INSERT INTO users (
  id, email, username, password_hash, first_name, last_name
) VALUES (
  'user-uuid-456', 'john.doe@eecd.in', 'johndoe', 
  '$2b$12$...', 'John', 'Doe'
);

-- employees table (still no user_id!)
employee_id: 'emp-uuid-123', user_id: NULL
```

**What John Can Do Now:**
- ✅ Log in with john.doe@eecd.in / TempPass123!
- ❌ Cannot access any properties (no property access)
- ❌ Cannot view most data (no role assigned)
- ✅ Can see basic dashboard
- ❌ Employee record NOT linked to user account yet

---

#### **Step 3: Admin Links Employee to User Account**

**Actor**: Admin (Arnav)  
**Access Required**: `admin` or `super_admin` role  
**Page**: Employees → Edit Employee

**What Happens:**
```
1. Arnav navigates to: HR → Employee Login → Find "John Doe"
2. Clicks "Edit" on John's employee record
3. Scrolls to "System Access" section
4. In "Link to User Account" dropdown:
   - Sees all users with matching email: john.doe@eecd.in
   - Selects: John Doe (john.doe@eecd.in)
5. Clicks "Save"
6. Backend updates:
   ✓ Sets employee.userId = 'user-uuid-456'
7. Status: ✅ Employee and User are now linked!
```

**Database State:**
```sql
-- employees table (NOW linked!)
UPDATE employees 
SET user_id = 'user-uuid-456' 
WHERE id = 'emp-uuid-123';
```

**What John Can Do Now:**
- ✅ Log in with john.doe@eecd.in / TempPass123!
- ✅ See his employee profile when navigating to Employees
- ❌ Still cannot access any properties (no property access)
- ❌ Still very limited access (no specific role assigned)

---

#### **Step 4: Admin Assigns Role**

**Actor**: Admin (Arnav)  
**Access Required**: `admin` or `super_admin` role  
**Page**: Users → Edit User → Roles

**What Happens:**
```
1. Arnav navigates to: Settings (gear icon) → Users → Find "John Doe"
   OR clicks "Roles" button from Users list
2. Clicks "Edit Roles" or "Roles" button
3. In "Assign Roles" dialog:
   - Available roles shown:
     * Sales Agent
     * Sales Manager
     * GM Sales ← Selects this
     * GM Marketing
     * GM Construction
     * Property Manager
     * etc.
4. Selects "GM Sales" checkbox
5. Clicks "Save"
6. Backend validates:
   ✓ Admin has permission to assign roles
   ✓ Role exists in system
7. Role assigned to user
```

**Database State:**
```sql
-- roles table
role_id: 'role-gm-sales-uuid', name: 'gm_sales', display_name: 'GM Sales'

-- user_roles junction table
INSERT INTO user_roles (user_id, role_id) 
VALUES ('user-uuid-456', 'role-gm-sales-uuid');
```

**What John Can Do Now:**
- ✅ Log in with john.doe@eecd.in / TempPass123!
- ✅ Has GM Sales role
- ✅ Can access Sales & CRM modules
- ❌ Still cannot see ANY property data (no property access)
- ❌ Properties dropdown is empty
- ❌ Flats list is empty
- ❌ Customers list is empty

**🚨 This is the KEY limitation**: Without property access, John has a role but NO data to work with!

---

#### **Step 5: Admin Grants Property Access** 

**Actor**: Admin (Arnav)  
**Access Required**: `admin` or `super_admin` role  
**Page**: Users → Properties (button)

**What Happens:**
```
1. Arnav navigates to: Settings (gear icon) → Users → Find "John Doe"
2. Clicks "Properties" button next to John's name
3. Property Access Management page opens:
   
   ┌─────────────────────────────────────────────────┐
   │ Property Access for: John Doe                   │
   │ (john.doe@eecd.in)                             │
   ├─────────────────────────────────────────────────┤
   │                                                 │
   │ Current Property Access: (Empty)                │
   │                                                 │
   │ Grant New Access:                              │
   │ ┌───────────────────────────────────────────┐  │
   │ │ Property: [Sunshine Apartments ▼]         │  │
   │ │ Role:     [GM Sales ▼]                    │  │
   │ │                    [Grant Access Button]  │  │
   │ └───────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────┘
   
4. Arnav selects:
   - Property: Sunshine Apartments
   - Role: GM_SALES
5. Clicks "Grant Access"
6. Backend validates:
   ✓ Admin has permission (@Roles('admin', 'super_admin'))
   ✓ Property exists
   ✓ Role is valid
   ✓ No duplicate access
7. Property access granted
8. Page refreshes, shows:
   
   Current Property Access:
   ┌──────────────────┬─────────┬──────────┬──────────┐
   │ Property         │ Role    │ Assigned │ Actions  │
   ├──────────────────┼─────────┼──────────┼──────────┤
   │ Sunshine Apts    │ GM Sales│ Just now │ [Revoke] │
   └──────────────────┴─────────┴──────────┴──────────┘
```

**Database State:**
```sql
-- user_property_access table
INSERT INTO user_property_access (
  id, user_id, property_id, role, assigned_by, assigned_at
) VALUES (
  'access-uuid-789', 
  'user-uuid-456',
  'property-sunshine-uuid',
  'GM_SALES',
  'arnav-user-id',
  NOW()
);
```

**What John Can Do NOW (FULL ACCESS!):**
- ✅ Log in with john.doe@eecd.in / TempPass123!
- ✅ Has GM Sales role
- ✅ Has property access to "Sunshine Apartments"
- ✅ Can see Properties → Only "Sunshine Apartments" appears
- ✅ Can see Towers → Only towers in Sunshine Apartments
- ✅ Can see Flats → Only flats in Sunshine Apartments
- ✅ Can see Customers → Only customers who booked flats in Sunshine Apartments
- ✅ Can see Bookings → Only bookings for Sunshine Apartments
- ✅ Can see Payments → Only payments for Sunshine Apartments flats
- ✅ Can create new customers, bookings for Sunshine Apartments
- ❌ Cannot see other properties (e.g., "Green Valley Residency")
- ❌ Cannot access Admin features (Users, Roles, Settings)
- ❌ Cannot create/edit employees

---

#### **Step 6: John's First Login Experience**

**Actor**: New Team Member (John Doe)  
**Access**: Just granted  
**Email**: john.doe@eecd.in  
**Password**: TempPass123!

**Login Flow:**
```
1. John opens browser → https://erp.easternestates.com
2. Sees login page
3. Enters:
   - Email: john.doe@eecd.in
   - Password: TempPass123!
4. Clicks "Sign In"
5. Backend validates:
   ✓ Email domain is @eecd.in (EmailDomainGuard)
   ✓ User exists
   ✓ Password is correct
   ✓ User is active
6. JWT token generated with:
   - user.id
   - user.roles: ['gm_sales']
   - user.propertyAccess: [{ propertyId: 'sunshine-uuid', role: 'GM_SALES' }]
7. Redirects to Dashboard
```

**Dashboard View:**
```
┌─────────────────────────────────────────────────────┐
│  🏢 Eastern Estate ERP                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Dashboard                                       │
│  ─────────────                                      │
│                                                     │
│  Welcome, John Doe!                                 │
│  Role: GM Sales                                     │
│  Properties: Sunshine Apartments                    │
│                                                     │
│  ┌─────────────┬─────────────┬─────────────┐       │
│  │ Customers   │ Bookings    │ Revenue     │       │
│  │ 156         │ 45          │ ₹4.2 Cr     │       │
│  │ (Sunshine)  │ (Sunshine)  │ (Sunshine)  │       │
│  └─────────────┴─────────────┴─────────────┘       │
│                                                     │
│  Recent Activities (Sunshine Apartments only):      │
│  - New booking: Flat A-101                         │
│  - Payment received: ₹5 lakhs                      │
│  - Customer inquiry: Mr. Sharma                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Sidebar Menu (John's View):**
```
📊 Dashboard
🏢 Properties          ← Only shows Sunshine Apartments
   ├── Properties
   ├── Towers
   └── Flats
👥 Sales               ← Only Sunshine Apartments data
   ├── Customers
   └── Bookings
💰 Payments            ← Only Sunshine Apartments payments
   ├── Payment Plans
   ├── Payments
   └── Demand Drafts
🏗️ Construction        ← Only Sunshine Apartments construction
   ├── Progress Log
   └── Milestones
⚙️ Settings            ← LIMITED ACCESS
   ├── My Profile      ← Can edit own profile only
   ├── Change Password
   └── (No other settings visible)
```

---

## 🔒 Access Control Flow (How It Works Internally)

### **Every API Request:**

```typescript
// 1. User logs in → JWT token contains:
{
  id: 'user-uuid-456',
  email: 'john.doe@eecd.in',
  roles: ['gm_sales'],
  propertyAccess: [
    { propertyId: 'sunshine-uuid', role: 'GM_SALES' }
  ]
}

// 2. User requests: GET /api/v1/flats
Request Headers: {
  Authorization: 'Bearer <jwt-token>'
}

// 3. Backend flow:
JwtAuthGuard
  ↓ Validates token
  ↓ Attaches user to request
  ↓
RolesGuard (if @Roles decorator present)
  ↓ Checks if user has required role
  ↓ gm_sales ✓ (for endpoints requiring sales role)
  ↓
PropertyAccessGuard (if enabled)
  ↓ Checks if user has access to requested propertyId
  ↓ If propertyId in request → checks user.propertyAccess
  ↓ If match found → Allow
  ↓ If no match → 403 Forbidden
  ↓
FlatsService.findAll()
  ↓ Filters flats by user's accessible properties
  ↓ WHERE property_id IN ('sunshine-uuid')
  ↓
Returns: Only flats from Sunshine Apartments
```

### **Example: John tries to access a flat from different property:**

```bash
# John tries to access Flat B-201 from "Green Valley Residency"
GET /api/v1/flats/flat-b-201-uuid

# Backend checks:
1. JwtAuthGuard → ✓ Valid token
2. RolesGuard → ✓ Has gm_sales role
3. PropertyAccessGuard → 
   - Flat B-201 belongs to property: green-valley-uuid
   - John's property access: ['sunshine-uuid']
   - Match? NO ❌
   - Result: 403 Forbidden

Response:
{
  "statusCode": 403,
  "message": "Access denied to property green-valley-uuid."
}
```

---

## 📋 Complete Access Matrix

| Action | Super Admin | Admin | HR Manager | GM Sales | Staff |
|--------|------------|-------|------------|----------|-------|
| **Employees** |
| Create Employee | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Employees | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Employee | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** |
| Create User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Grant Property Access | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Properties** |
| View Properties | ✅ All | ✅ All | ✅ All | ✅ Assigned Only | ✅ Assigned Only |
| Create Property | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Property | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Sales & Bookings** |
| View Customers | ✅ All | ✅ All | ✅ All | ✅ Assigned Props | ✅ Assigned Props |
| Create Booking | ✅ | ✅ | ❌ | ✅ | ✅ |
| Edit Booking | ✅ | ✅ | ❌ | ✅ | ❌ |
| Cancel Booking | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Payments** |
| View Payments | ✅ All | ✅ All | ❌ | ✅ Assigned Props | ✅ Assigned Props |
| Record Payment | ✅ | ✅ | ❌ | ✅ | ❌ |
| Generate Demand Draft | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Construction** |
| View Progress | ✅ All | ✅ All | ❌ | ✅ Assigned Props | ✅ Assigned Props |
| Log Progress | ✅ | ✅ | ❌ | ✅ (GM Cons) | ❌ |

---

## 🎯 Quick Reference: Onboarding Checklist

### **For HR Manager:**
- [ ] Create employee record in system
- [ ] Collect employee documents (Aadhar, PAN, etc.)
- [ ] Set up payroll details
- [ ] Assign reporting manager
- [ ] Inform Admin that employee account is ready

### **For Admin:**
- [ ] Verify employee record exists
- [ ] Create user account with @eecd.in email
- [ ] Link employee.userId to user account
- [ ] Assign appropriate role (GM Sales, GM Marketing, etc.)
- [ ] Grant property access to assigned property/properties
- [ ] Send login credentials to employee
- [ ] Verify employee can log in and access data

### **For New Employee (John):**
- [ ] Receive email with login credentials
- [ ] Log in to ERP at https://erp.easternestates.com
- [ ] Change password on first login
- [ ] Verify can see assigned property data
- [ ] Complete profile information
- [ ] Start working!

---

## 🚨 Common Issues & Solutions

### **Issue 1: Employee Can Log In But Sees No Data**
**Cause**: Property access not granted  
**Solution**: Admin must grant property access via Users → Properties

### **Issue 2: Employee Cannot Create Bookings**
**Cause**: Role doesn't have permission  
**Solution**: Admin must assign correct role (e.g., GM Sales, not Staff)

### **Issue 3: 403 Forbidden When Accessing Data**
**Cause**: Trying to access data from non-assigned property  
**Solution**: Admin must grant access to that property, OR employee is trying to access wrong data

### **Issue 4: Employee List Shows But Cannot Create**
**Cause**: User doesn't have HR Manager/Admin role  
**Solution**: This is intentional - only HR/Admin can create employees

### **Issue 5: User Account Created But Employee Not Linked**
**Cause**: Forgot to set employee.userId in Step 3  
**Solution**: Edit employee record and link to user account

---

**Created**: 2026-02-17  
**Last Updated**: 2026-02-17  
**Status**: PRODUCTION READY ✅
