import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | ELEOS Research Innovations (ERI)",
  description: "Request an admin password reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow bg-cream-100 px-6">
        <div className="max-w-330 mx-auto mt-8">
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
