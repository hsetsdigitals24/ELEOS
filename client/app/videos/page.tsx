import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import VideoIndex from "@/components/videos/VideoIndex";

export const metadata: Metadata = {
  title: "Latest Videos | ELEOS Research Innovations (ERI)",
  description:
    "Recorded seminars, workshops and broadcast moments from ELEOS Research Innovations — food and nutrition security, on record.",
};

export default function VideosPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <VideoIndex />
      </main>
      <Footer />
    </div>
  );
}
