"use client";

import Link from "next/link";
import SafeImage from "@/shared/components/UI/safeImage";

import { TProductCard } from "@/shared/types/common";
import { cn } from "@/shared/utils/styling";
import { useEffect, useState } from "react";

const ProductCard = ({
  name,
  imgUrl,
  price,
  dealPrice = undefined,
  specs,
  url,
  isAvailable = true,
  staticWidth = false,
}: TProductCard) => {
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  // Process image URLs when component mounts or imgUrl changes
  useEffect(() => {
    if (!imgUrl || !Array.isArray(imgUrl)) {
      setProcessedImages(['', '']);
      return;
    }

    // Create normalized URLs that can be safely used by SafeImage
    const normalizedImages = imgUrl.map(src => {
      if (!src) return '';

      // If it's already a complete URL, use it as is
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
      }

      // For local or relative paths, ensure they're properly formatted
      return src.startsWith('/') ? src : `/${src}`;
    });

    // Ensure we always have at least two images (even if second is same as first)
    if (normalizedImages.length === 1 && normalizedImages[0]) {
      setProcessedImages([normalizedImages[0], normalizedImages[0]]);
    } else {
      setProcessedImages(normalizedImages.slice(0, 2));
    }
  }, [imgUrl]);

  // Ensure the URL is correctly formatted
  const productUrl = url && url.trim() !== "" ? url : "#";

  // Calculate discount percentage if there's a deal price
  const discountPercentage = dealPrice ? Math.round(100 - (dealPrice / price) * 100) : 0;

  return (
    <Link
      href={productUrl}
      className={cn(
        "bg-white rounded-xl p-2 transition-all duration-500 relative hover:drop-shadow-sm hover:[&_.imageWrapper>img:last-child]:opacity-100 hover:[&_.imageWrapper>img:last-child]:scale-[1.05]",
        staticWidth && "min-w-64"
      )}
    >
      {!isAvailable && (
        <div className="flex left-2 right-2 bottom-2 top-2 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
          <span className="mt-14 text-gray-100 font-light px-6 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
            Out of Stock
          </span>
        </div>
      )}
      <div className="imageWrapper hover:border-gray-300 w-full h-[225px] block relative rounded-xl border border-gray-200 overflow-hidden transition-all duration-500">
        <SafeImage
          src={processedImages[0] || ''}
          alt={name}
          fill
          sizes="(max-width: 240px)"
          className="object-contain transition-all duration-400 ease-out"
        />
        <SafeImage
          src={processedImages[1] || processedImages[0] || ''}
          alt={`${name} alternate view`}
          fill
          sizes="(max-width: 240px)"
          className="object-contain transition-all duration-400 ease-out opacity-0 scale-[0.9]"
        />
      </div>
      <span className="inline-block text-gray-800 mt-2.5 mb-2 ml-2">{name}</span>
      <div className="h-16 flex flex-col">
        {specs && specs.map((spec, index) => (
          <span key={index} className="block text-sm ml-2 text-gray-600">
            {spec}
          </span>
        ))}
      </div>
      <div className="flex items-end h-10 mt-6 ml-2">
        <div className="flex-grow">
          {dealPrice ? (
            <>
              <div className="flex items-center mb-1.5">
                <span className="inline-flex justify-center items-center h-5 px-2 text-xs font-medium text-red-800 bg-red-100 rounded-sm">
                  -{discountPercentage}%
                </span>
                <span className="ml-2 text-xs text-gray-500 line-through">
                  was {price.toLocaleString("en-us", { minimumFractionDigits: 2 })} ETB
                </span>
              </div>
              <span className="text-lg font-medium text-gray-800">
                {dealPrice.toLocaleString("en-us", {
                  minimumFractionDigits: 2,
                })}
                ETB
              </span>
            </>
          ) : (
            <span className="text-lg font-medium text-gray-800">
              {price.toLocaleString("en-us", { minimumFractionDigits: 2 })} ETB
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
