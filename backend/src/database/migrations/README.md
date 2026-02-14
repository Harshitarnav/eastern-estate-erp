# Foreign Key Migration Script

This script adds foreign key constraints to your database tables to enable relationship visualization.

## Why Do I Need This?

Your database currently doesn't have foreign key constraints defined. While TypeORM's `@ManyToOne` decorators create the columns, they don't create actual FOREIGN KEY constraints in PostgreSQL when `synchronize: false`.

Foreign key constraints are needed for:
- **Database Relationships Visualization** in the UI
- **Referential Integrity** (prevent orphaned records)
- **Better Query Planning** (PostgreSQL optimizer)
- **Documentation** of table relationships

## How to Run

### Option 1: Using psql command line

```bash
# Navigate to backend directory
cd backend

# Run the migration
psql -h localhost -U your_username -d eastern_estate_db -f src/database/migrations/add-foreign-keys.sql
```

### Option 2: Using a database client

1. Open your preferred database client (DBeaver, pgAdmin, DataGrip, etc.)
2. Connect to your `eastern_estate_db` database
3. Open the file `backend/src/database/migrations/add-foreign-keys.sql`
4. Execute the SQL script

### Option 3: Using npm script (recommended)

Add this to your `package.json` scripts:

```json
"scripts": {
  "migrate:fk": "psql -h localhost -U postgres -d eastern_estate_db -f src/database/migrations/add-foreign-keys.sql"
}
```

Then run:

```bash
npm run migrate:fk
```

## What This Does

The migration adds foreign key constraints for:

- **Properties** ← → Users (creators/updaters)
- **Towers** ← → Properties, Users
- **Flats** ← → Properties, Towers, Customers, Users
- **Bookings** ← → Customers, Flats, Properties, Users
- **Leads** ← → Properties, Users (assigned_to)
- **Payments** ← → Bookings, Customers, Flats, Users
- **Customers** ← → Users
- **Employees** ← → Users, Employees (manager)
- **Notifications** ← → Users
- **Chat Messages** ← → Users (sender/receiver)
- **Accounts** ← → Accounts (parent)
- **Transactions** ← → Accounts, Users
- **Purchase Orders** ← → Vendors, Properties, Users
- **Vendor Payments** ← → Vendors, Purchase Orders, Users
- **Construction Updates** ← → Properties, Users
- **Materials** ← → Properties, Users
- **Demand Drafts** ← → Flats, Customers, Bookings, Users
- **Vendors** ← → Users
- **Marketing Campaigns** ← → Properties, Users

## After Running

1. Refresh the **Database → Relationships** page in the UI
2. You should see a beautiful relationship diagram
3. All foreign keys will be visualized with arrows showing connections

## Safety

- Uses `DROP CONSTRAINT IF EXISTS` to safely rerun
- Won't lose any data
- Only adds constraints, doesn't modify data
- Uses appropriate `ON DELETE` actions:
  - `CASCADE`: Delete related records (e.g., delete property → delete towers)
  - `SET NULL`: Keep record but clear reference (e.g., delete user → keep record but set created_by to NULL)

## Verification

After running, check the count:

```sql
SELECT COUNT(*) as foreign_key_count 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';
```

You should see 70+ foreign key constraints created!

## Troubleshooting

### "column does not exist"

Some columns might not exist in your database. The script will continue past errors, but you may want to:

1. Check your actual database schema
2. Comment out constraints for non-existent columns
3. Run the rest of the migration

### "violates foreign key constraint"

If you have orphaned data (e.g., a flat references a non-existent property), you'll need to clean it up first:

```sql
-- Find orphaned flats
SELECT f.id, f.flat_number, f.property_id 
FROM flats f 
LEFT JOIN properties p ON f.property_id = p.id 
WHERE p.id IS NULL;

-- Fix or delete orphaned records
```

### Permission denied

Make sure you're running as a user with `ALTER TABLE` privileges (typically the database owner or superuser).

## Next Steps

After adding foreign keys:

1. **Verify in UI**: Check Database → Relationships page
2. **Test Referential Integrity**: Try deleting a property that has towers (should cascade)
3. **Update Schema Sync Services**: Consider adding these FK constraints to your schema-sync services for future deployments

---

**Note**: This is a one-time migration. Future deployments should include foreign key definitions in the schema sync services.
