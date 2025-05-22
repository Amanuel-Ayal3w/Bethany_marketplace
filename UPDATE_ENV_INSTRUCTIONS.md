# Update Environment Variables

To solve the database permission issues, you need to update your `.env` file with a modified connection string. Follow these steps:

1. Open your `.env` file
2. Find the `DATABASE_URL` line
3. Comment out the original line by adding `#` at the beginning
4. Add the new connection string with search_path and application_name parameters

Here's how your updated section should look:

```
# === DATABASE CONNECTION (for Prisma and your app) ===
# Original connection
# DATABASE_URL="postgresql://postgres.kgiagyltfokpoelrlksj:ENCRTH29@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
# Using modified connection to fix permissions issue
DATABASE_URL="postgresql://postgres.kgiagyltfokpoelrlksj:ENCRTH29@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?options=--search_path%3Dpublic%26application_name%3Dsupabase"
```

Alternatively, you can use the service role connection:

```
# Using service role to fix permissions issue (if previous option doesn't work)
DATABASE_URL="postgresql://postgres.kgiagyltfokpoelrlksj:[USE-YOUR-SERVICE-ROLE-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

After making this change, restart your application. This will allow Prisma to access the database tables correctly.

## Why This Works

The modified connection string:
1. Explicitly sets the search_path to the public schema
2. Sets the application_name, which can help with connection pooling 
3. Ensures that Prisma connects with the right permissions

This is a temporary solution. For a permanent fix, apply the SQL commands in the `fix_permissions.sql` file through the Supabase SQL Editor. 