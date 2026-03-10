# Eastern Estate ERP — System Flow Guide
> **Living document.** Update this file whenever the system flow changes.  
> Last updated: March 2026

---

## Table of Contents
1. [Who Uses What — Roles Overview](#1-who-uses-what--roles-overview)
2. [Setting Up a New Project (Admin Only)](#2-setting-up-a-new-project-admin-only)
3. [Sales Flow — From Enquiry to Booking](#3-sales-flow--from-enquiry-to-booking)
4. [Payment Plan Flow — CLP Setup](#4-payment-plan-flow--clp-setup)
5. [Demand Draft Flow — Raising a Payment Demand](#5-demand-draft-flow--raising-a-payment-demand)
6. [Receiving a Payment](#6-receiving-a-payment)
7. [Construction Progress Logging](#7-construction-progress-logging)
8. [HR — Managing Employees](#8-hr--managing-employees)
9. [Notifications](#9-notifications)
10. [Common Questions & Gotchas](#10-common-questions--gotchas)

---

## 1. Who Uses What — Roles Overview

| Role | What they can see / do |
|------|------------------------|
| **Super Admin** | Everything — full access to all modules |
| **Admin** | Everything except system-level user management |
| **Sales Team** | Customers, Bookings, Payment Plans, Demand Drafts |
| **Accounts** | Payments, Demand Drafts, Payment Plans |
| **HR** | Employees, HR Dashboard |
| **Staff** | Dashboard only (read-only) |

> 💡 If someone says "I can't see X in the sidebar", check their role under **Settings → Users**.

---

## 2. Setting Up a New Project (Admin Only)

Before any sale can happen, the project hierarchy must exist:  
**Property → Tower → Flat**

### Step-by-step

```
Sidebar: Property Inventory
```

#### 2a. Create a Property
1. Go to **Properties** → click **+ New Property**
2. Fill in: Project Name, Location, Total Area, RERA Number, etc.
3. Save.

#### 2b. Add a Tower
1. Go to **Towers** → click **+ New Tower**
2. Select the Property it belongs to, enter Tower Name, number of floors, etc.
3. Save.

#### 2c. Add Flats
1. Go to **Flats** → click **+ New Flat**
2. Select the Tower, enter Flat Number, Floor, Type (2BHK, 3BHK…), Area, Base Price.
3. Save.

> ⚠️ A flat must exist before you can create a Booking for it.  
> Repeat Step 2c for every unit in the tower.

---

## 3. Sales Flow — From Enquiry to Booking

```
Sidebar: Sales & CRM → Customers / Bookings
```

### Step 1 — Add the Customer
1. Go to **Customers** → **+ New Customer**
2. Fill in: Full Name, Phone, Email, PAN Number, Aadhar Number, Address.
3. Save. The customer gets a unique Customer ID.

### Step 2 — Create a Booking
1. Go to **Bookings** → **+ New Booking**
2. Select:
   - **Customer** (created in Step 1)
   - **Flat** (the unit being purchased)
3. Fill in financial details: Agreement Value, Booking Amount, Discount, etc.
4. Set the Booking Date and Agreement Date.
5. Save. The booking gets a **Booking Number** (e.g. `BK-0012`).

> After saving a booking you land on the **Booking Detail** page.  
> From the **Quick Actions** panel (right side), you can immediately jump to creating a Payment Plan.

---

## 4. Payment Plan Flow — CLP Setup

```
Sidebar: Payments & Plans → Payment Plans
```

Every customer can have a **different** payment schedule (dynamic CLP).

### Step 1 — Create a Payment Plan for the Booking
1. Open the **Booking** detail page.
2. In **Quick Actions** click **Create Payment Plan**.
   - This pre-fills the flat, customer and total amount automatically.
3. Choose or customise the milestones:
   - **Milestone name** — e.g. "On Booking", "On Foundation", "On Possession"
   - **Amount** — what is due at this stage
   - **Construction Phase** — link it to a phase like FOUNDATION, STRUCTURE, etc. (optional, for auto-triggering)
   - **Due Date** — when payment is expected
4. Make sure the total of all milestones equals the agreement value.
5. Click **Save Changes**.

### Step 2 — Edit Milestones Later
- Open the Payment Plan, click **Edit Milestones**.
- You can add rows, remove rows, or change amounts.
- The running total at the bottom shows if you are over/under the agreement value.
- Click **Save Changes** when done.

> 💡 Each milestone will later get a **Demand Draft** (invoice) generated against it.

---

## 5. Demand Draft Flow — Raising a Payment Demand

```
Sidebar: Payments & Plans → Demand Drafts
```

A Demand Draft is the official payment demand notice sent to the customer when a milestone is due.

### Step 1 — Generate a Demand Draft from a Milestone
1. Open the **Payment Plan** for the booking.
2. In the milestones table, find the milestone you want to raise a demand for.
3. Click **Gen. Invoice** on that row.
4. The system creates a demand draft and opens it automatically.

### Step 2 — Review the Draft
- The notice is pre-filled with customer name, unit details, amount, and due date.
- Click **Edit Draft** to make changes.
  - You can click **directly into the notice** to edit any text (no coding needed).
  - Use the Title, Amount, and Due Date fields at the top to update those values.
- Click **Save Changes** when done.

### Step 2b — Download as PDF Invoice
- Click the red **Download PDF Invoice** button (available at any status).
- A dialog opens with pre-filled fields from the system:
  - **Invoice Number** — enter your own format (e.g. `EE/25-26/0001`)
  - **GSTIN** — company's GST registration number
  - **GST Rate** — default 18% (split automatically as 9% CGST + 9% SGST)
  - **Customer Address / PAN / Phone** — pre-filled from the customer record, editable
  - **Flat Area & Type** — pre-filled from the flat record, editable
  - **Bank Details** — fill in once, stays until dialog is reopened
  - **TDS Note** — default note about 1% TDS, editable
- Click **Generate & Download PDF** → a properly formatted A4 PDF is saved to your computer.

### Step 3 — Approve the Draft
- Once the content looks correct, click **Approve Draft**.
- Status changes from **DRAFT** → **READY**.
- At this point the notice is locked from editing.

### Step 4 — Send to Customer
1. Click **Send to Customer**.
2. A dialog will appear — follow these steps:
   - Click **Download Notice** to save the notice as an HTML file.
   - Open the downloaded file in Chrome/Edge.
   - Press `Ctrl+P` (or `Cmd+P` on Mac) → choose **Save as PDF**.
   - Attach the PDF to your email / WhatsApp and send it to the customer.
3. Come back and click **Mark as Sent**.
4. Status changes from **READY** → **SENT**.

> 💡 Back on the Payment Plan page, the milestone row will now show a green **SENT** badge.

### Demand Draft Statuses

| Status | Meaning |
|--------|---------|
| **DRAFT** | Created, being edited |
| **READY** | Approved, ready to send |
| **SENT** | Shared with customer, marked sent in system |

### Where to find all Demand Drafts
- Go to **Payments & Plans → Demand Drafts**
- Lists every draft across all bookings
- Search by flat/tower name, customer name, or status
- 🗑 Delete button appears only on **DRAFT** status drafts

---

## 6. Receiving a Payment & Generating a Money Receipt

```
Sidebar: Payments & Plans → Payments
```

When a customer actually pays against a demand:

1. Go to **Payments** → **+ New Payment**
2. Select the **Booking** and the **Customer**.
3. Enter: Amount Received, Payment Date, Payment Method (Cash / NEFT / Cheque / UPI), Bank Name, Cheque No / UTR as applicable.
4. Save. The payment is recorded and a Receipt Number can be assigned.

> The payment plan balance updates automatically once the payment is linked to a milestone.

### Generating a Money Receipt PDF

1. From the **Payments** list, click on a payment to open its detail page.
2. Click the green **Generate Receipt** button in the top-right.
3. A dialog opens with:
   - **Receipt Number** — pre-filled from the stored receipt number if one exists, or you can type one (e.g. `EE/REC/25-26/0001`).
   - **Narration / Notes** — optional free text (e.g. "Payment received against On-Possession demand for Flat A-101").
4. Click **Download Receipt PDF**.
5. A formatted PDF is downloaded containing:
   - Eastern Estate header with logo
   - Customer details + Unit details (Property → Tower → Flat)
   - Payment mode block (method, bank, cheque/UTR details)
   - Amount table with total
   - Amount in words (Indian format)
   - Notes / Narration
   - Authorised Signatory footer

---

## 7. Construction Progress Logging

```
Sidebar: Construction → Progress Log
```

Used by the site team to record how much of each construction phase is complete.

1. Go to **Construction → Progress Log**.
2. Select the **Tower** and **Phase** (e.g. Foundation, Structure).
3. Enter the **percentage complete** for that phase.
4. Save.

> When a construction phase crosses the percentage linked to a CLP milestone, the system can automatically flag that milestone as triggered.  
> The sales team is notified and can then generate the Demand Draft (Step 5 above).

---

## 8. HR — Managing Employees

```
Sidebar: HR → Employees
```

### Adding a New Employee
1. Go to **HR → Employees** → **+ New Employee**
2. Fill all tabs:
   - **Personal** — Name, DOB, Phone, Address
   - **Employment** — Department, Designation, Join Date, Type
   - **Salary** — Basic, HRA, Allowances (gross & net calculated automatically)
   - **Bank** — Bank Name, Account Number, IFSC, PF/ESI/UAN numbers
   - **Leave** — Leave balances
   - **Emergency** — Emergency contact details
3. Save.

> ⚠️ All fields are saved — not just the "important" ones. If a field was not saving before, that bug has been fixed.

### Editing an Employee
1. Go to the employee's profile page.
2. Click **Edit**.
3. Change any field across any tab.
4. Save — all fields update correctly.

---

## 9. Notifications

The bell icon (🔔) at the top right shows system notifications:

| Notification | Triggered when |
|---|---|
| New Demand Draft Created | Sales team generates a demand draft |
| Demand Draft Approved | Admin approves a draft |
| Demand Draft Sent | Admin marks a draft as sent |

> Notifications show the **creator's full name** (not "undefined") as long as users are logged in with a valid session.

---

## 10. Common Questions & Gotchas

**Q: I can't see a module in the sidebar.**  
A: Your role may not have access. Ask a Super Admin to check your role under **Settings → Users → [your user] → Roles**.

---

**Q: The Demand Draft shows "No content available".**  
A: This means it was created before the content generator was added. Delete it (🗑 button, DRAFT status only) and regenerate from the Payment Plan page.

---

**Q: The title shows "Untitled Draft" in the Demand Drafts list.**  
A: Same reason — old draft before the title field was added. Delete and regenerate.

---

**Q: I approved a draft but the email didn't send automatically.**  
A: Correct — email sending is not yet automated. The current process is: Download → Print to PDF → Email manually → Mark as Sent in system.  
Automated email will be added in a future update.

---

**Q: I changed the salary fields but the net salary didn't update.**  
A: Net salary auto-calculates from Basic + HRA + Allowances − Deductions. If you want a custom net salary, enter it directly in the Net Salary field — it will override the calculation.

---

**Q: Where do I see which payment plan belongs to which booking?**  
A: Open the **Booking** detail page → **Quick Actions** → **View Payment Plan**.  
Or from a **Payment Plan**, the booking number is shown in the header.

---

**Q: Can two customers have different payment schedules for the same project?**  
A: Yes. Every booking has its own independent Payment Plan with its own milestones and amounts. This is the "dynamic CLP" — fully customisable per customer.

---

*End of guide. Please update this document whenever a new flow is added or an existing one changes.*
