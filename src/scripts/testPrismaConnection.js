const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Original connection string
const originalUrl = process.env.DATABASE_URL;

// Modified connection strings
const modifiedUrl = originalUrl + '?options=--search_path%3Dpublic%26application_name%3Dsupabase';
const serviceRoleUrl = originalUrl.replace('postgres:', 'postgres.service:') + '?pgbouncer=true';

async function testConnection(url, label) {
    console.log(`\n🔍 Testing connection with ${label}...`);
    try {
        // Initialize Prisma client with the URL
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url,
                },
            },
        });

        // Test a simple query
        console.log('Attempting to connect...');
        await prisma.$connect();
        console.log('Connection successful ✅');

        // Try to access some tables
        console.log('Testing category access...');
        const categoryCount = await prisma.category.count();
        console.log(`Category count: ${categoryCount} ✅`);

        console.log('Testing brand access...');
        const brandCount = await prisma.brand.count();
        console.log(`Brand count: ${brandCount} ✅`);

        // Test a Settings query if it exists
        try {
            console.log('Testing settings access...');
            const settings = await prisma.$queryRaw`SELECT * FROM "Settings" WHERE key = 'footer' LIMIT 1`;
            if (settings && settings.length > 0) {
                console.log('Settings access successful ✅');
            } else {
                console.log('No settings found, but query executed without errors ✅');
            }
        } catch (settingsError) {
            console.error('Error accessing Settings table:', settingsError.message);
        }

        await prisma.$disconnect();
        return true;
    } catch (error) {
        console.error(`❌ Connection failed with ${label}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🧪 Testing Prisma Database Connections');
    console.log('======================================');

    console.log('Original URL:', originalUrl);
    console.log('Modified URL:', modifiedUrl);
    console.log('Service Role URL Example:', serviceRoleUrl.replace(/:[^:]*@/, ':[PASSWORD]@'));

    // Test original connection
    const originalSuccess = await testConnection(originalUrl, 'original connection');

    // Test modified connection if original fails
    if (!originalSuccess) {
        console.log('\n🔄 Original connection failed, trying modified connection...');
        const modifiedSuccess = await testConnection(modifiedUrl, 'modified connection');

        if (!modifiedSuccess) {
            console.log('\n⚠️ Both connections failed. You need to:');
            console.log('1. Update your .env file with the modified connection string');
            console.log('2. Run the SQL commands in fix_permissions.sql in the Supabase SQL Editor');
        } else {
            console.log('\n✅ Modified connection successful! Update your .env file with this connection string.');
        }
    } else {
        console.log('\n✅ Original connection successful! No changes needed.');
    }
}

main()
    .then(() => {
        console.log('\n🏁 Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }); 