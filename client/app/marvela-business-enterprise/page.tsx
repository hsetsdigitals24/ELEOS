import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CtaBanner from "@/components/home/CtaBanner";
import SubsidiaryHero from "@/components/subsidiary/SubsidiaryHero";
import MarvelaContent from "@/components/subsidiary/MarvelaContent";
import { getSubsidiary } from "@/components/subsidiary/subsidiaryData";

const subsidiary = getSubsidiary("marvela-business-enterprise");

export const metadata: Metadata = {
  title: "Marvela Business Enterprise | ELEOS Research Innovations (ERI)",
  description:
    "Marvela Business Enterprise — your trusted source for healthy living. A subsidiary of ELEOS offering natural, healthy, and everyday essential products, from food items and herbal products to oils and healthy snacks.",
};

export default function MarvelaBusinessEnterprisePage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <div className="bg-cream-100">
          <SubsidiaryHero subsidiary={subsidiary} />
          <MarvelaContent />
        </div>
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
