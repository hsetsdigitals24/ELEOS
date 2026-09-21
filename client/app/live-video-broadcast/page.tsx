import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import VideoBroadcast from "@/components/broadcast/VideoBroadcast";

export const metadata: Metadata = {
  title: "Live Video Broadcast | ELEOS Research Innovations (ERI)",
  description:
    "When ELEOS Research Innovations goes live, you're front row — seminars, workshops and special moments streamed from our YouTube stage.",
};

export default function LiveVideoBroadcastPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <VideoBroadcast />
      </main>
      <Footer />
    </div>
  );
}
