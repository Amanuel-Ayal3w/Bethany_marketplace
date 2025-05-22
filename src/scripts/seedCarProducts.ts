const { PrismaClient: CarProductPrismaClient } = require('@prisma/client');

// Initialize Prisma client with a unique name
const product_db_client = new CarProductPrismaClient();

// Define types for our data
type Category = {
    id: string;
    parentID: string | null;
    name: string;
    url: string;
};

type Brand = {
    id: string;
    name: string;
};

type ProductData = {
    name: string;
    desc: string;
    price: number;
    specialFeatures: string[];
    specs: Record<string, any>;
};

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

async function seedCarProducts(): Promise<void> {
    console.log("🌱 Starting to seed car products...");

    try {
        // Get all categories and brands
        const categories: Category[] = await product_db_client.category.findMany();
        const brands: Brand[] = await product_db_client.brand.findMany();

        // Group categories by parent for easy lookup
        const mainCategories = categories.filter((cat: Category) => cat.parentID === null);
        const subCategories = categories.filter((cat: Category) => cat.parentID !== null);

        // Map to organize subcategories by parent ID
        const categoryChildrenMap = new Map<string, Category[]>();
        subCategories.forEach((subCat: Category) => {
            if (subCat.parentID === null) return;

            if (!categoryChildrenMap.has(subCat.parentID)) {
                categoryChildrenMap.set(subCat.parentID, []);
            }
            const childrenList = categoryChildrenMap.get(subCat.parentID);
            if (childrenList) {
                childrenList.push(subCat);
            }
        });

        // Find brand IDs by group
        const carBrands = brands.filter((brand: Brand) =>
            ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Tesla", "Volvo"].includes(brand.name)
        );

        const partsBrands = brands.filter((brand: Brand) =>
            ["Bosch", "Denso", "Continental", "Michelin", "Bridgestone", "Brembo"].includes(brand.name)
        );

        const equipmentBrands = brands.filter((brand: Brand) =>
            ["Siemens", "ABB", "Fanuc", "Kuka", "Mitsubishi"].includes(brand.name)
        );

        // Find the New Vehicles category and its subcategories
        const newVehiclesCategory = mainCategories.find((cat: Category) => cat.name === "New Vehicles");
        if (newVehiclesCategory) {
            const vehicleSubCategories = categoryChildrenMap.get(newVehiclesCategory.id) || [];

            // Add sedan products
            const sedanCategory = vehicleSubCategories.find((cat: Category) => cat.name === "Sedans");
            if (sedanCategory) {
                await createSedanProducts(sedanCategory, carBrands);
            }

            // Add SUV products
            const suvCategory = vehicleSubCategories.find((cat: Category) => cat.name === "SUVs");
            if (suvCategory) {
                await createSUVProducts(suvCategory, carBrands);
            }

            // Add Electric Vehicle products
            const evCategory = vehicleSubCategories.find((cat: Category) => cat.name === "Electric Vehicles");
            if (evCategory) {
                await createEVProducts(evCategory, carBrands.filter((b: Brand) => ["Tesla", "Audi", "BMW", "Nissan"].some(name => b.name.includes(name))));
            }
        }

        // Find Auto Parts category and its subcategories
        const autoPartsCategory = mainCategories.find((cat: Category) => cat.name === "Auto Parts");
        if (autoPartsCategory) {
            const partsSubCategories = categoryChildrenMap.get(autoPartsCategory.id) || [];

            // Add engine components
            const engineComponentsCategory = partsSubCategories.find((cat: Category) => cat.name === "Engine Components");
            if (engineComponentsCategory) {
                await createEnginePartProducts(engineComponentsCategory, partsBrands);
            }

            // Add tire products
            const tiresCategory = partsSubCategories.find((cat: Category) => cat.name === "Tires & Wheels");
            if (tiresCategory) {
                await createTireProducts(tiresCategory, partsBrands.filter((b: Brand) => ["Michelin", "Bridgestone", "Goodyear"].some(name => b.name.includes(name))));
            }
        }

        // Find Manufacturing Equipment category and its subcategories
        const manufacturingCategory = mainCategories.find((cat: Category) => cat.name === "Manufacturing Equipment");
        if (manufacturingCategory) {
            const equipmentSubCategories = categoryChildrenMap.get(manufacturingCategory.id) || [];

            // Add automation systems
            const automationCategory = equipmentSubCategories.find((cat: Category) => cat.name === "Automation Systems");
            if (automationCategory) {
                await createAutomationProducts(automationCategory, equipmentBrands);
            }
        }

        console.log("🎉 Successfully seeded all car products!");
    } catch (error) {
        console.error("❌ Error seeding products:", error);
    } finally {
        await product_db_client.$disconnect();
    }
}

