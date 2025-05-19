"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getList } from "@/actions/list/listServices";
import ProductCard from "@/domains/product/components/productCard";
import { ProductListSkeleton } from "@/domains/store/productList/components";
import NoItem from "@/domains/store/productList/components/noItem";
import { DEFAULT_FILTERS, SORT_DATA, sortDropdownData } from "@/domains/store/productList/constants";
import { TFilterBrands, TFilters, TListItem } from "@/domains/store/productList/types";
import { TPageStatus } from "@/domains/store/productList/types/";
import { getFiltersFromProductList } from "@/domains/store/productList/utils";
import Button from "@/shared/components/UI/button";
import DropDownList from "@/shared/components/UI/dropDown";
import LineList from "@/shared/components/UI/lineList";
import { IMAGE_BASE_URL, getImageUrl } from "@/shared/constants/store";
import { TProductPath } from "@/shared/types/product";
import { cn } from "@/shared/utils/styling";

const ListPage = () => {
  const router = useRouter();
  const { params } = useParams<{ params: string[] }>();
  const pathName = usePathname();

  const [productList, setProductList] = useState<TListItem[]>([]);
  const [subCategories, setSubCategories] = useState<TProductPath[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [totalItems, setTotalItems] = useState(0);

  const [sortIndex, setSortIndex] = useState(0);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [filters, setFilters] = useState<TFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<TFilters>({
    ...DEFAULT_FILTERS,
    priceMinMax: [...DEFAULT_FILTERS.priceMinMax],
  });

  const [isListLoading, setIsListLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const getProductsList = async () => {
      setIsListLoading(true);

      const response = await getList(pathName, SORT_DATA[sortIndex], appliedFilters);
      if (response.error || !response.products || !response.subCategories) return router.push("/");

      if (isFilterApplied) {
        setFilters(appliedFilters);
        setProductList(response.products);
      } else {
        const filtersFromDB = getFiltersFromProductList(response.products);
        setFilters(filtersFromDB);
        setSubCategories(response.subCategories);
        setProductList(response.products);
      }

      setTotalItems(response.products.length);
      setIsListLoading(false);
    };

    getProductsList();
  }, [router, pathName, sortIndex, appliedFilters, isFilterApplied]);

  // Add mock products if product list is empty and not loading
  useEffect(() => {
    if (!isListLoading && productList.length === 0 && !isFilterApplied) {
      const mockProducts: TListItem[] = Array.from({ length: 50 }, (_, i) => ({
        id: `test-${i}`,
        name: `Test Product ${i + 1}`,
        price: 99.99,
        salePrice: i % 3 === 0 ? 79.99 : null,
        isAvailable: true,
        images: ['test-image.jpg'],
        specialFeatures: [`Feature 1 for product ${i + 1}`, `Feature 2 for product ${i + 1}`],
        brand: {
          id: "test-brand",
          name: "Test Brand"
        }
      }));
      setProductList(mockProducts);
      setTotalItems(mockProducts.length);
    }
  }, [isListLoading, productList.length, isFilterApplied]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return productList.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getPageNumbers = (): (number | string)[] => {
    const maxPagesToShow = 5;
    const pageNumbers: (number | string)[] = [];

    // If there are no pages or just one page, show at least page 1
    if (totalPages <= 0) {
      return [1];
    }

    if (totalPages <= maxPagesToShow) {
      // If total pages is small, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      // Calculate start and end for visible page numbers
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(currentPage + 1, totalPages - 1);

      // Adjust the range to always show 3 numbers (if possible)
      if (start === 2) end = Math.min(4, totalPages - 1);
      if (end === totalPages - 1) start = Math.max(2, totalPages - 3);

      // Add the range
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!params || !params.length) {
    router.push("/");
    return <div className="mt-[100px] bg-white"><ProductListSkeleton /></div>;
  }

  const handleSortChange = (newIndex: number) => {
    setSortIndex(newIndex);
  };

  const getPageHeader = () => {
    if (!params || !params.length) return "Products";

    try {
      const pageName = params[params.length - 1].split("-");
      pageName.forEach((word, index) => {
        pageName[index] = word[0].toUpperCase() + word.slice(1);
      });
      return pageName.join(" ");
    } catch (error) {
      console.error("Error formatting page header:", error);
      return "Products";
    }
  };

  const getLink = (array: string[], index: number) => {
    let link = "/list";
    for (let i = 0; i <= index; i++) {
      link += "/" + array[i];
    }
    return link;
  };

  const handleBrandChange = (index: number) => {
    const newBrandList = JSON.parse(JSON.stringify(filters.brands));
    newBrandList[index].isSelected = !newBrandList[index].isSelected;
    setFilters({ ...filters, brands: newBrandList });
  };

  const defineFilterChangeStatus = () => {
    if (appliedFilters.stockStatus !== filters.stockStatus) return false;

    if (JSON.stringify(appliedFilters.brands) !== JSON.stringify(filters.brands)) return false;

    if (JSON.stringify(appliedFilters.priceMinMax) !== JSON.stringify(filters.priceMinMax)) return false;

    return true;
  };
  const isFilterChanged: boolean = defineFilterChangeStatus();
  const handleApplyFilter = () => {
    const newFilter: TFilters = {
      brands: JSON.parse(JSON.stringify(filters.brands)),
      priceMinMax: [...filters.priceMinMax],
      stockStatus: filters.stockStatus,
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(true);
    setAppliedFilters(newFilter);
  };

  const handleResetFilters = () => {
    const newBrands: TFilterBrands[] = [];
    filters.brands.forEach((b) => newBrands.push({ id: b.id, name: b.name, isSelected: true }));
    const newFilter: TFilters = {
      brands: newBrands,
      priceMinMax: [...filters.priceMinMaxLimitation],
      stockStatus: "all",
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(false);
    setAppliedFilters(newFilter);
  };

  const getPageStatus = (): TPageStatus => {
    if (isListLoading) {
      if (isFilterApplied) return "filterLoading";
      return "pageLoading";
    }

    if (productList.length > 0) return "filledProductList";

    if (isFilterApplied) return "filterHasNoProduct";

    return "categoryHasNoProduct";
  };
  const currentPageStatus: TPageStatus = getPageStatus();

  const pageStatusJSX = {
    pageLoading: (
      <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">
        <ProductListSkeleton />
      </div>
    ),
    filterLoading: (
      <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">
        <ProductListSkeleton />
      </div>
    ),
    filledProductList: (
      <>
        <div className="flex justify-between items-center w-full px-5 py-4 bg-white mb-6 rounded-md border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-700">
            <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> results for <strong>"{getPageHeader()}"</strong>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2 hidden sm:inline">Sort by:</span>
            <DropDownList data={sortDropdownData} width="180px" selectedIndex={sortIndex} onChange={handleSortChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-8">
          {getCurrentItems().map((product) => {
            let imageUrl1 = '';
            let imageUrl2 = '';

            if (Array.isArray(product.images) && product.images.length > 0) {
              const validImages = product.images
                .filter(img => img && typeof img === 'string')
                .map(img => getImageUrl(img));

              if (validImages.length > 0) {
                imageUrl1 = validImages[0];
                imageUrl2 = validImages.length > 1 ? validImages[1] : validImages[0];
              }
            }

            return (
              <div key={product.id} className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition duration-300 flex flex-col h-full">
                <Link href={`/product/${product.id}`} className="group">
                  <div className="relative h-48 overflow-hidden mb-3 rounded-md">
                    <img
                      src={imageUrl1}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
                    <Link href={`/product/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-lg font-bold mr-2">ETB {product.price.toFixed(2)}</span>
                    {product.salePrice && (
                      <span className="text-sm text-gray-500 line-through">ETB {product.salePrice.toFixed(2)}</span>
                    )}
                  </div>
                  {product.specialFeatures && product.specialFeatures.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-1">
                      {product.specialFeatures.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="mb-0.5">{feature}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2">
                    {product.isAvailable ? (
                      <span className="text-xs text-green-700">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Component */}
        <div className="flex flex-col items-center mb-10 mt-8 border-t border-gray-200 pt-8">
          <div className="text-sm text-gray-600 mb-4">
            Showing page {currentPage} of {Math.max(1, totalPages)}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {getPageNumbers().map((pageNumber, index) =>
              pageNumber === '...' ? (
                <span key={`ellipsis-bottom-${index}`} className="px-3 py-1.5 text-gray-500">...</span>
              ) : (
                <button
                  key={`page-bottom-${pageNumber}`}
                  onClick={() => handlePageChange(pageNumber as number)}
                  className={`min-w-[40px] px-3 py-1.5 rounded-md text-sm ${currentPage === pageNumber
                    ? 'bg-blue-600 text-white border border-blue-600 font-medium'
                    : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700'
                    }`}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(Math.min(Math.max(1, totalPages), currentPage + 1))}
              disabled={currentPage === Math.max(1, totalPages)}
              className="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed text-sm flex items-center"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </>
    ),
    categoryHasNoProduct: <NoItem pageHeader={getPageHeader()} />,
    filterHasNoProduct: (
      <div className="flex flex-col items-center justify-center text-sm min-h-[400px] gap-4">
        <span> There is no product!</span>
        <Button onClick={handleResetFilters} className="w-[200px]">
          Reset Filters
        </Button>
      </div>
    ),
  }[currentPageStatus];

  return (
    <div className="mt-[100px] bg-white">
      <div className="w-full bg-gray-100 py-5 px-3 md:p-6 flex mt-32 sm:mt-0 flex-col justify-center items-center">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">{getPageHeader()}</h1>
        <div className="flex gap-3 items-center text-sm">
          <Link
            href={"/"}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Home
          </Link>
          {params && params.length > 0 && params.map((item, index) => (
            <Link
              className={cn(
                "flex items-center",
                index === params.length - 1 ? "text-gray-600" : "text-blue-600 hover:text-blue-700 transition-colors"
              )}
              key={index}
              href={getLink(params, index)}
            >
              {index > 0 && <span className="mx-2 text-gray-400">›</span>}
              {item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Link>
          ))}
        </div>
        <div className="h-auto md:h-7 mt-2">
          {!!subCategories?.length && (
            <div className="flex flex-wrap gap-2 border border-gray-300 bg-white rounded-md mt-2 px-3 py-1 text-gray-500 text-sm">
              <span>Related:</span>
              {subCategories.map((cat, index) => (
                <Link
                  href={pathName + "/" + cat.url}
                  key={index}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col md:flex-row mt-4">
          {/* Mobile filter toggle button */}
          <div className="md:hidden mb-4 px-4 w-full">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className={`w-full md:w-80 lg:w-96 xl:w-96 pr-0 md:pr-6 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`} style={{ maxWidth: '384px', flex: '0 0 auto' }}>
            <div className="bg-white border border-gray-200 rounded-md p-5 mb-4 sticky top-20 shadow-sm w-full">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">Filters</h2>

              {/* Price filter section */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-800">Price</h3>
                <div className="space-y-3 w-full">
                  <div className="flex items-center w-full">
                    <input
                      type="range"
                      min={filters.priceMinMaxLimitation[0]}
                      max={filters.priceMinMaxLimitation[1]}
                      value={filters.priceMinMax[1]}
                      onChange={(e) => {
                        const newFilters = { ...filters };
                        newFilters.priceMinMax[1] = parseInt(e.target.value);
                        setFilters(newFilters);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>ETB {filters.priceMinMax[0]}</span>
                    <span>ETB {filters.priceMinMax[1] || filters.priceMinMaxLimitation[1]}</span>
                  </div>

                  {/* Price input fields */}
                  <div className="flex items-center gap-3 pt-3 w-full">
                    <div className="w-1/2">
                      <label className="text-xs text-gray-500 mb-1 block">From</label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">ETB</span>
                        </div>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded py-1.5 pl-11 pr-2 text-sm"
                          value={filters.priceMinMax[0]}
                          onChange={(e) => {
                            const newFilters = { ...filters };
                            newFilters.priceMinMax[0] = parseInt(e.target.value) || 0;
                            setFilters(newFilters);
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs text-gray-500 mb-1 block">To</label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">ETB</span>
                        </div>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded py-1.5 pl-11 pr-2 text-sm"
                          value={filters.priceMinMax[1]}
                          onChange={(e) => {
                            const newFilters = { ...filters };
                            newFilters.priceMinMax[1] = parseInt(e.target.value) || filters.priceMinMaxLimitation[1];
                            setFilters(newFilters);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock status filter section */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-800">Availability</h3>
                <div className="space-y-1.5">
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.stockStatus === "all"}
                      onChange={() => setFilters({ ...filters, stockStatus: "all" })}
                      className="mr-2.5 h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">All</span>
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.stockStatus === "inStock"}
                      onChange={() => setFilters({ ...filters, stockStatus: "inStock" })}
                      className="mr-2.5 h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.stockStatus === "outStock"}
                      onChange={() => setFilters({ ...filters, stockStatus: "outStock" })}
                      className="mr-2.5 h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">Out of Stock</span>
                  </label>
                </div>
              </div>

              {/* Brand filters section */}
              {filters.brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3 text-gray-800">Brands</h3>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                    {filters.brands.map((brand, index) => (
                      <label key={index} className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={brand.isSelected}
                          onChange={() => handleBrandChange(index)}
                          className="mr-2.5 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply/Reset buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleApplyFilter}
                  disabled={isFilterChanged}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${isFilterChanged
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  Apply
                </button>
                {isFilterApplied && (
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 py-2 px-4 rounded-md text-sm font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-grow min-w-0 px-2 md:px-5 w-full md:w-[calc(100%-384px)]">
            {/* Product listing */}
            {pageStatusJSX}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
