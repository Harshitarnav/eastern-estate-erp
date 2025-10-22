# Construction Module - Complete Implementation Plan

## Overview
Comprehensive construction management system for property, tower, and flat level tracking with material inventory, purchase orders, vendors, and construction progress management.

## Module Structure

### 1. Construction Management
**Property/Tower/Flat Level Tracking**
- Daily Progress Reports
- Pain Points Tracking
- Material Shortages
- Work Scheduling & Assignment
- Engineer Work Schedules
- Task Management
- Quality Checks
- Safety Compliance

### 2. Material Inventory (Store Management)
**Inventory Tracking**
- Total Items in Store
- Entry Logs (Who, Quantity, When, From Which Vendor)
- Exit Logs (Purpose, Items, Quantity, Issued To)
- Low Stock Alerts
- Stock Valuation
- Category-wise Stock

### 3. Purchase Orders
**Procurement Management**
- Create Purchase Orders
- Vendor Selection
- Approval Workflow
- Delivery Tracking
- Invoice Management
- Payment Status

### 4. Vendor Management
**Vendor Database**
- Vendor Information
- Material Supply History
- Payment History
- Performance Ratings
- Contact Details
- Documents

### 5. Work Scheduling
**Schedule Management**
- Engineer Assignment
- Task Scheduling
- Resource Allocation
- Timeline Tracking
- Milestone Management

## Database Schema

### construction_projects
```sql
- id (UUID, PK)
- property_id (UUID, FK -> properties)
- tower_id (UUID, FK -> towers, nullable)
- flat_id (UUID, FK -> flats, nullable)
- project_name (VARCHAR)
- start_date (DATE)
- expected_completion_date (DATE)
- actual_completion_date (DATE, nullable)
- status (ENUM: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED)
- overall_progress (DECIMAL) // percentage
- budget_allocated (DECIMAL)
- budget_spent (DECIMAL)
- project_manager_id (UUID, FK -> employees)
- created_at, updated_at
```

### daily_progress_reports
```sql
- id (UUID, PK)
- construction_project_id (UUID, FK)
- report_date (DATE)
- reported_by (UUID, FK -> employees)
- work_completed (TEXT)
- work_planned_for_next_day (TEXT)
- progress_percentage (DECIMAL)
- workers_present (INTEGER)
- workers_absent (INTEGER)
- weather_conditions (VARCHAR)
- photos (JSON) // array of photo URLs
- created_at, updated_at
```

### pain_points
```sql
- id (UUID, PK)
- construction_project_id (UUID, FK)
- reported_by (UUID, FK -> employees)
- pain_point_type (ENUM: MATERIAL_SHORTAGE, LABOR_SHORTAGE, EQUIPMENT_ISSUE, DESIGN_ISSUE, WEATHER, OTHER)
- title (VARCHAR)
- description (TEXT)
- severity (ENUM: LOW, MEDIUM, HIGH, CRITICAL)
- status (ENUM: OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- reported_date (TIMESTAMP)
- resolved_date (TIMESTAMP, nullable)
- resolution_notes (TEXT, nullable)
- created_at, updated_at
```

### material_shortages
```sql
- id (UUID, PK)
- construction_project_id (UUID, FK)
- material_id (UUID, FK -> materials)
- quantity_required (DECIMAL)
- quantity_available (DECIMAL)
- shortage_quantity (DECIMAL)
- required_by_date (DATE)
- status (ENUM: PENDING, PO_RAISED, IN_TRANSIT, DELIVERED, RESOLVED)
- priority (ENUM: LOW, MEDIUM, HIGH, URGENT)
- impact_on_schedule (TEXT)
- created_at, updated_at
```

### work_schedules
```sql
- id (UUID, PK)
- construction_project_id (UUID, FK)
- task_name (VARCHAR)
- task_description (TEXT)
- assigned_to (UUID, FK -> employees) // engineer
- start_date (DATE)
- end_date (DATE)
- status (ENUM: NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED)
- dependencies (JSON) // array of task IDs
- progress_percentage (DECIMAL)
- actual_start_date (DATE, nullable)
- actual_end_date (DATE, nullable)
- notes (TEXT)
- created_at, updated_at
```

### materials
```sql
- id (UUID, PK)
- material_code (VARCHAR, UNIQUE)
- material_name (VARCHAR)
- category (ENUM: CEMENT, STEEL, SAND, AGGREGATE, BRICKS, TILES, ELECTRICAL, PLUMBING, PAINT, HARDWARE, OTHER)
- unit_of_measurement (ENUM: KG, TONNE, BAG, PIECE, LITRE, CUBIC_METER, SQUARE_METER, BOX, SET)
- current_stock (DECIMAL)
- minimum_stock_level (DECIMAL)
- maximum_stock_level (DECIMAL)
- unit_price (DECIMAL)
- gst_percentage (DECIMAL)
- specifications (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at
```

