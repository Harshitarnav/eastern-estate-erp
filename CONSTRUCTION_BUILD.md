# 🏗️ Construction Module Build Tracker
**Project:** Eastern Estate ERP  
**Started:** March 2026  
**Goal:** Full site-operations module - projects, teams, materials, vendors, POs, RA bills, QC, and daily logs

---

## Overall Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Backend scaffolding - entities, services, controllers, module wiring | ✅ Complete |
| Phase 2 | Frontend CRUD pages - Projects, Teams, Materials, Vendors, POs | ✅ Complete |
| Phase 3 | RA Bills + QC Checklists - entities, API, UI | ✅ Complete |
| Phase 4 | Daily Progress Logs - schema fix, new fields, frontend overhaul | ✅ Complete |
| Phase 5 | UI/UX Redesign - BrandHero, BrandStatCard, brandPalette, pristine design | ✅ Complete |
| Phase 6 | Roles & Access - CONSTRUCTION_TEAM role, module permissions | ✅ Complete |
| Phase 7 | Schema Sync Service - idempotent startup migrations | ✅ Complete |
| Phase 8 | Accounting Integration - auto-JE from RA Bill payments, Vendor payments | ✅ Complete |
| Phase 9 | Reports - Cost-to-complete, project budget variance, vendor spend | ✅ Complete |
| Phase 10 | Photo Uploads - site diary photos on progress logs | ✅ Complete |

---

## Phase 1 - Backend Scaffolding

**Goal:** Build all TypeORM entities, services, controllers, and wire the NestJS module.

### 1.1 - Entities Created

| Entity | Table | Key Fields |
|--------|-------|-----------|
| `ConstructionProject` | `construction_projects` | projectName, status, budgetAllocated, budgetSpent, overallProgress |
| `ConstructionTeam` | `construction_teams` | teamName, teamType (CONTRACTOR / IN_HOUSE / LABOR), leaderName, dailyRate |
| `ConstructionProgressLog` | `construction_progress_logs` | logDate, progressPercentage, description, shift, workersPresent/Absent |
| `ConstructionProjectAssignment` | `construction_project_assignments` | constructionProjectId, employeeId, role |
| `ConstructionDevelopmentUpdate` | `construction_development_updates` | updateType, description, propertyId |
| `ConstructionFlatProgress` | `construction_flat_progress` | flatId, status, completionPercentage |
| `ConstructionTowerProgress` | `construction_tower_progress` | towerId, completionPercentage, currentFloor |
| `RABill` | `ra_bills` | raBillNumber, grossAmount, retentionAmount, netPayable, status (DRAFT→PAID) |
| `QCChecklist` | `qc_checklists` | phase, inspectionDate, items (JSONB), defects (JSONB), overallResult |

- **Status:** ✅ Done

### 1.2 - Services & Controllers

| Controller / Service | Routes |
|---------------------|--------|
| `ConstructionProjectsController` | `GET/POST /construction-projects`, `GET/PUT/DELETE /construction-projects/:id` |
| `ProjectsAliasController` | Aliases `/projects` → `/construction-projects` |
| `ConstructionTeamsController` | `GET/POST /construction-teams`, `PUT/DELETE /construction-teams/:id` |
| `ConstructionProgressLogsController` | `GET/POST /construction-progress-logs`, `DELETE /construction-progress-logs/:id` |
| `ConstructionProjectAssignmentsController` | `GET/POST /project-assignments` |
| `RABillsController` | `GET/POST /ra-bills`, `POST /ra-bills/:id/submit|certify|approve|mark-paid` |
| `QCController` | `GET/POST /qc-checklists`, `PUT /qc-checklists/:id/items`, `POST /qc-checklists/:id/defects`, `PATCH /qc-checklists/:id/defects/:defectId/resolve` |

- **Status:** ✅ Done

### 1.3 - Module Wiring (`construction.module.ts`)

- All entities registered via `TypeOrmModule.forFeature([...])`
- All services and controllers provided/exported
- `ConstructionSchemaSyncService` registered as a provider (runs on startup)
- **Status:** ✅ Done

---

## Phase 2 - Frontend CRUD Pages

**Goal:** Build all day-to-day management pages linked from the sidebar.

### 2.1 - Sidebar Navigation
- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Added sub-items under "Construction":**
  - Overview → `/construction`
  - Projects → `/construction/projects`
  - Teams → `/construction/teams`
  - Materials → `/construction/materials`
  - Vendors → `/construction/vendors`
  - Purchase Orders → `/construction/purchase-orders`
  - RA Bills → `/construction/ra-bills`
  - QC Checklists → `/construction/quality`
- **Status:** ✅ Done

### 2.2 - Role-Based Access
- **File:** `frontend/src/lib/roles.ts`
- `SUPER_ADMIN`, `ADMIN`: full access to all construction sub-pages
- `CONSTRUCTION_TEAM`: access to all sub-pages except admin-only sections
- **Status:** ✅ Done

