import { COMPANIES_LOGOS } from "@/shared/constants/store/homePage/compayLogos";
import Image from "next/image";
import Link from "next/link";
import CompanyLogo from "./CompanyLogo";

type Brand = {
  id: string;
  name: string;
  logoPath?: string;
};

type CompanyLogoListProps = {
  brands?: Brand[];
};

export const CompanyLogoList = ({ brands }: CompanyLogoListProps) => {
  // Use passed brands if available, otherwise fall back to static content
  const hasDynamicBrands = brands && brands.length > 0;

  // If we have fewer than 4 brands, add a placeholder to maintain layout
  const displayBrands = hasDynamicBrands ? brands : [];

  return (
    <div className="w-full mt-24 mb-12 md:mb-32 flex flex-col">
      <h2 className="text-2xl font-medium text-gray-700 text-center mb-10">Featured Brands</h2>

      {hasDynamicBrands ? (
        // Display dynamic brands in a grid layout
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/list/brand/${brand.id}`}
              className="flex items-center justify-center h-20 px-4 transition-all duration-300 hover:scale-105"
            >
              {brand.logoPath ? (
                <Image
                  src={brand.logoPath}
                  alt={brand.name}
                  width={120}
                  height={48}
                  style={{ objectFit: "contain", maxHeight: "48px" }}
                  className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <div className="text-lg font-medium text-gray-700 hover:text-gray-900 text-center">
                  {brand.name}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        // Fall back to static content if no brands are configured
        <div className="flex justify-between items-center md:flex-row md:gap-0 flex-col gap-8">
          {COMPANIES_LOGOS.map((companyLogo, idx) => (
            <CompanyLogo key={idx} {...companyLogo} />
          ))}
        </div>
      )}
    </div>
  );
};
