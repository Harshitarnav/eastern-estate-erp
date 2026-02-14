# Database Editor Guide

## Overview

This guide covers the new **Database Editor** feature that allows you to view, edit, create, and delete records directly from the UI. This is a powerful tool for managing your database without needing to write SQL or use external database tools.

---

## Features

### ✅ What You Can Do

1. **View Data**
   - Browse all tables in your database
   - View records with pagination
   - Search across all text columns
   - Sort by any column (ascending/descending)
   - Export data to CSV

2. **Edit Records**
   - Inline editing of existing records
   - Edit any field except primary keys
   - Real-time validation
   - Save or cancel changes

3. **Create Records**
   - Add new records through a user-friendly dialog
   - Auto-generated primary keys (where applicable)
   - Field-by-field input with labels

4. **Delete Records**
   - Delete records with confirmation dialog
   - View record details before deletion
   - Safe deletion based on primary keys

---

## How to Use

### Accessing the Database Editor

1. Navigate to **Database → Data Viewer** in the sidebar
2. You'll see the Database Viewer & Editor page

### Viewing Data

1. **Select a table** from the dropdown menu
2. The data will load automatically with pagination
3. Use the controls:
   - **Search**: Type to search across text fields
   - **Rows per page**: Choose 10, 25, 50, or 100 rows
   - **Sort**: Click on column headers to sort
   - **Export CSV**: Download the current view as CSV

### Enabling Edit Mode

1. Click the **"Edit Mode"** button in the top-right corner
2. An alert will appear confirming edit mode is active
3. You'll see action buttons appear on each row
4. The **"Add New Record"** button appears at the top

### Editing a Record

1. **Enable Edit Mode** first
2. Click the **Edit icon (pencil)** next to the row you want to modify
3. The row becomes editable:
   - Text fields appear as input boxes
   - Primary key fields remain read-only (marked with "PK" badge)
4. Make your changes
5. Click **Save (checkmark icon)** to confirm
6. Or click **Cancel (X icon)** to discard changes

**Notes:**
- Only one row can be edited at a time
- Primary keys cannot be modified
- Changes are saved to the database immediately

### Creating a New Record

1. **Enable Edit Mode** first
2. Click **"Add New Record"** button
3. A dialog opens with all fields:
   - Primary key fields are excluded (auto-generated)
   - All other fields are optional
4. Fill in the fields you want to set
5. Click **"Create Record"**
6. The new record is added and the table refreshes

**Tips:**
- Leave fields blank to use database defaults or NULL
- Primary keys are auto-generated if your table supports it
- The dialog will show if a table only has primary key columns

### Deleting a Record

1. **Enable Edit Mode** first
2. Click the **Delete icon (trash)** next to the row
3. A confirmation dialog appears showing:
   - All field values of the record
   - Warning that action cannot be undone
4. Click **"Delete"** to confirm
5. Or click **"Cancel"** to abort

**Warning:** Deletion is permanent and cannot be undone!

---

## User Interface Guide

