# Quick Fix: Add profile_picture column to employees table

## The Problem
The backend code expects a `profile_picture` column in the `employees` table, but it doesn't exist in your database yet. This causes a 500 error when trying to view the employees page.

## The Solution (Required!)
Run this SQL command in your PostgreSQL database:

```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;
```

## How to Run It

### Option 1: Using Database GUI (Easiest & Recommended)
1. Open your database client (DBeaver, pgAdmin, TablePlus, Postico, etc.)
2. Connect to your `eastern_estate_db` database
3. Open a new SQL query window
4. Paste and execute: 
   ```sql
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;
   ```

### Option 2: Using your App's Database Section
If your app has a database query interface:
1. Navigate to Database section in your app
2. Look for SQL query or command executor
3. Run the SQL command above

### Option 3: Using psql command line
```bash
# First, find your database credentials from backend/.env file
# Look for: DB_HOST, DB_PORT, DB_USERNAME, DB_NAME

# Then run (replace <your_username> with your actual username):
psql -h localhost -U <your_username> -d eastern_estate_db -c "ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL;"
```

**Common database users to try:**
- `postgres` (default)
- Your Mac username
- `admin`

## Verify It Worked
Run this query to confirm the column was added:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'profile_picture';
```

**Expected result:**
```
column_name      | data_type | is_nullable
-----------------|-----------|------------
profile_picture  | text      | YES
```

## After Running the Migration

1. **Refresh your browser** - Clear cache if needed (Cmd+Shift+R on Mac)
2. **Navigate to `/employees` page** - Error should be gone!
3. **Test the features:**
   - View employees list with profile picture placeholders
   - Add new employee with profile picture
   - Edit existing employee and add/change picture

## What Was Fixed in the Code

I've also fixed these issues in your code:

1. ✅ **Upload service response handling** - Fixed `.url` access issue
2. ✅ **Data cleaning** - Remove empty/invalid fields before submission  
3. ✅ **Better error handling** - More informative error messages
4. ✅ **Profile picture display** - Beautiful circular avatars with fallbacks

## Files Modified

- `frontend/src/app/(dashboard)/employees/new/page.tsx` - Better upload handling
- `frontend/src/app/(dashboard)/employees/[id]/edit/page.tsx` - Better upload handling
- Backend entity already has the field defined (ready for migration)

## Still Getting Errors?

If you still see errors after running the migration:

1. **Check the backend console** - Look for specific error messages
2. **Restart the backend** - Sometimes TypeORM needs a restart
3. **Verify the column exists**:
   ```sql
   \d employees  -- In psql
   -- OR
   SELECT * FROM information_schema.columns WHERE table_name = 'employees';
   ```
4. **Check upload directory permissions** - Make sure the backend can write uploaded files

## Migration File Location

The complete migration script is at:
```
backend/src/database/migrations/add-employee-profile-picture.sql
```

## Need Help?

If you're having trouble finding your database credentials:
1. Look in `backend/.env` file (you'll need to use terminal or code editor)
2. Common location: `/Users/arnav/Desktop/Train-Rex.nosync/eastern-estate-erp/backend/.env`
3. Look for these variables:
   - `DB_HOST` (usually `localhost`)
   - `DB_PORT` (usually `5432`)
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_NAME` (should be `eastern_estate_db`)

