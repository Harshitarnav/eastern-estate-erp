# Construction-Linked Payment Integration Plan
## Eastern Estate ERP - Automated Payment Milestone System

**Date:** February 16, 2026  
**Status:** 📋 Planning Phase  
**Priority:** High

---

## 🎯 Project Overview

### Objective
Create an automated system that connects construction progress milestones with payment schedules, automatically generates demand drafts when checkpoints are completed, and updates flat details upon payment completion.

### Business Flow
```
Property → Tower → Flat → Booking → Payment Plan (Pre-fed)
                                            ↓
                            Construction Progress Tracking
                                            ↓
                            Milestone Checkpoint Completed
                                            ↓
                            Auto-Generate Demand Draft
                                            ↓
                            Send to Customer (One Click)
                                            ↓
                            Payment Received & Logged
                                            ↓
                            Update Flat Details & Close Checkpoint
```

---

## 📊 Current System Analysis

### ✅ What We Have

#### 1. **Property-Tower-Flat Hierarchy** (Complete)
- **Property Entity**: Has `projectId` linking to construction project
- **Tower Entity**: Has construction status and completion dates
- **Flat Entity**: 
  - Has `expectedPossession`, `bookingDate`, `soldDate`
  - Has `paymentPlan` (text field)
  - Has document URLs for agreements, receipts, demand letters
  - Status tracking: AVAILABLE, BOOKED, SOLD, UNDER_CONSTRUCTION

#### 2. **Booking System** (Complete)
- Links Customer → Flat → Property
- Has `paymentPlan` field (string: 'CONSTRUCTION_LINKED', 'TIME_LINKED', 'DOWN_PAYMENT')
- Tracks `totalAmount`, `paidAmount`, `balanceAmount`
- Has `tokenAmount` for initial booking

#### 3. **Payment Schedule System** (Partial)
- **Entity**: `payment_schedules`
- **Features**:
  - `installmentNumber` and `totalInstallments`
  - `dueDate` and `amount`
  - `milestone` field (for construction-linked plans)
  - `status`: PENDING, PAID, OVERDUE, WAIVED, PARTIAL
  - `paidAmount`, `paidDate`, `paymentId`
- **Gap**: No direct link to construction phases/checkpoints

#### 4. **Construction Progress Tracking** (Complete)
- **Tower Progress**: Tracks 5 phases per tower
  - FOUNDATION, STRUCTURE, MEP, FINISHING, HANDOVER
  - Has `phaseProgress` (0-100%), `status`, dates
- **Flat Progress**: Tracks same 5 phases per individual flat
  - Same phase tracking as tower
  - Has `overallProgress` percentage
  - Virtual properties: `isCompleted`, `isReadyForHandover`

#### 5. **Demand Drafts System** (Basic)
- **Entity**: `demand_drafts`
- **Features**:
  - Links to `flatId`, `customerId`, `bookingId`
  - Has `milestoneId` field (currently varchar)
  - `amount`, `status` (DRAFT, READY, SENT, FAILED)
  - `content` (HTML), `fileUrl` (PDF)
  - `generatedAt`, `sentAt` timestamps
- **Gap**: Not automated, no trigger mechanism

#### 6. **Payments System** (Complete)
- **Entity**: `payments`
- Tracks actual payments received
- Links to `bookingId` and `customerId`
- Multiple payment methods supported
- Has `status`: PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED

---

## 🔴 Gaps Identified

### 1. **Payment Plan Templates** (Missing)
- No structured payment plan definitions
- No predefined milestone-to-payment mappings
- Current `paymentPlan` is just a string field

### 2. **Milestone-Payment Linkage** (Missing)
- No direct connection between construction phases and payment schedules
- `milestone` field in payment_schedules is free text
- No automated trigger when construction checkpoint is completed

### 3. **Automated Demand Draft Generation** (Missing)
- No automatic generation when milestone is reached
- No workflow for approval/review before sending
- No template system for demand draft content

