import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a New Password | ELEOS Research Innovations (ERI)",
  description: "Choose a new admin password via a reset link.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow bg-cream-100 px-6">
        <div className="max-w-330 mx-auto mt-8">
          {/* useSearchParams needs a Suspense boundary for prerendering. */}
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
