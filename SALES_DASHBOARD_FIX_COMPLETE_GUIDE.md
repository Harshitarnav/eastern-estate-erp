# 🎯 Sales Dashboard 500 Error - COMPLETE FIX GUIDE

## 📋 Problem Summary

The Sales Dashboard at `http://localhost:3000/sales` is showing **500 Internal Server Error** because the NestJS backend entities expect database columns that don't exist in your PostgreSQL database.

### Root Cause
When the Sales CRM module was created, new entity fields were added to the TypeScript code, but the corresponding database columns were never added to PostgreSQL. This causes TypeORM to generate SQL queries that reference non-existent columns, resulting in database errors.

### Missing Columns Identified
- **Leads table**: ~50 missing columns (assigned_at, preferred_location, requirements, etc.)
- **Bookings table**: ~40 missing columns (token_payment_mode, token_receipt_number, etc.)

---

## 🚀 SOLUTION - Two Options

### Option 1: Automated Script (RECOMMENDED) ⭐

Run the automated migration script:

```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend
./run-migration.sh
```

The script will:
1. ✅ Prompt you to create a database backup (recommended)
2. ✅ Run the migration to add all missing columns
3. ✅ Verify the changes were applied successfully
4. ✅ Show you the next steps

---

### Option 2: Manual Migration

If you prefer to run the migration manually:

```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend

# 1. Create backup (IMPORTANT!)
pg_dump -h localhost -U arnav -d eastern_estate_erp > backup_$(date +%Y%m%d).sql

# 2. Run migration
psql -h localhost -U arnav -d eastern_estate_erp -f add-missing-sales-crm-columns.sql

# 3. Verify
psql -h localhost -U arnav -d eastern_estate_erp -c "\d leads"
psql -h localhost -U arnav -d eastern_estate_erp -c "\d bookings"
```

---

## 📝 After Migration

### Step 1: Restart Backend
```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend

# Kill existing backend
pkill -9 node

# Start fresh
npm run start:dev
```

### Step 2: Test Sales Dashboard
1. Open browser: `http://localhost:3000/login`
2. Login with:
   - Email: `superadmin@easternestates.com`
   - Password: `Password@123`
3. Navigate to: `http://localhost:3000/sales`
4. **The dashboard should now load without 500 errors!** ✅

---

## 📊 What Gets Added to Database

### LEADS Table (~50 new columns)

#### Assignment & Tracking
- `assigned_at` - Timestamp when lead was assigned
- `created_by`, `updated_by` - Audit trail

#### Lead Details
- `preferred_location` - Preferred property location
- `requirements` - Array of requirements (Parking, Vastu, Corner Unit, etc.)

#### Qualification Flags
- `is_qualified` - Is the lead qualified?
- `is_first_time_buyer` - First time buyer flag
- `has_existing_property` - Owns property flag
- `needs_home_loan` - Requires home loan
- `has_approved_loan` - Has loan pre-approval

#### Financial Information
- `current_occupation` - Lead's occupation
- `annual_income` - Annual income

#### Marketing & Analytics
- `campaign_name` - Marketing campaign name
- `utm_source`, `utm_medium`, `utm_campaign` - UTM tracking parameters
- `tags` - Array of tags for categorization

#### Referral Information
- `referred_by` - Referral source type
- `referral_name` - Name of referrer
- `referral_phone` - Phone of referrer

#### Site Visit Tracking
- `has_site_visit` - Has scheduled site visit
- `site_visit_feedback` - Feedback from site visit
- `total_site_visits` - Count of site visits

#### Activity Tracking
- `total_calls`, `total_emails`, `total_meetings` - Activity counters
- `last_call_date`, `last_email_date`, `last_meeting_date` - Last activity timestamps

#### Conversion & Loss Tracking
- `converted_at` - When lead was converted
- `lost_reason` - Reason for losing lead
- `lost_at` - When lead was lost

---

### BOOKINGS Table (~40 new columns)

#### Token Payment Details
- `token_paid_date` - Date token was paid
- `token_receipt_number` - Receipt number
- `token_payment_mode` - Payment mode (Cash, Cheque, UPI, etc.)

#### Agreement Details
- `agreement_signed_date` - Date agreement was signed
- `agreement_document_url` - URL/path to agreement document

#### Possession Dates
- `expected_possession_date` - Expected possession date
- `actual_possession_date` - Actual possession date

