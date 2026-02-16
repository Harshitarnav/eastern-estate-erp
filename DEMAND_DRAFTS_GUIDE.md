# Demand Drafts - Complete Guide

## 📍 Where to Find Demand Drafts

### Main Location: Construction Milestones Page

**Navigation**: `Payments & Plans → Construction Milestones → Demand Drafts Tab`

This is your central hub for managing all demand drafts in the system.

---

## 🎯 How Demand Drafts Are Created

### Automatic Generation (Primary Method)

Demand drafts are **automatically generated** when construction progress reaches a milestone:

1. **Log Construction Progress**:
   - Go to: `Construction → Progress Log`
   - Select: Property → Tower → Flat
   - Log progress (e.g., STRUCTURE at 50%)
   - Click "Log Progress"

2. **System Checks Payment Plan**:
   - If the flat has an active payment plan
   - If a milestone is linked to that construction phase
   - If progress meets or exceeds the milestone target

3. **Auto-Generate Draft**:
   - System creates a demand draft automatically
   - Status: **DRAFT** (Pending Review)
   - Includes: Customer name, flat details, amount, HTML content

### Manual Creation (Future Feature)

Currently, demand drafts are only auto-generated. Manual creation can be added if needed.

---

## 📋 Demand Draft Workflow

### States & Actions

```
DRAFT → READY → SENT → PAID
  ↓       ↓       ↓
[Edit] [Send] [Record Payment]
```

### 1. **DRAFT** (Pending Review)

**What it means**: Auto-generated draft awaiting approval

**Where to find**: Construction Milestones → Demand Drafts Tab → "Pending Review" section

**Actions Available**:
- ✏️ **Preview** - View the draft content
- ✏️ **Edit** - Modify content, amount, due date
- ✅ **Approve** - Move to READY state

**How to Edit**:
1. Click **"Preview"** button
2. Opens demand draft detail page
3. Click **"Edit Draft"** button
4. Modify:
   - Title
   - Amount
   - Due Date
   - HTML Content (full control)
5. Click **"Save Changes"**

---

### 2. **READY** (Approved, Ready to Send)

**What it means**: Draft has been reviewed and approved

**Where to find**: Construction Milestones → Demand Drafts Tab → "Ready to Send" section

**Actions Available**:
- 📤 **Send Now** - Send to customer (moves to SENT state)
- ✏️ **Preview** - Review before sending
- ✏️ **Edit** - Make last-minute changes (moves back to DRAFT)
- 💾 **Export** - Download as HTML file

---

### 3. **SENT** (Sent to Customer)

**What it means**: Draft has been sent to the customer

**Actions Available**:
- 👁️ **View Only** - Can no longer edit
- 📥 **Download** - Export sent copy

---

### 4. **PAID** (Payment Received)

**What it means**: Customer has completed the payment

**Actions Available**:
- 👁️ **View Only** - Archive copy
- 📥 **Download** - Export for records

---

## 🛠️ How to Edit Demand Drafts

### Step-by-Step: Editing a Demand Draft

#### Method 1: From Construction Milestones Page

1. Navigate to: `Payments & Plans → Construction Milestones`
2. Click the **"Demand Drafts" tab**
3. Find the draft in **"Pending Review"** section
4. Click **"Preview"** button
5. On the detail page, click **"Edit Draft"**
6. Make your changes:
   - **Title**: Update the document title
   - **Amount**: Modify the payment amount (₹)
   - **Due Date**: Change the payment deadline
   - **HTML Content**: Edit the full HTML template
7. Click **"Save Changes"**

#### Method 2: Direct URL

If you know the draft ID:
- Go to: `https://your-domain.com/demand-drafts/[draft-id]`
- Click **"Edit Draft"** button

---

## 🎨 What You Can Edit

### Basic Fields
- **Title**: Main heading of the demand notice
- **Amount**: Payment amount in Rupees
- **Due Date**: Payment deadline date

### HTML Content
Full control over the demand draft HTML:
- Company letterhead
- Customer address
- Flat details
- Payment breakdown table
- Terms and conditions
- Footer with company info
- Styling and formatting

### Example Editable HTML Structure:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Demand - Foundation Complete</title>
    <style>
        /* Your custom styles */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Demand Notice</h1>
            <p>Date: 16 February, 2026</p>
        </div>
        
        <div class="customer-details">
            <p><strong>To:</strong></p>
            <p>Mr. Customer Name</p>
            <p>Customer Address</p>
        </div>
        
        <div class="property-details">
            <p>Flat No: 102, Tower A</p>
            <p>Property: Diamond City Test</p>
        </div>
        
        <div class="amount">
            <p><strong>Amount Due:</strong> ₹50,000</p>
            <p>Milestone: Foundation Complete</p>
        </div>
        
        <!-- Your custom content here -->
    </div>