### 2.3 - Construction Overview Dashboard
- **Route:** `/construction`
- **File:** `frontend/src/app/(dashboard)/construction/page.tsx`
- **Features:**
  - `BrandHero` with project stats
  - `BrandStatCard` grid: active projects, total budget, teams on site, open defects
  - Quick-navigation cards to all sub-modules
  - Fetches live data from 4 concurrent API calls
- **Status:** ✅ Done

### 2.4 - Projects List Page
- **Route:** `/construction/projects`
- **File:** `frontend/src/app/(dashboard)/construction/projects/page.tsx`
- **Features:**
  - Status stat strip (Planning / In Progress / Completed / On Hold)
  - Filter by property, status, search by name
  - Project cards with budget utilisation bars
  - Safe null-check for `project.property` (crashes fixed)
- **Status:** ✅ Done

### 2.5 - New Project Form
- **Route:** `/construction/projects/new`
- **File:** `frontend/src/app/(dashboard)/construction/projects/new/page.tsx`
- **Features:**
  - Cascading dropdowns: Property → Tower → Flat
  - Project Manager dropdown (loads from `/employees`)
  - All dropdowns use `response.data?.data` pattern (API wraps in `{ data: [...] }`)
- **Status:** ✅ Done

### 2.6 - Project Detail Page
- **Route:** `/construction/projects/[id]`
- **File:** `frontend/src/app/(dashboard)/construction/projects/[id]/page.tsx`
- **Features:**
  - Gradient hero with progress ring
  - Inline metrics: budget spent %, days remaining, overall progress
  - Tabbed view: Overview | Teams | Progress Logs | RA Bills | QC | Materials
- **Status:** ✅ Done

### 2.7 - Teams Page
- **Route:** `/construction/teams`
- **File:** `frontend/src/app/(dashboard)/construction/teams/page.tsx`
- **Features:**
  - Filter by project and team type
  - Team cards with type icon (🏢 Contractor / 🏠 In-House / 👷 Labour)
  - Create/edit modal with full form fields
  - `BrandHero` + `BrandStatCard` design
- **Status:** ✅ Done

### 2.8 - Materials Inventory Page
- **Route:** `/construction/materials`
- **File:** `frontend/src/app/(dashboard)/construction/materials/page.tsx`
- **Features:**
  - Category filter + search
  - Table with stock status badges (OK / Low / Critical)
  - Low-stock alert banner with "Create PO" shortcut
  - "Stock In" / "Issue to Site" quick action buttons
  - Slide-in panel for create/edit
- **Status:** ✅ Done

### 2.9 - Vendors Page
- **Route:** `/construction/vendors`
- **File:** `frontend/src/app/(dashboard)/construction/vendors/page.tsx`
- **Features:**
  - Table with rating stars, outstanding balance, credit limit
  - "Record Payment" → `VendorPaymentModal`
  - "Add Vendor" → `AddVendorModal`
  - Fixed: `rating.toFixed is not a function` (PostgreSQL NUMERIC → string coercion)
- **Status:** ✅ Done

### 2.10 - Purchase Orders Page
- **Route:** `/construction/purchase-orders`
- **File:** `frontend/src/app/(dashboard)/construction/purchase-orders/page.tsx`
- **Features:**
  - Table with PO status, vendor, expected delivery, balance
  - Inline "Action" button to advance PO through workflow (DRAFT → PAID)
  - PO workflow guide banner
  - Create PO modal
- **Status:** ✅ Done

---

## Phase 3 - RA Bills & QC Checklists

**Goal:** Full running-account billing and quality inspection workflows.

### 3.1 - RA Bills API & UI
- **Backend:** `ra-bills.controller.ts`, `ra-bills.service.ts`, `ra-bill.entity.ts`
- **Frontend:** `frontend/src/app/(dashboard)/construction/ra-bills/page.tsx`
- **Workflow:** `DRAFT → SUBMITTED → CERTIFIED → APPROVED → PAID`
- **Key Calculations:**
  - `netThisBill = grossAmount − previousBillsAmount`
  - `retentionAmount = netThisBill × (retentionPercentage / 100)`
  - `netPayable = netThisBill − retentionAmount − advanceDeduction − otherDeductions`
- **TypeScript Fix:** Added `as RABill` type assertion to `raBillRepository.save()` to resolve `TS2740` overload error
- **Status:** ✅ Done

### 3.2 - QC Checklists API & UI
- **Backend:** `qc.controller.ts`, `qc.service.ts`, `qc-checklist.entity.ts`
- **Frontend:** `frontend/src/app/(dashboard)/construction/quality/page.tsx`
- **Phase Enum:** `FOUNDATION | STRUCTURE | MEP | FINISHING | HANDOVER`
- **Result Enum:** `PASS | FAIL | PARTIAL | PENDING`
- **Checklist Items & Defects:** Stored as JSONB arrays in the same row - no separate tables needed
- **Defect Severity:** `LOW | MEDIUM | HIGH | CRITICAL`
- **Actions:** Create inspection → update item statuses → add defects → mark defects resolved
- **TypeScript Fix:** Added `as QCChecklist` type assertion to `qcRepo.save()` to resolve `TS2740` overload error
- **Status:** ✅ Done

