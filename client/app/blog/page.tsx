import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import BlogIndex from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Blog | ELEOS Research Innovations (ERI)",
  description:
    "Research, stories and songs from ELEOS Research Innovations — food security, nutrition security and human security.",
};

export default function BlogPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <BlogIndex />
      </main>
      <Footer />
    </div>
  );
}
