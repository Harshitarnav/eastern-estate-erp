# Eastern Estate ERP — Team Onboarding Presentation
> Paste this into Gamma (gamma.app) or Claude to generate a visual presentation deck.  
> Each `---` is a slide break. Each `##` is a slide title.

---

## Eastern Estate ERP
### Your all-in-one system for sales, payments, construction, and documents

**Built for Eastern Estate Construction & Development Pvt. Ltd.**

> *"Life Long Bonding… — Creating a Lifestyle That Lasts a Lifetime"*

- One system for every department — Sales, Accounts, HR, Construction
- All data is live and connected — no Excel, no WhatsApp data loss
- Works in your browser — no installation needed
- Role-based access — each person sees only what they need

---

## What Each Role Can Do

| Role | Key Access |
|------|-----------|
| 🔴 **Super Admin** | Everything — full control |
| 🔴 **Admin** | Everything + Company Settings + User Management |
| 🟤 **Head Accountant** | All projects — full accounting, reports, payroll visibility |
| 🟠 **Accountant** | Accounting for **assigned projects only** (set under User → Property Access) |
| 🟠 **Sales Team** | Leads, Customers, Bookings, Payment Plans, Demand Drafts |
| 🟡 **Accounts** | Payments, Receipts, Reports, Ledger (as configured) |
| 🟢 **HR** | Employees, HR Dashboard |
| 🔵 **Staff** | Dashboard + read-only |

> ℹ️ If you can't see a page, ask your Admin to check your role under **Settings → Users**  
> ℹ️ **Accountants** also need **Property Access** so the system knows which projects they work on

---

## Pick your project (top bar)

**Every screen shares one project dropdown** in the header (next to notifications).

- Choose **All projects** or one project — accounting numbers and some lists follow this scope.
- If you only have one assigned project, it may already be selected for you.
- **Mobile:** same dropdown as desktop — use it before opening Accounting or customer lists that filter by project.

---

## The Dashboard — Your Morning Briefing

**Go to: Dashboard (first screen after login)**

- Shows **live numbers** — nothing is hardcoded or fake
- Refreshes every time you open it (or click the 🔄 refresh button)

**What you see:**
- 💰 Total collected vs outstanding balance
- 🏢 Available, booked, sold, on-hold unit counts
- 📋 This month's payments received
- ⚠️ Overdue units — who hasn't paid on time
- 🕐 Last 5 payments — click any to open

> **Tip:** If you see a red "Overdue Milestones" table at the bottom, those customers need a follow-up call today. Click any row to go directly to their ledger.

---

## Before the First Sale — Admin Setup

**Go to: Settings → Company & Bank**

Four things to do once before the team starts:

1. **Fill in company details** — name, address, phone, email
2. **Fill in SMTP email** — so demand drafts get emailed automatically
3. **Open each Property** → fill in its own GSTIN + bank account details
4. **Create user accounts** for every staff member (Settings → Users)

> ⚠️ GSTIN and bank details must be set on each **Property page** — not just in Company Settings. Each project has its own GSTIN and bank account.

---

## The Project Hierarchy

**Everything in the system is structured as:**

```
Property  (e.g. Diamond City)
  └── Tower  (e.g. Tower A)
        └── Flat  (e.g. A-101)
```

**A flat must exist before you can book it.**

### To set up a new project:
1. **Properties** → + New Property → fill name, location, GSTIN, bank details
2. **Towers** → + New Tower → select the property
3. **Flats** → + New Flat → select the tower, enter flat number, floor, type, price

> 💡 Click the 👁 eye icon on any Property in the list to view all its details, linked towers, and documents.

---

## Step 1 — Capture a Lead

**Go to: Leads → + New Lead**

When someone enquires — walk-in, call, or website — create a Lead immediately.

**Fill in:**
- Name, Phone, Email
- Source (Walk-in / Website / Referral / etc.)
- Interested property and budget
- Notes from the conversation

**Follow-up workflow:**
- Set a follow-up date → the system reminds you
- Update the status after each call (New → Contacted → Site Visit → Negotiation → Booked)
- When the customer is ready → convert to Customer