---

## Phase 4 - Daily Progress Logs (Schema Fix + New Fields)

**Goal:** Allow the `AddProgressLogModal` to submit comprehensive daily logs without DB constraint errors.

### 4.1 - Root Cause
The `construction_progress_logs` table had `NOT NULL` constraints on `property_id`, `progress_type`, `description`, and `logged_by`. The new project-based modal was not sending these fields (by design - logs are now linked via `constructionProjectId`). This caused:
```
QueryFailedError: null value in column "property_id" violates not-null constraint
```

### 4.2 - Backend Entity Changes
- **File:** `backend/src/modules/construction/entities/construction-progress-log.entity.ts`
- Made nullable: `propertyId`, `progressType`, `description`, `loggedBy`
- **Added 8 new columns:** `shift` (enum: DAY/NIGHT), `workersPresent`, `workersAbsent`, `materialsUsed`, `issuesDelays`, `supervisorName`, `nextDayPlan`, `remarks`
- **Added enum:** `ShiftType { DAY, NIGHT }`

### 4.3 - Schema Sync Service
- **File:** `backend/src/modules/construction/construction.schema-sync.service.ts`
- Runs idempotent SQL on `onModuleInit` (every server start)
- Checks column nullability before dropping NOT NULL (safe to re-run)
- Creates `ShiftType` enum in PostgreSQL if absent
- Adds all 8 new columns with `IF NOT EXISTS` guards

**SQL changes applied at startup:**
```sql
-- Drop NOT NULL on old required columns
ALTER TABLE construction_progress_logs ALTER COLUMN property_id DROP NOT NULL;
ALTER TABLE construction_progress_logs ALTER COLUMN progress_type DROP NOT NULL;
ALTER TABLE construction_progress_logs ALTER COLUMN description DROP NOT NULL;
ALTER TABLE construction_progress_logs ALTER COLUMN logged_by DROP NOT NULL;

-- Create ShiftType enum
CREATE TYPE shifttype AS ENUM ('DAY', 'NIGHT');

-- Add new columns
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS shift shifttype NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS workers_present INTEGER NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS workers_absent INTEGER NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS materials_used TEXT NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS issues_delays TEXT NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255) NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS next_day_plan TEXT NULL;
ALTER TABLE construction_progress_logs ADD COLUMN IF NOT EXISTS remarks TEXT NULL;
```

### 4.4 - Service Update
- **File:** `backend/src/modules/construction/construction-progress-logs.service.ts`
- Injected `ConstructionProject` repository
- `create()` now:
  - Maps `createDto.workCompleted` → `log.description`
  - Auto-derives `propertyId` from the project's `propertyId` if not explicitly provided
  - Explicitly maps all 8 new fields from the DTO

### 4.5 - Frontend Modal Fix
- **File:** `frontend/src/components/modals/AddProgressLogModal.tsx`
- Fixed: payload field was `projectId`, should be `constructionProjectId`
- Fixed: `loadProjects()` was filtering by `propertyId` even when empty - now loads all projects if no `propertyId`
- **Status:** ✅ Done

### 4.6 - Progress Logs Page
- **Route:** `/construction/progress`
- **File:** `frontend/src/app/(dashboard)/construction/progress/page.tsx`
- Displays `log.description` (not the old `log.workCompleted`)
- Shows shift badge (Day / Night)
- Expandable log cards with progress bar and all new fields
- **Status:** ✅ Done

---

## Phase 5 - UI/UX Redesign

**Goal:** Make every Construction page look as polished as the Customers and Bookings pages.

### Design System Components Used

| Component | Import | Purpose |
|-----------|--------|---------|
| `BrandHero` | `@/components/layout/BrandHero` | Page header with eyebrow, title, description, CTA |
| `BrandPrimaryButton` | `@/components/layout/BrandHero` | Red primary CTA button |
| `BrandSecondaryButton` | `@/components/layout/BrandHero` | Ghost/outlined secondary button |
| `BrandStatCard` | `@/components/layout/BrandStatCard` | Metric card with icon, primary value, sub-label |
| `brandPalette` | `@/utils/brand` | `primary`, `accent`, `success`, `neutral`, `secondary`, `background` |
| `formatIndianNumber` | `@/utils/brand` | Indian number formatting (lakhs/crores) |
| `formatToCrore` | `@/utils/brand` | Compact crore display (₹2.5Cr) |
| `CardGridSkeleton` | `@/components/Skeletons` | Loading state for card grids |

### Pages Redesigned

