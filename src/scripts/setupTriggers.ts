const postgres = require('postgres');
require('dotenv/config');

// Make sure to add DATABASE_URL to your .env file
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
}

const sql = postgres(databaseUrl);

async function setupTriggers() {
    console.log('Setting up triggers for Supabase Auth and Prisma integration...');

    try {
        // Check for existing tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public'
        `;
        console.log('Available tables:', tables.map((t: { table_name: string }) => t.table_name));

        // Create function to handle new users in auth.users
        await sql`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public."Profile" (id, role)
        VALUES (NEW.id, 'USER');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
        console.log('✅ Created handle_new_user function');

        // Create trigger for new user creation - first drop if exists
        await sql`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `;

        await sql`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
        console.log('✅ Created on_auth_user_created trigger');

        // Create function to handle user deletion from profile
        await sql`
      CREATE OR REPLACE FUNCTION public.handle_user_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM auth.users WHERE id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
        console.log('✅ Created handle_user_delete function');

        // Create trigger for profile deletion - first drop if exists
        await sql`
      DROP TRIGGER IF EXISTS on_profile_user_deleted ON public."Profile";
    `;

        await sql`
      CREATE TRIGGER on_profile_user_deleted
        AFTER DELETE ON public."Profile"
        FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();
    `;
        console.log('✅ Created on_profile_user_deleted trigger');

        console.log('🚀 Successfully set up all triggers and functions!');
    } catch (error) {
        console.error('❌ Error setting up triggers:', error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

setupTriggers(); 