### 4. **Payment Completion Workflow** (Partial)
- Payment logging exists but doesn't auto-update:
  - Flat status
  - Construction checkpoint closure
  - Payment schedule status
  - Booking balance amount

### 5. **Dashboard for Tracking** (Missing)
- No consolidated view of:
  - Pending milestones per flat
  - Demand drafts awaiting send
  - Payment vs construction progress correlation

---

## 🏗️ Proposed Solution Architecture

### Phase 1: Payment Plan Templates System

#### New Entity: `payment_plan_templates`
```typescript
{
  id: uuid
  name: string // "Standard Construction Linked", "Premium Time Linked"
  type: enum // CONSTRUCTION_LINKED, TIME_LINKED, DOWN_PAYMENT
  description: text
  isActive: boolean
  isDefault: boolean
  
  // For construction-linked plans
  milestones: jsonb[] // Array of milestone definitions
  /*
    [
      {
        sequence: 1,
        name: "Token Amount",
        constructionPhase: null,
        phasePercentage: null,
        paymentPercentage: 10,
        description: "Initial booking amount"
      },
      {
        sequence: 2,
        name: "On Foundation Completion",
        constructionPhase: "FOUNDATION",
        phasePercentage: 100,
        paymentPercentage: 15,
        description: "After foundation work is 100% complete"
      },
      {
        sequence: 3,
        name: "On Structure 50%",
        constructionPhase: "STRUCTURE",
        phasePercentage: 50,
        paymentPercentage: 20,
        description: "When structure reaches 50% completion"
      },
      // ... more milestones
    ]
  */
  
  totalPercentage: number // Should sum to 100
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### New Entity: `flat_payment_plans`
```typescript
{
  id: uuid
  flatId: uuid // FK to flats
  bookingId: uuid // FK to bookings
  customerId: uuid // FK to customers
  paymentPlanTemplateId: uuid // FK to payment_plan_templates
  
  totalAmount: decimal
  paidAmount: decimal
  balanceAmount: decimal
  
  // Actual milestones for this specific flat
  milestones: jsonb[] // Copy from template with actual amounts
  /*
    [
      {
        sequence: 1,
        name: "Token Amount",
        constructionPhase: null,
        phasePercentage: null,
        amount: 500000, // 10% of 5000000
        dueDate: "2026-01-15",
        status: "PAID",
        paymentScheduleId: "uuid",
        demandDraftId: null,
        paymentId: "uuid",
        completedAt: "2026-01-15"
      },
      {
        sequence: 2,
        name: "On Foundation Completion",
        constructionPhase: "FOUNDATION",
        phasePercentage: 100,
        amount: 750000, // 15% of 5000000
        dueDate: null, // Will be set when milestone is triggered
        status: "PENDING",
        constructionCheckpointId: "uuid", // Link to actual progress
        demandDraftId: null,
        paymentId: null,
        completedAt: null
      },
      // ... more
    ]
  */
  
  status: enum // ACTIVE, COMPLETED, CANCELLED
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### Phase 2: Construction Checkpoint System

#### Enhanced Entity: `construction_flat_progress`
**Add new columns:**
```typescript
{
  // Existing fields...
  
  // New fields for payment integration
  isPaymentMilestone: boolean // Is this a payment checkpoint?
  milestoneTriggered: boolean // Has payment been triggered?
  milestoneTriggeredAt: timestamp
  demandDraftId: uuid // Link to generated demand draft
  paymentScheduleId: uuid // Link to payment schedule
  
  // Approval workflow
  milestoneApprovedBy: uuid // Who approved the milestone completion
  milestoneApprovedAt: timestamp
  requiresApproval: boolean // Does this need approval before triggering payment?
}
```

#### New Service: `ConstructionMilestoneService`
**Responsibilities:**
1. Monitor construction progress updates
2. Detect when a payment milestone is reached
3. Trigger demand draft generation workflow
4. Update payment schedule status

---

### Phase 3: Automated Demand Draft Generation

#### Enhanced Entity: `demand_drafts`
**Add new columns:**
```typescript
{
  // Existing fields...
  
  // New structured fields
  paymentScheduleId: uuid // Link to specific payment schedule
  flatPaymentPlanId: uuid // Link to flat payment plan
  constructionCheckpointId: uuid // Link to construction progress
  
  // Workflow fields
  autoGenerated: boolean // Was this auto-generated?
  requiresReview: boolean // Needs approval before sending?
  reviewedBy: uuid
  reviewedAt: timestamp
  reviewNotes: text
  
  // Template fields
  templateId: uuid // Which template was used
  templateData: jsonb // Merged data for template
}
```

#### New Entity: `demand_draft_templates`
```typescript
{
  id: uuid
  name: string // "Standard Milestone Demand", "Final Payment Demand"
  subject: string // Email subject template
  htmlContent: text // HTML template with placeholders
  /*
    Placeholders:
    {{customerName}}
    {{flatNumber}}
    {{propertyName}}
    {{milestoneName}}
    {{amount}}
    {{dueDate}}
    {{bankDetails}}
    etc.
  */
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### Phase 4: Payment Completion Workflow

#### New Service: `PaymentCompletionService`
**Responsibilities:**
1. When payment is logged, automatically:
   - Update `payment_schedules.status` to PAID
   - Update `payment_schedules.paidAmount` and `paidDate`
   - Update `flat_payment_plans.milestones[x].status` to PAID
   - Update `flat_payment_plans.paidAmount` and `balanceAmount`
   - Update `bookings.paidAmount` and `balanceAmount`
   - Close construction checkpoint (`milestoneTriggered = true`)
   - Update flat status if all payments complete
   - Generate receipt and update document URLs

---

### Phase 5: Construction Dashboard

#### New Page: `/construction/payment-milestones`

**Features:**
1. **Overview Cards**
   - Total flats under construction
   - Pending payment milestones
   - Demand drafts awaiting approval
   - Demand drafts ready to send
   - Payments received today

2. **Milestone Tracking Table**
   - Columns: Flat, Tower, Property, Milestone, Progress %, Status, Action
   - Filters: Property, Tower, Phase, Status
   - Actions:
     - View construction progress
     - Approve milestone completion
     - Generate demand draft
     - Send demand draft
     - Log payment

3. **Demand Draft Queue**
   - Drafts awaiting review
   - Drafts ready to send
   - One-click send functionality
   - Bulk send option

4. **Payment vs Progress Chart**
   - Visual correlation between construction progress and payments
   - Identify delayed payments
   - Forecast upcoming payment demands

---

## 🗄️ Database Schema Changes

### New Tables to Create

```sql
-- 1. Payment Plan Templates
CREATE TABLE payment_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- CONSTRUCTION_LINKED, TIME_LINKED, DOWN_PAYMENT
    description TEXT,
    milestones JSONB NOT NULL,
    total_percentage DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- 2. Flat Payment Plans (Instance of template for specific flat)
CREATE TABLE flat_payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_plan_template_id UUID REFERENCES payment_plan_templates(id),
    
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2) NOT NULL,
    
    milestones JSONB NOT NULL, -- Actual milestone instances with amounts
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT unique_flat_booking UNIQUE(flat_id, booking_id)
);