| Page | Key UX Changes |
|------|---------------|
| `/construction` | BrandHero, 4-up stat strip, quick-nav card grid |
| `/construction/projects` | Status stat strip, project card grid, safe null property handling |
| `/construction/projects/[id]` | Gradient hero, progress ring, inline metrics, tabbed detail view |
| `/construction/teams` | BrandHero + 4 stat cards, team card grid, styled create/edit modal |
| `/construction/materials` | Low-stock alert banner, table layout, slide-in create panel |
| `/construction/vendors` | Table layout, rating/outstanding/credit-limit columns |
| `/construction/purchase-orders` | Table layout, workflow banner (Draft→Paid), inline action button |
| `/construction/ra-bills` | Bill cards with amount breakdown, workflow progress indicator |
| `/construction/quality` | Phase-filtered list + detail side panel with defect management |
| `/construction/progress` | Expandable log cards with day-of-month badge and progress bar |

### Design Rules Applied
- All modals use `X` icon (lucide) instead of `×` text
- All modals use `bg-black/50 backdrop-blur-sm` overlay
- All modal headers have a title + subtitle layout
- `rounded-2xl` cards with subtle `brandPalette.neutral` borders
- Footer line on every page: "Eastern Estate ERP • Building Homes, Nurturing Bonds"
- Suspense fallbacks use `CardGridSkeleton` not `TableRowsSkeleton`

### Critical Bug Fixes Applied During Redesign

#### Bug 1: `res.data` anti-pattern (affected ALL pages)
- `api.get()` already returns `response.data` - calling `.data` again returned `undefined`
- **Fix:** Use `res` directly, not `res.data`, across all construction pages and modals

#### Bug 2: `project.property?.name.toLowerCase()` crash
- Crashed filter loop when `project.property` was null (project without a property)
- **Fix:** `project.property?.name?.toLowerCase()` and `project.property?.name || 'N/A'`

#### Bug 3: Empty property/employee dropdowns on New Project form
- API response is `{ data: [...], total: N }` - code was treating it as a flat array
- **Fix:** `response.data?.data || []` everywhere

#### Bug 4: `rating.toFixed is not a function` on Vendors page
- PostgreSQL `NUMERIC` columns come back as strings via pg driver
- **Fix:** `Number(vendor.rating).toFixed(1)` - always coerce before calling `.toFixed()`

#### Bug 5: Empty project dropdown in modals
- `loadProjects()` filtered by `propertyId` even when empty string → returned zero results
- **Fix:** Conditional: only add `?propertyId=...` param if `propertyId` is non-empty

- **Status:** ✅ Done

---

## Phase 6 - Roles & Access Control

**File:** `frontend/src/lib/roles.ts`

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | All construction sub-pages |
| `ADMIN` | All construction sub-pages |
| `CONSTRUCTION_TEAM` | All construction sub-pages + property-inventory, flats, towers |
| Other roles | No construction access |

All new sub-page IDs (`construction-overview`, `projects`, `teams`, `materials`, `vendors`, `purchase-orders`, `ra-bills`, `quality`) were added to the role configs.

- **Status:** ✅ Done

---

## Phase 7 - Schema Sync Service

**Goal:** Handle schema evolution without manual migrations, since `synchronize: false` is set globally.

**File:** `backend/src/modules/construction/construction.schema-sync.service.ts`

### How It Works
1. Implements `OnModuleInit` - runs every time the NestJS app starts
2. Uses a `QueryRunner` inside a transaction
3. All SQL statements are idempotent (safe to re-run):
   - `IF EXISTS` / `IF NOT EXISTS` guards for column changes
   - `DO $$ BEGIN ... END $$` PL/pgSQL blocks for conditional DDL
4. Commits on success, rolls back on any error

### Changes Managed By This Service

| Change | Reason |
|--------|--------|
| `construction_projects.property_id` → nullable | Allow projects without a linked property |
| `construction_progress_logs.property_id` → nullable | Property derived from project, not required |
| `construction_progress_logs.progress_type` → nullable | Not always known at log time |
| `construction_progress_logs.description` → nullable | Mapped from `workCompleted` field |
| `construction_progress_logs.logged_by` → nullable | Authentication context not always available |
| Add `shift` enum column | Day / Night shift tracking |
| Add `workers_present`, `workers_absent` | Workforce headcount |
| Add `materials_used` | Free-text materials log |
| Add `issues_delays` | Issues / delays on that day |
| Add `supervisor_name` | On-site supervisor name |
| Add `next_day_plan` | Planning notes |
| Add `remarks` | General remarks |

- **Status:** ✅ Done

---

## Key File Map

### Backend
| File | Purpose |
|------|---------|
| `construction.module.ts` | Module registration, imports, providers |
| `construction.schema-sync.service.ts` | Idempotent startup schema migrations |
| `construction-projects.service.ts` | CRUD for projects, includes property/manager relations |
| `construction-projects.controller.ts` | REST at `/construction-projects` |
| `projects-alias.controller.ts` | Aliases `/projects` → `/construction-projects` |
| `construction-teams.service.ts` | CRUD for teams, project assignments |
| `construction-teams.controller.ts` | REST at `/construction-teams` |
| `construction-progress-logs.service.ts` | Create logs, auto-derive propertyId, map new fields |
| `construction-progress-logs.controller.ts` | REST at `/construction-progress-logs` |
| `ra-bills.service.ts` | RA bill CRUD + status transitions |
| `ra-bills.controller.ts` | REST at `/ra-bills` with action sub-routes |
| `qc.service.ts` | QC checklist CRUD, item updates, defect management |
| `qc.controller.ts` | REST at `/qc-checklists` |
| `services/vendors.service.ts` | Vendor CRUD, payment recording |
| `services/materials.service.ts` | Material CRUD, stock tracking |
| `services/purchase-orders.service.ts` | PO CRUD, status workflow |

