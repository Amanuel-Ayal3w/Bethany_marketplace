"use client";

import StoreNavBar from "@/domains/store/shared/components/navbar";

import StoreFooter from "../../domains/store/shared/components/footer/index";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-gray-50">
      <StoreNavBar />
      {children}
      <StoreFooter />
    </main>
  );
};

export default StoreLayout;
