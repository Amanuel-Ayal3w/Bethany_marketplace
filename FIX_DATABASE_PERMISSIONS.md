# Fixing Database Permissions Issue

## Problem

The application is encountering the following error:

```
{
  code: '42501',
  message: 'permission denied for schema public',
  details: null,
  hint: null
}
```

This error occurs because the PostgreSQL user doesn't have the necessary permissions to access the public schema in the Supabase database.

## Solution

To fix this issue, you need to grant the appropriate permissions to your database roles. Here's how to do it:

### Option 1: Run SQL Scripts in Supabase SQL Editor

1. Log into your Supabase dashboard: https://kgiagyltfokpoelrlksj.supabase.co/
2. Go to the SQL Editor section
3. Create a new query
4. Copy and paste the contents of the `fix_permissions.sql` file from this project
5. Run the SQL commands

The SQL script will:
- Grant schema usage permissions to all necessary roles
- Grant appropriate table privileges
- Set default privileges for future tables
- Create the Settings table if it doesn't exist
- Create necessary RLS policies
- Insert default footer settings

### Option 2: Update Database Connection URL

If you don't have access to the Supabase dashboard or prefer not to modify the database schema, you can use a service role connection instead:

1. Open your `.env` file
2. Replace the `DATABASE_URL` with the service role connection string:

```
DATABASE_URL="postgresql://postgres.kgiagyltfokpoelrlksj:[YOUR-SERVICE-ROLE-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

3. Save the file and restart your application

### Option 3: Contact Your Database Administrator

If you don't have sufficient permissions to make these changes, please contact your database administrator and share the `fix_permissions.sql` file with them, explaining that you need permissions to the public schema.

## Verifying the Fix

After applying one of the solutions, you can verify the fix by:

1. Restarting your application
2. Navigating to the footer settings page
3. Making a small change and saving it

If you no longer see the permission error, the fix was successful.

## Understanding the Issue

This issue occurs due to improper permission setup when the database was created. In Supabase, this can happen when:

1. The database was created without proper role permissions
2. Recent changes to Supabase's security model weren't accounted for
3. Row Level Security (RLS) policies are blocking access

The solution provided above addresses all of these potential causes. 