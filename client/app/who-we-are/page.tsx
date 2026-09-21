import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import MainWhoWeAre from "@/components/who-we-are/main.who-we-are";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "Who We Are | ELEOS Research Innovations (ERI)",
  description:
    "Learn about ELEOS Research Innovations (ERI), our mission, vision, four strategic pillars, and commitment to food and nutrition security.",
};

export default function WhoWeArePage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <MainWhoWeAre />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}