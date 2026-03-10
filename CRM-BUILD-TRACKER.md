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

### 4. 🔲 Review / Preview Step Before Submission
**What:** Confirm screen before finalizing: demand invoice generation, new payment entry, new booking.  
**Scope:**
- [ ] Demand draft: show filled invoice preview → Confirm / Edit back
- [ ] Payment entry: show payment summary → Confirm / Edit back
- [ ] Booking: show booking summary → Confirm / Edit back
- [ ] Pure frontend — zero backend changes

---

### 5. 🔲 Unit-wise Ledger
**What:** Per-unit statement — all milestones demanded + all payments received + running balance.  
**Scope:**
- [ ] Backend: `GET /payment-plans/ledger/:flatId` — joins FlatPaymentPlan + Payments
- [ ] Frontend: Ledger page under booking detail or flat detail
- [ ] Columns: Date | Description | Demand Amount | Payment Amount | Balance
- [ ] Export to PDF

---

### 6. 🔲 Outstanding + Payment Collection Reports
**What:** Tower/unit wise summary of what's due vs what's collected.  
**Scope:**
- [ ] Outstanding Report: flat | customer | total amount | paid | balance | overdue days
- [ ] Collection Report: grouped by property → tower → flat, with date filters
- [ ] Both exportable as PDF + Excel
- [ ] Backend: aggregation queries on `FlatPaymentPlan` + `Payment`

---

### 7. 🔲 Document Management (per Booking / Customer)
**What:** Upload + view categorized documents per booking.  
**Scope:**
- [ ] Categories: Agreement Copy | KYC (Aadhar, PAN, Photo) | Bank Documents | Other
- [ ] Upload via existing S3 service
- [ ] Viewer/download per document
- [ ] Visible on Booking detail page + Customer detail page
- [ ] KYC status indicator (Pending / In Progress / Verified)

---

### 8. 🔲 Stock Inventory Report
**What:** Property/tower-wise flat availability summary.  
**Scope:**
- [ ] Group flats by: Available | Booked | Agreement Signed | Registered | Cancelled
- [ ] Filter by property, tower, BHK type
- [ ] Export to PDF + Excel

---

## Notes
- Logo files: `frontend/public/logo.png` + `frontend/public/logo-white.png` ✅
- jspdf + jspdf-autotable already in `frontend/package.json` ✅
- S3 upload service already working ✅
- Dynamic CLP (JSONB milestones) already architected correctly ✅
