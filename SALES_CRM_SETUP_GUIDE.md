# Sales & CRM Module - Quick Setup Guide

## 🚀 Getting Started

This guide will help you set up and start using the Sales & CRM module in 15 minutes.

## 📋 Prerequisites

- ✅ Backend is running (`npm run start:dev` in `backend/` directory)
- ✅ PostgreSQL database is accessible
- ✅ Admin user credentials available

## 🔧 Step 1: Run Database Migration

### Option A: Using psql (Recommended)
```bash
cd /Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp

# Run the migration
psql -U your_postgres_user -d eastern_estate_db -f backend/database-migration-sales-crm-phase1.sql
```

### Option B: Using pgAdmin or Database GUI
1. Open your database tool
2. Connect to `eastern_estate_db`
3. Open and execute: `backend/database-migration-sales-crm-phase1.sql`

### Verify Migration Success
```bash
# Check if new tables were created
psql -U your_postgres_user -d eastern_estate_db -c "\dt sales*"
# Should show: sales_targets, sales_tasks

psql -U your_postgres_user -d eastern_estate_db -c "\dt followups"
# Should show: followups table
```

## 📧 Step 2: Configure Email Service (For Reminders)

### Update `.env` file in `backend/` directory:

```env
# Add these lines to your .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="Eastern Estate ERP <noreply@easternestates.com>"
ADMIN_EMAIL=admin@easternestates.com
```

### Gmail App Password Setup (if using Gmail)
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate new app password for "Mail"
5. Use this password in `EMAIL_PASSWORD`

### Alternative Email Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com` (Port: 587)
- **Yahoo**: `smtp.mail.yahoo.com` (Port: 587)
- **Custom SMTP**: Use your company's SMTP server details

## 🔄 Step 3: Restart Backend

```bash
cd backend
npm run start:dev
```

Look for these lines in the logs:
```
[Nest] INFO [SchedulerRegistry] Cron job sendFollowUpReminders has been added
[Nest] INFO [SchedulerRegistry] Cron job sendTaskReminders has been added
[Nest] INFO [SchedulerRegistry] Cron job sendSiteVisitReminders has been added
```

## ✅ Step 4: Verify Installation

### Test 1: Check API Health

```bash
# Test Sales Dashboard API
curl -X GET "http://localhost:5000/sales-dashboard/:salesPersonId" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with dashboard data
```

### Test 2: Create a Sales Target

```bash
curl -X POST "http://localhost:5000/sales-targets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salesPersonId": "YOUR_SALESPERSON_UUID",
    "targetPeriod": "MONTHLY",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31",
    "targetBookings": 5,
    "targetRevenue": 25000000,
    "baseIncentive": 50000
  }'

# Expected: 201 Created with target details
```

### Test 3: Create a Follow-up Record

```bash
curl -X POST "http://localhost:5000/followups" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "YOUR_LEAD_UUID",
    "followUpDate": "2025-10-19",
    "followUpType": "CALL",
    "performedBy": "YOUR_SALESPERSON_UUID",
    "outcome": "INTERESTED",
    "feedback": "Customer interested in 2BHK flats",
    "interestLevel": 8,
    "budgetFit": 7,
    "timelineFit": 6
  }'

# Expected: 201 Created with followup details
```

### Test 4: Check Database Tables

```bash
# Verify followups table
psql -U your_user -d eastern_estate_db -c "SELECT COUNT(*) FROM followups;"

# Verify sales_targets table
psql -U your_user -d eastern_estate_db -c "SELECT COUNT(*) FROM sales_targets;"

# Verify sales_tasks table
psql -U your_user -d eastern_estate_db -c "SELECT COUNT(*) FROM sales_tasks;"
```

## 📊 Step 5: Initial Data Setup

### Create Your First Sales Target

Using Postman or curl:
```json
POST http://localhost:5000/sales-targets
{
  "salesPersonId": "<get-from-users-table>",
  "targetPeriod": "MONTHLY",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "targetLeads": 50,
  "targetSiteVisits": 20,
  "targetConversions": 5,
  "targetBookings": 3,
  "targetRevenue": 30000000,
  "baseIncentive": 50000,
  "notes": "Q4 target for peak season"
}
```

### Update Existing Leads

Run this to update your existing leads with new fields:

```sql
-- Set default values for existing leads
UPDATE leads SET
  site_visit_status = 'NOT_SCHEDULED',
  requirement_type = 'END_USER',
  property_preference = 'FLAT',
  total_follow_ups = 0,
  send_follow_up_reminder = true,
  reminder_sent = false
WHERE site_visit_status IS NULL;
```

## 🎯 Step 6: Configure Cron Jobs (Production)

For production environments, ensure your server's timezone is correct:

