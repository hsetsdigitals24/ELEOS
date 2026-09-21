import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ServiceLayout from "@/components/service/ServiceLayout";
import JournalsContent from "@/components/service/JournalsContent";

export const metadata: Metadata = {
  title: "Journal Publications | ELEOS Research Innovations (ERI)",
  description:
    "ERI provides adequate support and opportunities to the academia and other researchers to publish their works — rigorous peer review, editorial support, and genuine reach.",
};

export default function JournalPublicationsPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ServiceLayout slug="journal-publications">
          <JournalsContent />
        </ServiceLayout>
      </main>
      <Footer />
    </div>
  );
}