CREATE INDEX idx_flat_payment_plans_flat ON flat_payment_plans(flat_id);
CREATE INDEX idx_flat_payment_plans_booking ON flat_payment_plans(booking_id);
CREATE INDEX idx_flat_payment_plans_customer ON flat_payment_plans(customer_id);
CREATE INDEX idx_flat_payment_plans_status ON flat_payment_plans(status);

-- 3. Demand Draft Templates
CREATE TABLE demand_draft_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alter Existing Tables

```sql
-- 1. Add columns to construction_flat_progress
ALTER TABLE construction_flat_progress
ADD COLUMN is_payment_milestone BOOLEAN DEFAULT FALSE,
ADD COLUMN milestone_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN milestone_triggered_at TIMESTAMP,
ADD COLUMN demand_draft_id UUID REFERENCES demand_drafts(id),
ADD COLUMN payment_schedule_id UUID REFERENCES payment_schedules(id),
ADD COLUMN milestone_approved_by UUID REFERENCES users(id),
ADD COLUMN milestone_approved_at TIMESTAMP,
ADD COLUMN requires_approval BOOLEAN DEFAULT TRUE;

-- 2. Add columns to demand_drafts
ALTER TABLE demand_drafts
ADD COLUMN payment_schedule_id UUID REFERENCES payment_schedules(id),
ADD COLUMN flat_payment_plan_id UUID REFERENCES flat_payment_plans(id),
ADD COLUMN construction_checkpoint_id UUID REFERENCES construction_flat_progress(id),
ADD COLUMN auto_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN requires_review BOOLEAN DEFAULT TRUE,
ADD COLUMN reviewed_by UUID REFERENCES users(id),
ADD COLUMN reviewed_at TIMESTAMP,
ADD COLUMN review_notes TEXT,
ADD COLUMN template_id UUID REFERENCES demand_draft_templates(id),
ADD COLUMN template_data JSONB;

-- 3. Add index to payment_schedules.milestone
CREATE INDEX idx_payment_schedules_milestone ON payment_schedules(milestone);

-- 4. Update flats table to track payment plan
ALTER TABLE flats
ADD COLUMN payment_plan_id UUID REFERENCES flat_payment_plans(id);
```

