import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import AdminConsole from "@/components/admin/AdminConsole";

export const metadata: Metadata = {
  title: "Admin Console | ELEOS Research Innovations (ERI)",
  description: "Internal console — manage broadcasts, products and messages.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      {/* <Navbar /> */}
      <main className="w-full grow bg-cream-100 px-6">
        <div className="max-w-330 mx-auto mt-8">
          <AdminConsole />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
