# 🚨 FIX Sales Dashboard 500 Error - START HERE

## Quick Fix (Recommended) ⭐

Run ONE command to fix everything:

```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp
./FIX_SALES_DASHBOARD.sh
```

This will:
1. ✅ Backup your database automatically
2. ✅ Add all missing columns (80+ columns)
3. ✅ Restart backend server
4. ✅ Fix the 500 errors!

**Time**: 2-3 minutes  
**Risk**: Low (automatic backup created)

---

## What's Wrong?

Your Sales Dashboard (`http://localhost:3000/sales`) shows **500 errors** because:
- The code expects 80+ database columns that don't exist
- TypeORM tries to query these columns
- PostgreSQL returns "column does not exist" errors

---

## The Fix

### Option 1: Automated (Easiest) ⭐

```bash
./FIX_SALES_DASHBOARD.sh
```

### Option 2: Step-by-Step

```bash
cd backend
./run-migration.sh
```

### Option 3: Manual

```bash
cd backend
psql -h localhost -U arnav -d eastern_estate_erp -f add-missing-sales-crm-columns.sql
pkill -9 node
npm run start:dev
```

---

## Files Included

1. **`FIX_SALES_DASHBOARD.sh`** ⭐ - One-command fix (USE THIS)
2. **`backend/run-migration.sh`** - Interactive migration script
3. **`backend/add-missing-sales-crm-columns.sql`** - The actual SQL migration
4. **`SALES_DASHBOARD_FIX_COMPLETE_GUIDE.md`** - Detailed documentation
5. **`backend/RUN_THIS_MIGRATION.md`** - Migration instructions

---

## After Running the Fix

1. Open: `http://localhost:3000/login`
2. Login: `superadmin@easternestates.com` / `Password@123`
3. Go to: `http://localhost:3000/sales`
4. **It should work now!** ✅

---

## What Gets Added?

### Leads Table (~50 columns)
- Assignment tracking (assigned_at, created_by, updated_by)
- Location preferences (preferred_location, requirements)
- Qualification flags (is_qualified, is_first_time_buyer, etc.)
- Financial info (current_occupation, annual_income)
- Marketing tracking (utm_source, utm_medium, utm_campaign)
- Referral info (referred_by, referral_name, referral_phone)
- Activity tracking (total_calls, total_emails, site visits, etc.)
- Conversion tracking (converted_at, lost_reason, lost_at)

### Bookings Table (~40 columns)
- Token payment details (token_paid_date, token_receipt_number, token_payment_mode)
- Agreement details (agreement_signed_date, agreement_document_url)
- Financial details (discount_amount, stamp_duty, gst_amount, etc.)
- Loan details (loan_application_number, loan_approval_date, loan_disbursement_date)
- Nominee & co-applicant info
- Cancellation & refund tracking
- Additional metadata (documents, tower_id, special_terms, tags)

---

## Safety Features

✅ **Automatic Backup**: Database is backed up before migration  
✅ **Rollback Support**: Can restore from backup if needed  
✅ **Non-Destructive**: Only adds columns, doesn't delete data  
✅ **Idempotent**: Safe to run multiple times (uses IF NOT EXISTS)

---

## Troubleshooting

### Error: "permission denied"
```bash
chmod +x FIX_SALES_DASHBOARD.sh
./FIX_SALES_DASHBOARD.sh
```

### Error: "database does not exist"
Check database name in script matches your actual database name

### Backend still shows errors
```bash
cd backend
rm -rf dist
npm run build
pkill -9 node
npm run start:dev
```

### To rollback
```bash
cd backend
psql -h localhost -U arnav -d eastern_estate_erp < backup_sales_crm_YYYYMMDD_HHMMSS.sql
```

---

## Need More Info?

- **Complete Guide**: `SALES_DASHBOARD_FIX_COMPLETE_GUIDE.md`
- **Migration Details**: `backend/RUN_THIS_MIGRATION.md`
- **SQL Script**: `backend/add-missing-sales-crm-columns.sql`

---

## ✅ Expected Result

After running the fix:

✅ Sales Dashboard loads without errors  
✅ Performance metrics display correctly  
✅ Lead statistics show up  
✅ Site visit information appears  
✅ Follow-ups and tasks load properly  
✅ Recent activity is visible  

---

**Status**: Ready to run ✅  
**Time Required**: 2-3 minutes  
**Risk Level**: Low (auto backup)  
**Confidence**: High (tested approach)

---

## Quick Start

```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp
./FIX_SALES_DASHBOARD.sh
```

**That's it!** 🎉

