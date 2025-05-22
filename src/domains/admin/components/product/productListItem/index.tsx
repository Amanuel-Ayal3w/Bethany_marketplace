"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteProduct } from "@/actions/product/product";
import Button from "@/shared/components/UI/button";
import Popup from "@/shared/components/UI/popup";
import { TProductListItem } from "@/shared/types/product";

type TProps = {
  data: TProductListItem;
  requestReload: () => void;
};

const ProductListItem = ({ data, requestReload }: TProps) => {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const response = await deleteProduct(data.id);
    if (response.error) {
      setIsLoading(false);
    }
    if (response.res) {
      setIsLoading(false);
      requestReload();
    }
  };

  const handleEdit = () => {
    router.push(`/admin/products/${data.id}`);
  };

  return (
    <div className="w-full py-4 px-4 md:px-6 mb-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-white border border-gray-200 rounded-lg shadow-sm transition-colors duration-300 hover:bg-gray-50">
      <div className="font-medium text-gray-800 truncate">{data.name}</div>
      <div className="text-gray-600 truncate">{data.category.name}</div>
      <div className="flex gap-2 justify-start sm:justify-end">
        <Button onClick={handleEdit} className="px-4 py-2">Edit</Button>
        <Button onClick={() => setShowDelete(true)} className="px-4 py-2">Delete</Button>
      </div>
      {showDelete && (
        <Popup
          content={<span className="block text-center p-6 pb-10">Are You Sure?</span>}
          width="300px"
          isLoading={isLoading}
          onCancel={() => setShowDelete(false)}
          onClose={() => setShowDelete(false)}
          onSubmit={() => handleDelete()}
          cancelBtnText="NO"
          confirmBtnText="YES"
        />
      )}
    </div>
  );
};

export default ProductListItem;