> ❌ Don't skip lead creation — it's how management tracks where every sale came from.

---

## Step 2 — Create a Customer

**Go to: Customers → + New Customer**

Fill in all tabs before creating the booking:

| Tab | What to fill |
|-----|-------------|
| Personal | Full name, phone, email, date of birth |
| KYC | PAN number, Aadhar number |
| Address | Permanent + correspondence address |
| Bank | Customer's bank details (for refunds if needed) |

- Upload **Aadhar copy** and **PAN card** directly from the customer's profile page
- The customer gets a unique **Customer ID** — use this for all future references

> 💡 A customer can have **multiple bookings** — one profile, many units.

---

## Step 3 — Create a Booking

**Go to: Bookings → + New Booking**

Select: **Customer → Property → Tower → Flat**

**Fill in financial details:**
- Agreement Value (total sale price)
- Token Amount (paid at time of booking)
- Discount (if any)
- GST, Stamp Duty, Registration Charges
- Booking Date and Agreement Date

**Before confirming — the Review Screen appears:**
- Shows every field you filled in on one screen
- Check everything carefully
- Click **← Edit Details** to go back (values are preserved)
- Click **Confirm & Create Booking** when satisfied

> ✅ After creating a booking, click **Download Summary** to get a branded PDF you can give to the customer.

---

## Step 4 — Set Up the Payment Plan (CLP)

**Go to: Booking → Quick Actions → Create Payment Plan**

Every customer can have a **different payment schedule** (Dynamic CLP).

**Add milestones:**
- On Booking — ₹ X lakh — Due: today
- On Foundation — ₹ X lakh — Due: 3 months
- On Plinth — ₹ X lakh — linked to Foundation phase
- On Possession — ₹ X lakh — Due: project completion

**Rules:**
- Total of all milestones must equal the agreement value
- Construction-linked milestones can be tied to a building phase (auto-triggers demand when phase is complete)
- You can add or edit milestones at any time

> 💡 Once a milestone has a demand draft generated, a coloured badge appears on that row: **DRAFT / READY / SENT**

---

## Step 5 — Raise a Demand Draft

**Go to: Payment Plans → open the booking's plan**

When a milestone is due, raise a Demand Notice to the customer.

### How to generate:
1. Find the milestone row → click **Gen. Invoice**
2. A preview appears — check: customer name, unit, amount, due date
3. Click **Create Invoice** → draft opens automatically

### Three places you can generate a draft from:
- **Payment Plan page** (most common — manual trigger)
- **Construction Milestones page** (when a build phase completes)
- **Automatically** (system creates it when construction crosses a threshold)

> ℹ️ All three methods produce the same format — consistent, branded demand notice.

---

## Step 5b — Edit & Approve the Demand Draft

**The draft opens automatically after creation**

- Click **Edit Draft** to make changes
- **Click directly into the notice text** to edit wording — no coding needed (WYSIWYG)
- Update Title, Amount, Due Date using the fields at the top

### Download as a formal PDF Invoice:
- Click **Download PDF Invoice** (red button)
- Fill in Invoice Number (e.g. `EE/25-26/0001`)
- GSTIN and bank details are auto-filled from the project settings
- Click **Generate & Download PDF**

### Approve the draft:
- Click **Approve Draft** → status becomes **READY** (locked from editing)

---

## Step 5c — Send Demand Draft to Customer

**If SMTP email is configured (automatic):**
1. Click **Send to Customer**
2. Email is sent automatically to the customer's email address
3. Status changes to **SENT** ✅

**If email is not set up yet (manual):**
1. Click **Send to Customer** → dialog appears
2. Click **Download Notice** → HTML file downloads
3. Open in Chrome → press `Ctrl+P` → **Save as PDF**
4. Attach to email / WhatsApp → send to customer manually
5. Come back → click **Mark as Sent**

> 📧 To enable automatic email: Settings → Company & Bank → SMTP Configuration → fill in Gmail App Password → Save → Test with "Send Test Email" button

---

## Step 6 — Record a Payment

**Go to: Payments → + New Payment**

