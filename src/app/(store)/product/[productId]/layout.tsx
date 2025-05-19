import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bethany Marketplace - Product",
};

const ProductLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white">{children}</div>;
};

export default ProductLayout;
