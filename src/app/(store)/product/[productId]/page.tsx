"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getOneProduct, getSimilarProducts } from "@/actions/product/product";
import Gallery from "@/domains/product/components/gallery";
import ProductBoard from "@/domains/product/components/productBoard";
import ProductCard from "@/domains/product/components/productCard";
import { MinusIcon } from "@/shared/components/icons/svgIcons";
import { SK_Box } from "@/shared/components/UI/skeleton";
import { getImageUrl } from "@/shared/constants/store";
import { TProductPageInfo } from "@/shared/types/product";

const ProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId;

  const [productInfo, setProductInfo] = useState<TProductPageInfo | null | undefined>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProductFromDB = async () => {
      if (!productId) {
        setError("Invalid product ID");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getOneProduct(Array.isArray(productId) ? productId[0] : productId.toString());

        if (response.error) {
          setError(response.error);
          setIsLoading(false);
          return;
        }

        setProductInfo(response.res);

        // Fetch similar products once we have the current product
        const similarProductsResponse = await getSimilarProducts(Array.isArray(productId) ? productId[0] : productId.toString());
        if (similarProductsResponse.res && Array.isArray(similarProductsResponse.res)) {
          setSimilarProducts(similarProductsResponse.res);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product information");
        setIsLoading(false);
      }
    };

    getProductFromDB();
  }, [productId, router]);

  if (isLoading) {
    return (
      <div className="storeContainer">
        <div className="w-full h-auto mt-[100px] flex flex-col">
          <div className="w-full flex flex-col lg:flex-row gap-12">
            <div className="flex-grow">
              <SK_Box width="60%" height="15px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || productInfo === undefined) {
    return (
      <div className="storeContainer">
        <div className="w-full h-auto mt-[100px] flex flex-col items-center justify-center">
          <h2 className="text-xl text-red-600 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for is not available."}</p>
          <Link href="/" className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let fullPath = "";

  // Format the images to include the base URL and ensure proper paths
  const formattedImages = productInfo?.images
    ? productInfo.images
      .filter((img): img is string => img !== undefined && img !== null)
      .map(img => getImageUrl(img))
    : undefined;

  return (
    <div className="storeContainer">
      <div className="w-full h-auto mt-[100px] flex flex-col">
        <div className="w-full flex flex-col lg:flex-row gap-12">
          <div className="flex-grow">
            <div className="block text-gray-700 w-full mb-10 text-sm">
              {productInfo ? (
                <>
                  <Link href={"/"} className="hover:font-medium after:mx-1 after:content-['/'] hover:text-gray-800">
                    Home
                  </Link>
                  {productInfo.path && productInfo.path.map((item, index) => {
                    fullPath += "/" + item.url;
                    return (
                      <Link
                        key={item.url + index}
                        href={"/list" + fullPath}
                        className="after:content-['/'] last:after:content-[''] after:mx-1 hover:text-gray-800"
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <SK_Box width="60%" height="15px" />
              )}
            </div>
            <Gallery images={formattedImages} />
          </div>
          <div className="lg:w-[512px] w-full">
            {productInfo ? (
              <ProductBoard
                boardData={{
                  id: productInfo?.id || "",
                  isAvailable: productInfo?.isAvailable || false,
                  defaultQuantity: 1,
                  name: productInfo?.name || "",
                  price: productInfo?.price || 0,
                  dealPrice: productInfo?.salePrice || undefined,
                  shortDesc: productInfo?.desc || "",
                  specialFeatures: productInfo?.specialFeatures || [],
                }}
              />
            ) : (
              <div className="flex flex-col">
                <SK_Box width="60%" height="14px" />
                <div className="flex flex-col mt-10 gap-5">
                  <SK_Box width="40%" height="30px" />
                  <SK_Box width="90%" height="16px" />
                </div>
                <div className="flex flex-col gap-4 mt-10">
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                </div>
                <div className="flex flex-col gap-4 mt-16">
                  <SK_Box width="30%" height="40px" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-auto flex gap-12 mt-10">
          <div className="w-full flex flex-col">
            {/* ----------------- SPECIFICATION SECTION ----------------- */}
            <div className="w-full mb-[100px]">
              <h2 className="font-light block text-2xl text-gray-900 py-5 border-b border-gray-300">Specification</h2>
              {productInfo ? (
                productInfo.specifications.map((spec, index) => (
                  <section key={index} className="w-full py-5 border-b border-gray-300">
                    <div className="flex items-center w-full">
                      <button className="size-8 inline-block relative border-none bg-white rounded-sm hover:bg-gray-200">
                        <MinusIcon width={12} className="absolute top-3.5 left-2.5 stroke-gray-700" />
                      </button>
                      <h3 className="ml-3 inline-block text-gray-700">{spec.groupName}</h3>
                    </div>
                    {spec.specs.map((row, index) => (
                      <div
                        key={index}
                        className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100"
                      >
                        <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                          <span>{row.name}</span>
                        </div>
                        <div className="font-medium text-gray-800">
                          <span key={index} className="block leading-5 min-h-8 h-auto">
                            {row.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </section>
                ))
              ) : (
                <>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ----------------- SIMILAR PRODUCTS SECTION ----------------- */}
        <div className="w-full my-[100px]">
          <h2 className="font-light block text-2xl text-gray-900 mb-4">Similar Products</h2>
          <div className="flex justify-between gap-3.5 w-full overflow-x-scroll pb-2">
            {similarProducts.length > 0 ? (
              similarProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  imgUrl={[
                    product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '',
                    product.images && product.images.length > 1 ? getImageUrl(product.images[1]) : (
                      product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : ''
                    )
                  ]}
                  name={product.name}
                  price={product.price}
                  specs={product.specialFeatures || []}
                  url={`/product/${product.id}`}
                  dealPrice={product.salePrice}
                  staticWidth
                  isAvailable={product.isAvailable}
                />
              ))
            ) : (
              <p className="text-gray-500 py-4">No similar products found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
