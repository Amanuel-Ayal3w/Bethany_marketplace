// List all users from Supabase Auth and Profile table
require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const prisma = new PrismaClient();

async function listUsers() {
    try {
        console.log('Fetching users from Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching Auth users:', authError);
        } else {
            console.log('Auth Users:');
            console.table(
                authData.users.map(user => ({
                    id: user.id,
                    email: user.email,
                    confirmed: !!user.confirmed_at,
                    created_at: user.created_at,
                    last_sign_in: user.last_sign_in_at
                }))
            );
        }

        console.log('\nFetching profiles from database...');
        const profiles = await prisma.profile.findMany();
        console.log('Profiles:');
        console.table(profiles);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers(); 