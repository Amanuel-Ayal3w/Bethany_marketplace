"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/shared/utils/styling";
import SearchAutocomplete from "@/shared/components/UI/SearchAutocomplete";
import AddVisit from "../addVisit";

import NavBarProfile from "./navProfile";

const StoreNavBar = () => {
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let prevPositionY = 0;
    if (typeof window !== "undefined") prevPositionY = window.scrollY;
    const handleScroll = () => {
      //---handle auto hiding navbar
      if (window !== undefined) {
        const shouldHideNavbar = prevPositionY < window.scrollY && window.scrollY > 100;
        setHideNavbar(shouldHideNavbar);
        prevPositionY = window.scrollY;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <nav
      className={cn(
        "flex flex-col bg-white transition-all pt-5 pb-4 duration-700 fixed w-full z-10 border-b border-gray-200 shadow-sm",
        hideNavbar ? "top-[-180px]" : "top-0"
      )}
    >
      <section className="w-full">
        <div className="storeContainer w-full relative flex justify-between items-center">
          <Link href={"/"} className="mr-0 xl:mr-20 lg:mr-10 flex items-center">
            <div className="flex items-center">
              <span className="text-gray-800 font-bold text-xl">BETHANY</span>
              <span className="text-bethany-blue-500 font-bold text-xl ml-2">MARKETPLACE</span>
            </div>
          </Link>
          <div className="h-11 relative flex-1 mx-6 sm:mx-10">
            <SearchAutocomplete
              placeholder="Search products, brands and more..."
              className="hidden sm:block"
            />
          </div>
          <div className="text-gray-500 flex pr-2 md:pr-0">
            <NavBarProfile />
          </div>
        </div>
      </section>
      <AddVisit />
    </nav>
  );
};

export default StoreNavBar;