### material_entries
```sql
- id (UUID, PK)
- material_id (UUID, FK)
- entry_type (ENUM: PURCHASE, RETURN, ADJUSTMENT)
- quantity (DECIMAL)
- unit_price (DECIMAL)
- total_value (DECIMAL)
- vendor_id (UUID, FK -> vendors, nullable)
- purchase_order_id (UUID, FK -> purchase_orders, nullable)
- entry_date (TIMESTAMP)
- entered_by (UUID, FK -> employees)
- invoice_number (VARCHAR, nullable)
- remarks (TEXT)
- created_at, updated_at
```

### material_exits
```sql
- id (UUID, PK)
- material_id (UUID, FK)
- construction_project_id (UUID, FK)
- quantity (DECIMAL)
- purpose (TEXT)
- issued_to (UUID, FK -> employees)
- approved_by (UUID, FK -> employees)
- exit_date (TIMESTAMP)
- return_expected (BOOLEAN)
- return_date (TIMESTAMP, nullable)
- return_quantity (DECIMAL, nullable)
- remarks (TEXT)
- created_at, updated_at
```

### purchase_orders
```sql
- id (UUID, PK)
- po_number (VARCHAR, UNIQUE)
- vendor_id (UUID, FK)
- order_date (DATE)
- expected_delivery_date (DATE)
- actual_delivery_date (DATE, nullable)
- status (ENUM: DRAFT, PENDING_APPROVAL, APPROVED, SENT, PARTIALLY_RECEIVED, RECEIVED, CANCELLED)
- total_amount (DECIMAL)
- gst_amount (DECIMAL)
- grand_total (DECIMAL)
- payment_terms (VARCHAR)
- payment_status (ENUM: PENDING, PARTIAL, PAID)
- approved_by (UUID, FK -> employees, nullable)
- created_by (UUID, FK -> employees)
- notes (TEXT)
- created_at, updated_at
```

### purchase_order_items
```sql
- id (UUID, PK)
- purchase_order_id (UUID, FK)
- material_id (UUID, FK)
- quantity_ordered (DECIMAL)
- quantity_received (DECIMAL)
- unit_price (DECIMAL)
- gst_percentage (DECIMAL)
- total_price (DECIMAL)
- specifications (TEXT)
- created_at, updated_at
```

### vendors
```sql
- id (UUID, PK)
- vendor_code (VARCHAR, UNIQUE)
- vendor_name (VARCHAR)
- contact_person (VARCHAR)
- email (VARCHAR)
- phone_number (VARCHAR)
- alternate_phone (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- state (VARCHAR)
- pincode (VARCHAR)
- gst_number (VARCHAR)
- pan_number (VARCHAR)
- bank_name (VARCHAR)
- bank_account_number (VARCHAR)
- ifsc_code (VARCHAR)
- materials_supplied (JSON) // array of material categories
- rating (DECIMAL) // 1-5 stars
- payment_terms (VARCHAR)
- credit_limit (DECIMAL)
- outstanding_amount (DECIMAL)
- is_active (BOOLEAN)
- created_at, updated_at
```

### vendor_payments
```sql
- id (UUID, PK)
- vendor_id (UUID, FK)
- purchase_order_id (UUID, FK, nullable)
- payment_date (DATE)
- amount (DECIMAL)
- payment_mode (ENUM: CASH, CHEQUE, NEFT, RTGS, UPI)
- transaction_reference (VARCHAR)
- notes (TEXT)
- created_by (UUID, FK -> employees)
- created_at, updated_at
```

## API Endpoints

### Construction Projects
- GET    /api/v1/construction/projects
- GET    /api/v1/construction/projects/:id
- POST   /api/v1/construction/projects
- PUT    /api/v1/construction/projects/:id
- DELETE /api/v1/construction/projects/:id

### Daily Progress Reports
- GET    /api/v1/construction/progress-reports
- GET    /api/v1/construction/progress-reports/:id
- POST   /api/v1/construction/progress-reports
- PUT    /api/v1/construction/progress-reports/:id

### Pain Points
- GET    /api/v1/construction/pain-points
- POST   /api/v1/construction/pain-points
- PUT    /api/v1/construction/pain-points/:id
- POST   /api/v1/construction/pain-points/:id/resolve

### Material Shortages
- GET    /api/v1/construction/material-shortages
- POST   /api/v1/construction/material-shortages
- PUT    /api/v1/construction/material-shortages/:id

### Work Schedules
- GET    /api/v1/construction/work-schedules
- POST   /api/v1/construction/work-schedules
- PUT    /api/v1/construction/work-schedules/:id