---

## 🔄 Workflow Implementation

### Workflow 1: Setting Up Payment Plan for a Flat

**Trigger:** When a booking is confirmed

**Steps:**
1. Admin selects a payment plan template
2. System calculates actual amounts based on flat's total price
3. Creates `flat_payment_plans` record with milestone instances
4. Creates `payment_schedules` for each milestone
5. Links construction checkpoints to payment milestones
6. Updates flat's `payment_plan_id`

**API Endpoint:**
```
POST /api/v1/flats/:flatId/payment-plan
Body: {
  paymentPlanTemplateId: uuid,
  bookingId: uuid,
  customerId: uuid,
  totalAmount: number
}
```

---

### Workflow 2: Construction Milestone Completion

**Trigger:** Construction team updates flat progress to 100% for a phase

**Steps:**
1. System checks if this phase is a payment milestone
2. If yes, checks if milestone requires approval
3. If approval required:
   - Sends notification to approvers
   - Waits for approval
4. Once approved:
   - Marks `milestone_triggered = true`
   - Auto-generates demand draft using template
   - Sets demand draft status to READY (if no review needed) or DRAFT (if review needed)
   - Updates payment schedule status to PENDING
   - Sends notification to finance team

**API Endpoint:**
```
PATCH /api/v1/construction/flat-progress/:id/complete-phase
Body: {
  phaseProgress: 100,
  notes: string
}
```

---

### Workflow 3: Demand Draft Review & Send

**Trigger:** Finance team reviews auto-generated demand draft

**Steps:**
1. Finance team opens demand draft queue
2. Reviews draft content (can edit if needed)
3. Approves draft
4. Clicks "Send to Customer"
5. System:
   - Generates PDF
   - Sends email to customer
   - Updates status to SENT
   - Records `sentAt` timestamp
   - Sends notification to customer

**API Endpoint:**
```
POST /api/v1/demand-drafts/:id/send
Body: {
  sendEmail: boolean,
  emailAddresses: string[],
  ccAddresses: string[],
  customMessage: string
}
```

---

### Workflow 4: Payment Receipt & Checkpoint Closure

**Trigger:** Payment is logged in the system

**Steps:**
1. Finance team logs payment
2. Links payment to:
   - Booking
   - Payment schedule
   - Demand draft
3. System automatically:
   - Updates payment_schedule.status = PAID
   - Updates payment_schedule.paidAmount and paidDate
   - Updates flat_payment_plans milestone status
   - Updates booking.paidAmount and balanceAmount
   - Closes construction checkpoint
   - Updates flat status if all payments complete
   - Generates payment receipt
   - Sends confirmation to customer
   - Updates flat document URLs

