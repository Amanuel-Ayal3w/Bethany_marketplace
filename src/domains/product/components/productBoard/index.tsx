"use client";

import Link from "next/link";

import { TProductBoard } from "@/shared/types/product";
import Button from "@/shared/components/UI/button";

interface ProductBoardProps {
  boardData: TProductBoard;
}

const ProductBoard = ({ boardData }: ProductBoardProps) => {
  const { name, id, isAvailable, specialFeatures, price, shortDesc, dealPrice, defaultQuantity } = boardData;

  return (
    <div className="w-full relative flex flex-col">
      <h1 className="block text-2xl leading-9 font-medium mt-2 mb-2.5 text-gray-700">{name}</h1>
      <span className="block text-xs text-gray-700 mb-4">{shortDesc}</span>
      <hr className="w-full border-t border-gray-300 mb-5" />
      <div className="flex flex-col gap-3 text-sm text-gray-500 mb-12">
        {specialFeatures && specialFeatures?.map((feature, index) => <span key={index}>{feature}</span>)}
      </div>
      <h2 className="text-3xl font-medium text-gray-800 mb-5">
        {(dealPrice ? dealPrice : price).toLocaleString("en-us", {
          minimumIntegerDigits: 2,
          minimumFractionDigits: 2,
        })}{" "}
        ETB
      </h2>

      {dealPrice && (
        <div className="mb-5 text-sm">
          <span className="text-white rounded-sm bg-bethany-red-500 px-3 py-1">
            {`
            Save
            ${(price - dealPrice).toLocaleString("en-us", {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
            })} ETB
            `}
          </span>
          <span className="mt-[10px] block text-gray-800">Was {price} ETB</span>
        </div>
      )}
      <hr className="w-full border-t border-gray-300 mb-5" />

      {/* ----------------- CONTACT US SECTION ----------------- */}
      <section className="flex items-center w-full">
        <Link href="/contact">
          <Button className="flex justify-center items-center gap-5 cursor-pointer ml-6 sm:ml-10 text-sm sm:text-lg font-light px-8 sm:px-12 py-2.5 bg-bethany-blue-500 rounded-lg text-white transition-all duration-300 hover:bg-bethany-blue-600">
            Contact Us
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default ProductBoard;
