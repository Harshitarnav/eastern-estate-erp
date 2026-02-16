# Employee Profile Picture Migration

This migration adds a `profile_picture` column to the `employees` table to store employee photos for ID card generation.

## Changes Made

- Added `profile_picture` TEXT column to `employees` table (nullable)
- The column stores the URL of the uploaded employee profile picture

## How to Run

### Option 1: Using psql command line

```bash
# Navigate to backend directory
cd backend

# Run the migration
psql -h localhost -U postgres -d eastern_estate_db -f src/database/migrations/add-employee-profile-picture.sql
```

### Option 2: Using a database client

1. Open your preferred database client (DBeaver, pgAdmin, DataGrip, etc.)
2. Connect to your `eastern_estate_db` database
3. Open the file `backend/src/database/migrations/add-employee-profile-picture.sql`
4. Execute the SQL script

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'profile_picture';
```

Expected output:
```
column_name      | data_type | is_nullable
-----------------|-----------|------------
profile_picture  | text      | YES
```

## Rollback

If you need to rollback this migration:

```sql
ALTER TABLE employees DROP COLUMN IF EXISTS profile_picture;
```

## Related Changes

This migration is part of the HR module enhancement which includes:
- Frontend: Profile picture upload field in employee form
- Backend: ProfilePicture field in Employee entity and DTOs
- Upload service integration for handling file uploads
