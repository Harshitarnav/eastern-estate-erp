# 🏦 Accounting Module Build Tracker
**Project:** Eastern Estate ERP  
**Started:** March 2026  
**Goal:** Full Tally-like accounting module for real estate firm

---

## Overall Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Backend wiring — Trial Balance API, Property-wise P&L | ✅ Complete |
| Phase 2 | Core UI — Journal Entries, Account Ledger | ✅ Complete |
| Phase 3 | Bank Reconciliation UI | ✅ Complete |
| Phase 4 | Property-wise & Project-wise Reporting | ✅ Complete |
| Phase 5 | Module Integrations (Payments → JE, Expenses → JE, HR → JE) | ✅ Complete |
| Phase 6 | Real PDF/Excel Exports + Tabbed Reports | ✅ Complete |
| Phase 7 | Roles — Head Accountant, Project Accountant | ✅ Complete |
| Phase 8 | Cash & Bank Book UI, Property-wise P&L tab, Dashboard polish | ✅ Complete |

---

## Phase 1 — Backend Wiring
**Goal:** Ensure all API endpoints the frontend needs actually exist and work.

### What was already working (pre-build)
- ✅ `GET /accounting/accounts/balance-sheet` — AccountsService.getBalanceSheet()
- ✅ `GET /accounting/accounts/profit-loss` — AccountsService.getProfitAndLoss()
- ✅ `GET /accounting/accounts` — list all accounts with type filter
- ✅ `POST /accounting/accounts` — create account
- ✅ `GET /accounting/accounts/hierarchy` — tree structure
- ✅ `GET /journal-entries` — list with filters (status, date, referenceType)
- ✅ `POST /journal-entries` — create with debit=credit validation
- ✅ `POST /journal-entries/:id/post` — post draft entry & update balances
- ✅ `POST /journal-entries/:id/void` — void & reverse balances
- ✅ `GET /accounting/expenses` — list with filters
- ✅ `POST /accounting/expenses/:id/approve` — approve flow
- ✅ `POST /accounting/expenses/:id/paid` — mark paid
- ✅ `GET /accounting/budgets` — list
- ✅ `GET /accounting/ledgers/account/:id` — per-account ledger
- ✅ `GET /accounting/ledgers/cash-book` — cash book
- ✅ `GET /accounting/ledgers/bank-book/:bankAccountId` — bank book
- ✅ `GET /accounting/exports/trial-balance` — Excel export
- ✅ `GET /accounting/exports/itr` — ITR JSON

### Phase 1 Tasks

#### 1.1 — Trial Balance JSON API
- **File:** `backend/src/modules/accounting/accounts.service.ts`
- **File:** `backend/src/modules/accounting/accounts.controller.ts`
- **Route:** `GET /accounting/accounts/trial-balance`
- **Returns:** All active accounts with debit/credit columns + totals
- **Status:** ✅ Done

#### 1.2 — Property-wise P&L API
- **File:** `backend/src/modules/accounting/accounts.service.ts`
- **File:** `backend/src/modules/accounting/accounts.controller.ts`
- **Route:** `GET /accounting/accounts/property-pl?propertyId=xxx`
- **Returns:** P&L filtered by propertyId on journal entry lines
- **Status:** ✅ Done

#### 1.3 — Frontend accounting.service.ts additions
- **File:** `frontend/src/services/accounting.service.ts`
- **Added:** `getTrialBalance()`, `getPropertyWisePL()`, `getLedger()`, `getCashBook()`, `getBankBook()`
- **Status:** ✅ Done

### Phase 1 Hotfix — Missing DB Columns (journal_entries)

**Error:** `column "createdBy" of relation "journal_entries" does not exist`

**Root Cause:** `synchronize: false` is set in app.module.ts. The columns `createdBy`, `approvedBy`, `approvedAt`, `voidedBy`, `voidedAt`, `voidReason` were added to the entity after synchronize was disabled, so they were never created in the DB.