When the customer pays against a demand:

**Fill in:**
- Booking + Customer (select from dropdowns)
- Amount received
- Payment Date
- Method: Cash / Cheque / NEFT / UPI / Card

**For Cheque:** enter cheque number, bank, branch, date  
**For NEFT/IMPS/UPI:** enter UTR number or transaction ID

**Review Screen appears** — check all details, then **Confirm & Save Payment**

> The payment plan balance updates automatically. The milestone status changes to PAID.

---

## Step 6b — Generate a Money Receipt

**Go to: Payments → open any payment → click Generate Receipt**

Produces a formal receipt to give to the customer.

**The receipt includes:**
- Eastern Estate letterhead
- Customer name + unit (Property → Tower → Flat)
- Payment mode details (method, bank, cheque number / UTR)
- Amount table
- Amount in words (Indian format — e.g. *Rupees Five Lakhs Only*)
- Authorised Signatory space

**Receipt number:**
- Auto-filled if already stored in the system
- Or type your own format (e.g. `EE/REC/25-26/0001`)

> Print this and hand it to the customer as their payment proof.

---

## The Unit-wise Ledger

**Go to: Booking → Quick Actions → View Ledger**

A complete account statement for one unit — every demand raised and every payment received.

**Reading the ledger table:**

| Date | Description | Demanded | Paid | Balance |
|------|-------------|----------|------|---------|
| 01 Jan | On Booking | ₹5L | — | ₹5L |
| 15 Jan | — | — | ₹5L | ₹0 |
| 01 Mar | On Foundation | ₹10L | — | ₹10L |

**Summary cards at the top:**
- Agreement Value / Total Demanded / Total Paid / **Outstanding Balance**

**Share with Customer panel:**
- Copy phone or email to clipboard
- WhatsApp button — sends the outstanding balance in a pre-written message
- Download PDF — exports full statement as a printable document

---

## Document Management

Documents can be stored at every level:

| Where | What to upload |
|-------|---------------|
| 👤 Customer | Aadhar, PAN, photo, bank statement |
| 📋 Booking | Agreement copy, allotment letter |
| 💳 Payment | Cheque scan, bank screenshot, UPI receipt |
| 🏢 Property | RERA certificate, layout plan, brochure |
| 🏗️ Tower | Tower approvals, NOC |
| 🏠 Flat | Sale Agreement, Possession Letter, Snag List, Handover Checklist |
| 👔 Employee | Offer letter, ID proof, certificates |

**Flat — Documents & Compliance section:**
- Named slots for each document type
- Click **Upload** next to the document name
- KYC badge updates automatically (e.g. `KYC: 2/4`)

> 📎 Documents uploaded in a Booking automatically appear on the Customer profile — they are cross-linked.

---

## Reports

**Go to: Reports (sidebar)**

Three reports, all exportable as **PDF or Excel**:

### 📊 Outstanding Report
- Every active booking with: demanded, paid, outstanding, overdue age
- Filter by Property / Tower / Status
- Red highlights on overdue rows
- *Use this every Monday morning to identify who needs a follow-up*

### 📊 Collection Report
- All payments received with customer, unit, method, receipt
- Filter by date range, property, payment method
- *Use this to prepare the monthly revenue summary for management*

### 📊 Stock Inventory Report
- Every flat with current status (Available / Booked / Sold / On Hold)
- Click any row to open the flat's detail page
- *Use this when a customer asks "what's still available in Tower B?"*

---

## Construction Progress Tracking

**Go to: Construction → Progress Log / Milestones**

### Logging progress (Site Engineer):
1. Construction → Progress Log
2. Select Tower and Phase
3. Enter % complete → Save

### How it connects to payments:
- When a phase crosses the % threshold linked to a milestone → system **auto-flags** it
- **Construction → Milestones** page shows a **Generate Draft** button
- Click it → demand draft created automatically for all customers in that tower
- Sales team reviews and sends

> 🔗 This is the link between construction and finance — no manual coordination needed between site and accounts.

---

## HR — Managing Employees

**Go to: HR → Employees**

