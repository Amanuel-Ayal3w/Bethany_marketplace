"use server";
import { z } from "zod";

import { TFilters, TListItem } from "@/domains/store/productList/types";
import { TListSort } from "@/domains/store/productList/types/";
import { db } from "@/shared/lib/db";
import { TProductPath } from "@/shared/types/product";

const ValidateSort = z.object({
  sortName: z.enum(["id", "price", "name"]),
  sortType: z.enum(["asc", "desc"]),
});

export const getList = async (path: string, sortData: TListSort, filters: TFilters) => {
  try {
    if (!ValidateSort.safeParse(sortData).success) {
      console.warn("Invalid sort data:", sortData);
      return { error: "Invalid Sort Parameters" };
    }

    if (!path || path === "") {
      console.warn("Empty path received");
      return { error: "Invalid Path" };
    }

    // Log the received path for debugging
    console.log("Processing list path:", path);

    const pathArray = pathToArray(path);
    if (!pathArray || pathArray.length === 0) {
      console.warn("Invalid path array:", pathArray, "from path:", path);
      return { error: "Invalid Path Structure" };
    }

    // Support up to 3 levels of nesting
    if (pathArray.length > 3) {
      console.warn("Path too deep:", pathArray);
      pathArray.splice(3); // Truncate to 3 levels
    }

    console.log("Path array after processing:", pathArray);

    const categoryID = await findCategoryFromPathArray(pathArray);
    if (categoryID === "") {
      console.warn("Could not find category for path array:", pathArray);
      return { error: "Category Not Found" };
    }

    const subCategories: TProductPath[] | null = await getSubCategories(categoryID);
    if (!subCategories) {
      console.warn("Failed to load subcategories for category ID:", categoryID);
      return { error: "Failed to Load Sub-Categories" };
    }

    const allRelatedCategories = await findCategoryChildren(categoryID, pathArray.length);
    if (!allRelatedCategories || allRelatedCategories.length === 0) {
      console.warn("No related categories found for category ID:", categoryID);
      return { error: "No Related Categories Found" };
    }

    const result = await getProductsByCategories(allRelatedCategories, sortData, filters);
    if (!result) {
      console.warn("Failed to load products for categories:", allRelatedCategories);
      return { error: "Failed to Load Products" };
    }

    console.log(`Found ${result.length} products for category ID:`, categoryID);
    return { products: result, subCategories: subCategories };
  } catch (error) {
    console.error("Error in getList:", error);
    return { error: "An unexpected error occurred" };
  }
};

const getSubCategories = async (catID: string) => {
  try {
    if (!catID) return null;

    const result = await db.category.findMany({
      where: {
        parentID: catID,
      },
    });

    if (!result || result.length === 0) return [];

    const subCategories: TProductPath[] = [];
    result.forEach((cat) => {
      subCategories.push({
        label: cat.name,
        url: cat.url,
      });
    });

    return subCategories;
  } catch (error) {
    console.error("Error getting subcategories:", error);
    return null;
  }
};

const findCategoryFromPathArray = async (pathArray: string[]) => {
  try {
    if (!pathArray || pathArray.length === 0) {
      console.warn("Empty path array");
      return "";
    }

    const result = await db.category.findMany();
    if (!result || result.length === 0) {
      console.warn("No categories found in database");
      return "";
    }

    console.log("Searching for category with path:", pathArray);

    // Try to find exact match first
    let parentID: string | null = null;
    let categoryID = "";

    for (const path of pathArray) {
      console.log(`Looking for category with parentID=${parentID} and url=${path}`);
      const matchingCategory = result.find(cat => cat.parentID === parentID && cat.url === path);

      if (!matchingCategory) {
        console.warn(`No matching category found for path segment: ${path} with parentID: ${parentID}`);

        // Try fuzzy match - look for any category with this URL segment regardless of parent
        console.log(`Trying fuzzy match for url=${path}`);
        const fuzzyMatch = result.find(cat => cat.url === path);

        if (fuzzyMatch) {
          console.log(`Found fuzzy match: ${fuzzyMatch.name} (ID: ${fuzzyMatch.id})`);
          categoryID = fuzzyMatch.id;
          parentID = fuzzyMatch.id;
          continue;
        }

        return ""; // Path segment not found at all
      }

      categoryID = matchingCategory.id;
      parentID = categoryID;
      console.log(`Found category: ${matchingCategory.name} (ID: ${matchingCategory.id})`);
    }

    return categoryID;
  } catch (error) {
    console.error("Error finding category from path array:", error);
    return "";
  }
};

const findCategoryChildren = async (catID: string, numberOfParents: number) => {
  try {
    if (!catID) return null;

    if (numberOfParents === 3) return [catID];

    const result = await db.category.findMany();
    if (!result) return null;

    const tempChildren: string[] = [];
    result.forEach((cat) => {
      if (cat.parentID === catID) {
        tempChildren.push(cat.id);
      }
    });

    if (numberOfParents === 1) {
      const lastChildren: string[] = [];
      result.forEach((cat) => {
        if (cat.parentID && tempChildren.includes(cat.parentID)) {
          lastChildren.push(cat.id);
        }
      });
      return tempChildren.concat([catID], lastChildren);
    }

    return tempChildren.concat([catID]);
  } catch (error) {
    console.error("Error finding category children:", error);
    return null;
  }
};

const getProductsByCategories = async (categories: string[], sortData: TListSort, filters: TFilters) => {
  try {
    if (!categories || categories.length === 0) {
      return [];
    }

    const brands: string[] | null = filters.brands.length > 0 ? [] : null;
    if (brands) {
      filters.brands.forEach((brand) => {
        if (brand.isSelected) return brands.push(brand.id);
      });
    }

    let isAvailable: boolean | null = null;
    if (filters.stockStatus === "inStock") isAvailable = true;
    if (filters.stockStatus === "outStock") isAvailable = false;

    const isInitialPrice = filters.priceMinMax[1] === 0;

    const result: TListItem[] | null = await db.product.findMany({
      where: {
        AND: [
          {
            categoryID: { in: categories },
          },
          isAvailable !== null
            ? {
              isAvailable: isAvailable,
            }
            : {},
          brands
            ? {
              brandID: { in: brands },
            }
            : {},
          !isInitialPrice
            ? {
              price: {
                gt: filters.priceMinMax[0],
                lte: filters.priceMinMax[1],
              },
            }
            : {},
        ],
      },
      select: {
        id: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
        name: true,
        price: true,
        salePrice: true,
        specialFeatures: true,
        isAvailable: true,
      },
      orderBy: {
        [sortData.sortName]: sortData.sortType,
      },
    });

    return result || [];
  } catch (error) {
    console.error("Error getting products by categories:", error);
    return null;
  }
};

const pathToArray = (path: string) => {
  if (!path) return [];

  try {
    let pathWithoutPrefix = path;

    // Remove the /list/ prefix if it exists
    if (path.startsWith('/list/')) {
      pathWithoutPrefix = path.substring(6);
    } else if (path.startsWith('/list')) {
      // Handle case where path is just '/list'
      pathWithoutPrefix = path.substring(5);
    }

    // Handle trailing slash
    if (pathWithoutPrefix.endsWith('/')) {
      pathWithoutPrefix = pathWithoutPrefix.slice(0, -1);
    }

    // Split by slashes and filter out empty segments
    const pathArray = pathWithoutPrefix.split('/').filter(segment => segment !== '');

    console.log("Converted path to array:", pathArray);
    return pathArray;
  } catch (error) {
    console.error("Error in pathToArray:", error);
    return [];
  }
};