### Frontend Pages
| File | Route | Purpose |
|------|-------|---------|
| `construction/page.tsx` | `/construction` | Overview dashboard |
| `construction/projects/page.tsx` | `/construction/projects` | Project list + filters |
| `construction/projects/new/page.tsx` | `/construction/projects/new` | Create project form |
| `construction/projects/[id]/page.tsx` | `/construction/projects/:id` | Project detail + tabs |
| `construction/teams/page.tsx` | `/construction/teams` | Team management |
| `construction/materials/page.tsx` | `/construction/materials` | Material inventory |
| `construction/vendors/page.tsx` | `/construction/vendors` | Vendor management |
| `construction/purchase-orders/page.tsx` | `/construction/purchase-orders` | PO management |
| `construction/ra-bills/page.tsx` | `/construction/ra-bills` | RA bill management |
| `construction/quality/page.tsx` | `/construction/quality` | QC inspections |
| `construction/progress/page.tsx` | `/construction/progress` | Daily progress logs |

### Frontend Modals
| File | Purpose |
|------|---------|
| `modals/AddProgressLogModal.tsx` | Add daily log (project-based) |
| `modals/CreatePurchaseOrderModal.tsx` | Create new PO |
| `modals/MaterialEntryModal.tsx` | Record stock received |
| `modals/MaterialExitModal.tsx` | Record material issued to site |
| `modals/VendorPaymentModal.tsx` | Record vendor payment |
| `modals/AddVendorModal.tsx` | Add new vendor |

### Entity Files
| File | Table |
|------|-------|
| `entities/construction-project.entity.ts` | `construction_projects` |
| `entities/construction-team.entity.ts` | `construction_teams` |
| `entities/construction-progress-log.entity.ts` | `construction_progress_logs` |
| `entities/construction-project-assignment.entity.ts` | `construction_project_assignments` |
| `entities/construction-development-update.entity.ts` | `construction_development_updates` |
| `entities/construction-flat-progress.entity.ts` | `construction_flat_progress` |
| `entities/construction-tower-progress.entity.ts` | `construction_tower_progress` |
| `entities/ra-bill.entity.ts` | `ra_bills` |
| `entities/qc-checklist.entity.ts` | `qc_checklists` |

---

## Entity Map (DB Schema Reference)

### `construction_projects`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `property_id` | UUID FK → properties | nullable |
| `project_name` | VARCHAR(255) | |
| `start_date` | DATE | |
| `expected_completion_date` | DATE | |
| `actual_end_date` | DATE | nullable |
| `status` | VARCHAR(20) | PLANNING / IN_PROGRESS / ON_HOLD / COMPLETED |
| `overall_progress` | DECIMAL(5,2) | 0–100 |
| `budget_allocated` | DECIMAL(15,2) | |
| `budget_spent` | DECIMAL(15,2) | |
| `project_manager_id` | UUID FK → employees | nullable |
| `created_by` | UUID FK → users | nullable |

### `construction_teams`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `team_name` | VARCHAR(255) | |
| `team_code` | VARCHAR(50) | unique, nullable |
| `team_type` | ENUM | CONTRACTOR / IN_HOUSE / LABOR |
| `construction_project_id` | UUID | nullable (no FK enforced in entity) |
| `property_id` | UUID FK → properties | nullable |
| `leader_name` | VARCHAR(255) | |
| `contact_number` | VARCHAR(20) | |
| `total_members` | INTEGER | |
| `daily_rate` | DECIMAL(10,2) | nullable |
| `contract_start_date` | DATE | nullable |
| `contract_end_date` | DATE | nullable |
| `is_active` | BOOLEAN | default true |

### `construction_progress_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `property_id` | UUID FK → properties | **nullable** (schema sync drops NOT NULL) |
| `construction_project_id` | UUID | nullable |
| `log_date` | DATE | |
| `progress_type` | ENUM | **nullable**: STRUCTURE / INTERIOR / FINISHING / QUALITY_CHECK |
| `description` | TEXT | **nullable** - mapped from `workCompleted` |
| `progress_percentage` | DECIMAL(5,2) | nullable |
| `weather_condition` | VARCHAR(100) | nullable |
| `logged_by` | UUID FK → users | **nullable** |
| `shift` | ENUM (shifttype) | **NEW**: DAY / NIGHT |
| `workers_present` | INTEGER | **NEW** |
| `workers_absent` | INTEGER | **NEW** |
| `materials_used` | TEXT | **NEW** |
| `issues_delays` | TEXT | **NEW** |
| `supervisor_name` | VARCHAR(255) | **NEW** |
| `next_day_plan` | TEXT | **NEW** |
| `remarks` | TEXT | **NEW** |

