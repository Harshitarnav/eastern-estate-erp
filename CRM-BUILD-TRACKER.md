# CRM Feature Build Tracker
> Work through items **one at a time**. Mark ✅ when confirmed, then move to next.  
> Last updated: March 2026 (updated 11 Mar 2026)

---

## Status Key
- 🔲 Not started
- 🔨 In progress
- ✅ Done & confirmed
- ⏸️ Blocked / needs input

---

## Build Queue

### 1. ✅ Per-Customer CLP Milestone Editor
**What:** UI to view and edit `FlatPaymentPlan.milestones` JSONB for each booking.  
**Why first:** Every invoice and ledger depends on confirmed milestones.  
- Editable milestone table: name, amount, due date, construction phase, status
- Add / remove milestone rows; live recalculate totals
- Save → PATCH `/payment-plans/:id`

---

### 1b. ✅ Flow Fixes (Sidebar + Navigation + Invoice Trigger)
- Demand Drafts added to sidebar under Payments & Plans
- Demand Drafts listing page at `/demand-drafts`
- Booking → "View / Create Payment Plan" in Quick Actions
- Payment Plan milestone rows → "Gen. Invoice" button
- Roles updated for demand-drafts access

---

### 2. ✅ Demand Invoice PDF
- Formatted A4 PDF with company header, customer block, milestone table
- CGST + SGST breakdown, bank details footer, TDS note
- Invoice number (manual input), GSTIN auto-filled from project settings
- Download via jspdf + autotable (client-side)

---

### 3. ✅ Money Receipt PDF
- Formatted receipt: applicant details, payment mode block, amount table
- Amount in Words (Indian format)
- Receipt number auto-filled from DB or manual entry
- "Generate Receipt" button on Payment detail page

---

### 4. ✅ Review / Preview Step Before Submission
- Demand draft: preview → Confirm / Edit back
- Payment entry: summary → Confirm / Edit back
- Booking: summary → Confirm / Edit back
- Pure frontend, zero backend changes

---

### 5. ✅ Unit-wise Ledger
- `GET /flat-payment-plans/ledger/booking/:bookingId`
- Chronological table: Demanded / Paid / Balance / Status
- Summary cards: Agreement Value, Total Demanded, Total Paid, Outstanding
- Overdue / upcoming milestone alerts
- Share panel: copy phone/email, WhatsApp quick-share, Export PDF
- "View Ledger" button on Booking detail + Payment Plan page

---

### 6. ✅ Outstanding + Payment Collection Reports
- Outstanding: flat | customer | demanded | paid | outstanding | overdue count | days overdue
- Collection: all payments, filterable by property, method, date range
- Summary cards + PDF export + Excel export
- Ledger quick-link on each row

---

### 7. ✅ Document Management (per Booking / Customer / Payment / Employee / Property / Tower / Flat)
- `documents` DB table, `DocumentsModule`, multipart upload
- 11 categories: Agreement, KYC (Aadhar/PAN/Photo/Other), Bank, Loan, Payment Proof, Possession Letter, NOC, Other
- `DocumentsPanel` reusable component with KYC badge
- Flat — named slots: Sale Agreement, Allotment Letter, Possession Letter, Payment Plan, NOC, RERA Certificate, Snag List, Handover Checklist
- Cross-linked: Booking docs appear on Customer profile
- Integrated on: Booking, Customer, Payment, Employee, Property, Tower, Flat

---

### 8. ✅ Stock Inventory Report
- Flat availability by status: Available / Booked / Sold / On Hold / Blocked
- Filter by property, tower, status, BHK type
- Summary cards + value cards (inventory value, booked/sold value)
- PDF + Excel export; click row → flat detail page

---

### 9. ✅ DTO Audits — Booking, Customer, Employee
- Booking: added `rtgsNumber`, `utrNumber`, `chequeNumber`, `chequeDate`, `paymentBank`, `paymentBranch`, `paymentPlan`, `towerId` to DTO + form
- Customer: fixed `customerType`, `kycStatus`, `metadata` silent data loss (removed `select/insert/update: false`)
- Employee: added all missing salary, bank, leave fields to `CreateEmployeeDto`

---

### 10. ✅ Construction Progress Tracker
- `/construction-milestones` page with tower/phase progress table
- "Generate Draft" button per triggered milestone → preview dialog → creates demand draft
- Auto-trigger: construction phase % crossing threshold auto-creates draft
- Linked to Payment Plan milestones via `constructionPhase` field
- Fixed: non-construction milestones (token/down payment) handled gracefully

---

### 11. ✅ Unified Demand Draft Format
- Canonical HTML builder: `demand-draft-html.builder.ts`
- All 3 generation points (Payment Plan, Construction Milestones, Auto-trigger) use the same format
- Includes: company header, customer block, amount highlighted, bank + GSTIN details, footer

