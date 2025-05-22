const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service_role key
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabasePermissions() {
    console.log('🛠️ Fixing database permissions...');

    try {
        // Check if Settings table exists
        const { data: settingsData, error: settingsError } = await supabase
            .from('Settings')
            .select('count(*)', { count: 'exact' })
            .limit(1);

        if (settingsError) {
            console.error('Error checking Settings table:', settingsError);
            console.log('Attempting to create Settings table...');

            // Try to create the Settings table
            const { error: createError } = await supabase.rpc('create_settings_table');

            if (createError) {
                console.error('Failed to create Settings table:', createError);
                console.log('\nManual SQL commands to run in the Supabase SQL editor:');
                console.log(`
-- Create Settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Settings" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON "Settings" FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON "Settings" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON "Settings" FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default footer settings
INSERT INTO "Settings" (key, value) 
VALUES ('footer', '{"contactPhone":"+49 30 575909881","contactAddress":"685 Market Street, San Francisco, CA 94105, US","contactEmail":"contact@bethanymarketplace.com","socialLinks":{"facebook":"https://www.facebook.com","instagram":"https://www.instagram.com","twitter":"https://www.twitter.com","linkedin":"https://www.linkedin.com"}}') 
ON CONFLICT (key) DO NOTHING;
        `);
            } else {
                console.log('✅ Settings table created successfully');
            }
        } else {
            console.log(`✅ Settings table exists with ${settingsData.count} records`);
        }

        // Check and fix model tables permissions
        console.log('Checking Prisma model tables...');

        const tables = [
            'Category', 'FeaturedCategory', 'Category_OptionSet', 'OptionSet',
            'Category_SpecGroup', 'SpecGroup', 'Product', 'Brand', 'PageVisit',
            'Profile', 'Account', 'User', 'FeaturedBanner', 'HomepageBrand',
            'ProductReview', 'SiteSettings'
        ];

        for (const table of tables) {
            console.log(`Checking permissions for ${table}...`);

            // Verify if table exists by trying to count records
            const { error: tableError } = await supabase
                .from(table)
                .select('id')
                .limit(1);

            if (tableError) {
                console.error(`Error accessing ${table}: ${tableError.message}`);
                console.log(`Grant permissions command for ${table}:`);
                console.log(`GRANT ALL PRIVILEGES ON TABLE "${table}" TO postgres, anon, authenticated, service_role;`);
            } else {
                console.log(`✅ ${table} is accessible`);
            }
        }

        console.log('\nIf you encountered any errors, please run the suggested SQL commands in the Supabase SQL editor.');
        console.log('You can access it at: https://kgiagyltfokpoelrlksj.supabase.co/project/sql');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

fixDatabasePermissions()
    .then(() => {
        console.log('🎉 Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }); 