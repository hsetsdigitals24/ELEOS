import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ServiceLayout from "@/components/service/ServiceLayout";
import SocioeconomicContent from "@/components/service/SocioeconomicContent";

export const metadata: Metadata = {
  title:
    "Socioeconomic Empowerment Program | ELEOS Research Innovations (ERI)",
  description:
    "ERI implements programmes tailored towards uplifting and empowering underprivileged communities — skills acquisition, entrepreneurship support, and household resilience.",
};

export default function SocioeconomicEmpowermentPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ServiceLayout slug="socioeconomic-empowerment-program">
          <SocioeconomicContent />
        </ServiceLayout>
      </main>
      <Footer />
    </div>
  );
}