#### Financial Details
- `discount_amount` - Discount given
- `discount_reason` - Reason for discount
- `stamp_duty` - Stamp duty amount
- `registration_charges` - Registration charges
- `gst_amount` - GST amount
- `maintenance_deposit` - Maintenance deposit
- `parking_charges` - Parking charges
- `other_charges` - Other miscellaneous charges

#### Loan Details
- `loan_application_number` - Loan application number
- `loan_approval_date` - Date loan was approved
- `loan_disbursement_date` - Date loan was disbursed

#### Nominee Information
- `nominee1_name`, `nominee1_relation` - First nominee details
- `nominee2_name`, `nominee2_relation` - Second nominee details

#### Co-Applicant Information
- `co_applicant_name` - Co-applicant name
- `co_applicant_email` - Co-applicant email
- `co_applicant_phone` - Co-applicant phone
- `co_applicant_relation` - Relationship to main applicant

#### Cancellation & Refund
- `cancellation_date` - Date of cancellation
- `cancellation_reason` - Reason for cancellation
- `refund_amount` - Amount refunded
- `refund_date` - Date of refund

#### Additional Fields
- `documents` - JSONB array for storing multiple document references
- `tower_id` - Link to towers table
- `special_terms` - Special terms and conditions
- `tags` - Array of tags for categorization
- `created_by`, `updated_by` - Audit trail

---

## 🔧 Files Created

1. **`add-missing-sales-crm-columns.sql`** - The actual migration SQL script
2. **`run-migration.sh`** - Automated script to run the migration safely
3. **`RUN_THIS_MIGRATION.md`** - Detailed migration instructions
4. **`SALES_DASHBOARD_FIX_COMPLETE_GUIDE.md`** - This complete guide

---

## ⚠️ Important Notes

### Before Running Migration

1. **BACKUP YOUR DATABASE** - Always create a backup before running migrations
2. **Test Environment** - If possible, test on a non-production database first
3. **Maintenance Window** - Consider running during low-traffic period
4. **Permissions** - Ensure you have ALTER TABLE permissions

### After Running Migration

1. **Restart Backend** - Required for changes to take effect
2. **Clear Cache** - Browser cache may need to be cleared
3. **Test Thoroughly** - Test all Sales Dashboard features
4. **Monitor Logs** - Watch backend logs for any remaining errors

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# Restore from backup
psql -h localhost -U arnav -d eastern_estate_erp < backup_YYYYMMDD.sql

# Restart backend
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend
pkill -9 node
npm run start:dev
```

---

## ✅ Verification Checklist

After running the migration, verify:

- [ ] Backend starts without errors
- [ ] Sales Dashboard loads (http://localhost:3000/sales)
- [ ] Dashboard shows performance metrics
- [ ] Lead statistics are displayed
- [ ] Site visit information appears
- [ ] Follow-ups section loads
- [ ] Tasks section loads
- [ ] Recent activity is visible
- [ ] No 500 errors in browser console
- [ ] No database errors in backend logs

---

## 📞 Troubleshooting

### Error: "relation does not exist"
- **Solution**: Make sure you're connected to the correct database

### Error: "permission denied"
- **Solution**: Ensure user has ALTER TABLE permissions

### Error: "duplicate column name"
- **Solution**: Some columns may already exist, the script handles this with `IF NOT EXISTS`

### Backend still shows errors
- **Solution**: 
  1. Clear dist folder: `rm -rf dist && npm run build`
  2. Restart backend: `pkill -9 node && npm run start:dev`
  3. Clear browser cache and reload

---

## 🎉 Expected Result

After successful migration:

✅ **Sales Dashboard loads successfully**
✅ **All metrics display correctly**
✅ **No 500 errors**
✅ **Full Sales CRM functionality available**

---

## 📚 Related Documentation

- `RUN_THIS_MIGRATION.md` - Detailed migration instructions
- `add-missing-sales-crm-columns.sql` - The actual SQL migration script
- `SALES_CRM_MODULE_DOCUMENTATION.md` - Full Sales CRM documentation

---

## 🤝 Need Help?

If you encounter issues:
1. Check backend logs: `tail -f server.log`
2. Check PostgreSQL logs
3. Verify database connection settings
4. Ensure all services are running

---

**Created**: October 20, 2025  
**Status**: Ready to run ✅  
**Estimated Time**: 5-10 minutes including backup