### Main Controls

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] Database Viewer & Editor     [Edit Mode] [Refresh]  │
└─────────────────────────────────────────────────────────────┘
```

- **Back**: Return to Database Explorer
- **Edit Mode**: Toggle edit/create/delete capabilities
- **Refresh**: Reload current table data

### Table Controls

```
┌────────────────────────────────────────────────────────┐
│  Select Table: [Dropdown]                              │
│  Search: [______]                                      │
│  Rows per page: [10▼]                                  │
│  [Export CSV]                                          │
│  [Add New Record]  ← Only in Edit Mode                 │
└────────────────────────────────────────────────────────┘
```

### Data Table

```
┌──────────────────────────────────────────────────────────┐
│ Actions  │ id (PK) │ name      │ email      │ created_at │
├──────────┼─────────┼───────────┼────────────┼────────────┤
│ [✎] [🗑]│    1    │ John Doe  │ john@...   │ 2024-...   │
│ [✎] [🗑]│    2    │ Jane Smith│ jane@...   │ 2024-...   │
└──────────────────────────────────────────────────────────┘
```

**Column Features:**
- **(PK)** badge: Indicates primary key columns
- **↑/↓ arrows**: Shows active sort direction
- **Click header**: Sort by that column

### Editing Interface

When editing a row:
```
┌──────────────────────────────────────────────────────────┐
│ [✓] [✗] │ id (PK) │ name         │ email           │     │
├─────────┼─────────┼──────────────┼─────────────────┤     │
│ Save/X  │    1    │ [John Doe___]│ [john@...____]  │     │
└──────────────────────────────────────────────────────────┘
```

- **[✓]**: Save changes
- **[✗]**: Cancel editing
- Editable fields show as input boxes
- Primary keys remain read-only

---

## Security & Permissions

### Who Can Use This Feature?

- **Super Admin**: Full access (view, edit, create, delete)
- **Admin**: Full access (view, edit, create, delete)
- **Other Roles**: No access to database editor

### Safety Features

1. **Primary Key Protection**: Primary keys cannot be edited
2. **Confirmation Dialogs**: Deletion requires confirmation
3. **Transaction Safety**: Each operation is atomic
4. **Error Handling**: Clear error messages for failed operations
5. **Role-Based Access**: Only authorized users can access

---

## Technical Details

### Backend API Endpoints

All endpoints require authentication and admin/super_admin role:

```
GET    /api/v1/database/tables/:tableName/primary-keys
PUT    /api/v1/database/tables/:tableName/records
POST   /api/v1/database/tables/:tableName/records
DELETE /api/v1/database/tables/:tableName/records
```

### Data Types Handled

The editor automatically handles:
- **Text**: String, VARCHAR, TEXT
- **Numbers**: INTEGER, BIGINT, DECIMAL, NUMERIC
- **Booleans**: True/False values
- **Dates**: Timestamps and dates
- **JSON**: Displayed as formatted code
- **NULL**: Displayed as gray italic "null"

### Limitations

1. **Primary Keys**: Cannot be edited (read-only)
2. **Auto-generated Fields**: Some fields may be database-managed
3. **Foreign Keys**: No dropdown of related records (yet)
4. **Complex Types**: Arrays and complex JSON may need manual entry
5. **Large Text**: Fields over 50 characters are truncated in display (full text on hover)

---

## Best Practices

### When to Use the Editor

✅ **Good Use Cases:**
- Quick data fixes and corrections
- Adding test data during development
- Viewing related records
- Exporting data for analysis
- Managing lookup/reference tables

❌ **Avoid Using For:**
- Bulk data imports (use SQL or migrations)
- Complex multi-table operations
- Production data without backups
- Modifying system-critical tables

### Safety Tips

1. **Always enable Edit Mode consciously** - it's off by default for a reason
2. **Review before deleting** - deletion is permanent
3. **Use backups** - especially before bulk changes
4. **Test on development first** - don't edit production directly
5. **Check relationships** - be aware of foreign key constraints
6. **Use transactions** - for complex multi-record changes, use SQL

---

## Troubleshooting

### "Failed to update record"

**Possible causes:**
- Foreign key constraint violation
- Data type mismatch
- Field validation failed
- Database connection issue

**Solutions:**
1. Check that foreign key references exist
2. Ensure data types match (e.g., numbers not text)
3. Review database constraints
4. Check server logs for detailed error

### "Failed to create record"

**Possible causes:**
- Required field missing
- Duplicate unique key
- Invalid data format
- Auto-increment not configured

**Solutions:**
1. Check which fields are required (NOT NULL)
2. Ensure unique fields have unique values
3. Use correct data formats (e.g., valid email)
4. Verify primary key is auto-generated or provide value

### "Failed to delete record"

**Possible causes:**
- Foreign key constraint (other records reference this)
- Database permission issue
- Record doesn't exist anymore

**Solutions:**
1. Delete dependent records first
2. Check database user permissions
3. Refresh the table to see current state

### Table shows "No data found"

**Possible causes:**
- Table is actually empty
- Search filter is too restrictive
- Pagination issue

**Solutions:**
1. Clear search box
2. Check total record count
3. Reset to page 1
4. Refresh the data

---

## Examples

### Example 1: Editing a User's Email

1. Go to **Database → Data Viewer**
2. Select **"users"** table
3. Click **"Edit Mode"**
4. Find the user (use search if needed)
5. Click **Edit icon** on their row
6. Change the email field
7. Click **Save**
8. Confirmation toast appears

### Example 2: Adding a New Product

1. Go to **Database → Data Viewer**
2. Select **"products"** table
3. Click **"Edit Mode"**
4. Click **"Add New Record"**
5. Fill in:
   - name: "New Widget"
   - price: "29.99"
   - category: "Electronics"
6. Click **"Create Record"**
7. New product appears in the list

### Example 3: Deleting Old Records

1. Go to **Database → Data Viewer**
2. Select the table
3. Sort by date (click column header)
4. Click **"Edit Mode"**
5. For each old record:
   - Click **Delete icon**
   - Review in confirmation dialog
   - Click **"Delete"**
6. Record is removed

---

## Advanced Features

### CSV Export

The CSV export feature:
- Exports currently filtered/searched data
- Includes all visible columns
- Formats dates and timestamps
- Handles NULL values as "NULL"
- Escapes special characters
- Names file: `{tablename}_{timestamp}.csv`

### Search Functionality

Search behavior:
- Searches across all text-based columns
- Case-insensitive matching
- Partial matching (contains)
- Resets to page 1 automatically
- Combines with sorting

### Pagination

Smart pagination:
- Maintains position on refresh
- Adjusts when changing page size
- Shows: "Showing X-Y of Z records"
- Keyboard-friendly navigation

---

## Future Enhancements

Planned features:
- [ ] Foreign key dropdowns (select related records)
- [ ] Bulk edit operations
- [ ] Column filtering (show/hide columns)
- [ ] Advanced search (per-column filters)
- [ ] Import CSV data
- [ ] Audit trail (see who changed what)
- [ ] Keyboard shortcuts
- [ ] Field validation with hints
- [ ] Rich text editors for JSON fields

---

## Related Documentation

- [Database Reference](./DATABASE_REFERENCE.md) - Full database schema
- [Onboarding Guide](./ONBOARDING_GUIDE.md) - Getting started with the codebase
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

---

## Support

If you encounter issues:

1. **Check the browser console** for error details
2. **Check backend logs** (`backend/` terminal)
3. **Verify database connection** is working
4. **Confirm user permissions** (admin or super_admin role)
5. **Review this guide** for usage instructions

For bugs or feature requests, please create an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser console errors
- Backend logs

---

**Happy Database Editing! 🎉**

Remember: With great power comes great responsibility. Always double-check before deleting or modifying production data.
