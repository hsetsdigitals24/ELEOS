import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import AudioBroadcast from "@/components/broadcast/AudioBroadcast";

export const metadata: Metadata = {
  title: "Live Audio Broadcast | ELEOS Research Innovations (ERI)",
  description:
    "Tune in as ELEOS Research Innovations goes on air — seminars, healthy living conversations and the voices behind our research.",
};

export default function LiveAudioBroadcastPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
        <AudioBroadcast />
      </main>
      <Footer />
    </div>
  );
}
