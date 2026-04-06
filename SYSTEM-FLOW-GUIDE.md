# Eastern Estate ERP — System Flow Guide
> **Living document.** Update this file whenever the system flow changes.  
> Last updated: 6 April 2026

---

## Table of Contents
1. [Who Uses What — Roles Overview](#1-who-uses-what--roles-overview)
2. [First-Time Setup Checklist (Admin)](#2-first-time-setup-checklist-admin)
3. [Setting Up a New Project](#3-setting-up-a-new-project)
4. [Sales Flow — From Enquiry to Booking](#4-sales-flow--from-enquiry-to-booking)
5. [Payment Plan Flow — CLP Setup](#5-payment-plan-flow--clp-setup)
6. [Demand Draft Flow — Raising a Payment Demand](#6-demand-draft-flow--raising-a-payment-demand)
7. [Receiving a Payment & Money Receipt](#7-receiving-a-payment--money-receipt)
8. [Unit-wise Ledger](#8-unit-wise-ledger)
9. [Document Management](#9-document-management)
10. [Reports](#10-reports)
11. [Construction Progress Tracking](#11-construction-progress-tracking)
12. [HR — Managing Employees](#12-hr--managing-employees)
13. [Dashboard](#13-dashboard)
14. [Settings — Company, Users & Profile](#14-settings--company-users--profile)
15. [Notifications](#15-notifications)
16. [Project Scope & Accounting](#16-project-scope--accounting)
17. [Role Management (Custom Roles & Permissions)](#17-role-management-custom-roles--permissions)
18. [Production Deployments & Database Migrations](#18-production-deployments--database-migrations)
19. [Common Questions & Gotchas](#19-common-questions--gotchas)

---

## 1. Who Uses What — Roles Overview

| Role | What they can see / do |
|------|------------------------|
| **Super Admin** | Everything — full access to all modules including Settings |
| **Admin** | Everything including Company Settings and User Management |
| **Head Accountant** | Company-wide accounting: all projects, books, expenses, journal entries, payroll-related views, reports (same breadth as Admin for accounting modules) |
| **Accountant** | Accounting for **assigned projects only** — chart of accounts, bank accounts, expenses, journal entries, reports scoped to those projects |
| **Sales Team** | Customers, Leads, Bookings, Payment Plans, Demand Drafts, Ledger |
| **Accounts** (legacy naming) | Often used for payment operations — may overlap with accountant roles depending on your setup |
| **HR** | Employees, HR Dashboard |
| **Staff** | Dashboard + read-only access to their assigned modules |

> 💡 If someone says "I can't see X in the sidebar", check their role under **Settings → Users**.  
> 💡 **Project access:** Users who are not Super Admin / Admin / Head Accountant only see data for **properties they are assigned to** (see **Users → Property Access**). The **project dropdown** in the top bar chooses which project’s data you are working in (especially for Accounting and other scoped modules).

> 💡 **Mobile:** Lists support tap-to-open details where a desktop row click works; wide tables scroll horizontally inside the page so the app does not overflow sideways.

---

## 2. First-Time Setup Checklist (Admin)

Do these once before the team starts using the ERP:

- [ ] **Company Settings** — Go to **Settings → Company & Bank** → fill in company name, address, contact
- [ ] **SMTP Email** — In the same page, fill in SMTP details → click **Send Test Email** to verify
- [ ] **Project Bank & GSTIN** — Open each **Property** → fill in its own GSTIN and bank details
- [ ] **Create Users** — Go to **Settings → Users** → add each staff member with their role
- [ ] **Create Properties → Towers → Flats** — The project hierarchy must exist before any booking
- [ ] **Create a Payment Plan Template** — Optional but speeds up CLP setup per customer

---

## 3. Setting Up a New Project

```
Sidebar: Property Inventory
```

Every sale needs the full hierarchy: **Property → Tower → Flat**

### 3a. Create a Property
1. Go to **Properties** → click **+ New Property**
2. Fill in: Project Name, Location, Total Area, Type, BHK Types, Price Range
3. In the **Legal & Tax** section: enter **GSTIN** and **RERA Number** for this project
4. In the **Project Bank Account** section: enter the bank details specific to this project
5. Save.

> ⚠️ Setting GSTIN and bank details at the Property level means every demand draft for this project will automatically use the correct details — no manual entry needed.

### 3b. View Property Details
- From the **Properties list**, click the **👁 eye icon** on any row to open the Property detail page
- Shows all project details, linked towers, documents, and bank/legal info

### 3c. Add a Tower
1. Go to **Towers** → click **+ New Tower**
2. Select the Property it belongs to, enter Tower Name, number of floors, etc.
3. Save.

### 3d. Add Flats
1. Go to **Flats** → click **+ New Flat**
2. Select the Tower, enter Flat Number, Floor, Type (2BHK, 3BHK…), Area, Base Price
3. Save.

> Repeat 3d for every unit. A flat must exist before you can book it.

---

## 4. Sales Flow — From Enquiry to Booking

```
Sidebar: Sales & CRM → Leads / Customers / Bookings
```

### Step 1 — Capture the Lead
1. Go to **Leads** → **+ New Lead**
2. Fill in: Name, Phone, Email, Source (Walk-in / Website / Referral), interested property, budget
3. Log follow-up dates as the conversation progresses
4. When the customer is ready to book, convert to a Customer

### Step 2 — Add the Customer
1. Go to **Customers** → **+ New Customer**
2. Fill in all tabs: Personal, KYC (PAN, Aadhar), Bank Details, Address
3. Save. The customer gets a unique Customer ID.

> 💡 Documents (Aadhar copy, PAN card, photo) can be uploaded directly from the customer's profile page.

### Step 3 — Create a Booking
1. Go to **Bookings** → **+ New Booking**
2. Select: **Customer**, **Property**, **Tower**, **Flat**
3. Fill financial details: Agreement Value, Token Amount, Discount, GST, Stamp Duty, etc.
4. Set Booking Date and Agreement Date
5. Add co-applicant and nominee details if applicable
6. Click **Submit** — a **Review Screen** appears showing every field you filled in
7. If anything is wrong, click **← Edit Details** to go back (all values are preserved)
8. Click **Confirm & Create Booking** — the booking is saved

### Step 4 — Download Booking Summary PDF
- From the **Booking detail page**, click **Download Summary** (top-right)
- A branded A4 PDF is downloaded with: customer info, unit details, financial breakdown, payment plan milestones, and signature lines

> From the **Quick Actions** panel on the right side of the booking, you can jump to: Create Payment Plan, New Payment, View Ledger.

---

## 5. Payment Plan Flow — CLP Setup

```
Sidebar: Payments & Plans → Payment Plans
```

Every customer can have a **different** payment schedule (fully dynamic CLP).

### Step 1 — Create a Payment Plan
1. Open the **Booking** detail page → Quick Actions → **Create Payment Plan**
   - Customer, flat, and total amount are pre-filled automatically
2. Add milestones:
   - **Milestone name** — e.g. "On Booking", "On Foundation", "On Possession"
   - **Amount** — what is due at this stage
   - **Construction Phase** — links it to a construction phase for auto-triggering (optional)
   - **Due Date** — when payment is expected
3. Ensure the total of all milestones matches the agreement value
4. Click **Save Changes**

### Step 2 — Edit Milestones Later
- Open the Payment Plan → click **Edit Milestones**
- Add rows, remove rows, or change amounts
- The running total at the bottom shows if you are over/under
- Click **Save Changes** when done

> 💡 Each milestone will have a **Demand Draft** generated against it when the time comes. The milestone row shows a coloured status badge (DRAFT / READY / SENT) once a draft is generated.

---

## 6. Demand Draft Flow — Raising a Payment Demand

```
Sidebar: Payments & Plans → Demand Drafts
```

A Demand Draft is the official payment demand notice sent to the customer when a milestone is due.

### Where demand drafts can be generated from
There are **3 places** a demand draft can be generated:

| Where | How |
|-------|-----|
| **Payment Plan page** | Click **Gen. Invoice** on a milestone row |
| **Construction Milestones page** | Click **Generate Draft** next to a triggered milestone |
| **Auto-trigger** | When construction progress crosses a phase threshold, the system creates a draft automatically |

### Step 1 — Generate from Payment Plan (most common)
1. Open the **Payment Plan** for the booking
2. On the milestone row, click **Gen. Invoice**
3. A **Preview dialog** appears: customer, property/tower/flat, milestone name, phase, due date, amount
4. Click **Create Invoice** to confirm — the draft opens automatically

### Step 2 — Review & Edit the Draft
- The notice is pre-filled with customer details, unit details, amount, and due date
- Click **Edit Draft** to make changes
  - Click **directly into the notice text** to edit any wording (WYSIWYG — no coding)
  - Use the Title, Amount, Due Date fields at the top to update the key values
- Click **Save Changes** when done

### Step 3 — Download as PDF Invoice
- Click the red **Download PDF Invoice** button (available at any draft status)
- A dialog opens — fill in / verify:
  - **Invoice Number** — enter your own format (e.g. `EE/25-26/0001`)
  - **GSTIN** — auto-filled from the project's Property settings
  - **GST Rate** — default 18% (split as 9% CGST + 9% SGST)
  - **Bank Details** — auto-filled from the project's Property settings
  - **Customer Address / PAN / Phone** — pre-filled from the customer record, editable
- Click **Generate & Download PDF** → a formatted A4 invoice PDF is saved

### Step 4 — Approve the Draft
- Click **Approve Draft**
- Status: **DRAFT → READY** (locked from further editing)

### Step 5 — Send to Customer

**If SMTP is configured (automatic):**
1. Click **Send to Customer**
2. The email is sent automatically to the customer's email address
3. Status: **READY → SENT**

**If SMTP is NOT configured (manual):**
1. Click **Send to Customer** — a dialog appears
2. Click **Download Notice** → HTML file saves to your computer
3. Open in Chrome/Edge → press `Ctrl+P` → **Save as PDF**
4. Attach the PDF to your email / WhatsApp and send manually
5. Come back → click **Mark as Sent**
6. Status: **READY → SENT**

> 💡 To set up automatic email, go to **Settings → Company & Bank → SMTP Configuration**.  
> Then use the **Send Test Email** button to verify it works before sending real drafts.

### Demand Draft Statuses

| Status | Meaning |
|--------|---------|
| **DRAFT** | Created, being edited — can be deleted |
| **READY** | Approved, ready to send — locked from editing |
| **SENT** | Shared with customer — milestone shows green SENT badge |

### Where to find all Demand Drafts
- Go to **Payments & Plans → Demand Drafts**
- Lists every draft across all bookings — search by flat, customer, or status
- 🗑 Delete button only appears on **DRAFT** status (once approved, it cannot be deleted)

---

## 7. Receiving a Payment & Money Receipt

```
Sidebar: Payments & Plans → Payments
```

### Recording a Payment
1. Go to **Payments** → **+ New Payment**
2. Select the **Booking** and **Customer**
3. Enter: Amount, Payment Date, Method (Cash / NEFT / Cheque / UPI / Card)
4. For cheque: enter cheque number, bank, branch, date
5. For NEFT/IMPS: enter UTR number
6. Click **Submit** — a **Review Screen** appears showing the full payment summary
7. Click **← Edit Details** to go back, or **Confirm & Save Payment** to record it

> The payment plan balance updates automatically once the payment is saved.

### Generating a Money Receipt PDF
1. Open a **Payment** from the Payments list
2. Click the green **Generate Receipt** button (top-right)
3. In the dialog:
   - **Receipt Number** — auto-filled from the stored receipt number, or type one (e.g. `EE/REC/25-26/0001`)
   - **Narration** — optional free text (e.g. "Payment received against On-Possession demand")
4. Click **Download Receipt PDF**
5. A formatted PDF downloads with:
   - Eastern Estate letterhead
   - Customer details + Unit details (Property → Tower → Flat)
   - Payment mode block (method, bank, cheque/UTR details)
   - Amount table + Amount in words (Indian format)
   - Authorised Signatory line

---

## 8. Unit-wise Ledger

The **Unit-wise Ledger** is a per-flat account statement showing every demand raised and every payment received, in date order, with a running outstanding balance.

### How to open
- From **Booking detail page** → Quick Actions → **View Ledger**
- From **Payment Plan page** → header area → **View Ledger**

### What you see

| Column | Meaning |
|--------|---------|
| **Date** | Due date of demand OR payment date of receipt |
| **Description** | Milestone name (demand) or "Payment received — method" |
| **Demanded ₹** | Amount in a demand notice (amber) |
| **Paid ₹** | Amount received (green) |
| **Balance ₹** | Running outstanding after each row |
| **Status** | PENDING / TRIGGERED / OVERDUE / PAID |
| **Link** | Direct link to the demand draft or payment detail |

### Summary cards
- **Agreement Value** — total booking amount
- **Total Demanded** — all demand notices raised so far
- **Total Paid** — all payments recorded
- **Outstanding Balance** — what is still owed

### Share with Customer panel
Below the summary cards is a **Share with Customer** panel:
- Copy customer's phone or email to clipboard (one click)
- **WhatsApp** button — opens WhatsApp with a pre-written message containing the outstanding balance
- **Download PDF** — exports the full ledger as a branded A4 statement

### Alerts
- 🔴 Red alert banner if any milestones are **overdue**
- 🔵 Blue notice showing how many milestones are still upcoming

---

## 9. Document Management

Documents can be uploaded and managed at **every level** of the system.

### Where to upload documents

| Module | What to upload |
|--------|----------------|
| **Customer profile** | Aadhar, PAN, passport photo, bank statement |
| **Booking detail** | Agreement copy, allotment letter, KYC docs |
| **Payment detail** | Payment proof (cheque scan, bank screenshot, UPI receipt) |
| **Property** | RERA certificate, project brochure, layout plan |
| **Tower** | Tower-specific approvals, NOC |
| **Flat detail** | Sale Agreement, Allotment Letter, Possession Letter, Payment Plan, NOC, RERA Certificate, Snag List, Handover Checklist |
| **Employee profile** | Offer letter, ID proof, qualification certificates |

### Flat-level Documents & Compliance
The **Flat detail page** has a dedicated **Documents & Compliance** section with named slots:
- Click **Upload** next to each document type to attach the file
- Uploaded documents show a ✅ badge with the file name
- The **KYC count** badge (e.g. `KYC: 2/4`) updates automatically as documents are added

### Document cross-linking
- Documents uploaded in a **Booking** automatically appear on the **Customer profile** under the booking's documents — they are cross-linked, not duplicated
- Documents uploaded in a **Payment** appear on both the payment detail and the booking's payment list

---

## 10. Reports

```
Sidebar: Reports
```

Three report types are available, each with PDF and Excel export.

### Outstanding Report
**Reports → Outstanding**
- Shows every active booking with: total agreement value, amount demanded, amount paid, outstanding balance, overdue milestones, and oldest overdue age
- Filter by: Property, Tower, Status
- Summary row at top: total units, total portfolio value, total outstanding
- 🔴 Overdue rows are highlighted in red

### Collection Report
**Reports → Collection**
- Shows all payments received with: customer, unit, amount, date, method, receipt number
- Filter by: Property, Tower, Date Range, Payment Method
- Summary row: total payments, total amount, breakdown by method

### Stock Inventory Report
**Reports → Inventory**
- Shows every flat with its current status (Available / Booked / Sold / On Hold)
- Filter by: Property, Tower, Status, Flat Type
- Summary: total units, available count, booked value, available %
- Click any row → opens the flat's detail page

### Exporting Reports
- **Download PDF** — formatted A4 report with Eastern Estate header
- **Download Excel** — full data table in `.xlsx` format, ready for further analysis

---

## 11. Construction Progress Tracking

```
Sidebar: Construction → Milestones / Projects / Progress Log
```

### Logging Construction Progress
1. Go to **Construction → Progress Log**
2. Select the Tower and Phase (Foundation, Plinth, Structure, etc.)
3. Enter the % complete for that phase
4. Save

### Milestone auto-trigger
When a construction phase crosses the % threshold linked to a CLP milestone:
1. The system **flags** that milestone as triggered
2. The **Construction Milestones** page shows it with a **Generate Draft** button
3. Click **Generate Draft** → a demand draft is created automatically and opened for review
4. From there, follow the Demand Draft flow (Section 6) to approve and send

### Manual Draft from Milestones page
1. Go to **Construction → Milestones**
2. Find the tower/milestone row
3. Click **Generate Draft** — preview dialog shows the customer, unit, and amount
4. Confirm → draft is created and linked to the payment plan milestone

---

## 12. HR — Managing Employees

```
Sidebar: HR → Employees
```

### Adding a New Employee
1. Go to **HR → Employees** → **+ New Employee**
2. Fill all tabs:
   - **Personal** — Name, DOB, Gender, Phone, Address, Emergency Contact
   - **Employment** — Department, Designation, Join Date, Employment Type
   - **Salary** — Basic, HRA, TA, DA, Other Allowances, PF, ESI, TDS (gross and net auto-calculate)
   - **Bank** — Bank Name, Account Number, IFSC, UAN, PF/ESI numbers
   - **Leave** — CL, SL, and EL balances (enter the actual entitlement — no hardcoded defaults)
3. Upload documents from the **Documents** section: offer letter, ID proof, etc.
4. Save — all fields persist correctly

### Viewing an Employee Profile
The employee detail page shows all data across every section:

| Section | What's shown |
|---------|-------------|
| **Personal** | Name, DOB, Gender, Phone, Address, Emergency Contact |
| **Employment** | Department, Designation, Join Date, Type, Status, Manager |
| **Salary** | Basic, HRA, TA, DA, Allowances, PF, ESI, TDS, Gross, Net |
| **Bank** | Bank Name, Account Number, IFSC, UAN, PF/ESI numbers |
| **Leave Balances** | CL, SL, EL remaining — sourced live from the database |
| **Attendance Summary** | Days Present, Days Absent, Late Arrivals |
| **Feedback & Performance** | Skills, Qualifications, Experience, Performance Rating, Last Review Date, Notes |
| **Documents** | Offer letter, ID proof, qualification certificates |

### Editing an Employee
1. Open the employee profile → click **Edit**
2. Change any field across any tab
3. Save — all fields update (including salary, bank details, and leave balances)

> ℹ️ Net salary auto-calculates from Basic + HRA + Allowances − Deductions. To override, type directly in the Net Salary field.

> ℹ️ Leave balances (CL / SL / EL) are set when creating the employee and can be updated via Edit at any time. They reflect whatever value is entered — there are no hardcoded defaults.

---

## 13. Dashboard

```
Sidebar: Dashboard (home page after login)
```

The dashboard shows **live data** from the database — nothing is hardcoded.

### What you see

| Section | Data shown |
|---------|-----------|
| **Financial Overview** | Total agreement value, total collected all-time, outstanding balance, this month's collection |
| **Inventory Overview** | Total / available / booked / sold / on-hold unit counts with % available |
| **CRM at a Glance** | Customer count, active bookings, active leads, overdue unit count |
| **Unit Status Donut** | Visual breakdown of unit statuses |
| **Recent Payments** | Last 5 payments with customer, unit, amount, date, method — click to open |
| **Overdue Milestones** | Top 5 most overdue units — click row to open that unit's ledger |
| **Quick Actions** | One-click buttons: New Booking, New Customer, New Lead, New Payment, Add Property |

> 🔄 Click the refresh icon (top-right of dashboard header) to reload all data without refreshing the page.

---

## 14. Settings — Company, Users & Profile

```
Sidebar: Settings
```

### Company & Bank Settings (`/settings/company`)
Accessible by **Admin and Super Admin only**.

| Section | What to fill |
|---------|-------------|
| **Company Information** | Company name, address, phone, email, website — shown in all letterheads |
| **Tax & Legal (Fallback)** | GSTIN, RERA number — used only if a project has no project-specific values |
| **Bank Details (Fallback)** | Bank name, account, IFSC, UPI — used only if a project has no project-specific bank |
| **SMTP Email** | SMTP host, port, username, app password — enables automatic email sending |
| **Test SMTP** | Enter a recipient email → click **Send Test Email** → see result inline |

> ⚠️ **Important:** Each project (Property) should have its own GSTIN and bank details set on the Property page. The Company Settings values here are only used as a fallback when a project hasn't set its own.

#### SMTP Quick Setup (Gmail)
1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Create an App Password for "Eastern Estate ERP" → copy the 16-character code
4. In Company Settings: Host = `smtp.gmail.com`, Port = `587`, User = your Gmail, Password = the App Password
5. Click **Save**, then test with **Send Test Email**

### User Management (`/settings/users`)
Accessible by **Admin and Super Admin only**.

- View all staff accounts with their roles and active/inactive status
- **+ New User** — create a new staff account (name, email, username, password, role)
- **Edit** — change name, phone, role assignments
- **Property Access** — assign which **projects (properties)** a user may see (required for scoped roles such as **Accountant**)
- **Reset Password** — set a new password for any user
- **Activate / Deactivate** — toggle access without deleting the account
- **Delete** — permanently removes the account

### Profile & Password (`/settings`)
Every user can:
- Update their **First Name, Last Name, Phone** (click Save Profile)
- Change their **Password** (Change Password section — requires new password + confirmation, minimum 8 characters)

> Email and username can only be changed by an Admin.

---

## 15. Notifications

The bell icon (🔔) at the top right shows system notifications.

| Notification | Triggered when |
|---|---|
| New Demand Draft Created | A demand draft is generated (manual or auto) |
| Demand Draft Approved | Status changes to READY |
| Demand Draft Sent | Status changes to SENT |
| New Booking Created | A booking is confirmed |
| Payment Received | A new payment is saved |

> Notifications show the staff member's full name. If you see "undefined", log out and log back in to refresh your session.

---

## 16. Project Scope & Accounting

```
Top bar: Project dropdown (next to menu on mobile, beside brand area on desktop)
```

- **One global project selector** in the dashboard header applies across modules that respect project scope (including **Accounting**).
- **Super Admin, Admin, Head Accountant** can choose **All projects** or a single project. Consolidated views use **All projects**; single-project shows only that project’s books.
- **Other roles** see only projects they are assigned to; if there is only one assignment, it may be selected automatically.
- **Accounting data is stored per project** where applicable: chart of accounts, bank accounts, journal entries, budgets, and many expenses are tied to a **property (project)**. Vendor payments and salary payments can also carry a **project** for reporting and fund-flow.
- When creating or editing **accounts**, **expenses**, **bank accounts**, or similar, pick the correct **project** so reports and ledgers stay accurate.

---

## 17. Role Management (Custom Roles & Permissions)

```
Sidebar: Settings → Roles (where enabled for your admin user)
```

- Admins can **create and edit roles** and assign **permissions** in grouped modules (search, expand a module, use **All / None** for quick setup).
- Use **lowercase_with_underscores** for role names (e.g. `site_engineer`).  
- System roles (e.g. Super Admin, Admin) should not be deleted casually; custom roles are for specialised access.

---

## 18. Production Deployments & Database Migrations

After **`git pull`** on the production server, apply any new SQL migrations **before** or **together with** restarting containers.

### Recommended sequence

1. **Pull** the latest code: `git pull` (from your project directory, e.g. `/opt/eastern-estate-erp` or `~/eastern-estate-erp`).
2. **Run migrations** (idempotent scripts — safe to re-run where noted):
   ```bash
   bash backend/src/database/migrations/run-prod-migrations.sh
   ```
   This script runs the full ordered set, including recent steps such as:
   - **`v014_project_level_accounting.sql`** — adds `property_id` to accounting-related tables (accounts, bank accounts, journal entries, budgets, vendor payments, salary payments) and adjusts uniqueness of account codes **per project**.
   - **`v015_accountant_roles.sql`** — ensures **`accountant`** and **`head_accountant`** roles exist in the database.
3. **Rebuild / restart** application containers (per your hosting setup), for example:
   ```bash
   docker compose -f docker-compose.prod.yml build backend frontend
   docker compose -f docker-compose.prod.yml up -d
   ```
   (Adjust compose file path and service names to match your server.)

4. **Frontend ↔ API in Docker:** Production Compose sets **`INTERNAL_API_URL=http://backend:3001/api/v1`** so Next.js can call the Nest API during server rendering. Without it, logs may show `ECONNRESET` or `failed to get redirect response` for `/` because relative `/api/v1` would hit the frontend container, not the backend.

5. **Health checks:** Backend may stay **starting** for several minutes while schema sync runs — that is normal. Verify from the host with:
   ```bash
   docker exec eastern-estate-backend node -e "require('http').get('http://127.0.0.1:3001/api/v1/health',(r)=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log(r.statusCode,d);process.exit(r.statusCode===200?0:1)})})"
   docker exec eastern-estate-frontend node -e "require('http').get('http://127.0.0.1:3000',(r)=>process.exit(r.statusCode===200?0:1))"
   ```
   Do **not** rely on `curl http://127.0.0.1:3001` from the host unless that port is published in Compose (default prod file keeps API on the internal network only).

> ⚠️ Always take a **database backup** before running migrations on production.

> 🛡️ **Security:** If you ever see random lines in logs mentioning `chattr`, `powershell.exe`, foreign paths under `/usr/bin`, or `sysctl` / `hugepages` failures mixed with app output, treat the **server as potentially compromised** — rotate credentials, scan for malware, patch SSH, and review `crontab` / Docker images. That output is **not** from the ERP application code.

### Brand copy in emails / PDFs

Customer-facing lines such as demand drafts and booking emails use the tagline **“Life Long Bonding…”** (updated from the older wording). Company name and SMTP behaviour are unchanged.

---

## 19. Common Questions & Gotchas

**Q: I can't see a module in the sidebar.**  
A: Your role may not have access. Ask a Super Admin to check under **Settings → Users → [your user] → Roles**.

---

**Q: The Demand Draft shows "No content available".**  
A: This is an old draft created before the content generator was added. Delete it (🗑 button, DRAFT status only) and regenerate from the Payment Plan page.

---

**Q: Bank details / GSTIN still show placeholders in the demand draft.**  
A: Open the **Property** for that project → fill in the **Legal & Tax** and **Project Bank Account** sections → Save. Then re-generate the demand draft — it will pick up the new values.

---

**Q: The SMTP test says "Authentication failed".**  
A: For Gmail — make sure **2-Step Verification** is turned on, then generate an **App Password** (not your normal Gmail password). See Settings → Help & Guides → SMTP Email Setup for step-by-step instructions.

---

**Q: I approved a draft but the email didn't send.**  
A: SMTP may not be configured yet. Go to **Settings → Company & Bank → SMTP Configuration**, fill in the details, click Save, then use the **Send Test Email** button to verify. Once SMTP is working, clicking "Send to Customer" will auto-email the customer.

---

**Q: I changed salary fields but the net salary didn't update.**  
A: Net salary auto-calculates. If you want to override it, type directly into the Net Salary field — your value takes precedence.

---

**Q: A customer's documents uploaded in Booking don't show on their Customer profile.**  
A: They do — the Customer profile shows all documents linked to that customer, including those uploaded under their bookings. Make sure you are viewing the correct customer (same Customer ID).

---

**Q: Can two customers have different payment schedules for the same project?**  
A: Yes. Every booking has its own independent Payment Plan with fully custom milestones. This is the dynamic CLP — every customer can have completely different amounts, dates, and phases.

---

**Q: Where do I see which payment plan belongs to which booking?**  
A: Open the **Booking** detail → Quick Actions → **View Payment Plan**.  
Or from a **Payment Plan**, the booking number and customer name appear in the header.

---

**Q: How do I find all overdue customers quickly?**  
A: Two ways:  
1. **Dashboard** → scroll to the "Overdue Milestones" table — click any row to open that unit's ledger  
2. **Reports → Outstanding** → filter / sort by the "Overdue Milestones" column

---

**Q: The page shows a grey skeleton/shimmer instead of data — is something broken?**  
A: No — that is the skeleton loader. Every page shows an animated preview of its layout while data loads from the server. It disappears automatically once the data arrives. If it stays indefinitely, check your network connection or the backend logs.

---

**Q: Leave balances (CL / SL / EL) on an employee profile show 0.**  
A: Leave balances must be entered when creating the employee (or updated via Edit). There are no automatic defaults — the value shown is exactly what was saved. Ask HR to open the employee → Edit → Leave tab and enter the correct balances.

---

**Q: Where are uploaded documents and profile pictures stored? Will they survive a server rebuild?**  
A: All new uploads go to **MinIO** — an S3-compatible object store running as a Docker container with a persistent `minio_data` volume. Even if the server OS is wiped and the containers are recreated, the files survive as long as the volume is preserved (or backed up). Files are served at `https://<domain>/files/<uuid.ext>` via Caddy. Older uploads (pre-MinIO) continue to work at `/uploads/<uuid.ext>` from the backend's Docker volume.

---

**Q: How do I access the MinIO Admin Console to browse stored files?**  
A: The console runs on port `9001` but is bound to `127.0.0.1` (not exposed to the internet). To access it:  
1. Open a terminal on your **Mac** and run: `ssh -L 9001:localhost:9001 root@<server-ip>`  
2. Keep that terminal open (it tunnels the port to your machine)  
3. Open `http://localhost:9001` in your browser  
4. Log in with `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` from the server's `.env` file  
The `eastern-estate` bucket holds all uploaded files.

---

**Q: A file uploaded before the MinIO migration is missing — it shows a broken image or 404.**  
A: Pre-migration files are stored in the backend container's `backend_uploads` Docker volume and served at `/uploads/<key>`. If a file is missing, either the volume was lost or the migration script updated that row to `/files/` but the file wasn't copied. Re-run the migration: `docker exec -it eastern-estate-backend node scripts/migrate-uploads-to-minio.js` — it skips already-migrated files.

---

**Q: How do I run the MinIO migration script on the production server?**  
A:
```bash
# 1. Make sure you're in the project directory on the server
cd ~/eastern-estate-erp && git pull

# 2. Copy the JS script into the running backend container
docker cp backend/scripts/migrate-uploads-to-minio.js eastern-estate-backend:/app/scripts/

# 3. Run it (plain node — no ts-node needed)
docker exec -it eastern-estate-backend node scripts/migrate-uploads-to-minio.js
```
The script is idempotent — safe to re-run; it skips any file already pointing to `/files/`.

---

*End of guide. Please update this document whenever a new flow is added or an existing one changes.*
