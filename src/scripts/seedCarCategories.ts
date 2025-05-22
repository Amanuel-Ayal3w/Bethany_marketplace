const { PrismaClient: CarPrismaClient } = require('@prisma/client');

// Initialize Prisma client with a unique name
const car_db_client = new CarPrismaClient();

// Types for our categories
type CarMainCategory = {
    name: string;
    url: string;
};

type CarSubCategory = {
    name: string;
    url: string;
};

type CarCategoryMap = {
    [key: string]: string;
};

type CarSubCategoriesMap = {
    [key: string]: CarSubCategory[];
};

type CarThirdLevelMap = {
    [key: string]: CarSubCategory[];
};

// Main category groups for car manufacturing and selling
const CAR_MAIN_CATEGORIES: CarMainCategory[] = [
    {
        name: "New Vehicles",
        url: "new-vehicles",
    },
    {
        name: "Used Vehicles",
        url: "used-vehicles",
    },
    {
        name: "Auto Parts",
        url: "auto-parts",
    },
    {
        name: "Manufacturing Equipment",
        url: "manufacturing-equipment",
    },
    {
        name: "Services",
        url: "services",
    }
];

// Sub-categories for each main category
const CAR_SUB_CATEGORIES: CarSubCategoriesMap = {
    "New Vehicles": [
        { name: "Sedans", url: "sedans" },
        { name: "SUVs", url: "suvs" },
        { name: "Trucks", url: "trucks" },
        { name: "Electric Vehicles", url: "electric-vehicles" },
        { name: "Luxury Vehicles", url: "luxury-vehicles" },
        { name: "Commercial Vehicles", url: "commercial-vehicles" }
    ],
    "Used Vehicles": [
        { name: "Certified Pre-Owned", url: "certified-pre-owned" },
        { name: "Used Sedans", url: "used-sedans" },
        { name: "Used SUVs", url: "used-suvs" },
        { name: "Used Trucks", url: "used-trucks" },
        { name: "Classic Cars", url: "classic-cars" }
    ],
    "Auto Parts": [
        { name: "Engine Components", url: "engine-components" },
        { name: "Transmission Parts", url: "transmission-parts" },
        { name: "Body Parts", url: "body-parts" },
        { name: "Interior Accessories", url: "interior-accessories" },
        { name: "Electronics", url: "auto-electronics" },
        { name: "Tires & Wheels", url: "tires-wheels" }
    ],
    "Manufacturing Equipment": [
        { name: "Assembly Line Equipment", url: "assembly-line-equipment" },
        { name: "Automation Systems", url: "automation-systems" },
        { name: "Welding & Fabrication", url: "welding-fabrication" },
        { name: "Paint & Finishing", url: "paint-finishing" },
        { name: "Quality Control Tools", url: "quality-control-tools" }
    ],
    "Services": [
        { name: "Maintenance & Repair", url: "maintenance-repair" },
        { name: "Customization", url: "customization" },
        { name: "Financing", url: "financing" },
        { name: "Insurance", url: "insurance" },
        { name: "Vehicle Transport", url: "vehicle-transport" }
    ]
};

// Third level categories
const CAR_THIRD_LEVEL: CarThirdLevelMap = {
    "Sedans": [
        { name: "Compact Sedans", url: "compact-sedans" },
        { name: "Mid-size Sedans", url: "mid-size-sedans" },
        { name: "Full-size Sedans", url: "full-size-sedans" },
        { name: "Sports Sedans", url: "sports-sedans" }
    ],
    "SUVs": [
        { name: "Compact SUVs", url: "compact-suvs" },
        { name: "Mid-size SUVs", url: "mid-size-suvs" },
        { name: "Full-size SUVs", url: "full-size-suvs" },
        { name: "Luxury SUVs", url: "luxury-suvs" }
    ],
    "Electric Vehicles": [
        { name: "Electric Sedans", url: "electric-sedans" },
        { name: "Electric SUVs", url: "electric-suvs" },
        { name: "Electric Trucks", url: "electric-trucks" },
        { name: "Hybrid Vehicles", url: "hybrid-vehicles" }
    ],
    "Engine Components": [
        { name: "Engine Blocks", url: "engine-blocks" },
        { name: "Pistons & Rods", url: "pistons-rods" },
        { name: "Crankshafts", url: "crankshafts" },
        { name: "Camshafts", url: "camshafts" },
        { name: "Valves & Springs", url: "valves-springs" }
    ],
    "Assembly Line Equipment": [
        { name: "Conveyor Systems", url: "conveyor-systems" },
        { name: "Robotic Arms", url: "robotic-arms" },
        { name: "Control Systems", url: "control-systems" },
        { name: "Material Handling", url: "material-handling" }
    ],
    "Maintenance & Repair": [
        { name: "Scheduled Maintenance", url: "scheduled-maintenance" },
        { name: "Engine Repair", url: "engine-repair" },
        { name: "Collision Repair", url: "collision-repair" },
        { name: "Electrical Systems", url: "electrical-systems-repair" }
    ]
};

async function seedCarCategories() {
    console.log("🌱 Starting to seed car manufacturing and selling categories...");

    try {
        // Create main categories
        const carMainCategoryMap: CarCategoryMap = {};

        for (const category of CAR_MAIN_CATEGORIES) {
            const createdCategory = await car_db_client.category.create({
                data: {
                    name: category.name,
                    url: category.url,
                    parentID: null
                }
            });
            carMainCategoryMap[category.name] = createdCategory.id;
            console.log(`✅ Created main category: ${category.name}`);
        }

        // Create second level categories
        const carSubCategoryMap: CarCategoryMap = {};

        for (const [mainName, subCategories] of Object.entries(CAR_SUB_CATEGORIES)) {
            const parentID = carMainCategoryMap[mainName];

            for (const subCategory of subCategories) {
                const createdSubCategory = await car_db_client.category.create({
                    data: {
                        name: subCategory.name,
                        url: subCategory.url,
                        parentID: parentID
                    }
                });
                carSubCategoryMap[subCategory.name] = createdSubCategory.id;
                console.log(`✅ Created sub-category: ${subCategory.name} under ${mainName}`);
            }
        }

        // Create third level categories
        for (const [subName, thirdLevelCategories] of Object.entries(CAR_THIRD_LEVEL)) {
            const parentID = carSubCategoryMap[subName];

            if (parentID) { // Make sure parent exists
                for (const thirdCategory of thirdLevelCategories) {
                    await car_db_client.category.create({
                        data: {
                            name: thirdCategory.name,
                            url: thirdCategory.url,
                            parentID: parentID
                        }
                    });
                    console.log(`✅ Created third-level category: ${thirdCategory.name} under ${subName}`);
                }
            } else {
                console.warn(`⚠️ Parent category '${subName}' not found, skipping its subcategories`);
            }
        }

        console.log("🎉 Successfully seeded all car manufacturing and selling categories!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error seeding categories:", error);
        return { error: JSON.stringify(error) };
    } finally {
        await car_db_client.$disconnect();
    }
}

// Run the seed function
seedCarCategories()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 