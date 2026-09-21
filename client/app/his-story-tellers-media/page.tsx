import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CtaBanner from "@/components/home/CtaBanner";
import SubsidiaryHero from "@/components/subsidiary/SubsidiaryHero";
import HisStoryTellersContent from "@/components/subsidiary/HisStoryTellersContent";
import { getSubsidiary } from "@/components/subsidiary/subsidiaryData";

const subsidiary = getSubsidiary("his-story-tellers-media");

export const metadata: Metadata = {
  title: "His Story Tellers Media | ELEOS Research Innovations (ERI)",
  description:
    "His Story Tellers Media is a creative media and film production subsidiary of ELEOS — producing enriching movies, documentaries, and digital content that inform, inspire, and shape societal values.",
};

export default function HisStoryTellersMediaPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <div className="bg-cream-100">
          <SubsidiaryHero subsidiary={subsidiary} />
          <HisStoryTellersContent />
        </div>
        {/* <CtaBanner /> */}
      </main>
      <Footer />
    </div>
  );
}