### Adding an employee:
Fill all tabs:
- **Personal** — Name, DOB, phone, address, emergency contact
- **Employment** — Department, designation, join date, type (permanent / contract)
- **Salary** — Basic, HRA, TA, DA, allowances, PF, ESI, TDS (net auto-calculates)
- **Bank** — Account number, IFSC, UAN, PF number
- **Leave** — Leave balances per type

### Documents:
- Upload offer letter, ID proof, qualification certificates directly from the employee profile

### Key rules:
- All fields save correctly — including salary components, bank details, leave balances
- Net salary auto-calculates from components; type a custom value to override
- Designations, departments are searchable from existing records

---

## Settings — What Admins Need to Know

### Settings → Company & Bank
- Company details → appear on all letterheads
- GSTIN + bank → **fallback only** — set these on each Property page for accuracy
- SMTP → enables auto-email for demand drafts
- **Send Test Email** button → verify SMTP is working before relying on it

### Settings → Users
- Create / edit / deactivate staff accounts
- Assign roles (Sales, Accounts, HR, Admin, etc.)
- Reset passwords for any user
- Toggle active/inactive without deleting

### Settings → Profile (every user)
- Update your name and phone
- Change your password (min. 8 characters)

### Settings → Help & Guides
- Step-by-step role guides (CEO, Sales, Accounts, Engineer, etc.)
- **SMTP Email Setup Guide** — how to get Gmail App Password
- Troubleshooting common errors

---

## Daily Workflow by Role

### 🎯 Sales Executive — every morning
1. Dashboard → check overdue units → call those customers
2. Leads → filter by today's follow-up date → make calls → update status
3. New enquiry → Leads → + New Lead
4. Booking confirmed → Bookings → + New Booking → create Payment Plan

### 💰 Accounts — every morning
1. Dashboard → check this month's collection
2. Payment received → Payments → + New Payment → Generate Receipt
3. Milestone due → Payment Plan → Gen. Invoice → Approve → Send
4. Monday → Reports → Outstanding → export for management

### 🏗️ Site Engineer — when work is done
1. Construction → Progress Log → update % complete for completed phase
2. Check Construction → Milestones → click Generate Draft if triggered
3. Inform accounts that drafts are ready to review

### 👨‍💼 Management — weekly
1. Dashboard → review all KPIs
2. Reports → Outstanding → who owes what
3. Reports → Collection → this month's inflow
4. Reports → Inventory → units left to sell

---

## Tips & Common Mistakes to Avoid

| ❌ Don't do this | ✅ Do this instead |
|-----------------|-------------------|
| Skip creating a Lead | Always log enquiries in Leads — management tracks conversion |
| Create a booking without a payment plan | Always create the Payment Plan immediately after booking |
| Send a demand draft without reviewing it | Always click Edit Draft + review the content first |
| Upload bank payment proof later "by memory" | Upload the screenshot immediately when recording the payment |
| Set GSTIN only in Company Settings | Set GSTIN on each **Property page** for the correct project |
| Use a regular Gmail password for SMTP | Generate an **App Password** from Google Account settings |
| Delete a demand draft that's been sent | Mark as SENT — never delete a sent notice |

---

## Getting Help

### If something looks wrong:
1. Read the **error message** — it tells you exactly which field to fix
2. Go to **Settings → Help & Guides** for step-by-step guides
3. Check **Common Questions & Gotchas** in the System Flow Guide

### If you can't see a page:
- Your role may not have access
- Ask your Admin: **Settings → Users → [your name] → check role**

### If an email didn't send:
- Go to **Settings → Company & Bank → Test SMTP** — check if it's configured
- Green result = SMTP is working, the email went through
- Red result = follow the error message to fix it

### Contact your Admin for:
- Password reset
- Role change
- New user account

---

## You're Ready to Start

**Remember the flow:**

```
Lead → Customer → Booking → Payment Plan → Demand Draft → Payment → Receipt → Ledger
```

Every step connects to the next. Nothing gets lost. Everything is tracked.

> **Eastern Estate ERP — Life Long Bonding…, Creating a Lifestyle That Lasts a Lifetime**
