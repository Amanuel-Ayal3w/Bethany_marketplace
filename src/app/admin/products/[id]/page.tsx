"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getProductForEdit, updateProduct } from "@/actions/product/product";
import ProductForm from "@/domains/admin/components/product/productForm";
import Button from "@/shared/components/UI/button";
import { TAddProductFormValues } from "@/shared/types/product";

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

const EditProductPage = () => {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formValues, setFormValues] = useState<TAddProductFormValues>(initialForm);

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            const response = await getProductForEdit(productId);

            if (response.error) {
                setErrorMessage(response.error);
                setIsLoading(false);
                return;
            }

            if (response.res) {
                setFormValues(response.res);
            }

            setIsLoading(false);
        };

        loadProduct();
    }, [productId]);

    const handleUpdateProduct = async () => {
        setIsLoading(true);
        setErrorMessage("");

        const result = await updateProduct(productId, formValues);

        if (result.error) {
            setErrorMessage(result.error);
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        // Navigate back to products list
        router.push("/admin/products");
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between h-20 mb-8">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <div className="flex gap-4">
                    <Button onClick={() => router.push("/admin/products")} className="bg-gray-200 text-gray-800">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateProduct} disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Product"}
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errorMessage}
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <ProductForm formValues={formValues} onChange={setFormValues} />
            </div>
        </div>
    );
};

export default EditProductPage; 