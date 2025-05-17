// Script to update all users to have admin role
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserToAdmin() {
    try {
        console.log('Finding all profiles...');
        const profiles = await prisma.profile.findMany();
        console.log(`Found ${profiles.length} profiles`);

        for (const profile of profiles) {
            console.log(`Updating user ${profile.id} to ADMIN role`);
            await prisma.profile.update({
                where: { id: profile.id },
                data: { role: 'ADMIN' }
            });
        }

        console.log('Updated all users to ADMIN role');

        const updatedProfiles = await prisma.profile.findMany();
        console.log('Updated profiles:');
        console.table(updatedProfiles);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserToAdmin(); 