### `ra_bills`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `ra_bill_number` | VARCHAR(50) | unique |
| `vendor_id` | UUID FK → vendors | |
| `construction_project_id` | UUID FK → construction_projects | |
| `bill_date` | DATE | |
| `gross_amount` | DECIMAL(15,2) | Cumulative certified value |
| `previous_bills_amount` | DECIMAL(15,2) | Sum of prior RA bills |
| `net_this_bill` | DECIMAL(15,2) | gross − previous |
| `retention_percentage` | DECIMAL(5,2) | e.g. 5.00 |
| `retention_amount` | DECIMAL(15,2) | |
| `advance_deduction` | DECIMAL(15,2) | |
| `net_payable` | DECIMAL(15,2) | Final amount to contractor |
| `status` | VARCHAR(20) | DRAFT / SUBMITTED / CERTIFIED / APPROVED / PAID / REJECTED |
| `certified_by` | UUID FK → users | nullable |
| `approved_by` | UUID FK → users | nullable |
| `payment_reference` | VARCHAR(255) | NEFT/RTGS UTR number |

### `qc_checklists`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `construction_project_id` | UUID FK → construction_projects | |
| `phase` | VARCHAR(30) | FOUNDATION / STRUCTURE / MEP / FINISHING / HANDOVER |
| `inspection_date` | DATE | |
| `inspector_name` | VARCHAR(255) | |
| `location_description` | VARCHAR(500) | nullable |
| `items` | JSONB | Array of `{ id, description, status, remarks }` |
| `defects` | JSONB | Array of `{ id, description, severity, location, status, resolvedAt }` |
| `overall_result` | VARCHAR(20) | PASS / FAIL / PARTIAL / PENDING |
| `next_inspection_date` | DATE | nullable |

---

## 🧪 Phase 1–2 Test Guide

### Test Projects CRUD

```
POST http://localhost:3001/api/v1/construction-projects
Authorization: Bearer <token>
{
  "projectName": "Tower A Construction",
  "startDate": "2026-01-01",
  "expectedCompletionDate": "2027-06-30",
  "budgetAllocated": 50000000,
  "status": "IN_PROGRESS"
}
```
**Expected:** `201` with UUID and default `overallProgress: 0`

```
GET http://localhost:3001/api/v1/construction-projects
```
**Expected:** Array of projects with `property`, `projectManager` relations loaded

### Test Teams CRUD

```
POST http://localhost:3001/api/v1/construction-teams
{
  "teamName": "Ramesh Masonry",
  "teamType": "CONTRACTOR",
  "leaderName": "Ramesh Kumar",
  "contactNumber": "9876543210",
  "totalMembers": 15,
  "dailyRate": 25000
}
```

### Test In the UI

1. Navigate to **Construction → Projects** in the sidebar
2. Click **"New Project"** - form opens with Property, Tower, Flat, Project Manager dropdowns
3. Fill in project name, dates, budget - submit
4. New project appears in the list card grid
5. Click the project card → detail page loads with hero, metrics, tabs
6. Navigate to **Teams** → **"Add New Team"** → fill form → team card appears

---

## 🧪 Phase 3 Test Guide - RA Bills & QC

### RA Bills Workflow

1. Go to **Construction → RA Bills**
2. Click **"New RA Bill"**
3. Select a project and vendor
4. Enter: Gross Amount = ₹10,00,000 | Previous Bills = ₹0 | Retention = 5%
5. **Preview shows:** Net This Bill = ₹10,00,000 | Retention = ₹50,000 | Net Payable = ₹9,50,000
6. Submit → bill created as `DRAFT`
7. Click **"Submit"** → status changes to `SUBMITTED`
8. Click **"Certify"** → status changes to `CERTIFIED`
9. Click **"Approve"** → status changes to `APPROVED`
10. Click **"Mark Paid"** → prompt for UTR/NEFT ref → status changes to `PAID`
11. Click **"Details"** on any bill → modal shows full breakdown

### QC Inspections Workflow

1. Go to **Construction → QC Checklists**
2. Click **"New Inspection"**
3. Select project, phase (e.g. FOUNDATION), inspection date, inspector name
4. Submit → checklist created with auto-populated items for that phase
5. Checklist appears in the list - click it to open the detail panel
6. Change item status dropdowns (Pending → Pass / Fail / N/A)
7. Click **"+ Defect"** → add a HIGH severity defect
8. Defect appears in the list with "Open" badge
9. Click **"Resolve"** on the defect → badge changes to "Resolved" and row fades

