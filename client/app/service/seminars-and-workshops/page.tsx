import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ServiceLayout from "@/components/service/ServiceLayout";
import SeminarsContent from "@/components/service/SeminarsContent";

export const metadata: Metadata = {
  title: "Seminars & Workshops | ELEOS Research Innovations (ERI)",
  description:
    "ERI's interactive forums facilitate discussion, foster collaboration, and unearth pragmatic solutions to contemporary issues in sustainable development.",
};

export default function SeminarsAndWorkshopsPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ServiceLayout slug="seminars-and-workshops">
          <SeminarsContent />
        </ServiceLayout>
      </main>
      <Footer />
    </div>
  );
}
