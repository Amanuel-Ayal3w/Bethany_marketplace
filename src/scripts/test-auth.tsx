const { createClient } = require('@supabase/supabase-js');
const pgClient = require('postgres');
require('dotenv/config');

// Define types for database tables
type TableRecord = {
    table_name: string;
};

type TriggerRecord = {
    trigger_name: string;
};

async function testAuth() {
    try {
        console.log('🔍 Testing Supabase Auth configuration...\n');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const databaseUrl = process.env.DATABASE_URL;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
        }

        if (!supabaseServiceKey) {
            console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Some operations may fail due to permission issues.');
        }

        if (!databaseUrl) {
            console.warn('⚠️ DATABASE_URL is not set. Direct database connection test will be skipped.');
        }

        // Part 1: Test Supabase Auth client connection
        console.log('1️⃣ Testing Supabase Auth client connection:');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        console.log('✅ Successfully connected to Supabase Auth with anon key');
        console.log('Session status:', data.session ? 'Active session found' : 'No active session');

        // Part 2: Test Supabase Database with service role key
        console.log('\n2️⃣ Testing Supabase Database access with service role key:');

        if (supabaseServiceKey) {
            const adminClient = createClient(supabaseUrl, supabaseServiceKey);

            try {
                // Check if Profile table exists
                const { data: tableData, error: tableError } = await adminClient
                    .from('Profile')
                    .select('*')
                    .limit(1);

                if (tableError) {
                    console.warn('⚠️ Could not query Profile table:', tableError.message);
                } else {
                    console.log('✅ Successfully connected to database and queried Profile table');
                    console.log('Profile records found:', tableData.length);
                }
            } catch (err) {
                console.error('❌ Error testing database access with service role key:', err);
            }
        } else {
            console.warn('⚠️ Skipping service role key test (not provided)');
        }

        // Part 3: Test direct PostgreSQL connection if DATABASE_URL is available
        console.log('\n3️⃣ Testing direct PostgreSQL connection:');

        if (databaseUrl) {
            try {
                const sql = pgClient(databaseUrl);

                // Check available tables
                const tables: TableRecord[] = await sql`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema='public'
                `;

                console.log('✅ Successfully connected to PostgreSQL database');
                console.log('Available tables:', tables.map((t: TableRecord) => t.table_name).join(', '));

                // Check if Profile table exists
                const profileExists = tables.some((t: TableRecord) => t.table_name === 'Profile');

                if (profileExists) {
                    console.log('✅ Profile table exists');

                    // Check for records in Profile table
                    const profiles = await sql`SELECT * FROM public."Profile" LIMIT 5`;
                    console.log(`Found ${profiles.length} profiles in the database`);
                } else {
                    console.warn('⚠️ Profile table does not exist in the database');
                    console.log('Available tables are:', tables.map((t: TableRecord) => t.table_name).join(', '));
                }

                // Check for triggers across all schemas using pg_trigger
                console.log('\n4️⃣ Checking auth triggers:');
                try {
                    const allTriggers = await sql`
                        SELECT 
                            tgname AS trigger_name,
                            relname AS table_name,
                            nspname AS schema_name
                        FROM pg_trigger
                        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
                        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
                        WHERE NOT tgisinternal
                    `;

                    if (allTriggers.length === 0) {
                        console.log('⚠️ No triggers found in the database');
                    } else {
                        // Filter for auth-related triggers
                        const authTriggers = allTriggers.filter((t: any) =>
                            t.schema_name === 'auth' ||
                            (t.schema_name === 'public' && (
                                t.trigger_name.includes('user') ||
                                t.trigger_name.includes('auth') ||
                                t.trigger_name.includes('profile')
                            ))
                        );

                        if (authTriggers.length === 0) {
                            console.log('⚠️ No auth-related triggers found');
                        } else {
                            console.log('✅ Found the following auth-related triggers:');
                            authTriggers.forEach((t: any) => {
                                console.log(`- ${t.trigger_name} on ${t.schema_name}.${t.table_name}`);
                            });
                        }
                    }
                } catch (err) {
                    console.warn('⚠️ Could not query pg_trigger:', err);
                }

                await sql.end();
            } catch (err) {
                console.error('❌ Error connecting directly to PostgreSQL:', err);
            }
        } else {
            console.warn('⚠️ Skipping direct PostgreSQL connection test (DATABASE_URL not provided)');
        }

        console.log('\n✨ Supabase Auth testing completed!');
        console.log('Next steps:');
        console.log('1. Make sure the Profile table exists in the public schema');
        console.log('2. Verify that both auth.users and public.Profile triggers are set up');
        console.log('3. Ensure your Supabase project has the correct permissions set up');

    } catch (error) {
        console.error('❌ Supabase Auth test failed:', error);
    }
}

testAuth(); 