### Materials (Inventory)
- GET    /api/v1/materials
- GET    /api/v1/materials/:id
- POST   /api/v1/materials
- PUT    /api/v1/materials/:id
- GET    /api/v1/materials/low-stock
- GET    /api/v1/materials/entries
- POST   /api/v1/materials/entries
- GET    /api/v1/materials/exits
- POST   /api/v1/materials/exits

### Purchase Orders
- GET    /api/v1/purchase-orders
- GET    /api/v1/purchase-orders/:id
- POST   /api/v1/purchase-orders
- PUT    /api/v1/purchase-orders/:id
- POST   /api/v1/purchase-orders/:id/approve
- POST   /api/v1/purchase-orders/:id/receive

### Vendors
- GET    /api/v1/vendors
- GET    /api/v1/vendors/:id
- POST   /api/v1/vendors
- PUT    /api/v1/vendors/:id
- GET    /api/v1/vendors/:id/purchase-history
- GET    /api/v1/vendors/:id/payments
- POST   /api/v1/vendors/:id/payments

## Frontend Pages

### Construction Module
- `/construction` - Dashboard with overview
- `/construction/projects` - List all projects
- `/construction/projects/:id` - Project details
- `/construction/projects/:id/progress` - Progress reports
- `/construction/projects/:id/schedule` - Work schedule
- `/construction/projects/:id/pain-points` - Pain points tracking

### Inventory/Store
- `/inventory` - Store dashboard
- `/inventory/materials` - Materials list
- `/inventory/materials/:id` - Material details
- `/inventory/entries` - Entry logs
- `/inventory/exits` - Exit logs
- `/inventory/low-stock` - Low stock alerts

### Purchase Orders
- `/purchase-orders` - PO list
- `/purchase-orders/new` - Create new PO
- `/purchase-orders/:id` - PO details
- `/purchase-orders/:id/edit` - Edit PO

### Vendors
- `/vendors` - Vendor list
- `/vendors/new` - Add vendor
- `/vendors/:id` - Vendor details
- `/vendors/:id/edit` - Edit vendor

## Integration Points

### With Sales/CRM Module
- Update property status based on construction progress
- Notify sales team when construction milestones achieved
- Update flat availability based on completion

### With Property Module
- Link construction projects to properties/towers/flats
- Update property status
- Track construction timeline

### With Payment Module
- Vendor payment tracking
- Purchase order payment status
- Budget vs. actual spend tracking

## Implementation Phases

### Phase 1: Database & Backend (Priority)
1. Create all database tables with migrations
2. Create entities for all tables
3. Implement DTOs and services
4. Create API endpoints
5. Add validation and error handling

### Phase 2: Frontend - Core Pages
1. Construction dashboard
2. Project list and details
3. Daily progress reports
4. Pain points tracking
5. Work schedules

### Phase 3: Frontend - Inventory
1. Materials management
2. Entry/Exit logs
3. Low stock alerts
4. Stock reports

### Phase 4: Frontend - Purchase & Vendors
1. Purchase order management
2. Vendor management
3. Payment tracking
4. Vendor performance

### Phase 5: Integration & Testing
1. Integrate with existing modules
2. Real-time notifications
3. Reports and analytics
4. User acceptance testing

## Key Features

### Daily Progress Reports
- Photo upload capability
- Weather tracking
- Worker attendance
- Work completion tracking
- Next day planning

### Pain Points Management
- Categorized issues
- Severity levels
- Status tracking
- Resolution workflow
- Impact analysis

### Material Shortage Tracking
- Automatic detection from inventory
- Priority flagging
- PO linking
- Delivery tracking

### Work Scheduling
- Gantt chart view
- Task dependencies
- Resource allocation
- Progress tracking
- Delay alerts

### Inventory Management
- Real-time stock levels
- Entry/Exit tracking
- User accountability
- Low stock alerts
- Stock valuation

### Vendor Management
- Complete vendor profiles
- Purchase history
- Payment tracking
- Performance ratings
- Document management

## Security & Permissions

### Role-Based Access
- **Super Admin**: Full access
- **Project Manager**: Project management, reporting
- **Site Engineer**: Daily reports, schedules, material requests
- **Store Manager**: Inventory management, material issue
- **Purchase Manager**: PO creation, vendor management
- **Accounts**: Payment tracking, vendor payments

## Reports & Analytics

### Construction Reports
- Project progress summary
- Daily progress compilation
- Pain points analysis
- Schedule adherence
- Budget vs. actual

### Inventory Reports
- Stock summary
- Entry/Exit summary
- Material consumption
- Stock valuation
- Reorder level alerts

### Vendor Reports
- Purchase history
- Payment summary
- Vendor performance
- Outstanding payments
- Material-wise vendors

## Next Steps

1. ✅ Create detailed plan (This document)
2. [ ] Create database migration file
3. [ ] Implement backend entities
4. [ ] Create API services
5. [ ] Build frontend pages
6. [ ] Integration with existing modules
7. [ ] Testing and deployment