**API Endpoint:**
```
POST /api/v1/payments
Body: {
  bookingId: uuid,
  paymentScheduleId: uuid,
  amount: number,
  paymentMethod: string,
  paymentDate: date,
  transactionReference: string,
  // ... other payment details
}
```

---

## 📱 Frontend Components

### 1. Payment Plan Setup Form
**Location:** `/flats/:id/payment-plan/setup`
- Select payment plan template
- Preview milestones
- Adjust amounts if needed
- Confirm and create

### 2. Construction Milestone Dashboard
**Location:** `/construction/payment-milestones`
- Overview cards
- Milestone tracking table
- Demand draft queue
- Payment vs progress charts

### 3. Demand Draft Review Modal
- Preview demand draft content
- Edit if needed
- Approve and send
- Track sending status

### 4. Payment Logging Form (Enhanced)
**Location:** `/payments/new`
- Auto-populate from pending payment schedules
- Link to demand draft
- Auto-update all related records

### 5. Flat Payment Timeline
**Location:** `/flats/:id/payment-timeline`
- Visual timeline of milestones
- Construction progress vs payments
- Upcoming payment predictions
- Payment history

---

## 🎯 Implementation Phases

### Phase 1: Database & Backend Foundation (Week 1-2)
- [ ] Create new database tables
- [ ] Alter existing tables
- [ ] Create entities and DTOs
- [ ] Build payment plan template CRUD
- [ ] Build flat payment plan service

### Phase 2: Milestone Integration (Week 3-4)
- [ ] Enhance construction progress service
- [ ] Build milestone detection logic
- [ ] Create demand draft auto-generation service
- [ ] Implement approval workflow
- [ ] Build notification system

### Phase 3: Payment Completion Workflow (Week 5)
- [ ] Enhance payment service
- [ ] Build auto-update logic for all related entities
- [ ] Create receipt generation
- [ ] Implement status update cascade

### Phase 4: Frontend Dashboard (Week 6-7)
- [ ] Build payment plan setup UI
- [ ] Create construction milestone dashboard
- [ ] Build demand draft review interface
- [ ] Enhance payment logging form
- [ ] Create flat payment timeline view

### Phase 5: Testing & Refinement (Week 8)
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Training materials

---

## 🔐 Security & Permissions

### Role-Based Access

**Payment Plan Setup:**
- Super Admin, Admin, Sales Manager

**Milestone Approval:**
- Super Admin, Admin, Construction Manager

**Demand Draft Review:**
- Super Admin, Admin, Accountant

**Demand Draft Send:**
- Super Admin, Admin, Accountant

**Payment Logging:**
- Super Admin, Admin, Accountant

**View Dashboard:**
- All roles (filtered by permissions)

---

## 📊 Success Metrics

1. **Automation Rate**: % of demand drafts auto-generated vs manual
2. **Payment Timeliness**: Average days between milestone completion and payment receipt
3. **Error Rate**: % of payments requiring manual correction
4. **User Satisfaction**: Feedback from finance and construction teams
5. **Time Savings**: Hours saved per month in manual processes

---

## 🚨 Risk Mitigation

### Risk 1: Incorrect Milestone Triggering
**Mitigation:** Require approval before generating demand draft

### Risk 2: Payment Misallocation
**Mitigation:** Strict validation and confirmation before auto-updates

### Risk 3: Data Inconsistency
**Mitigation:** Use database transactions for all multi-entity updates

### Risk 4: Customer Confusion
**Mitigation:** Clear communication in demand drafts, customer portal access

---

## 📝 Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize features** - which workflows are most critical?
3. **Create sample payment plan templates** - what are the standard plans?
4. **Design demand draft templates** - what should they look like?
5. **Begin Phase 1 implementation** - database and backend foundation

---

**Document Version:** 1.0  
**Last Updated:** February 16, 2026  
**Author:** AI Assistant  
**Status:** Awaiting Approval
