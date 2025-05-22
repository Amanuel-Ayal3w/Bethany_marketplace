// Script to promote a user to admin role
// Run with: node src/scripts/makeUserAdmin.js <user_email>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate arguments
const userEmail = process.argv[2];
if (!userEmail) {
    console.error('Please provide a user email as an argument');
    console.error('Usage: node src/scripts/makeUserAdmin.js <user_email>');
    process.exit(1);
}

async function makeUserAdmin() {
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // First, get the user ID from the email
        console.log(`Looking up user with email: ${userEmail}`);
        const { data: userData, error: userError } = await supabase
            .from('auth.users')  // This might vary based on your Supabase setup
            .select('id')
            .eq('email', userEmail)
            .single();

        if (userError) {
            // Try to get the user from the auth API directly
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

            if (authError) {
                throw new Error(`Failed to fetch users: ${authError.message}`);
            }

            const user = authData.users.find(u => u.email === userEmail);

            if (!user) {
                throw new Error(`User with email ${userEmail} not found`);
            }

            // Update the user role in the Profile table
            const now = new Date().toISOString();
            console.log(`Updating role for user ID: ${user.id}`);

            // Check if profile exists
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from('Profile')
                .select('id, role')
                .eq('id', user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                throw new Error(`Error checking profile: ${profileCheckError.message}`);
            }

            if (!existingProfile) {
                // Insert new profile
                const { error: insertError } = await supabase
                    .from('Profile')
                    .insert([{
                        id: user.id,
                        role: 'ADMIN',
                        createdAt: now,
                        updatedAt: now
                    }]);

                if (insertError) {
                    throw new Error(`Failed to create admin profile: ${insertError.message}`);
                }

                console.log(`Created new profile with ADMIN role for ${userEmail}`);
            } else {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('Profile')
                    .update({
                        role: 'ADMIN',
                        updatedAt: now
                    })
                    .eq('id', user.id);

                if (updateError) {
                    throw new Error(`Failed to update profile: ${updateError.message}`);
                }

                console.log(`Updated profile role from ${existingProfile.role} to ADMIN for ${userEmail}`);
            }

            console.log('User is now an admin!');
            return;
        }

        // If we got the user ID directly
        const userId = userData.id;
        console.log(`Found user ID: ${userId}`);

        // Update the user role in the Profile table
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('Profile')
            .update({
                role: 'ADMIN',
                updatedAt: now
            })
            .eq('id', userId);

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        console.log(`User ${userEmail} is now an admin!`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

makeUserAdmin(); 