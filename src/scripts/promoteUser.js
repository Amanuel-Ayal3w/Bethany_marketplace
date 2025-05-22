// Script to directly promote a specific user to admin role
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// User ID to promote to admin (from logs)
const userId = '29e29246-810d-40cf-bae7-7b565e5fa18e';

async function promoteUserToAdmin() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not found in environment variables.');
        console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
        process.exit(1);
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log(`Attempting to promote user ${userId} to ADMIN role...`);

        // Update the user role in the Profile table
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('Profile')
            .update({
                role: 'ADMIN',
                updatedAt: now
            })
            .eq('id', userId)
            .select();

        if (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }

        if (data && data.length > 0) {
            console.log(`Successfully updated user to ADMIN role!`);
            console.log(`User details: `, data[0]);
        } else {
            console.log(`User profile was not found. Creating new profile...`);

            // Create a new profile with ADMIN role
            const { data: insertData, error: insertError } = await supabase
                .from('Profile')
                .insert([{
                    id: userId,
                    role: 'ADMIN',
                    createdAt: now,
                    updatedAt: now
                }])
                .select();

            if (insertError) {
                throw new Error(`Failed to create profile: ${insertError.message}`);
            }

            console.log(`Successfully created ADMIN profile!`);
            console.log(`User details: `, insertData[0]);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

promoteUserToAdmin(); 