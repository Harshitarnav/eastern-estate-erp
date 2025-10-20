# 🎯 Sales CRM Database Migration - FIX 500 ERRORS

## Problem
The Sales Dashboard is showing 500 errors because the NestJS entity definitions expect columns that don't exist in the PostgreSQL database.

## Solution
Run the migration script to add all missing columns to the database.

## ⚠️ IMPORTANT - READ BEFORE RUNNING

This migration will add approximately **80+ new columns** to your `leads` and `bookings` tables. Make sure you:

1. **Backup your database first** (recommended)
2. Have write access to the database
3. Understand that this will modify your production schema

## 🚀 How to Run the Migration

### Step 1: Backup Database (RECOMMENDED)
```bash
pg_dump -h localhost -U arnav -d eastern_estate_erp > backup_before_sales_crm_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run the Migration Script
```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend

psql -h localhost -U arnav -d eastern_estate_erp -f add-missing-sales-crm-columns.sql
```

### Step 3: Verify the Migration
```bash
# Check that columns were added to leads table
psql -h localhost -U arnav -d eastern_estate_erp -c "\d leads"

# Check that columns were added to bookings table
psql -h localhost -U arnav -d eastern_estate_erp -c "\d bookings"
```

### Step 4: Restart the Backend
```bash
# Kill existing node processes
pkill -9 node

# Start backend
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend
npm run start:dev
```

### Step 5: Test the Sales Dashboard
1. Open browser: http://localhost:3000/login
2. Login with: `superadmin@easternestates.com` / `Password@123`
3. Navigate to: http://localhost:3000/sales
4. The 500 errors should now be FIXED! ✅

## 📋 What This Migration Adds

### LEADS Table (~50 new columns):
- `assigned_at` - When lead was assigned
- `preferred_location` - Preferred property location
- `requirements` - Array of requirements (Parking, Vastu, etc.)
- `is_qualified`, `is_first_time_buyer`, `has_existing_property` - Boolean flags
- `needs_home_loan`, `has_approved_loan` - Loan related fields
- `current_occupation`, `annual_income` - Financial info
- `campaign_name`, `utm_source`, `utm_medium`, `utm_campaign` - Marketing tracking
- `tags` - Array of tags
- `referred_by`, `referral_name`, `referral_phone` - Referral info
- `has_site_visit`, `site_visit_feedback`, `total_site_visits` - Site visit tracking
- `total_calls`, `total_emails`, `total_meetings` - Activity counters
- `last_call_date`, `last_email_date`, `last_meeting_date` - Activity timestamps
- `converted_at`, `lost_reason`, `lost_at` - Conversion tracking
- `created_by`, `updated_by` - Audit trail

### BOOKINGS Table (~40 new columns):
- `token_paid_date`, `token_receipt_number`, `token_payment_mode` - Token payment details
- `agreement_signed_date`, `agreement_document_url` - Agreement details
- `expected_possession_date`, `actual_possession_date` - Possession dates
- `discount_amount`, `discount_reason` - Discount tracking
- `stamp_duty`, `registration_charges`, `gst_amount` - Charges
- `maintenance_deposit`, `parking_charges`, `other_charges` - Additional charges
- `loan_application_number`, `loan_approval_date`, `loan_disbursement_date` - Loan details
- `nominee1_name`, `nominee1_relation`, `nominee2_name`, `nominee2_relation` - Nominee info
- `co_applicant_name`, `co_applicant_email`, `co_applicant_phone`, `co_applicant_relation` - Co-applicant
- `cancellation_date`, `cancellation_reason`, `refund_amount`, `refund_date` - Cancellation tracking
- `documents` - JSONB for storing multiple documents
- `tower_id` - Link to towers table
- `special_terms` - Special terms and conditions
- `tags` - Array of tags
- `created_by`, `updated_by` - Audit trail

## 🔄 Alternative: Rollback (If Needed)

If you need to rollback the migration:

```bash
# Restore from backup
psql -h localhost -U arnav -d eastern_estate_erp < backup_before_sales_crm_migration_YYYYMMDD_HHMMSS.sql
```

## ✅ Expected Result

After running this migration, the Sales Dashboard will:
- ✅ Load without 500 errors
- ✅ Display sales metrics and targets
- ✅ Show lead statistics
- ✅ Display site visit information
- ✅ Show follow-ups and tasks
- ✅ Display recent activity

## 📞 Need Help?

If you encounter any errors:
1. Check the PostgreSQL logs for detailed error messages
2. Verify database connection settings
3. Ensure you have the necessary permissions
4. Make sure no other processes are writing to the database during migration

