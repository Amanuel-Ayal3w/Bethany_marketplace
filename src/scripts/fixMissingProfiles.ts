/**
 * This script can be run to find users in auth.users who don't have corresponding
 * profiles in public.Profile and create those profiles for them.
 * 
 * Usage: npx ts-node src/scripts/fixMissingProfiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

async function fixMissingProfiles() {
    try {
        console.log('Fetching users from Supabase auth.users table...');

        // Get all users from auth.users (requires service role key)
        const { data: users, error } = await supabase.auth.admin.listUsers();

        if (error) {
            throw error;
        }

        if (!users || !users.users || users.users.length === 0) {
            console.log('No users found in auth.users');
            return;
        }

        console.log(`Found ${users.users.length} users in auth system`);

        // Check each user for a profile and create if missing
        let created = 0;
        let existing = 0;
        let errors = 0;

        for (const user of users.users) {
            try {
                // Check if profile exists
                const profile = await prisma.profile.findUnique({
                    where: { id: user.id }
                });

                if (profile) {
                    existing++;
                    continue;
                }

                // Create profile if it doesn't exist
                await prisma.profile.create({
                    data: {
                        id: user.id,
                        role: 'USER'
                    }
                });

                created++;
                console.log(`Created profile for user ${user.id} (${user.email})`);
            } catch (err) {
                errors++;
                console.error(`Failed to process user ${user.id}:`, err);
            }
        }

        console.log(`
Summary:
- Users checked: ${users.users.length}
- Profiles already existing: ${existing}
- Profiles created: ${created}
- Errors: ${errors}
    `);

    } catch (error) {
        console.error('Error fixing missing profiles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
fixMissingProfiles()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 