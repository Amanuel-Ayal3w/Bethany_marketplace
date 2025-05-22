"use client";

import { useEffect, useState } from "react";

import { addProduct, getAllProducts } from "@/actions/product/product";
import ProductForm from "@/domains/admin/components/product/productForm";
import ProductListItem from "@/domains/admin/components/product/productListItem";
import AdminPagination from "@/domains/admin/components/pagination";
import Button from "@/shared/components/UI/button";
import Popup from "@/shared/components/UI/popup";
import { TAddProductFormValues, TProductListItem } from "@/shared/types/product";

const initialForm: TAddProductFormValues = {
  name: "",
  brandID: "",
  specialFeatures: ["", "", ""],
  isAvailable: false,
  desc: "",
  price: "",
  salePrice: "",
  images: [],
  categoryID: "",
  specifications: [],
};

const ITEMS_PER_PAGE = 10;

const AdminProducts = () => {
  const [showProductWindow, setShowProductWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<TAddProductFormValues>(initialForm);
  const [productsList, setProductsList] = useState<TProductListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    getProductsList();
  }, [currentPage]);

  const getProductsList = async () => {
    setIsLoading(true);
    const response = await getAllProducts();
    if (response.res) {
      setTotalProducts(response.res.length);

      // Apply pagination to the products list
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setProductsList(response.res.slice(startIndex, endIndex));
    }
    setIsLoading(false);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    const result = await addProduct(formValues);
    if (result.error) {
      setIsLoading(false);
    }
    if (result.res) {
      setIsLoading(false);
      setShowProductWindow(false);
      // Go to first page when adding a new product
      setCurrentPage(1);
      getProductsList();
    }
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">Products</h1>
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            {totalProducts} Total
          </div>
        </div>
        <Button onClick={() => setShowProductWindow(true)} className="px-5 py-2.5">Add new product</Button>
      </div>

      {/* Table header - visible on larger screens */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-3 px-6 py-3 font-medium text-sm text-gray-500 bg-gray-50 rounded-lg mb-3">
        <div>PRODUCT NAME</div>
        <div>CATEGORY</div>
        <div className="text-right">ACTIONS</div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-full py-4 px-4 md:px-6 mb-2 bg-gray-100 animate-pulse rounded-lg h-16"></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {productsList.length ? (
            <>
              {productsList.map((product) => (
                <ProductListItem key={product.id} data={product} requestReload={getProductsList} />
              ))}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {showProductWindow && (
        <Popup
          content={<ProductForm formValues={formValues} onChange={setFormValues} />}
          isLoading={isLoading}
          onCancel={() => setShowProductWindow(false)}
          onClose={() => setShowProductWindow(false)}
          onSubmit={() => handleAddProduct()}
          confirmBtnText="Add Product"
          title="Add New Product"
        />
      )}
    </div>
  );
};

export default AdminProducts;
