import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import MainWhatWeDo from "@/components/what-we-do/main.what-we-do";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "What We Do | ELEOS Research Innovations (ERI)",
  description:
    "Explore ELEOS Research Innovations' services — advocacy and capacity building, socioeconomic empowerment, seminars and workshops, research support, and journal publications advancing food and nutrition security.",
};

export default function WhatWeDoPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <MainWhatWeDo />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