**Fix applied:**
- `journal-entries.service.ts` — removed `createdBy: userId` from create, removed `voidedBy/voidedAt/voidReason` from void (commented, safe to re-enable after migration)
- `journal-entries.service.ts` — removed `'creator', 'poster', 'voider'` from relations in findOne
- Created migration: `backend/src/database/migrations/006_add_journal_entry_audit_columns.sql`

**✅ MIGRATION COMPLETE** — Run on 25 Mar 2026. Audit columns now live in DB.

~~**⚠️ ACTION REQUIRED:** Run the migration on your DB:~~
```sql
-- File: backend/src/database/migrations/006_add_journal_entry_audit_columns.sql
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS "createdBy"  UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "approvedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "voidedBy"   UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "voidedAt"   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "voidReason" TEXT;
```
After running: uncomment the guarded lines in `journal-entries.service.ts` (void method).

### Phase 1 Test Guide
See bottom of this file → **[Phase 1 Test Guide]**

---

## Phase 2 — Core UI Pages
**Goal:** Build the pages that accountants use daily.

### Phase 2 Tasks

#### 2.1 — Journal Entries Page
- **Route:** `/accounting/journal-entries`
- **File:** `frontend/src/app/(dashboard)/accounting/journal-entries/page.tsx`
- **Features:**
  - List all journal entries (date, entry#, description, debit, credit, status)
  - Filters: date range, status, reference type
  - Actions: Post draft, Void posted (with reason), View detail
  - "New Journal Entry" button → modal form with multi-line debit/credit
  - Debit = Credit validation before submit
- **Status:** ✅ Done

#### 2.2 — Account Ledger Page
- **Route:** `/accounting/accounts/[id]/ledger`
- **File:** `frontend/src/app/(dashboard)/accounting/accounts/[id]/ledger/page.tsx`
- **Features:**
  - Account header (name, code, type, current balance)
  - Date range picker
  - Ledger table: Date | Entry# | Narration | Debit | Credit | Running Balance
  - Opening balance row at top, Closing balance at bottom
  - Export to Excel button
- **Status:** ✅ Done

#### 2.3 — Sidebar Expansion
- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Added:** Journal Entries, Ledger (via accounts page link)
- **Status:** ✅ Done

### Phase 2 Test Guide
See bottom of this file → **[Phase 2 Test Guide]**

---

## Phase 3 — Bank Reconciliation UI
**Goal:** Let accountants upload bank statements and match them.

### Phase 3 Tasks
#### 3.1 — Bank Accounts page `/accounting/bank-accounts`
#### 3.2 — Reconciliation page `/accounting/bank-accounts/[id]/reconcile`
- **Status:** ⏳ Pending

---

## Phase 4 — Property-wise Reporting
**Goal:** Per-property P&L for multi-project firms.
- **Status:** ⏳ Pending

---

## Phase 5 — Module Integrations
**Goal:** Auto-generate journal entries from other modules.

| Trigger | Journal Entry |
|---------|--------------|
| Payment marked received | Dr: Bank A/c → Cr: Sales Revenue |
| Demand Draft cleared | Dr: Bank A/c → Cr: Advance Received |
| Expense marked PAID | Dr: Expense A/c → Cr: Bank/Cash |
| Salary processed (HR) | Dr: Salary Expense → Cr: Bank/Cash |

- **Status:** ⏳ Pending

---

## Phase 6 — Real PDF/Excel Exports
**Goal:** Replace all `alert()` placeholders with real downloads.
- Balance Sheet PDF
- P&L Statement PDF  
- Trial Balance Excel
- Budget Variance PDF
- ITR Export UI (FY picker → download)
- **Status:** ⏳ Pending

---

## Phase 7 — Roles & Head Accountant Dashboard
**Goal:** Role-based access with head accountant cross-project view.
- Add `accountant` and `head_accountant` roles
- Head accountant dashboard: cross-project summary
- Project accountant: scoped to their property
- **Status:** ⏳ Pending

---

## Phase 8 — Sidebar & Polish
**Goal:** Final polish before prod deployment.
- Expanded sidebar with all new accounting sub-items
- Date range pickers everywhere
- Pagination on all lists
- Mobile responsive tables
- **Status:** ⏳ Pending

---

## Key File Map

### Backend
| File | Purpose |
|------|---------|
| `backend/src/modules/accounting/accounts.service.ts` | Balance Sheet, P&L, Trial Balance, Property P&L |
| `backend/src/modules/accounting/accounts.controller.ts` | REST routes for accounts |
| `backend/src/modules/accounting/journal-entries.service.ts` | Create, Post, Void JEs |
| `backend/src/modules/accounting/journal-entries.controller.ts` | REST at `/journal-entries` |
| `backend/src/modules/accounting/expenses.service.ts` | Expense CRUD + approval |
| `backend/src/modules/accounting/budgets.service.ts` | Budget CRUD + variance |
| `backend/src/modules/accounting/accounting.service.ts` | Ledger, Cash Book, Bank Book, Excel export |
| `backend/src/modules/accounting/accounting.module.ts` | Module registration |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/services/accounting.service.ts` | All API calls |
| `frontend/src/app/(dashboard)/accounting/page.tsx` | Dashboard |
| `frontend/src/app/(dashboard)/accounting/accounts/page.tsx` | Chart of Accounts |
| `frontend/src/app/(dashboard)/accounting/accounts/[id]/ledger/page.tsx` | Account Ledger *(new)* |
| `frontend/src/app/(dashboard)/accounting/journal-entries/page.tsx` | Journal Entries *(new)* |
| `frontend/src/app/(dashboard)/accounting/expenses/page.tsx` | Expenses |
| `frontend/src/app/(dashboard)/accounting/budgets/page.tsx` | Budgets |
| `frontend/src/app/(dashboard)/accounting/reports/page.tsx` | Reports |
| `frontend/src/components/layout/Sidebar.tsx` | Navigation |
| `frontend/src/lib/roles.ts` | Role-module access |

### Entity Map (DB Tables)
| Entity | Table | Key Fields |
|--------|-------|-----------|
| Account | `accounts` | accountCode, accountType, currentBalance |
| JournalEntry | `journal_entries` | entryNumber, entryDate, status, referenceType, referenceId |
| JournalEntryLine | `journal_entry_lines` | journalEntryId, accountId, debitAmount, creditAmount |
| Expense | `expenses` | expenseCategory, amount, status, propertyId, accountId |
| Budget | `budgets` | budgetName, fiscalYear, budgetedAmount, actualAmount |
| BankAccount | `bank_accounts` | accountName, bankName, accountNumber |
| BankStatement | `bank_statements` | bankAccountId, isReconciled, debitAmount, creditAmount |

---

## 🧪 Phase 1 Test Guide

Once Phase 1 is deployed (or running locally), test these endpoints with Postman or browser:

### 1. Trial Balance
```
GET http://localhost:3001/api/accounting/accounts/trial-balance
Authorization: Bearer <your-token>
```
**Expected:** JSON with `{ accounts: [...], totalDebit, totalCredit, isBalanced }`  
Each account has: `accountCode`, `accountName`, `accountType`, `debitBalance`, `creditBalance`

### 2. Property-wise P&L
```
GET http://localhost:3001/api/accounting/accounts/property-pl?propertyId=<uuid>
Authorization: Bearer <your-token>
```
**Expected:** `{ income: [...], expenses: [...], totalIncome, totalExpenses, netProfit }`

### 3. Balance Sheet (verify existing)
```
GET http://localhost:3001/api/accounting/accounts/balance-sheet
```
**Expected:** `{ assets: [...], liabilities: [...], equity: [...], totalAssets, totalLiabilities, totalEquity }`

### 4. Journal Entries List (verify existing)
```
GET http://localhost:3001/api/journal-entries
GET http://localhost:3001/api/journal-entries?status=DRAFT
GET http://localhost:3001/api/journal-entries?startDate=2026-01-01&endDate=2026-12-31
```

### 5. In the UI — Open `/accounting` dashboard
- Should show 4 summary cards (Total Assets, Total Liabilities, Total Equity, Net Profit)
- Balance Sheet and P&L summary panels should populate
- Quick links to Chart of Accounts, Expenses, Budgets should work

---

## 🧪 Phase 2 Test Guide

### Journal Entries page `/accounting/journal-entries`
1. Navigate to Accounting → Journal Entries in the sidebar
2. Page loads showing list of all journal entries (empty if none yet)
3. Click **"New Journal Entry"**
4. Fill in: Date, Description
5. Add line 1: pick an ASSET account, enter ₹10,000 in Debit
6. Add line 2: pick an INCOME account, enter ₹10,000 in Credit
7. Try to submit with mismatched totals — should show validation error
8. Submit with balanced lines — entry created as DRAFT
9. Click **"Post"** on the draft — status changes to POSTED, account balances update
10. Click **"Void"** on a POSTED entry — enter reason — status changes to VOID
11. Verify account balances reverted after void

### Account Ledger `/accounting/accounts/[id]/ledger`
1. Go to Chart of Accounts, click any account
2. Click **"View Ledger"** button
3. Set date range (e.g. Jan 2026 – Dec 2026)
4. Should show: Opening Balance → transactions → Closing Balance with running total
5. Click **"Export Excel"** — file downloads

---

## 🧪 Phase 3 Test Guide — Bank Reconciliation

### Step 1 – Add a Bank Account
1. Go to **Accounting → Bank Accounts** in the sidebar (new item)
2. Click **"Add Bank Account"**
3. Fill: Account Nickname = `HDFC Current Main`, Bank = `HDFC Bank`, Account No. = `50100xxxxxx`, IFSC = `HDFC0001234`
4. Click Save → account appears in the list
5. Click **"Reconcile"** on that account

### Step 2 – Upload a Bank Statement
1. On the Reconcile page, click **"Choose Excel File"**
2. Upload an Excel file with these columns:
   ```
   Date | Description | Debit | Credit | Balance
   ```
3. Rows should appear in the "Bank Transactions" table

### Step 3 – Match transactions
1. For each row, select a **Posted journal entry** from the dropdown
2. Click **"Match"** → row turns green with a checkmark
3. Watch the summary cards update (Unreconciled count drops)

### Step 4 – Edge cases to test
- Upload an empty file → should show an error
- Try uploading a non-Excel file → should reject
- Try clicking Match without selecting a JE → alert fires

### Backend APIs to test (cURL/Postman)
```
GET  http://localhost:3001/api/v1/accounting/bank-accounts
POST http://localhost:3001/api/v1/accounting/bank-accounts  { accountName, bankName, accountNumber }
GET  http://localhost:3001/api/v1/accounting/bank-statements/unreconciled/:id
POST http://localhost:3001/api/v1/accounting/bank-statements/upload  (multipart/form-data)
POST http://localhost:3001/api/v1/accounting/bank-statements/:id/reconcile  { journalEntryId }
```

---

## 🧪 Phase 6 Test Guide — Reports & Exports

### Reports page `/accounting/reports`
1. Navigate to **Accounting → Reports**
2. **Balance Sheet tab** — All accounts listed under Assets, Liabilities, Equity. Bottom row shows equation check (✓ Balanced / ⚠ Not balanced)
3. Click **"Print / PDF"** → Browser print dialog opens with clean layout. Save as PDF from here.
4. **Profit & Loss tab** — Income & Expense accounts listed, Net Profit / Loss card at bottom
5. Click **"Print / PDF"** → same browser print dialog
6. **Trial Balance tab** — All accounts in one table with Debit / Credit columns. Bottom row shows TOTALS and balanced status.
7. Change the date and click **"Excel"** → `.xlsx` file downloads (ensure backend export route is working)
8. **Budget Variance tab** — shows all budgets with budgeted vs actual spend and variance %
9. **ITR Export tab** — Select financial year (e.g. 2025-2026), click "Fetch Data" → summary cards appear with income/expense heads. Click "Download JSON".

### Common issues to watch for
- **NaN values** → all `Number()` coercions are in place; if NaN appears check console for API shape
- **Excel export fails** → verify `NEXT_PUBLIC_API_URL` is set correctly in `.env`
- **Print layout breaks** → tested in Chrome; Firefox may need margin tweaks in print CSS

## 🧪 Phase 4 Test Guide *(to be added)*
## 🧪 Phase 5 Test Guide *(to be added)*
## 🧪 Phase 7 Test Guide *(to be added)*
## 🧪 Phase 8 Test Guide *(to be added)*

---

## Deployment Notes
- No DB migrations needed for Phases 1–3 (all entities already exist)
- Phase 5 (integrations) may need a column addition to `payments` table: `journalEntryId`
- Phase 7 (roles) needs new enum values in the `user_roles` table
- Always deploy backend first, then frontend
- Command: `docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend`

---

## ✳️ POST-LAUNCH PHASE PLAN — Tally Parity Gaps

### Current Gap Assessment (vs Tally)
| Category | Score | Key Missing |
|---|---|---|
| Core engine (JE, COA, Ledger) | 80% | — |
| Financial reports | 65% | Cash Flow, Fund Flow |
| Bank reconciliation | 50% | Auto-match |
| GST compliance | 5% | GSTR-1, GSTR-3B, ITC |
| TDS management | 0% | 194C, 194I, Form 26Q |
| AR/AP aging | 10% | Aging buckets, SOA |
| Voucher types / UX | 35% | Specific voucher UI |
| **Overall vs Tally** | **~50%** | — |

---

## Phase 9 — Voucher Types UI
**Goal:** Make daily accounting as fast as Tally — split "New Journal Entry" into business-friendly voucher buttons.
**Status:** ✅ Complete

### What to Build
- **Payment Voucher**: Dr Expense → Cr Bank/Cash. Simple form: Who? How much? Which bank?
- **Receipt Voucher**: Dr Bank/Cash → Cr Customer/Income. Flat buyer payment form.
- **Contra Voucher**: Cash ↔ Bank transfers. Just two dropdowns + amount.
- **Journal Voucher**: Existing JE form for advanced adjustments.

### Files to Change
- `frontend/src/app/(dashboard)/accounting/journal-entries/page.tsx` — Add 4 big buttons at top, each opens a pre-configured modal
- **NO backend changes** — same JE API, just smarter frontend

### Test Guide
1. Go to `/accounting/journal-entries`
2. Click **Payment Voucher** — form should pre-fill Dr side to Expenses, Cr side to Bank accounts
3. Enter vendor name, amount, bank — submit
4. JE created with correct double-entry, status DRAFT
5. Post it — account balances update

---

## Phase 10 — AR/AP Aging Reports
**Goal:** Show who owes you money and who you owe, bucketed by age.

**Status:** ✅ Complete

### What to Build
#### Accounts Receivable Aging (flat buyers)
- Query payments module for outstanding booking installments
- Group by customer, show amounts in 0–30, 31–60, 61–90, 90+ day buckets
- Drill-down to flat/booking
- "Send Reminder" button (email/WhatsApp stub)

#### Accounts Payable Aging (vendors)
- Query vendor outstanding from `vendors.outstandingAmount`
- Bucket by PO expected payment date
- Vendor-wise summary

### Backend Routes to Add
```
GET /accounting/reports/ar-aging?asOf=YYYY-MM-DD
GET /accounting/reports/ap-aging?asOf=YYYY-MM-DD
```

### Frontend
- New tab on `/accounting/reports` → "AR Aging" + "AP Aging"
- Color-coded: Green (0-30), Yellow (31-60), Orange (61-90), Red (90+)

### Test Guide
1. Go to `/accounting/reports` → AR Aging tab
2. Should list all customers with outstanding installments
3. Red rows = 90+ days overdue

---

## Phase 11 — TDS Tracking
**Goal:** Track Tax Deducted at Source on contractor/vendor payments (Section 194C, 194I, 194J).

**Status:** ⏳ Pending

### What to Build
#### Backend
- Add `tdsSection`, `tdsRate`, `tdsAmount` columns to `vendor_payments` table (migration)
- New route: `GET /accounting/tds-summary?fy=2025-26` — returns vendor-wise TDS deducted
- New route: `GET /accounting/tds/form-26q` — exports Form 26Q compatible data

#### Frontend
- Add TDS fields to Vendor Payment modal (section dropdown: 194C/194I/194J, auto-calculate rate)
- New tab on Reports page: **TDS Summary** — vendor-wise with section and amounts
- Download Form 26Q data as Excel

### TDS Rates Reference
| Section | Nature | Rate |
|---|---|---|
| 194C | Contractor | 1% (Individual) / 2% (Company) |
| 194I | Rent | 10% |
| 194J | Professional/Technical | 10% |

### Test Guide
1. Go to Construction → Vendors → Record Payment
2. Check "Deduct TDS" checkbox → Section 194C → 2% auto-calculated
3. Go to Accounting → Reports → TDS Summary
4. Should show vendor with TDS deducted, total TDS liability

---

## Phase 12 — Cash Flow Statement
**Goal:** Auto-generate Cash Flow from journal entries (the third of the "Big 3" financial reports).

**Status:** ✅ Complete

### What to Build
#### Backend
- New service method: `getCashFlowStatement(startDate, endDate)`
- Categorize JE lines by activity type:
  - **Operating**: Sales receipts, expense payments, salary
  - **Investing**: Property purchase, equipment
  - **Financing**: Loan receipts, loan repayments, capital
- Returns: Opening balance, net from each activity, closing balance

#### Frontend
- New tab on `/accounting/reports` — **Cash Flow**
- Three sections: Operating / Investing / Financing
- Net change in cash, opening + closing balance
- Print/PDF support

### Test Guide
1. Go to `/accounting/reports` → Cash Flow tab
2. Should show three sections with transaction totals
3. Closing balance should match current cash account balance

---

## Phase 13 — GST Module (Indian Compliance)
**Goal:** Basic GST tracking for real estate transactions.

**Status:** ⏳ Pending
**Complexity:** HIGH — ~1 week

### What to Build
#### Phase 13a — GST on Transactions
- Add `gstPercentage`, `gstAmount`, `hsnSacCode` to `expenses` table
- Add `gstPercentage`, `gstAmount` to `payments` table (flat sales)
- Show GST breakdown in expense and payment forms

#### Phase 13b — Input Tax Credit (ITC)
- Track GST paid on purchases (vendor invoices) = ITC available
- Track GST collected on sales (flat sales) = GST payable
- ITC Set-off: GST Payable − ITC = Net Payable

#### Phase 13c — GSTR Reports
- **GSTR-1**: Outward supplies (flat sales with GST) — monthly summary
- **GSTR-3B**: Net GST payable after ITC set-off

### Key Real Estate GST Rules
| Transaction | GST Rate |
|---|---|
| Under-construction flat sale | 5% (affordable), 12% (regular) |
| Plot sale (with development) | 12% |
| Ready-to-move flat (OC received) | EXEMPT |
| Commercial property | 18% |
| Construction services to builder | 18% (ITC available) |

### Test Guide
1. Create an expense (cement purchase) — add GST 18%, HSN 2523
2. Record a flat sale payment — add GST 5%
3. Go to Reports → GSTR-3B preview — should show ITC offset against liability

---

## 🧪 Phase 9–13 Test Guide Summary

| Phase | Key Test |
|---|---|
| 9 — Voucher Types | Click "Payment Voucher" → fills debit side automatically |
| 10 — AR Aging | `/accounting/reports` AR tab → color-coded aging buckets |
| 11 — TDS | Vendor payment with TDS → appears in TDS Summary report |
| 12 — Cash Flow | `/accounting/reports` Cash Flow tab → 3 sections, balanced |
| 13 — GST | Expense with GST 18% → GSTR-3B shows ITC credit |