---

### 12. ✅ Company / Bank Settings Page
- `/settings/company` — company name, address, phone, email, website
- GSTIN + bank details as **fallback defaults** (each Property overrides with its own)
- SMTP configuration: host, port, username, app password
- **Send Test Email** button with inline result (success / error with diagnostic message)
- `CompanySettings` singleton entity + `SettingsService` + `SettingsController`

---

### 13. ✅ Property-level GSTIN + Bank Details
- `Property` entity extended: `gstin`, `bankName`, `accountName`, `accountNumber`, `ifscCode`, `branch`, `upiId`
- `PropertyForm` updated: new "Legal & Tax" + "Project Bank Account" sections
- Demand draft generation: uses property-level values first, falls back to `CompanySettings`
- Schema sync: columns auto-added on backend boot

---

### 14. ✅ Email Sending via nodemailer
- `MailService` using `nodemailer`, SMTP config pulled live from `CompanySettings`
- `sendDemandDraftEmail` — fires when "Send to Customer" clicked (if SMTP configured)
- Graceful fallback: if SMTP not set, manual download + "Mark as Sent" flow shown
- `MailModule` imported in `AppModule`, `ConstructionModule`, `SettingsModule`

---

### 15. ✅ User Management (`/settings/users`)
- Table: all users, role badge, active/inactive toggle
- Create / Edit / Reset Password / Delete modals
- Role assignment per user
- Backend: `UsersModule` + `UsersService` + `UsersController`

---

### 16. ✅ Booking Summary PDF
- "Download Summary" button on Booking detail page
- A4 PDF: company header, customer + co-applicant details, unit details, financial breakdown, payment plan milestones, signature lines
- Generated client-side via `generate-booking-pdf.ts`

---

### 17. ✅ Ledger Share Panel
- Share panel on Ledger page: copy phone, copy email, WhatsApp quick-share
- WhatsApp pre-fills: customer name, unit, outstanding balance
- "Download PDF" integrated into the share panel

---

### 18. ✅ Dashboard — Live Data
- New backend endpoint `GET /reports/dashboard` — 6 parallel aggregation queries
- Dashboard rebuilt: Financial Overview, Inventory Overview, CRM at a Glance, Unit Status donut, Recent Payments, Overdue Alerts, Quick Actions
- All data from DB — no hardcoded mocks

---

### 19. ✅ Settings → Profile Tab
- Profile tab: fetch + save real user data (first name, last name, phone)
- Change Password section with validation (min 8 chars, must match)
- Help & Guides tab: SMTP setup guide, role guides, troubleshooting

---

### 20. ✅ HR Module Fixes
**What:** Resolved four production issues reported by the HR team.  
**Fixes:**
- **Static leave balances (CL/SL/EL):** Removed hardcoded defaults (`12/12/15`) from `employees.service.ts` `create()` — leave balances now come from the DTO or default to `0` via the entity definition
- **Incomplete employee detail page:** Rewrote `employees/[id]/page.tsx` to display every field from the `Employee` entity — personal, employment, salary, bank, leave, attendance, and a new **Feedback & Performance** section (skills, qualifications, experience, rating, last review, notes)
- **Vanishing fields on edit:** Fixed `Form.tsx` — changed `formValues[field.name] || ''` → `formValues[field.name] ?? ''` so number fields with value `0` no longer appear blank
- **Missing loaders:** Added skeleton loaders to employee list, detail, and edit pages

---

### 21a. ✅ MinIO Object Storage
**What:** Replaced local filesystem uploads with MinIO (S3-compatible) object storage for permanent document persistence.  
**Why:** Files on the backend container's local filesystem are lost if the server is wiped. MinIO stores files in a Docker volume that survives server updates.  
**Scope:**
- Created `MinioStorageService` using `@aws-sdk/client-s3` (already installed) — implements `IStorageService`
- Created `STORAGE_SERVICE` injection token — modules resolve to `MinioStorageService` in production, `LocalStorageService` in local dev (based on `MINIO_ENDPOINT` env var)
- Updated `multer.config.ts` — multer writes to `os.tmpdir()` first; `storage.save()` then moves/uploads to final destination
- Updated `UploadController` — calls `save()` before returning URL; thumbnail generation happens before `save()` so the source file is still available
- Updated `DocumentsService` — calls `save()` then `getUrl()` instead of just `getUrl()`
- Added MinIO container + `minio_data` volume to `docker-compose.prod.yml`
- Updated `Caddyfile` — `handle_path /files/*` strips the prefix then rewrites to `/eastern-estate/{path}` before proxying to `minio:9000` (`/files/<key>` → `minio:9000/eastern-estate/<key>`)
- Old `/uploads/*` route unchanged — legacy files on Docker volume continue to work forever
- Bucket auto-created with public-read policy on backend startup via `onModuleInit()`

