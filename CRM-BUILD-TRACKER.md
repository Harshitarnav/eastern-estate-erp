# CRM Feature Build Tracker
> Work through items **one at a time**. Mark ✅ when confirmed by Arnav, then move to next.

---

## Status Key
- 🔲 Not started
- 🔨 In progress
- ✅ Done & confirmed
- ⏸️ Blocked / needs input

---

## Build Queue

### 1. ✅ Per-Customer CLP Milestone Editor
**What:** UI to view and edit the `FlatPaymentPlan.milestones` JSONB for each booking.  
**Why first:** Every invoice and ledger depends on confirmed milestones.  
**Scope:**
- [ ] Page: `/payment-plans/[id]` — already exists, needs edit capability
- [ ] Editable milestone table: name, amount, due date, construction phase, status
- [ ] Add / remove milestone rows
- [ ] Recalculate totals live (paid + balance)
- [ ] Save → PATCH `/payment-plans/:id`
- [ ] Guard: only Admin / HR can edit; Sales can view

**No new backend entities needed.**

---

### 1b. ✅ Flow Fixes (Sidebar + Navigation + Invoice Trigger)
- Demand Drafts added to sidebar under Payments & Plans
- Demand Drafts listing page created at `/demand-drafts`
- Booking detail → "View Payment Plan" / "Create Payment Plan" button in Quick Actions
- Payment Plan milestone rows → "Gen. Invoice" button (creates draft + navigates to it)
- Roles updated: `demand-drafts` access added for SUPER_ADMIN, ADMIN, SALES_TEAM

---

### 2. ✅ Demand Invoice PDF
**What:** Generate a formatted PDF demand invoice matching the Assotech sample.  
**Scope:**
- [ ] Invoice number auto-sequencing (e.g., `PP1TX/25/00001/A`)
- [ ] Template: logo, company header, customer block, milestone table with GST breakdown
- [ ] CGST + SGST rows under each milestone line
- [ ] "Amount Payable" column (due − paid)
- [ ] Bank details footer + TDS note + authorized signatory placeholder
- [ ] Download as PDF (client-side via jspdf + autotable, already in package.json ✅)
- [ ] Backend: new endpoint `GET /demand-drafts/:id/pdf` or generate on frontend

**Logo:** `frontend/public/logo.png` — already present ✅

---

### 3. ✅ Money Receipt PDF
**What:** Generate a formatted PDF receipt matching the Assotech receipt sample.  
**Scope:**
- [ ] Receipt number auto-sequencing (e.g., `4323/00383/25-26`)
- [ ] Template: logo, "Receipt" header, applicant details, payment mode block
- [ ] Table: Sl.# | Type | Schedule Name | Revenue Name | Particulars | Total Amt
- [ ] Tax row (base amount row + tax row per line item)
- [ ] "Amount in Words" utility (e.g., *Rupees Three Lac...*)
- [ ] Notes + Narration section
- [ ] "Prepared By" + "Authorized Signatory" footer
- [ ] Triggered from Payment detail page → "Generate Receipt" button

---

### 4. ✅ Review / Preview Step Before Submission
**What:** Confirm screen before finalizing: demand invoice generation, new payment entry, new booking.  
**Scope:**
- [ ] Demand draft: show filled invoice preview → Confirm / Edit back
- [ ] Payment entry: show payment summary → Confirm / Edit back
- [ ] Booking: show booking summary → Confirm / Edit back
- [ ] Pure frontend — zero backend changes

---

### 5. ✅ Unit-wise Ledger
**What:** Per-unit statement — all milestones demanded + all payments received + running balance.  
**Scope:**
- [x] Backend: `GET /flat-payment-plans/ledger/booking/:bookingId` — joins FlatPaymentPlan milestones + Payments
- [x] Frontend: `/ledger/[bookingId]` page — chronological table with colour-coded rows
- [x] Columns: Date | Description | Demanded (₹) | Paid (₹) | Balance (₹) | Status | Links
- [x] Summary cards: Agreement Value, Total Demanded, Total Paid, Outstanding Balance
- [x] Overdue / pending milestone alerts
- [x] Export to PDF (jspdf + autotable, branded header)
- [x] "View Ledger" button on Booking detail Quick Actions + Payment Plan page

---

### 6. ✅ Outstanding + Payment Collection Reports
**What:** Tower/unit wise summary of what's due vs what's collected.  
**Scope:**
- [x] Backend: `ReportsModule` with `/reports/outstanding` and `/reports/collection` endpoints
- [x] Outstanding Report: flat | customer | demanded | paid | outstanding | overdue milestones | oldest overdue days
- [x] Collection Report: all payments, filterable by property, method & date range
- [x] Summary cards on each report page (totals, by-method breakdown)
- [x] PDF export (branded A4 landscape, jspdf + autotable)
- [x] Excel export (xlsx library)
- [x] Reports index page `/reports` with card navigation
- [x] Sidebar "Reports" section (Outstanding + Collection) visible to SUPER_ADMIN, ADMIN, SALES_TEAM
- [x] "Ledger" quick-link on each row of the Outstanding report

---

### 7. ✅ Document Management (per Booking / Customer / Payment / Employee)
**What:** Upload + view categorized documents on any ERP record.  
**Scope:**
- [x] `documents` DB table (auto-created by SchemaSyncService on startup)
- [x] Backend: `DocumentsModule` with upload (multipart), list, delete endpoints
- [x] 11 document categories: Agreement, KYC (Aadhar/PAN/Photo/Other), Bank, Loan, Payment Proof, Possession Letter, NOC, Other
- [x] `DocumentsPanel` reusable React component: drag-to-upload, category dropdown, notes, view/download/delete per file
- [x] KYC doc count badge on panel header (e.g. "KYC: 2/4")
- [x] Integrated on **Booking** detail page (right sidebar)
- [x] Integrated on **Customer** detail page (replaces static KYC section)
- [x] Integrated on **Payment** detail page (payment proof section)
- [x] Integrated on **Employee** detail page (employee documents section)

---

### 8. ✅ Stock Inventory Report
**What:** Property/tower-wise flat availability summary.  
**Scope:**
- [x] Group flats by: Available | Booked | On Hold | Blocked | Sold | Under Construction
- [x] Filter by property, tower, status, BHK type
- [x] Summary cards: Total, Available, Booked, Sold, On Hold, Available %
- [x] Status breakdown strip + BHK type breakdown
- [x] Value cards: Total Inventory Value + Booked/Sold Value
- [x] Table: Property | Tower | Unit # | Type | Floor | Carpet Area | Price | Status | Customer | Booking # | Booked On
- [x] Click row → navigates to flat detail page
- [x] Export to PDF (branded A4 landscape, jspdf + autotable)
- [x] Export to Excel (xlsx)
- [x] Reports index card added
- [x] Sidebar "Stock Inventory" added under Reports

---

## Notes
- Logo files: `frontend/public/logo.png` + `frontend/public/logo-white.png` ✅
- jspdf + jspdf-autotable already in `frontend/package.json` ✅
- S3 upload service already working ✅
- Dynamic CLP (JSONB milestones) already architected correctly ✅
