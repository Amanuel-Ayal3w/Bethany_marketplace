"use client";

import { useState, useEffect } from "react";

import {
  CompanyLogoList,
  HomeCategoryList,
  HomeSlider,
} from "@/domains/store/homePage/components";
import { getActiveFeaturedBannersByType, FeaturedBanner } from "@/actions/homepage/featuredBanners";
import { getActiveHomepageBrands, HomepageBrand } from "@/actions/homepage/homepageBrands";
import { getAllProducts } from "@/actions/product/product";
import ProductCard from "@/domains/product/components/productCard";

// Define banner card type
type BannerCard = {
  imgUrl: string;
  smallTitle: string;
  title: string;
  url: string;
};

// Define slide type
type Slide = {
  imgUrl: string;
  url: string;
  alt?: string;
  msg?: {
    title: string;
    buttonText: string;
    desc?: string;
  };
};

// Define Product type
type Product = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  isAvailable: boolean;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
};

export default function Home() {
  // State for data
  const [collectionBanners, setCollectionBanners] = useState<BannerCard[]>([]);
  const [sliderBanners, setSliderBanners] = useState<Slide[]>([]);
  const [homepageBrands, setHomepageBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Show 15 products per page (3 rows of 5 on desktop)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch banner data
        const collectionBannersResult = await getActiveFeaturedBannersByType("collection");
        const fetchedCollectionBanners = collectionBannersResult.success ? collectionBannersResult.banners : [];

        const sliderBannersResult = await getActiveFeaturedBannersByType("slider");
        const fetchedSliderBanners = sliderBannersResult.success ? sliderBannersResult.banners : [];

        // Fetch brands
        const homepageBrandsResult = await getActiveHomepageBrands();
        const fetchedBrands = homepageBrandsResult.success ? homepageBrandsResult.brands : [];

        // Fetch products
        const productsResult = await getAllProducts();
        let fetchedProducts = productsResult.res || [];

        // For testing pagination - Uncomment this section if you need to test with mock data
        /*
        if (fetchedProducts.length < 5) {
          const mockProducts = Array.from({ length: 25 }, (_, i) => ({
            id: `mock-${i}`,
            name: `Mock Product ${i + 1}`,
            price: 99.99,
            salePrice: i % 3 === 0 ? 79.99 : null,
            isAvailable: true,
            images: ['https://via.placeholder.com/300'],
            category: {
              id: "mock-category",
              name: "Mock Category"
            },
            brand: {
              id: "mock-brand",
              name: "Mock Brand"
            }
          }));
          fetchedProducts = [...fetchedProducts, ...mockProducts];
        }
        */

        // Format the data
        const collectionBannersFormatted = fetchedCollectionBanners.map((banner: FeaturedBanner) => ({
          imgUrl: banner.imagePath,
          smallTitle: banner.smallTitle || "",
          title: banner.title,
          url: banner.url
        }));

        const sliderBannersFormatted = fetchedSliderBanners.map((banner: FeaturedBanner) => ({
          imgUrl: banner.imagePath,
          url: banner.url,
          alt: banner.title,
          msg: {
            title: banner.title,
            buttonText: banner.smallTitle || "Shop Now",
            desc: banner.smallTitle ? "" : "Special Offer"
          }
        }));

        const homepageBrandsFormatted = fetchedBrands.map((hb: HomepageBrand) => ({
          id: hb.brand.id,
          name: hb.brand.name,
          logoPath: hb.logoPath || undefined
        }));

        // Update state
        setCollectionBanners(collectionBannersFormatted);
        setSliderBanners(sliderBannersFormatted);
        setHomepageBrands(homepageBrandsFormatted);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return products.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to product section
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate page numbers for pagination
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

  // Get actual displayed items
  const currentItems = getCurrentItems();

  if (isLoading) {
    return (
      <div className="w-full bg-mint-500 min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center mt-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-mint-500">
      <div className="container mx-auto px-4 flex-col">
        <div className="flex w-full mt-24">
          <HomeCategoryList />
          <HomeSlider slides={sliderBanners.length > 0 ? sliderBanners : undefined} />
        </div>

        {/* Display admin-managed collection banners */}
        {collectionBanners.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-medium text-gray-700 text-center mb-8">Featured Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionBanners.map((banner: BannerCard, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <a href={banner.url} className="block relative">
                    <div className="relative h-64 w-full">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img
                        src={banner.imgUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 p-4 z-20 text-white">
                      {banner.smallTitle && (
                        <p className="text-sm font-medium mb-1 opacity-90">{banner.smallTitle}</p>
                      )}
                      <h3 className="text-xl font-bold">{banner.title}</h3>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display all products */}
        <div id="products-section" className="mt-16 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-gray-700">All Products</h2>
            {products.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold">{totalItems}</span> products
              </div>
            )}
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {currentItems.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    imgUrl={product.images && product.images.length > 0
                      ? [product.images[0], product.images[1] || product.images[0]]
                      : ['/images/products/placeholder.jpg', '/images/products/placeholder.jpg']}
                    price={product.price}
                    dealPrice={product.salePrice || undefined}
                    specs={[
                      product.category?.name || 'Uncategorized',
                      product.brand?.name || ''
                    ].filter(Boolean)}
                    url={`/product/${product.id}`}
                    isAvailable={product.isAvailable}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center mb-10 mt-8 border-t border-gray-200 pt-8">
                <div className="text-sm text-gray-600 mb-4">
                  Showing <span className="font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold">{totalItems}</span> products
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
                      <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500">...</span>
                    ) : (
                      <button
                        key={`page-${pageNumber}`}
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
                    onClick={() => handlePageChange(Math.min(totalPages || 1, currentPage + 1))}
                    disabled={currentPage === (totalPages || 1)}
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
          ) : (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">
                No products have been added yet. Products added through the admin panel will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Display admin-managed brands */}
        {homepageBrands.length > 0 && (
          <CompanyLogoList brands={homepageBrands} />
        )}

        {/* Display a message if no content has been uploaded */}
        {collectionBanners.length === 0 &&
          homepageBrands.length === 0 &&
          products.length === 0 && (
            <div className="mt-16 mb-24 text-center p-10 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-medium text-gray-700 mb-4">Welcome to Bethany Marketplace</h2>
              <p className="text-gray-600">
                No content has been added by the administrator yet.
                Please visit the admin panel to add products, banners, and featured brands.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}