**File URL patterns:**
- Old files (pre-MinIO): `/uploads/<uuid>.pdf` — served from backend Docker volume
- New files (MinIO): `/files/<uuid>.pdf` — served directly from MinIO via Caddy

**Production fixes applied after initial deployment:**
- `docker-compose.prod.yml` — added `ports: "127.0.0.1:9001:9001"` to MinIO container so the Admin Console is reachable via SSH tunnel (`ssh -L 9001:localhost:9001 root@<server>` → `http://localhost:9001`)
- `Caddyfile` — fixed path-rewrite bug: `handle_path` strips `/files` prefix before `rewrite` runs, so `{path}` = `/uuid.jpg` not `/files/uuid.jpg`; without this fix Caddy was sending key `files/uuid.jpg` to MinIO (NoSuchKey error)
- Created `backend/scripts/migrate-uploads-to-minio.js` (plain JavaScript) to avoid `ts-node` / `tsconfig.json` compilation conflicts inside the production container; migrates `documents.file_url`, `employees.profile_picture`, and `employee_documents.document_url` from `/uploads/` to `/files/` — run with `node scripts/migrate-uploads-to-minio.js` inside the container

---

### 22. ✅ Skeleton Loaders — ERP-wide
**What:** Replaced all spinner/no-loader loading states with contextual skeleton loaders across every page in the ERP.  
**Why:** Prevents multiple clicks during loading and gives users a clear visual of the page structure before data arrives.  
**Scope:**
- Created `frontend/src/components/Skeletons.tsx` — centralised library of 7 skeleton patterns:
  - `TableSkeleton` — animated rows for data tables
  - `CardGridSkeleton` — card grids (customers, marketing, projects)
  - `TableRowsSkeleton` — compact row skeletons for dense tables
  - `DetailSkeleton` — two-column detail/profile page layout
  - `DashboardSkeleton` — stat cards + charts layout
  - `FormSkeleton` — labelled form fields
  - `SectionSkeleton` — generic section block
- Updated `DataTable.tsx` to accept a `loading` prop and render `TableSkeleton` natively
- **55+ pages updated** across every module:
  - Dashboard, Bookings, Customers, Payments, Leads, Properties, Flats, Towers
  - Construction (8 sub-pages: overview, projects, vendors, materials, POs, progress, teams, inventory, milestones)
  - Sales (overview, tasks, follow-ups)
  - Marketing, Roles, Users
  - Accounting (overview, expenses, accounts, budgets, reports)
  - Reports (outstanding, collection, inventory)
  - Settings (company, users, property-access)
  - Demand Drafts, Payment Plans, Ledger, Notifications
  - All `[id]` detail pages and all `[id]/edit` / `new` form pages

---

---

## 🔲 Pending — Next Up

---

### 22. 🔲 Leads DTO Audit
**What:** Same audit done for Booking/Customer/Employee — check for silent data loss in the Leads module.  
**Why:** If leads have the same issue, notes, source, follow-up dates, or budget fields may not be saving.  
**Scope:**
- [ ] Audit `Lead` entity vs `CreateLeadDto` — find missing fields
- [ ] Audit `UpdateLeadDto` — ensure all editable fields are included
- [ ] Audit `LeadsService.update()` — check Object.assign vs explicit mapping
- [ ] Audit frontend `LeadForm` — ensure all fields submit correctly
- [ ] Audit `LeadResponseDto` — check all fields are returned in API response
- [ ] Fix any gaps found

---

