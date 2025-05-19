"use server";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import {
  TAddProductFormValues,
  TCartListItemDB,
  TPath,
  TProductListItem,
  TProductPageInfo,
  TSpecification,
  ProductSpec
} from "@/shared/types/product";

const ValidateAddProduct = z.object({
  name: z.string().min(3),
  brandID: z.string().min(6),
  specialFeatures: z.array(z.string()),
  desc: z.string().optional(),
  images: z.array(z.string()),
  categoryID: z.string().min(6),
  price: z.string().min(1),
  salePrice: z.string(),
  specifications: z.array(
    z.object({
      specGroupID: z.string().min(6),
      specValues: z.array(z.string()),
    })
  ),
});

const convertStringToFloat = (str: string) => {
  str.replace(/,/, ".");
  return str ? parseFloat(str) : 0.0;
};

export const addProduct = async (data: TAddProductFormValues) => {
  if (!ValidateAddProduct.safeParse(data).success) return { error: "Invalid Data!" };

  try {
    const price = convertStringToFloat(data.price);
    const salePrice = data.salePrice ? convertStringToFloat(data.salePrice) : null;

    const result = db.category.update({
      where: {
        id: data.categoryID,
      },
      data: {
        products: {
          create: {
            name: data.name,
            desc: data.desc,
            brandID: data.brandID,
            specialFeatures: data.specialFeatures,
            isAvailable: data.isAvailable,
            price: price,
            salePrice: salePrice,
            images: [...data.images],
            specs: data.specifications,
          },
        },
      },
    });
    if (!result) return { error: "Can't Insert Data" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getAllProducts = async () => {
  try {
    const result = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        isAvailable: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    if (!result) return { error: "Can't Get Data from Database!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getOneProduct = async (productID: string) => {
  if (!productID || productID === "") {
    console.error("Invalid Product ID received:", productID);
    return { error: "Invalid Product ID!" };
  }

  try {
    const result = await db.product.findFirst({
      where: {
        id: productID,
      },
      select: {
        id: true,
        name: true,
        desc: true,
        images: true,
        price: true,
        salePrice: true,
        specs: true,
        specialFeatures: true,
        isAvailable: true,
        optionSets: true,
        category: {
          select: {
            id: true,
            parentID: true,
          },
        },
      },
    });

    if (!result) {
      console.warn("Product not found in database:", productID);
      return { error: "Product not found" };
    }

    const specifications = await generateSpecTable(result.specs);

    let pathArray: TPath[] | null = [];
    try {
      pathArray = await getPathByCategoryID(result.category.id, result.category.parentID);
      if (!pathArray || pathArray.length === 0) {
        console.warn("Could not generate path for product category. Using empty path.");
        pathArray = [];
      }
    } catch (pathError) {
      console.error("Error generating path:", pathError);
      pathArray = [];
    }

    //eslint-disable-next-line
    const { specs, ...others } = result;
    const mergedResult: TProductPageInfo = {
      ...others,
      specifications: specifications || [],
      path: pathArray || [],
    };

    return { res: mergedResult };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { error: "Failed to load product information" };
  }
};

export const getCartProducts = async (productIDs: string[]) => {
  if (!productIDs || productIDs.length === 0) return { error: "Invalid Product List" };

  try {
    const result: TCartListItemDB[] | null = await db.product.findMany({
      where: {
        id: { in: productIDs },
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        salePrice: true,
      },
    });

    if (!result) return { error: "Can't Get Data from Database!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const deleteProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Data!" };
  try {
    const result = await db.product.delete({
      where: {
        id: productID,
      },
    });

    if (!result) return { error: "Can't Delete!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

const generateSpecTable = async (rawSpec: any) => {
  try {
    // Type-safe handling of specs
    if (!rawSpec || typeof rawSpec !== 'object') {
      console.warn("Invalid specs format:", rawSpec);
      return [];
    }

    const specData = rawSpec as ProductSpec[];
    if (!Array.isArray(specData) || specData.length === 0) {
      console.warn("Empty specs array or not an array:", specData);
      return [];
    }

    const specGroupIDs = specData
      .filter(spec => spec && spec.specGroupID)
      .map(spec => spec.specGroupID);

    if (specGroupIDs.length === 0) {
      console.warn("No valid spec group IDs found");
      return [];
    }

    const result = await db.specGroup.findMany({
      where: {
        id: { in: specGroupIDs },
      },
    });

    if (!result || result.length === 0) {
      console.warn("No spec groups found for IDs:", specGroupIDs);
      return [];
    }

    const specifications: TSpecification[] = [];

    specData.forEach((spec) => {
      if (!spec || !spec.specGroupID || !spec.specValues) return;

      const groupSpecIndex = result.findIndex((g) => g.id === spec.specGroupID);
      if (groupSpecIndex === -1) return;

      const tempSpecs: { name: string; value: string }[] = [];

      if (Array.isArray(spec.specValues)) {
        spec.specValues.forEach((s, index) => {
          if (result[groupSpecIndex] && result[groupSpecIndex].specs &&
            result[groupSpecIndex].specs[index] !== undefined) {
            tempSpecs.push({
              name: result[groupSpecIndex].specs[index] || "",
              value: s || "",
            });
          }
        });
      }

      if (tempSpecs.length > 0) {
        specifications.push({
          groupName: result[groupSpecIndex].title || "",
          specs: tempSpecs,
        });
      }
    });

    return specifications;
  } catch (error) {
    console.error("Error generating specification table:", error);
    return [];
  }
};

const getPathByCategoryID = async (categoryID: string, parentID: string | null) => {
  try {
    if (!categoryID || categoryID === "") return null;
    if (!parentID || parentID === "") return null;
    const result: TPath[] = await db.category.findMany({
      where: {
        OR: [{ id: categoryID }, { id: parentID }, { parentID: null }],
      },
      select: {
        id: true,
        parentID: true,
        name: true,
        url: true,
      },
    });
    if (!result || result.length === 0) return null;

    const path: TPath[] = [];
    let tempCatID: string | null = categoryID;
    let searchCount = 0;

    const generatePath = () => {
      const foundCatIndex = result.findIndex((cat) => cat.id === tempCatID);
      if (foundCatIndex === -1) return;
      path.unshift(result[foundCatIndex]);
      tempCatID = result[foundCatIndex].parentID;
      if (!tempCatID) return;
      searchCount++;
      if (searchCount <= 3) generatePath();
      return;
    };
    generatePath();

    if (!path || path.length === 0) return null;
    return path;
  } catch {
    return null;
  }
};

export const updateProduct = async (productId: string, data: TAddProductFormValues) => {
  if (!productId || productId === "") return { error: "Invalid Product ID!" };
  if (!ValidateAddProduct.safeParse(data).success) return { error: "Invalid Data!" };

  try {
    const price = convertStringToFloat(data.price);
    const salePrice = data.salePrice ? convertStringToFloat(data.salePrice) : null;

    const result = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        name: data.name,
        desc: data.desc,
        brandID: data.brandID,
        specialFeatures: data.specialFeatures,
        isAvailable: data.isAvailable,
        price: price,
        salePrice: salePrice,
        images: [...data.images],
        specs: data.specifications,
        categoryID: data.categoryID
      },
    });

    if (!result) return { error: "Can't Update Product" };
    return { res: result };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: JSON.stringify(error) };
  }
};

export const getProductForEdit = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Product ID!" };

  try {
    const result = await db.product.findFirst({
      where: {
        id: productID,
      },
      select: {
        id: true,
        name: true,
        desc: true,
        images: true,
        price: true,
        salePrice: true,
        specs: true,
        specialFeatures: true,
        isAvailable: true,
        brandID: true,
        categoryID: true,
      },
    });

    if (!result) return { error: "Product not found" };

    // Convert types for the form
    const formData: TAddProductFormValues = {
      name: result.name,
      desc: result.desc || "",
      images: result.images,
      price: result.price.toString(),
      salePrice: result.salePrice ? result.salePrice.toString() : "",
      isAvailable: result.isAvailable,
      specialFeatures: result.specialFeatures,
      brandID: result.brandID,
      categoryID: result.categoryID,
      specifications: result.specs as ProductSpec[],
    };

    return { res: formData, id: result.id };
  } catch (error) {
    console.error("Error getting product for edit:", error);
    return { error: JSON.stringify(error) };
  }
};

export const getSimilarProducts = async (productId: string, limit = 5) => {
  if (!productId || productId === "") {
    return { error: "Invalid Product ID!" };
  }

  try {
    // First get the current product to determine its category
    const currentProduct = await db.product.findFirst({
      where: {
        id: productId,
      },
      select: {
        id: true,
        categoryID: true,
      },
    });

    if (!currentProduct) {
      return { error: "Product not found" };
    }

    // Then find similar products from the same category, excluding the current product
    const similarProducts = await db.product.findMany({
      where: {
        categoryID: currentProduct.categoryID,
        id: { not: productId },
        isAvailable: true, // Only include available products
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        specialFeatures: true,
        isAvailable: true,
      },
      take: limit, // Limit the number of similar products
    });

    return { res: similarProducts };
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return { error: "Failed to load similar products" };
  }
};

export const getTopSellingProducts = async (limit = 5) => {
  try {
    // For now, we'll just return the most recent products
    // In a real app, this would be based on actual sales data
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        specialFeatures: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        // This is just a placeholder for now
        // In a real app, you might order by sales count or another metric
        id: 'desc',
      },
      take: limit,
    });

    return { res: products };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return { error: "Failed to load top selling products" };
  }
};

export const getTodayDealProducts = async (limit = 5) => {
  try {
    // Find products that have sale prices (on discount)
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        salePrice: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        specialFeatures: true,
        isAvailable: true,
      },
      orderBy: {
        // Sort by the biggest discount first
        salePrice: 'asc',
      },
      take: limit,
    });

    return { res: products };
  } catch (error) {
    console.error("Error fetching deal products:", error);
    return { error: "Failed to load deal products" };
  }
};
