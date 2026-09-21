import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ServiceLayout from "@/components/service/ServiceLayout";
import ResearchContent from "@/components/service/ResearchContent";

export const metadata: Metadata = {
  title: "Research Support | ELEOS Research Innovations (ERI)",
  description:
    "ERI fuels academic innovation and discovery in the social sciences, humanities, and interdisciplinary studies — supporting researchers from question to publication.",
};

export default function ResearchSupportPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ServiceLayout slug="research-support">
          <ResearchContent />
        </ServiceLayout>
      </main>
      <Footer />
    </div>
  );
}
