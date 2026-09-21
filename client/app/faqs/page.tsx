import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import MainFaqs from "@/components/faqs/main.faqs";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "FAQs | ELEOS Research Innovations (ERI)",
  description:
    "Frequently asked questions about ELEOS Research Innovations, our food and nutrition security initiatives, research support, and community advocacy.",
};

export default function FaqsPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <MainFaqs />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}