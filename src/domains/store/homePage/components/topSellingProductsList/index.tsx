"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getTopSellingProducts } from "@/actions/product/product";
import ProductCard from "@/domains/product/components/productCard";
import { SK_Box } from "@/shared/components/UI/skeleton";
import { getImageUrl } from "@/shared/constants/store";

export const TopSellingProductsList = () => {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await getTopSellingProducts();
        if (response.res && Array.isArray(response.res)) {
          setTopProducts(response.res);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Top Selling Products</h2>
        <Link href={"/list"}>view all</Link>
      </div>

      {isLoading ? (
        <div className="flex justify-between gap-3.5 pb-7">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="min-w-[220px] flex flex-col gap-2">
              <SK_Box width="100%" height="140px" />
              <SK_Box width="80%" height="20px" />
              <SK_Box width="40%" height="16px" />
            </div>
          ))}
        </div>
      ) : topProducts.length > 0 ? (
        <div className="flex justify-between gap-3.5 overflow-x-scroll pb-7 2xl:pb-2 2xl:overflow-x-visible">
          {topProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              imgUrl={[
                product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '',
                product.images && product.images.length > 1 ? getImageUrl(product.images[1]) : (
                  product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : ''
                )
              ]}
              price={product.price}
              specs={product.specialFeatures || []}
              url={`/product/${product.id}`}
              dealPrice={product.salePrice}
              staticWidth
              isAvailable={product.isAvailable}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No products available at the moment.
        </div>
      )}
    </div>
  );
};
