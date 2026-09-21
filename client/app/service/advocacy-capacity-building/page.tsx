import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ServiceLayout from "@/components/service/ServiceLayout";
import AdvocacyContent from "@/components/service/AdvocacyContent";

export const metadata: Metadata = {
  title: "Advocacy & Capacity Building | ELEOS Research Innovations (ERI)",
  description:
    "ERI's strategic campaigns raise awareness about the intersectionality of food and nutrition security with health, education, and economic development — and build community capacity to act.",
};

export default function AdvocacyCapacityBuildingPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ServiceLayout slug="advocacy-capacity-building">
          <AdvocacyContent />
        </ServiceLayout>
      </main>
      <Footer />
    </div>
  );
}