### Backend API Tests
```
POST http://localhost:3001/api/v1/ra-bills
{ "constructionProjectId": "<uuid>", "vendorId": "<uuid>", "billDate": "2026-03-26",
  "workDescription": "RCC Slab Level 1", "grossAmount": 1000000, "retentionPercentage": 5 }

POST http://localhost:3001/api/v1/ra-bills/<id>/certify
POST http://localhost:3001/api/v1/ra-bills/<id>/approve
POST http://localhost:3001/api/v1/ra-bills/<id>/mark-paid  { "paymentReference": "NEFT123456" }

POST http://localhost:3001/api/v1/qc-checklists
{ "constructionProjectId": "<uuid>", "phase": "FOUNDATION",
  "inspectionDate": "2026-03-26", "inspectorName": "Site Engineer Raju" }

PUT http://localhost:3001/api/v1/qc-checklists/<id>/items
{ "items": [{ "id": "...", "description": "...", "status": "PASS" }] }

POST http://localhost:3001/api/v1/qc-checklists/<id>/defects
{ "description": "Column alignment off by 5mm", "severity": "HIGH", "location": "Column C-4, Floor 2" }
```

---

## 🧪 Phase 4 Test Guide - Progress Logs

### Add a Daily Log

1. Go to **Construction → Progress Logs** (or the Daily Logs card on the Overview)
2. Click **"Add Today's Log"** → `AddProgressLogModal` opens
3. **Select a project from the dropdown** - should list ALL projects (not just filtered)
4. Fill: Date = today, Shift = Day, Workers Present = 45, Workers Absent = 5
5. Work Completed = "Poured RCC for Columns C7–C12"
6. Issues/Delays = "Concrete mixer broke down at 3pm - 2hr delay"
7. Next Day Plan = "Complete remaining 4 columns"
8. Submit
9. Log appears in the list with an expandable card
10. Click the log card → expands to show progress bar, workforce counts, issues section (orange)
11. Verify `property_id` is auto-derived - check DB: `SELECT property_id FROM construction_progress_logs ORDER BY created_at DESC LIMIT 1;`

### Verify Schema Sync Ran

On next server start, check console for no errors. Verify columns exist:
```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'construction_progress_logs'
ORDER BY ordinal_position;
```
Should include: `shift`, `workers_present`, `workers_absent`, `materials_used`, `issues_delays`, `supervisor_name`, `next_day_plan`, `remarks` - all nullable.

---

## Deployment Notes

- **No manual migrations needed** - `ConstructionSchemaSyncService` handles all schema changes on startup
- Schema sync is fully idempotent - re-running never breaks the DB
- Deploy backend first (runs schema sync), then frontend
- If adding new schema changes: add them to `construction.schema-sync.service.ts` (not a separate SQL file)
- `synchronize: false` is set globally in `app.module.ts` - TypeORM will NOT auto-sync entities

### Environment Checklist Before Deploy
- [ ] `DATABASE_URL` (or individual `DB_*` vars) set in production env
- [ ] `JWT_SECRET` set
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] Backend starts without errors - check logs for schema sync completion
- [ ] Run a quick smoke test on `/construction-projects` endpoint

---

## ✅ Phase 8 - Accounting Integration

**Goal:** Auto-generate double-entry journal entries when construction payments are made.

**Status:** ✅ Complete

### Trigger → Journal Entry Map

| Event | Dr | Cr |
|-------|----|----|
| RA Bill marked PAID | Construction WIP / Work Expense | Bank / Cash |
| Vendor Payment recorded | Material Purchase Expense | Bank / Cash |

### What Was Built

#### `AccountingIntegrationService` (new methods)
- `findConstructionExpenseAccount()` - searches for accounts named "construction", "WIP", "contractor", "civil"
- `findMaterialPurchaseAccount()` - searches for accounts named "material", "purchase", "procurement"
- `onRABillPaid()` - Dr: Construction Expense / Cr: Bank; stores JE ref on bill
- `onVendorPaymentRecorded()` - Dr: Material Purchase / Cr: Bank; stores JE ref on payment

#### `RABillsService.markPaid()` changes
- Now accepts optional `userId` parameter
- After saving PAID status, calls `accountingIntegration.onRABillPaid()`
- Stores returned `journalEntryId` on the bill row

#### `VendorPaymentsService.create()` changes
- Injected `AccountingIntegrationService`
- After transaction commits, calls `accountingIntegration.onVendorPaymentRecorded()`
- Stores returned `journalEntryId` on the payment row

#### Schema Changes (via ConstructionSchemaSyncService)
- `ra_bills.journal_entry_id` UUID nullable - added on startup
- `vendor_payments.journal_entry_id` UUID nullable - added on startup

#### Module Wiring
- `AccountingModule` imported into `ConstructionModule`
- `AccountingModule` imported into `VendorsModule`

### Test Guide
1. Mark an RA Bill as PAID (POST `/ra-bills/:id/mark-paid`)
2. Go to **Accounting → Journal Entries**
3. Should see a new **POSTED** entry: Dr Construction Expense ← Cr Bank
4. Account balances update automatically
5. Record a Vendor Payment → same: Dr Material Expense ← Cr Bank
6. Check `ra_bills.journal_entry_id` and `vendor_payments.journal_entry_id` columns are populated

