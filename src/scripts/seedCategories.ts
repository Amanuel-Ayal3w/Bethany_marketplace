const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client with a unique name
const db_client = new PrismaClient();

// Types for our categories
type MainCategory = {
    name: string;
    url: string;
    iconUrl: string;
    iconSize: [number, number];
};

type SubCategory = {
    name: string;
    url: string;
};

type CategoryMap = {
    [key: string]: string;
};

type SubCategoriesMap = {
    [key: string]: SubCategory[];
};

type ThirdLevelMap = {
    [key: string]: SubCategory[];
};

// Main category groups
const MAIN_CATEGORIES: MainCategory[] = [
    {
        name: "Electronics",
        url: "electronics",
        iconUrl: "/icons/electronics.svg",
        iconSize: [24, 24],
    },
    {
        name: "Computers",
        url: "computers",
        iconUrl: "/icons/computer.svg",
        iconSize: [24, 24],
    },
    {
        name: "Mobile",
        url: "mobile",
        iconUrl: "/icons/smartphone.svg",
        iconSize: [24, 24],
    },
    {
        name: "Home Appliances",
        url: "home-appliances",
        iconUrl: "/icons/appliance.svg",
        iconSize: [24, 24],
    }
];

// Sub-categories for each main category
const SUB_CATEGORIES: SubCategoriesMap = {
    "Electronics": [
        { name: "TVs", url: "tvs" },
        { name: "Audio Systems", url: "audio-systems" },
        { name: "Cameras", url: "cameras" }
    ],
    "Computers": [
        { name: "Laptops", url: "laptops" },
        { name: "Desktops", url: "desktops" },
        { name: "Monitors", url: "monitors" },
        { name: "Computer Parts", url: "computer-parts" }
    ],
    "Mobile": [
        { name: "Smartphones", url: "smartphones" },
        { name: "Tablets", url: "tablets" },
        { name: "Accessories", url: "mobile-accessories" }
    ],
    "Home Appliances": [
        { name: "Kitchen", url: "kitchen-appliances" },
        { name: "Laundry", url: "laundry-appliances" },
        { name: "Climate Control", url: "climate-control" }
    ]
};

// Third level categories
const THIRD_LEVEL: ThirdLevelMap = {
    "TVs": [
        { name: "Smart TVs", url: "smart-tvs" },
        { name: "4K TVs", url: "4k-tvs" },
        { name: "OLED TVs", url: "oled-tvs" }
    ],
    "Laptops": [
        { name: "Gaming Laptops", url: "gaming-laptops" },
        { name: "Ultrabooks", url: "ultrabooks" },
        { name: "Business Laptops", url: "business-laptops" }
    ],
    "Smartphones": [
        { name: "Android", url: "android-phones" },
        { name: "iPhone", url: "iphones" },
        { name: "Foldables", url: "foldable-phones" }
    ]
};

async function seedCategories() {
    console.log("🌱 Starting to seed category data...");

    try {
        // Create main categories
        const mainCategoryMap: CategoryMap = {};

        for (const category of MAIN_CATEGORIES) {
            const createdCategory = await db_client.category.create({
                data: {
                    name: category.name,
                    url: category.url,
                    iconUrl: category.iconUrl,
                    iconSize: category.iconSize,
                    parentID: null
                }
            });
            mainCategoryMap[category.name] = createdCategory.id;
            console.log(`✅ Created main category: ${category.name}`);
        }

        // Create second level categories
        const subCategoryMap: CategoryMap = {};

        for (const [mainName, subCategories] of Object.entries(SUB_CATEGORIES)) {
            const parentID = mainCategoryMap[mainName];

            for (const subCategory of subCategories) {
                const createdSubCategory = await db_client.category.create({
                    data: {
                        name: subCategory.name,
                        url: subCategory.url,
                        iconUrl: null,
                        iconSize: [16, 16],
                        parentID: parentID
                    }
                });
                subCategoryMap[subCategory.name] = createdSubCategory.id;
                console.log(`✅ Created sub-category: ${subCategory.name} under ${mainName}`);
            }
        }

        // Create third level categories
        for (const [subName, thirdLevelCategories] of Object.entries(THIRD_LEVEL)) {
            const parentID = subCategoryMap[subName];

            if (parentID) { // Make sure parent exists
                for (const thirdCategory of thirdLevelCategories) {
                    await db_client.category.create({
                        data: {
                            name: thirdCategory.name,
                            url: thirdCategory.url,
                            iconUrl: null,
                            iconSize: [12, 12],
                            parentID: parentID
                        }
                    });
                    console.log(`✅ Created third-level category: ${thirdCategory.name} under ${subName}`);
                }
            } else {
                console.warn(`⚠️ Parent category '${subName}' not found, skipping its subcategories`);
            }
        }

        console.log("🎉 Successfully seeded all category data!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error seeding categories:", error);
        return { error: JSON.stringify(error) };
    } finally {
        await db_client.$disconnect();
    }
}

// Run the seed function
seedCategories()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 