// Migration script for creating Settings table
// Run with: node src/scripts/migrations/createSettingsTable.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Default footer settings for seeding
const DEFAULT_FOOTER_SETTINGS = {
    contactPhone: "+49 30 575909881",
    contactAddress: "685 Market Street, San Francisco, CA 94105, US",
    contactEmail: "contact@bethanymarketplace.com",
    socialLinks: {
        facebook: "https://www.facebook.com",
        instagram: "https://www.instagram.com",
        twitter: "https://www.twitter.com",
        linkedin: "https://www.linkedin.com"
    }
};

async function createSettingsTable() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not found in environment variables.');
        console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Creating Settings table...');

        // Check if Settings table exists
        const { error: checkError } = await supabase
            .from('Settings')
            .select('id')
            .limit(1);

        if (checkError && checkError.code !== 'PGRST116') {
            // Create the table using Supabase SQL
            const { error: createError } = await supabase.rpc('create_settings_table', {});

            if (createError) {
                // If RPC fails, display a manual SQL command
                console.error('Failed to create table automatically. Please run this SQL in your Supabase SQL Editor:');
                console.error(`
CREATE TABLE IF NOT EXISTS public."Settings" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public."Settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to authenticated users with admin role" ON public."Settings"
  USING (EXISTS (
    SELECT 1 FROM public."Profile"
    WHERE id = auth.uid() AND role = 'ADMIN'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public."Profile"
    WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Allow public read access" ON public."Settings"
  FOR SELECT USING (true);
        `);
                throw new Error('Failed to create Settings table: ' + createError.message);
            }

            console.log('Settings table created successfully.');
        } else {
            console.log('Settings table already exists.');
        }

        // Seed with default footer settings
        const { data: existingSettings, error: existingError } = await supabase
            .from('Settings')
            .select('id')
            .eq('key', 'footer')
            .single();

        if (existingError && existingError.code === 'PGRST116') {
            console.log('Adding default footer settings...');

            const { error: insertError } = await supabase
                .from('Settings')
                .insert({
                    key: 'footer',
                    value: DEFAULT_FOOTER_SETTINGS,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

            if (insertError) {
                throw new Error('Failed to add default footer settings: ' + insertError.message);
            }

            console.log('Default footer settings added successfully.');
        } else {
            console.log('Footer settings already exist. Skipping seeding.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

createSettingsTable(); 