```bash
# Check server timezone
timedatectl

# Set timezone (example: IST)
sudo timedatectl set-timezone Asia/Kolkata
```

The cron jobs will automatically run:
- **Every hour**: Follow-up and task reminders
- **Daily at 9 AM**: Site visit confirmations
- **Daily at 10 PM**: Reminder flag resets

## 👥 Step 7: Set Up Team Targets

### For Sales Manager/GM:

1. Get list of sales team members:
```sql
SELECT id, first_name, last_name, email 
FROM users 
WHERE role = 'SALES_PERSON' OR role = 'SALES_EXECUTIVE';
```

2. Create targets for each team member (use API or run multiple SQL inserts)

3. View team performance:
```bash
GET /sales-targets/team/performance-summary?teamMemberIds=uuid1,uuid2,uuid3
```

## 📱 Step 8: Test Reminder System

### Manual Test of Reminders

Create a lead with follow-up tomorrow:
```sql
INSERT INTO leads (
  first_name, last_name, phone, email, 
  next_follow_up_date, assigned_to,
  send_follow_up_reminder, reminder_sent
) VALUES (
  'Test', 'Customer', '9999999999', 'test@example.com',
  CURRENT_DATE + INTERVAL '1 day',
  'YOUR_SALESPERSON_UUID',
  true, false
);
```

Wait for the next hour, and check logs for:
```
[ReminderService] Running followup reminder check...
[ReminderService] Found 1 leads needing followup reminders
[ReminderService] Sent followup reminder for lead <uuid>
```

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution**: 
```bash
# Check if tables already exist
psql -U user -d db -c "\dt"

# If they exist, drop them first (CAUTION: Only in development!)
psql -U user -d db -c "DROP TABLE IF EXISTS followups CASCADE;"
psql -U user -d db -c "DROP TABLE IF EXISTS sales_targets CASCADE;"
psql -U user -d db -c "DROP TABLE IF EXISTS sales_tasks CASCADE;"
```

### Issue: Cron jobs not running
**Solution**:
```bash
# Check if ScheduleModule is imported in app.module.ts
grep "ScheduleModule" backend/src/app.module.ts

# Check logs for scheduler registration
npm run start:dev | grep "Cron job"
```

### Issue: Authentication errors
**Solution**:
```bash
# Get a valid JWT token first
curl -X POST "http://localhost:5000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}'

# Use the returned token in Authorization header
```

### Issue: Email not sending
**Solution**:
1. Check `.env` configuration
2. Verify email credentials
3. Check if 2FA/App Password is required
4. Look for email errors in logs:
```bash
npm run start:dev | grep "Email"
```

## 📈 Usage Tips

### Best Practices

1. **Follow-ups**:
   - Record every interaction immediately
   - Use interest/budget/timeline scores consistently
   - Always set next follow-up date

2. **Tasks**:
   - Create tasks for important actions
   - Use HIGH priority sparingly (only for hot leads)
   - Link tasks to leads for context

3. **Targets**:
   - Set realistic monthly targets
   - Review and adjust quarterly
   - Encourage self-targets for motivation

4. **Site Visits**:
   - Always update site visit status
   - Record feedback immediately after visit
   - Rate the visit to track property popularity

## 📞 Quick Reference - API Endpoints

### Dashboard
- `GET /sales-dashboard/:salesPersonId` - Get comprehensive dashboard

### Follow-ups
- `POST /followups` - Create follow-up
- `GET /followups/lead/:leadId` - Get lead's follow-ups
- `GET /followups/salesperson/:id/statistics` - Get statistics

### Tasks
- `POST /sales-tasks` - Create task
- `GET /sales-tasks/user/:userId/today` - Today's tasks
- `GET /sales-tasks/user/:userId/upcoming` - Upcoming tasks
- `PATCH /sales-tasks/:id/complete` - Complete task

### Targets
- `POST /sales-targets` - Create target
- `GET /sales-targets/salesperson/:id/active` - Get active target
- `PATCH /sales-targets/:id/update-achievement` - Update achievement
- `GET /sales-targets/team/performance-summary` - Team performance

## ✅ Setup Complete!

Your Sales & CRM module is now ready to use. The sales team can start:
- Recording follow-ups
- Managing tasks
- Tracking towards targets
- Receiving automated reminders

## 🚀 Next: Frontend Development

With the backend complete, the next phase is to build the frontend interfaces:
1. Sales Person Dashboard
2. Lead Management Enhanced
3. Task Scheduler
4. Target Tracker
5. Sales Head Console

---

**Need Help?** Check `SALES_CRM_MODULE_DOCUMENTATION.md` for detailed documentation.

**Status**: Backend ✅ Complete | Database Migration ⏳ Pending | Frontend ⏳ Next Phase