### 23. 🔲 Payment Reminders (Automated)
**What:** Automated email / notification reminders to customers for upcoming and overdue milestone payments.  
**Why:** Currently reminders are fully manual — accounts has to find overdue units in the report and call/email each one.  
**Scope:**
- [ ] Backend: `@nestjs/schedule` cron job — runs daily at 9 AM
- [ ] Query milestones: due in next 3 days (upcoming) + already overdue (missed)
- [ ] For each: fetch customer email from booking → send templated reminder email via `MailService`
- [ ] Email template: unit details, milestone name, amount due, due date, bank details for payment
- [ ] Reminder config page: `/settings/reminders` — toggle on/off, set days-before threshold (e.g. remind 3 days + 1 day before)
- [ ] "Manual Remind" button on Outstanding Report row — send one-off reminder for a specific unit
- [ ] Log sent reminders in DB (don't double-send same day)

---

### 24. 🔲 Accounting Module Audit
**What:** Audit the Expenses, Budgets, and Accounts sub-modules for silent data loss.  
**Why:** These modules were built early and may have the same DTO/entity gaps found in Bookings and Customers.  
**Scope:**
- [ ] Audit `Expense` entity vs `CreateExpenseDto` — missing fields?
- [ ] Audit `Budget` entity vs `CreateBudgetDto`
- [ ] Audit `Account` / `Transaction` entity vs DTOs
- [ ] Check all `*.service.ts` update methods for explicit field mapping
- [ ] Check frontend forms — all fields present and submitting?
- [ ] Fix any gaps found

---

### 25. 🔲 Sales Leads → Follow-ups & Tasks
**What:** A structured follow-up task system tied to Leads.  
**Why:** Currently there's no way to schedule a callback or track task status per lead.  
**Scope:**
- [ ] `LeadFollowUp` entity: leadId, date, time, type (call/visit/email), notes, outcome, createdBy
- [ ] Backend: CRUD endpoints for follow-ups under `/leads/:id/followups`
- [ ] Frontend: Timeline/log view on Lead detail page showing all follow-ups
- [ ] "Add Follow-up" button → quick form (date, type, notes)
- [ ] Dashboard widget: "Today's Follow-ups" — shows leads with follow-up scheduled for today
- [ ] Filter leads list by follow-up due date

---

### 26. 🔲 Possession / Handover Workflow
**What:** Track the handover process for units that are ready for possession.  
**Why:** Possession involves collecting final dues, signing handover checklist, handing over keys — no system for this yet.  
**Scope:**
- [ ] New flat status: `POSSESSION_READY` (beyond Sold)
- [ ] Possession checklist: final dues cleared? snag items resolved? documents signed? keys handed?
- [ ] "Initiate Possession" button on Flat detail (Admin only)
- [ ] Checklist form: each item can be checked off with date + staff name
- [ ] Auto-generate Possession Letter document when checklist is complete
- [ ] Notification to customer when possession is initiated

---

### 27. 🔲 Cancellation / Refund Workflow
**What:** Formal process for cancelling a booking and tracking refund.  
**Why:** Currently there is no structured way to cancel a booking — the flat stays "Booked" even if the deal falls through.  
**Scope:**
- [ ] "Cancel Booking" button on Booking detail (Admin only) with reason dropdown
- [ ] Cancellation creates a record: date, reason, refund amount, deduction (cancellation charges)
- [ ] Flat status reverts to `AVAILABLE` automatically
- [ ] Refund tracking: status (Pending / Processed), payment date, reference
- [ ] Cancelled bookings visible in a separate "Cancelled" filter on the Bookings list
- [ ] Notification to accounts team when cancellation is requested

---

### 28. 🔲 Customer Portal / Dashboard
**What:** A read-only self-service portal for customers to view their booking, ledger, and documents.  
**Scope:** TBD

---

### 29. 🔲 Sales and CP Rate & Unit Details View
**What:** A structured view for channel partners and sales team showing unit pricing and availability.  
**Scope:** TBD

---

### 30. 🔲 Customer Rate Negotiations
**What:** Track negotiated rates and discount approvals per customer/booking.  
**Scope:** TBD

---

## Notes
- Logo files: `frontend/public/logo.png` + `frontend/public/logo-white.png` ✅
- jspdf + jspdf-autotable already in `frontend/package.json` ✅
- Dynamic CLP (JSONB milestones) already architected correctly ✅
- SMTP email (nodemailer) wired in via `MailService` ✅
- Company Settings + Property-level overrides for GSTIN/bank in place ✅
- Schema sync handles all DB migrations automatically on backend boot ✅
- Skeleton loaders centralised in `frontend/src/components/Skeletons.tsx` ✅
- `Form.tsx` uses `??` (nullish coalescing) — number fields with value `0` display correctly ✅
- Employee leave balances (CL/SL/EL) are dynamic — set via DTO, no hardcoded defaults ✅
- MinIO object storage active in production — files stored permanently in `minio_data` Docker volume ✅
- `STORAGE_SERVICE` injection token — auto-switches between MinIO (prod) and local filesystem (dev) ✅
- `@aws-sdk/client-s3` already in `backend/package.json` — no new packages needed ✅
- MinIO Admin Console accessible via SSH tunnel on port `9001` (bound to `127.0.0.1` only — not public) ✅
- Caddy `handle_path /files/*` correctly strips prefix before rewrite — files serve at `https://<domain>/files/<key>` ✅
- Migration script `backend/scripts/migrate-uploads-to-minio.js` (plain JS) migrated all pre-MinIO uploads to bucket; run with `node scripts/migrate-uploads-to-minio.js` inside backend container ✅
- All DB rows confirmed updated: `documents.file_url`, `employees.profile_picture`, `employee_documents.document_url` all point to `/files/...` ✅