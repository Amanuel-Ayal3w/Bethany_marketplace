# Admin Access Fix

This guide explains how to fix admin access in the Bethany Marketplace application.

## Issue

The main issue is that the application was trying to check for admin access using both Prisma and Supabase, but there were database connection issues preventing this from working correctly.

## Quick Fix (Already Implemented)

We've already implemented a quick fix by adding your email (`amanuel.ayalew@aait.edu.et`) to the hard-coded admin list in these files:

- `src/app/admin/layout.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/api/admin/users/route.ts`

This means that even if the database check fails, you'll still have admin access based on your email.

## How to Fix Admin Access Permanently

To permanently fix the issue by updating your database record:

1. Ensure your Supabase credentials are in your `.env` file:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the script to update your role:

   ```bash
   node src/scripts/promoteUser.js
   ```

   This will update your user profile to have the ADMIN role.

3. If the above script fails, try the more general script:

   ```bash
   node src/scripts/makeUserAdmin.js amanuel.ayalew@aait.edu.et
   ```

## Adding Other Admins

To add other admins, you can:

1. Add their email to the admin list in the files mentioned above
2. Use the admin UI you've just fixed to create admin users
3. Run the script with their email:

   ```bash
   node src/scripts/makeUserAdmin.js their-email@example.com
   ```

## Database Connection Issues

If you're still experiencing database connection issues with Prisma, you may need to:

1. Check your database connection URL in `.env`
2. Make sure your IP address is allowed in Supabase's settings
3. Consider switching fully to Supabase client instead of using Prisma

## Long-term Solution

For a more robust long-term solution:

1. Implement a proper role-based access control system
2. Store roles in a reliable database table
3. Set up proper database connection pooling
4. Add proper error handling throughout the application 