// Create sedan products
async function createSedanProducts(category: Category, brands: Brand[]): Promise<void> {
    const sedanProducts: ProductData[] = [
        {
            name: "Toyota Corolla 2024",
            desc: "The 2024 Toyota Corolla continues the model's legacy of reliability with improved fuel efficiency and modern features. Perfect for daily commuting and family use.",
            price: 2500000, // 2.5 million ETB
            specialFeatures: ["Fuel Efficient", "Advanced Safety Features", "Apple CarPlay & Android Auto", "LED Headlights"],
            specs: { color: ["White", "Black", "Silver"], transmission: "Automatic", engine: "1.8L 4-Cylinder" }
        },
        {
            name: "Honda Civic 2024",
            desc: "The Honda Civic 2024 offers sporty styling, excellent fuel economy, and responsive handling. Packed with technology and safety features for the modern driver.",
            price: 2700000, // 2.7 million ETB
            specialFeatures: ["Sport Mode", "Honda Sensing Safety Suite", "Wireless Charging", "Premium Audio System"],
            specs: { color: ["Blue", "Red", "White", "Black"], transmission: "CVT", engine: "2.0L 4-Cylinder" }
        },
        {
            name: "Mercedes-Benz C-Class 2024",
            desc: "The 2024 C-Class represents luxury and performance in a compact sedan. With premium materials, cutting-edge technology, and powerful engine options.",
            price: 5500000, // 5.5 million ETB
            specialFeatures: ["MBUX Infotainment System", "Leather Interior", "Ambient Lighting", "Driver Assistance Package"],
            specs: { color: ["Black", "Silver", "Blue"], transmission: "9-Speed Automatic", engine: "2.0L Turbocharged" }
        },
        {
            name: "BMW 3 Series 2024",
            desc: "The BMW 3 Series 2024 delivers the perfect blend of luxury, sportiness, and technology. Featuring dynamic handling and a driver-focused cockpit.",
            price: 5200000, // 5.2 million ETB
            specialFeatures: ["Sport Suspension", "BMW iDrive 8", "Premium Harman Kardon Sound", "Adaptive LED Headlights"],
            specs: { color: ["Alpine White", "Black Sapphire", "Mineral Grey"], transmission: "8-Speed Automatic", engine: "2.0L TwinPower Turbo" }
        },
    ];

    for (const product of sedanProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-car.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created sedan product: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Create SUV products
async function createSUVProducts(category: Category, brands: Brand[]): Promise<void> {
    const suvProducts: ProductData[] = [
        {
            name: "Toyota RAV4 2024",
            desc: "The Toyota RAV4 2024 combines rugged styling with practical comfort. This versatile SUV offers ample cargo space, all-wheel drive capability, and excellent fuel economy.",
            price: 3200000, // 3.2 million ETB
            specialFeatures: ["All-Wheel Drive", "Toyota Safety Sense 2.0", "Spacious Cargo Area", "Multi-Terrain Select"],
            specs: { color: ["White", "Black", "Blue", "Green"], transmission: "8-Speed Automatic", engine: "2.5L 4-Cylinder" }
        },
        {
            name: "Honda CR-V 2024",
            desc: "The Honda CR-V 2024 is a family-friendly SUV with a spacious interior, smooth ride, and excellent safety ratings. Perfect for both city driving and weekend adventures.",
            price: 3500000, // 3.5 million ETB
            specialFeatures: ["Real-Time AWD", "Honda Sensing", "Hands-Free Power Tailgate", "Wireless Phone Charger"],
            specs: { color: ["Platinum White", "Crystal Black", "Radiant Red"], transmission: "CVT", engine: "1.5L Turbocharged" }
        },
        {
            name: "BMW X5 2024",
            desc: "The BMW X5 2024 is a luxury midsize SUV that offers powerful performance, premium comfort, and cutting-edge technology. The epitome of luxury SUV experience.",
            price: 7800000, // 7.8 million ETB
            specialFeatures: ["xDrive All-Wheel Drive", "Panoramic Sunroof", "BMW Live Cockpit Professional", "Vernasca Leather Upholstery"],
            specs: { color: ["Alpine White", "Black Sapphire", "Mineral White"], transmission: "8-Speed Sport Automatic", engine: "3.0L TwinPower Turbo" }
        },
        {
            name: "Mercedes-Benz GLE 2024",
            desc: "The Mercedes-Benz GLE 2024 combines sophistication with capability. This luxury SUV features advanced technology, premium comfort, and impressive off-road ability.",
            price: 8200000, // 8.2 million ETB
            specialFeatures: ["4MATIC All-Wheel Drive", "E-Active Body Control", "MBUX with Voice Control", "Burmester Surround Sound"],
            specs: { color: ["Obsidian Black", "Polar White", "Selenite Grey"], transmission: "9G-TRONIC Automatic", engine: "3.0L Inline-6 Turbo" }
        },
    ];

    for (const product of suvProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-suv.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created SUV product: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Create Electric Vehicle products
async function createEVProducts(category: Category, brands: Brand[]): Promise<void> {
    const evProducts: ProductData[] = [
        {
            name: "Tesla Model 3 2024",
            desc: "The Tesla Model 3 2024 is an all-electric sedan with impressive range, acceleration, and advanced autopilot features. Represents the future of sustainable transportation.",
            price: 4900000, // 4.9 million ETB
            specialFeatures: ["Autopilot", "Minimalist Interior", "Over-the-air Updates", "Glass Roof"],
            specs: { color: ["Pearl White", "Solid Black", "Deep Blue", "Red"], range: "576 km", acceleration: "0-100 km/h in 5.8s" }
        },
        {
            name: "Tesla Model Y 2024",
            desc: "The Tesla Model Y 2024 is a versatile all-electric SUV with spacious interior, long range capability, and cutting-edge technology. Perfect for families transitioning to electric.",
            price: 5500000, // 5.5 million ETB
            specialFeatures: ["Full Self-Driving Capability", "15-inch Touchscreen", "Panoramic Glass Roof", "Supercharger Access"],
            specs: { color: ["Pearl White", "Solid Black", "Deep Blue", "Red"], range: "525 km", acceleration: "0-100 km/h in 5.0s" }
        },
        {
            name: "Audi e-tron 2024",
            desc: "The Audi e-tron 2024 is a premium electric SUV that combines Audi's luxury craftsmanship with electric performance. Features quick charging and impressive range.",
            price: 7200000, // 7.2 million ETB
            specialFeatures: ["Quattro All-Wheel Drive", "MMI Touch Response", "Matrix LED Headlights", "Air Suspension"],
            specs: { color: ["Glacier White", "Mythos Black", "Galaxy Blue"], range: "437 km", acceleration: "0-100 km/h in 5.7s" }
        },
        {
            name: "BMW i4 2024",
            desc: "The BMW i4 2024 is an electric gran coupe that delivers BMW's signature driving dynamics with zero emissions. Combines sportiness with sustainability.",
            price: 6800000, // 6.8 million ETB
            specialFeatures: ["BMW Curved Display", "Sport Mode", "Acoustic Pedestrian Protection", "Regenerative Braking"],
            specs: { color: ["Alpine White", "Black Sapphire", "Mineral White"], range: "510 km", acceleration: "0-100 km/h in 5.7s" }
        },
    ];

    for (const product of evProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-ev.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created EV product: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Create Engine Parts products
async function createEnginePartProducts(category: Category, brands: Brand[]): Promise<void> {
    const engineProducts: ProductData[] = [
        {
            name: "Bosch Platinum Spark Plugs (Set of 4)",
            desc: "High-performance platinum spark plugs designed for longevity and improved fuel efficiency. Compatible with most modern engines.",
            price: 3500, // 3,500 ETB
            specialFeatures: ["Extended Lifespan", "Improved Fuel Economy", "Better Cold Starts", "Reduced Emissions"],
            specs: { compatibility: ["Toyota", "Honda", "Ford", "Chevrolet"], material: "Platinum", thread: "14mm" }
        },
        {
            name: "Denso Iridium Spark Plugs (Set of 4)",
            desc: "Premium iridium spark plugs offering superior ignition performance and durability. Ideal for high-performance engines.",
            price: 4200, // 4,200 ETB
            specialFeatures: ["Fine Wire Design", "Better Throttle Response", "100,000 km Lifespan", "Enhanced Ignitability"],
            specs: { compatibility: ["Toyota", "Nissan", "Honda", "Subaru"], material: "Iridium", thread: "14mm" }
        },
        {
            name: "Continental Timing Belt Kit",
            desc: "Complete timing belt kit includes belt, tensioners, and water pump. Essential maintenance kit for preventing engine damage.",
            price: 15000, // 15,000 ETB
            specialFeatures: ["OEM Quality", "Complete Kit", "Installation Guide Included", "2-Year Warranty"],
            specs: { compatibility: ["Volkswagen", "Audi", "BMW", "Mercedes"], teeth: "124", width: "25mm" }
        },
        {
            name: "Bosch Oxygen Sensor",
            desc: "High-quality oxygen sensor designed to monitor exhaust gas composition for optimal engine performance and emissions control.",
            price: 5800, // 5,800 ETB
            specialFeatures: ["Fast Response Time", "Exact Fit", "Reduces Emissions", "Improves Fuel Economy"],
            specs: { compatibility: ["Multiple Brands"], sensor_type: "Wideband", wire_count: "4" }
        },
    ];

    for (const product of engineProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-part.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created engine part: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Create Tire products
async function createTireProducts(category: Category, brands: Brand[]): Promise<void> {
    const tireProducts: ProductData[] = [
        {
            name: "Michelin Primacy 4 215/55R17",
            desc: "All-season touring tire offering excellent wet grip, comfort, and long-lasting performance. Ideal for sedans and small SUVs.",
            price: 12000, // 12,000 ETB
            specialFeatures: ["Long Tread Life", "Wet Weather Performance", "Quiet Ride", "Fuel Efficient"],
            specs: { size: "215/55R17", load_index: "94", speed_rating: "V", tread_depth: "8mm" }
        },
        {
            name: "Bridgestone Alenza A/S 235/65R18",
            desc: "Premium all-season tire specifically designed for luxury SUVs and crossovers. Combines comfort with all-weather traction.",
            price: 14500, // 14,500 ETB
            specialFeatures: ["QuietTrack Technology", "All-Season Traction", "Long Wear Life", "Fuel Efficient Design"],
            specs: { size: "235/65R18", load_index: "106", speed_rating: "H", tread_depth: "10mm" }
        },
        {
            name: "Michelin Pilot Sport 4S 245/40R19",
            desc: "Ultra-high performance summer tire designed for sports cars and performance sedans. Offers exceptional grip and handling.",
            price: 18000, // 18,000 ETB
            specialFeatures: ["Maximum Grip", "Precise Steering", "Dynamic Response", "Racing-Derived Compounds"],
            specs: { size: "245/40R19", load_index: "98", speed_rating: "Y", tread_depth: "9mm" }
        },
        {
            name: "Bridgestone Blizzak WS90 205/60R16",
            desc: "Premium winter tire with advanced technology for excellent snow and ice traction. Designed for sedans and crossovers.",
            price: 13200, // 13,200 ETB
            specialFeatures: ["MultiCell Compound", "3D Zigzag Sipes", "Snow Vices", "Improved Ice Braking"],
            specs: { size: "205/60R16", load_index: "92", speed_rating: "H", tread_depth: "11mm" }
        },
    ];

    for (const product of tireProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-tire.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created tire product: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Create Automation products
async function createAutomationProducts(category: Category, brands: Brand[]): Promise<void> {
    const automationProducts: ProductData[] = [
        {
            name: "Siemens SIMATIC S7-1500 PLC",
            desc: "Advanced programmable logic controller for automotive manufacturing automation. Features high processing speed and extensive connectivity options.",
            price: 450000, // 450,000 ETB
            specialFeatures: ["Integrated Security", "High Performance", "PROFINET Interface", "Web Server Functionality"],
            specs: { processor: "High-speed CPU", memory: "4MB", communication: "Industrial Ethernet", inputs_outputs: "64 Digital, 32 Analog" }
        },
        {
            name: "ABB IRB 6700 Industrial Robot",
            desc: "Heavy-duty industrial robot designed for automotive manufacturing applications like welding, material handling, and assembly.",
            price: 3200000, // 3.2 million ETB
            specialFeatures: ["High Payload Capacity", "Precise Positioning", "Low Maintenance", "Energy Efficient"],
            specs: { payload: "235kg", reach: "2.65m", axes: "6", repeatability: "±0.05mm" }
        },
        {
            name: "Fanuc R-2000iC Robot",
            desc: "Versatile industrial robot for automotive assembly lines. Combines high speed with precision for applications like painting and material handling.",
            price: 2800000, // 2.8 million ETB
            specialFeatures: ["High Speed Motion", "Compact Footprint", "Flexible Mounting", "IP67 Protected"],
            specs: { payload: "210kg", reach: "2.5m", axes: "6", repeatability: "±0.02mm" }
        },
        {
            name: "Kuka KR QUANTEC Industrial Robot",
            desc: "Premium industrial robot for automotive manufacturing with high payload capacity and excellent precision. Perfect for welding and assembly tasks.",
            price: 3500000, // 3.5 million ETB
            specialFeatures: ["Path Accuracy", "Integrated Energy Supply", "Motion Control", "Process-specific Software"],
            specs: { payload: "240kg", reach: "2.9m", axes: "6", repeatability: "±0.06mm" }
        },
    ];

    for (const product of automationProducts) {
        const brandName = product.name.split(' ')[0];
        const brand = brands.find((b: Brand) => b.name === brandName);

        if (brand) {
            await product_db_client.product.create({
                data: {
                    name: product.name,
                    desc: product.desc,
                    price: product.price,
                    specialFeatures: product.specialFeatures,
                    images: ["placeholder-automation.jpg"],
                    categoryID: category.id,
                    optionSets: [],
                    specs: product.specs,
                    brandID: brand.id
                }
            });
            console.log(`✅ Created automation product: ${product.name}`);
        } else {
            console.warn(`⚠️ Brand not found for product: ${product.name}`);
        }
    }
}

// Run the seed function
seedCarProducts()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 