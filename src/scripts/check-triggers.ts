const postgresDb = require('postgres');
require('dotenv/config');

async function checkTriggers() {
    try {
        console.log('Checking all triggers in the database...');

        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in the environment variables');
        }

        const sql = postgresDb(databaseUrl);

        // Check all triggers in public schema
        console.log('\nPublic schema triggers:');
        const publicTriggers = await sql`
            SELECT trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
        `;

        if (publicTriggers.length === 0) {
            console.log('No triggers found in public schema');
        } else {
            publicTriggers.forEach((trigger: any) => {
                console.log(`- ${trigger.trigger_name} (${trigger.event_manipulation})`);
            });
        }

        // Check all schemas
        console.log('\nAll available schemas:');
        const schemas = await sql`
            SELECT schema_name
            FROM information_schema.schemata
        `;

        schemas.forEach((schema: any) => {
            console.log(`- ${schema.schema_name}`);
        });

        // Try to check for auth schema triggers
        console.log('\nAttempting to check auth schema triggers:');
        try {
            const authTriggers = await sql`
                SELECT trigger_name, event_object_table, event_manipulation
                FROM information_schema.triggers
                WHERE trigger_schema = 'auth'
            `;

            if (authTriggers.length === 0) {
                console.log('No triggers found in auth schema');
            } else {
                authTriggers.forEach((trigger: any) => {
                    console.log(`- ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`);
                });
            }
        } catch (error) {
            console.warn('Could not query auth schema triggers. This might be due to permission restrictions.');
        }

        // Try to list all triggers in the database using pg_trigger
        console.log('\nAll triggers from pg_trigger:');
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
                console.log('No triggers found');
            } else {
                allTriggers.forEach((trigger: any) => {
                    console.log(`- ${trigger.trigger_name} on ${trigger.schema_name}.${trigger.table_name}`);
                });
            }
        } catch (error) {
            console.warn('Could not query pg_trigger. This might be due to permission restrictions.');
        }

        await sql.end();
    } catch (error) {
        console.error('Error checking triggers:', error);
    }
}

checkTriggers(); 