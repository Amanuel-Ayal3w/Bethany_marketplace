const { PrismaClient: CarBrandPrismaClient } = require('@prisma/client');

// Initialize Prisma client with a unique name
const car_brand_db_client = new CarBrandPrismaClient();

// Car manufacturer brands
const CAR_BRANDS = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Volkswagen",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Hyundai",
    "Kia",
    "Nissan",
    "Tesla",
    "Volvo",
    "Subaru",
    "Mazda",
    "Lexus",
    "Jaguar",
    "Land Rover",
    "Porsche",
    "Ferrari"
];

// Manufacturing equipment brands
const EQUIPMENT_BRANDS = [
    "Siemens",
    "ABB",
    "Fanuc",
    "Kuka",
    "Bosch",
    "Mitsubishi",
    "Rockwell Automation",
    "Schneider Electric",
    "Omron",
    "Honeywell"
];

// Auto parts brands
const PARTS_BRANDS = [
    "Bosch",
    "Denso",
    "Continental",
    "ZF",
    "Michelin",
    "Bridgestone",
    "Goodyear",
    "Brembo",
    "Valeo",
    "NGK"
];

async function seedCarBrands() {
    console.log("🌱 Starting to seed car brands...");

    // Combine all brands and remove duplicates using Array.from and Set
    const allBrands = Array.from(new Set([...CAR_BRANDS, ...EQUIPMENT_BRANDS, ...PARTS_BRANDS]));

    try {
        for (const brandName of allBrands) {
            const existingBrand = await car_brand_db_client.brand.findUnique({
                where: {
                    name: brandName
                }
            });

            if (!existingBrand) {
                await car_brand_db_client.brand.create({
                    data: {
                        name: brandName
                    }
                });
                console.log(`✅ Created brand: ${brandName}`);
            } else {
                console.log(`⚠️ Brand already exists: ${brandName}`);
            }
        }

        console.log("🎉 Successfully seeded all car brands!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error seeding brands:", error);
        return { error: JSON.stringify(error) };
    } finally {
        await car_brand_db_client.$disconnect();
    }
}

// Run the seed function
seedCarBrands()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 