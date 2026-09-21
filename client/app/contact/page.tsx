import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ContactIndex from "@/components/contact/ContactIndex";

export const metadata: Metadata = {
  title: "Contact Us | ELEOS Research Innovations (ERI)",
  description:
    "Get in touch with ELEOS Research Innovations — send us a message, call, or find directions to our office at TLAC Office Complex, Maranatha Tent, Behind Offa Road, Ilorin.",
};

export default function ContactPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <ContactIndex />
      </main>
      <Footer />
    </div>
  );
}
