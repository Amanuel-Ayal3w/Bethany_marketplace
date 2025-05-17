// Script to check if users have the ADMIN role
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminRole() {
    try {
        console.log('Checking for admin users...');
        const profiles = await prisma.profile.findMany();

        if (profiles.length === 0) {
            console.log('No profiles found in the database!');
            return;
        }

        console.log(`Found ${profiles.length} profile(s):`);

        profiles.forEach(profile => {
            console.log(`-----------------------------------`);
            console.log(`User ID: ${profile.id}`);
            console.log(`Role: ${profile.role}`);
            console.log(`Is ADMIN? ${profile.role === 'ADMIN'}`);
            console.log(`Is admin? ${profile.role === 'admin'}`);
            console.log(`Uppercase check: ${String(profile.role).toUpperCase() === 'ADMIN'}`);
            console.log(`Role type: ${typeof profile.role}`);
            console.log(`Created: ${profile.createdAt}`);
            console.log(`Updated: ${profile.updatedAt}`);
        });

        // Check database directly
        const directQuery = await prisma.$queryRaw`SELECT * FROM "Profile"`;
        console.log('\nDirect query results:');
        console.log(directQuery);

    } catch (error) {
        console.error('Error checking admin role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminRole(); 