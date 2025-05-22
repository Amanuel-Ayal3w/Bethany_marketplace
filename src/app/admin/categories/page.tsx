"use client";

import { useEffect, useState } from "react";

import { TGetAllCategories, getAllCategories } from "@/actions/category/category";
import AddCategoryGroup from "@/domains/admin/components/category/addCategoryGroup";
import CatGroupRow from "@/domains/admin/components/category/rowGroup";
import AdminPagination from "@/domains/admin/components/pagination";

const ITEMS_PER_PAGE = 5;

const AdminCategories = () => {
  const [allCategories, setAllCategories] = useState<TGetAllCategories[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const data = await getAllCategories();
    if (data.res) setAllCategories(data.res);
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const groups: TGetAllCategories[] = [];
  const categories: TGetAllCategories[] = [];

  if (allCategories.length > 0) {
    allCategories.forEach((cat) => {
      if (cat.parentID) {
        categories.push(cat);
        return;
      }

      groups.push(cat);
    });
  }

  // Apply pagination to the groups
  const totalGroups = groups.length;
  const totalPages = Math.ceil(totalGroups / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedGroups = groups.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      <div className="w-full mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              {allCategories.length} Total
            </div>
            <div className="bg-gray-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              {groups.length} Groups
            </div>
            <div className="bg-gray-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              {categories.length} Subcategories
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <h3 className="text-sm font-light text-gray-600">Add a main group:</h3>
          <AddCategoryGroup onReset={getData} />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <div key={index} className="mb-8 rounded-lg border border-gray-200 h-20 bg-gray-100 animate-pulse"></div>
          ))
        ) : paginatedGroups.length > 0 ? (
          paginatedGroups.map((group) => (
            <div className="mb-8 rounded-lg border border-gray-200" key={group.id}>
              <CatGroupRow onReset={getData} data={group} categories={categories} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdminCategories;