### Important Notes
- JE creation never blocks the payment operation - it silently logs on failure
- If no matching account exists in Chart of Accounts, JE is skipped with a warning log
- Both JEs are auto-POSTED (not DRAFT) since they originate from confirmed transactions

---

## ✅ Phase 9 - Construction Reports

**Goal:** Management-level visibility into project costs, timelines, and vendor spends.

**Status:** ✅ Complete

### Reports Built

| Report | Description | API Route |
|--------|-------------|-----------|
| Budget vs Actual | Per-project budget utilisation with variance % | `GET /construction/reports/budget` |
| Cost-to-Complete | Burn-rate projection, estimated final cost, overrun flag | `GET /construction/reports/cost-to-complete` |
| Vendor Spend Summary | Total gross, net payable, paid, retention per vendor | `GET /construction/reports/vendor-spend?startDate=&endDate=` |
| Labour Productivity | Avg workers/day, avg progress/day, issue rate per project | `GET /construction/reports/labour` |
| QC Pass Rate | Phase-wise pass/fail rates, open defects, project breakdown | `GET /construction/reports/qc` |
| Dashboard Summary | Top-line KPIs (allocated, spent, at-risk count, QC %) | `GET /construction/reports` |

### Files Created / Changed

| File | Purpose |
|------|---------|
| `services/construction-reports.service.ts` | All 5 report aggregations + dashboard summary |
| `controllers/construction-reports.controller.ts` | REST routes under `GET /construction/reports/…` |
| `construction.module.ts` | Registered service + controller |
| `frontend/.../construction/reports/page.tsx` | Full tabbed UI page |
| `Sidebar.tsx` | Added **Reports** link under Construction |
| `construction/page.tsx` | Added **Reports** card to quick-nav |

### Frontend UI Features
- **4 summary stat cards** (Budget allocated, spent, at-risk count, QC pass rate)
- **Tab 1 - Budget vs Actual**: sortable table with utilisation progress bars, variance coloured red/green
- **Tab 2 - Cost-to-Complete**: card list with burn-rate estimate, at-risk badge, projected overrun
- **Tab 3 - Vendor Spend**: date range filter, ranked vendor table with retention %
- **Tab 4 - Labour Productivity**: per-project cards + last 60 log history table
- **Tab 5 - QC Pass Rate**: phase-wise progress bars + project breakdown table
- Print/Export button (browser print)

---

## ✅ Phase 10 - Photo Uploads on Progress Logs

**Goal:** Site engineers can attach photos to each daily log.

**Status:** ✅ Complete

### What Was Built

**Backend**
- `POST /construction-progress-logs/:id/photos` - Multer `FilesInterceptor` (max 5 files, 10 MB each, JPEG/PNG/WebP/GIF). Files written to `./uploads/progress-photos/` with unique timestamped filenames. URLs appended to the log's `photos` JSONB array.
- `DELETE /construction-progress-logs/:id/photos` - Body `{ photoUrl }`. Removes the URL from the array and deletes the physical file from disk.
- `addPhotos()` and `removePhoto()` service methods added to `ConstructionProgressLogsService`.
- `@ManyToOne` relation `constructionProject` added to `ConstructionProgressLog` entity (was missing, only FK column existed) - also fixes the Phase 9 TypeScript errors in `ConstructionReportsService`.
- Static files are served via the existing `app.useStaticAssets` in `main.ts` at `/uploads/`.

**Frontend - `AddProgressLogModal.tsx`**
- New "Site Photos" section with a drag-target click zone + `<input type="file" multiple accept="image/*">`.
- In-modal preview grid (up to 5 thumbnails, 88×88 px) with per-photo remove button and file-size label.
- After the log is created, photos are uploaded via a `fetch` `multipart/form-data` POST to the photos endpoint with the JWT token.
- Graceful fallback: if photo upload fails the log is still saved and the user is not blocked.

**Frontend - `progress/page.tsx`**
- Camera icon + count badge in the log header row for logs that have photos.
- Photo grid in the expanded details section (80×80 px thumbnails). Click → opens fullscreen lightbox. Hover → shows ×-delete button (calls `DELETE` endpoint and updates UI optimistically).
- Fullscreen lightbox overlay (black backdrop + close button) with `object-contain` large image.

### Files Changed
- `construction-progress-logs.controller.ts`
- `construction-progress-logs.service.ts`
- `entities/construction-progress-log.entity.ts`
- `frontend/src/components/modals/AddProgressLogModal.tsx`
- `frontend/src/app/(dashboard)/construction/progress/page.tsx`

---

## 🧪 Phase 8–10 Test Guide Summary

| Phase | Key Test |
|-------|----------|
| 8 - Accounting Integration | Mark RA Bill PAID → see JE in `/accounting/journal-entries` |
| 9 - Budget Report | `/construction/reports/budget?projectId=<id>` → budget vs actual bar chart |
| 10 - Photo Uploads | Attach photo to progress log → appears as thumbnail in expanded card |
