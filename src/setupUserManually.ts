const { PrismaClient: PrismaClientTest } = require('@prisma/client');
require('dotenv/config');

// Create a Prisma client
const testPrisma = new PrismaClientTest();

// Manual test of profile creation
async function createTestUser() {
    console.log('Attempting to create a test profile manually...');

    try {
        // Create a test UUID that would match what Supabase Auth would create
        const testUserId = '00000000-0000-0000-0000-000000000001';

        // Try to create a Profile with the test user ID
        const profile = await testPrisma.profile.create({
            data: {
                id: testUserId,
                role: 'USER',
            }
        });

        console.log('✅ Successfully created test profile:', profile);
        return { success: true, profile };
    } catch (error) {
        console.error('❌ Error creating test profile:', error);
        return { error: JSON.stringify(error) };
    } finally {
        await testPrisma.$disconnect();
    }
}

// Run the test
createTestUser()
    .then((result) => {
        console.log('Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error running test:', error);
        process.exit(1);
    }); 