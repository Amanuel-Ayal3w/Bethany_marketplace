"use client";

import StoreNavBar from "@/domains/store/shared/components/navbar";
import dynamic from 'next/dynamic';

// Import client-side footer wrapper instead of server component directly
const ClientFooterWrapper = dynamic(
  () => import('@/domains/store/shared/components/footer/ClientFooterWrapper'),
  { ssr: false }
);

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-gray-50">
      <StoreNavBar />
      {children}
      <ClientFooterWrapper />
    </main>
  );
};

export default StoreLayout;
