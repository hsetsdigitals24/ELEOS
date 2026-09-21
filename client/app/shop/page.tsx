import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ShopIndex from "@/components/shop/ShopIndex";

export const metadata: Metadata = {
  title: "Shop | ERI — ELEOS Research Innovations",
  description:
    "Natural, healthy and everyday essential products from Marvela Business Enterprise. Add to cart and complete your purchase securely on Selar.",
};

export default function ShopPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ShopIndex />
      </main>
      <Footer />
    </div>
  );
}
