import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CartIndex from "@/components/cart/CartIndex";

export const metadata: Metadata = {
  title: "Your Cart | ELEOS Research Innovations (ERI)",
  description:
    "Review your Marvela cart and proceed to Selar to complete your purchase securely.",
};

export default function CartPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <CartIndex />
      </main>
      <Footer />
    </div>
  );
}
