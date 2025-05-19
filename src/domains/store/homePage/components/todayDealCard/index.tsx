"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getTodayDealProducts } from "@/actions/product/product";
import { SK_Box } from "@/shared/components/UI/skeleton";
import { getImageUrl } from "@/shared/constants/store";

import TodayDealCard from "./TodayDealCard";

export const TodayDealCards = () => {
  const [dealProducts, setDealProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        const response = await getTodayDealProducts();
        if (response.res && Array.isArray(response.res)) {
          setDealProducts(response.res);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching deal products:", error);
        setIsLoading(false);
      }
    };

    fetchDealProducts();
  }, []);

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Today's Deals</h2>
        <Link
          href={"/list"}
          className="font-medium bg-[position:right_center] hover:pr-5 pr-6 text-gray-700 bg-[url('/icons/arrowIcon02.svg')] bg-no-repeat bg-right-center transition-all duration-300 ease-out"
        >
          view all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-between gap-3.5 pb-7">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="min-w-64 h-[400px] relative p-2 bg-white rounded-xl">
              <SK_Box width="100%" height="220px" className="rounded-lg" />
              <SK_Box width="50%" height="18px" className="mt-3.5 mb-3 ml-2" />
              <div className="h-14 w-full ml-2">
                <SK_Box width="80%" height="12px" className="mb-1" />
                <SK_Box width="60%" height="12px" className="mb-1" />
              </div>
              <div className="flex justify-between mx-2 mt-2">
                <div>
                  <SK_Box width="80px" height="14px" className="mb-1" />
                  <SK_Box width="100px" height="22px" />
                </div>
                <SK_Box width="60px" height="40px" />
              </div>
            </div>
          ))}
        </div>
      ) : dealProducts.length > 0 ? (
        <div className="flex justify-between gap-3.5 overflow-x-scroll pb-7 2xl:pb-0 2xl:overflow-x-hidden">
          {dealProducts.map((product) => (
            <TodayDealCard
              key={product.id}
              productName={product.name}
              oldPrice={product.price}
              newPrice={product.salePrice || product.price}
              image={[
                product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '',
                product.images && product.images.length > 1 ? getImageUrl(product.images[1]) : (
                  product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : ''
                )
              ]}
              spec={product.specialFeatures || []}
              dealEndTime={new Date("1970-01-01T18:00:00")} // Fixed time for now
              url={`/product/${product.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No deals available at the moment.
        </div>
      )}
    </div>
  );
};