</body>
</html>
```

---

## 📤 How to Send Demand Drafts

### Approval Process

1. **Review Draft**:
   - Open from Construction Milestones → Demand Drafts
   - Click "Preview" to review content
   - Verify all details are correct

2. **Approve**:
   - Click **"Approve Draft"** button
   - Draft moves to "Ready to Send" section
   - Status changes from DRAFT → READY

3. **Send**:
   - In "Ready to Send" section, click **"Send Now"**
   - System marks draft as SENT
   - Records sent timestamp
   - (Future: Integration with email/WhatsApp)

---

## 💾 How to Export Demand Drafts

### Export as HTML File

1. Open demand draft detail page
2. Click **"Export HTML"** button
3. File downloads as: `demand_draft_[id].html`
4. You can:
   - Print it
   - Convert to PDF using browser print
   - Email it manually
   - Upload to document management system

### Export Locations

**From Detail Page**:
- Any draft can be exported regardless of status
- File name includes draft ID for tracking

**Future Export Options** (can be added):
- PDF export
- Email integration
- WhatsApp integration
- SMS with payment link

---

## 🔍 How to Find Demand Drafts

### By Status

Navigate to: `Payments & Plans → Construction Milestones → Demand Drafts Tab`

**Tabs Available**:
1. **All Milestones** - Overview of construction progress
2. **Not Started** - Milestones without construction tracking
3. **Ready to Trigger** - Construction complete, ready for draft
4. **In Progress** - Construction ongoing
5. **Awaiting Payment** - Drafts sent, waiting for payment
6. **Completed** - Payments received
7. **Demand Drafts** ← **YOUR MAIN TAB**

### By Flat/Customer

**Method 1**: Filter in Construction Milestones page
- Use the milestone filters to find specific properties/flats

**Method 2**: From Flat Details
- Go to: `Property Inventory → Flats → Select Flat`
- Click on flat number (e.g., T1-0102)
- Scroll to "Construction Progress" section
- Click link to related demand drafts (if any)

**Method 3**: From Payment Plans Detail
- Go to: `Payments & Plans → Payment Plans`
- Select a flat payment plan
- View milestones with "TRIGGERED" status
- Click to see related demand draft

---

## 🎯 Quick Actions Reference

| Status | Actions Available | Main Use Case |
|--------|------------------|---------------|
| **DRAFT** | Preview, Edit, Approve | Review and modify before sending |
| **READY** | Send, Preview, Export | Final review and send to customer |
| **SENT** | View, Export | Track sent drafts |
| **PAID** | View, Export | Archive completed payments |

---

## 🚀 Example Workflow

### Complete Demand Draft Lifecycle

1. **Construction Team** logs progress:
   - Construction → Progress Log
   - Select flat: Diamond City Test / Tower A / 102
   - Log: STRUCTURE phase at 100%

2. **System Auto-Generates** draft:
   - Checks payment plan for flat
   - Finds milestone linked to STRUCTURE phase
   - Creates demand draft with all details
   - Status: DRAFT

3. **Finance Team Reviews** draft:
   - Payments & Plans → Construction Milestones → Demand Drafts
   - Click "Preview" on pending draft
   - Reviews content, amount, customer details

4. **Edit if Needed**:
   - Click "Edit Draft"
   - Update amount (if negotiated discount)
   - Adjust due date
   - Customize message
   - Click "Save Changes"

5. **Approve Draft**:
   - Click "Approve Draft"
   - Status: DRAFT → READY

6. **Send to Customer**:
   - Draft appears in "Ready to Send" section
   - Click "Send Now"
   - Status: READY → SENT
   - System records sent timestamp

7. **Customer Pays**:
   - Payments → Record Payment
   - Link to this demand draft
   - System updates: SENT → PAID
   - Milestone marked as complete

---

## 🔧 Troubleshooting

### "Demand draft not generating automatically"

**Check**:
1. Does the flat have an active payment plan?
   - Go to: Payments & Plans → Payment Plans
   - Search for the flat
   - Ensure status is ACTIVE

2. Is the milestone linked to a construction phase?
   - Open payment plan details
   - Check milestones have `constructionPhase` defined

3. Is the construction progress >= milestone target?
   - Construction progress must meet or exceed `phasePercentage`
   - Example: If milestone requires 50% STRUCTURE, log at least 50%

### "Can't edit demand draft"

**Possible causes**:
- Draft status is SENT or PAID (cannot edit completed drafts)
- Solution: Create a new draft or contact admin to reset status

### "Preview button not working"

**Fix**:
- The demand draft detail page was just created
- Restart your frontend dev server if needed
- Clear browser cache

---

## 📊 Summary

| Task | Location | Action |
|------|----------|--------|
| **View All Drafts** | Construction Milestones → Demand Drafts Tab | View table of all drafts |
| **Edit Draft** | Draft Detail Page → Edit Draft button | Modify content, amount, date |
| **Approve Draft** | Draft Detail Page → Approve button | Move to READY status |
| **Send Draft** | Construction Milestones → Ready to Send | Click Send Now |
| **Export Draft** | Draft Detail Page → Export HTML | Download HTML file |
| **Create Draft** | (Automatic) Log construction progress | System generates automatically |

---

## 🎉 New Feature: Demand Draft Detail Page

**Just Created!**

A dedicated page for viewing and editing demand drafts with:

✅ Full preview of HTML content  
✅ Edit mode with form fields  
✅ Toggle between preview and raw HTML  
✅ Approve/Send actions  
✅ Export as HTML  
✅ Detailed metadata sidebar  
✅ Status indicators  

**Access**: Click "Preview" button from Construction Milestones → Demand Drafts tab

---

**Need Help?**

- Check Construction Milestones page for existing drafts
- Review payment plans to ensure milestones are properly configured
- Log construction progress to trigger automatic draft generation

**Future Enhancements** (can be added):
- Manual draft creation
- PDF export
- Email integration
- WhatsApp integration
- Bulk send functionality
- Custom templates
- Multi-language support
