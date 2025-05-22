"use client";
import { useEffect, useState } from "react";

import { addBrand, deleteBrand, getAllBrands, updateBrand } from "@/actions/brands/brands";
import Button from "@/shared/components/UI/button";
import Input from "@/shared/components/UI/input";
import Popup from "@/shared/components/UI/popup";
import AdminPagination from "@/domains/admin/components/pagination";
import { TBrand } from "@/shared/types";

const ITEMS_PER_PAGE = 10;

let selectedBrandID = "";
const Brand = () => {
  const [addValue, setAddValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [brandList, setBrandList] = useState<TBrand[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);

  const [showEdit, setShowEdit] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const fetchBrands = async () => {
    const response = await getAllBrands();

    if (response.res) {
      setIsListLoading(false);
      setTotalBrands(response.res.length);

      // Apply pagination
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setBrandList(response.res.slice(startIndex, endIndex));
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentPage]);

  const handleAdd = async () => {
    if (addValue !== "") {
      setIsLoading(true);
      const response = await addBrand(addValue);
      if (response.error) {
        setIsLoading(false);
      }
      if (response.res) {
        setIsLoading(false);
        setAddValue("");
        setCurrentPage(1); // Go to first page after adding
        fetchBrands();
      }
    }
  };

  const handleShowEdit = (data: TBrand) => {
    selectedBrandID = data.id;
    setEditValue(data.name);
    setErrorMsg("");
    setShowEdit(true);
  };
  const handleUpdate = async () => {
    if (selectedBrandID !== "" && editValue !== "") {
      setIsLoading(true);
      const response = await updateBrand({
        id: selectedBrandID,
        name: editValue,
      });
      if (response.error) {
        setIsLoading(false);
        setErrorMsg(response.error);
      }
      if (response.res) {
        setIsLoading(false);
        setShowEdit(false);
        fetchBrands();
      }
    }
  };

  const handleShowDelete = (id: string) => {
    selectedBrandID = id;
    setShowDelete(true);
  };
  const handleDelete = async () => {
    if (selectedBrandID !== "") {
      setIsLoading(true);
      const response = await deleteBrand(selectedBrandID);
      if (response.error) {
        setIsLoading(false);
      }
      if (response.res) {
        setIsLoading(false);
        setShowDelete(false);
        fetchBrands();
      }
    }
  };

  const totalPages = Math.ceil(totalBrands / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">Brands</h1>
          <div className="bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            {totalBrands} Total
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            type="text"
            className="w-[200px]"
            value={addValue}
            onChange={(e) => setAddValue(e.currentTarget.value)}
            placeholder="Enter brand name"
          />
          <Button disabled={isLoading} onClick={handleAdd}>
            Add New Brand
          </Button>
        </div>
      </div>
      <div className="w-full mt-10 text-sm text-gray-800">
        {isListLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {brandList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No brands found</p>
              </div>
            ) : (
              brandList.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center p-3 mb-2 pl-6 rounded-lg justify-between transition-colors duration-400 hover:bg-gray-100 border border-gray-200"
                >
                  <span className="font-medium">{brand.name}</span>
                  <div className="flex gap-4">
                    <Button onClick={() => handleShowEdit(brand)} className="px-4 py-2">Edit</Button>
                    <Button onClick={() => handleShowDelete(brand.id)} className="px-4 py-2">Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {showEdit && (
        <Popup
          width="400px"
          title="Edit Brand Name"
          content={
            <div className="flex flex-col gap-4 py-10 px-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Brand Name:</span>
                <Input
                  className="w-[200px]"
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.currentTarget.value)}
                />
              </div>
              <span>{errorMsg}</span>
            </div>
          }
          isLoading={isLoading}
          onCancel={() => setShowEdit(false)}
          onClose={() => setShowEdit(false)}
          onSubmit={() => handleUpdate()}
          cancelBtnText="No"
          confirmBtnText="Yes"
        />
      )}
      {showDelete && (
        <Popup
          width="300px"
          content={<div className="text-center py-3 pb-6">Are You Sure?</div>}
          isLoading={isLoading}
          onCancel={() => setShowDelete(false)}
          onClose={() => setShowDelete(false)}
          onSubmit={() => handleDelete()}
          cancelBtnText="No"
          confirmBtnText="Yes"
        />
      )}
    </div>
  );
};

export default Brand;
