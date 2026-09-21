import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import EventsIndex from "@/components/events/EventsIndex";

export const metadata: Metadata = {
  title: "Upcoming Events | ELEOS Research Innovations (ERI)",
  description:
    "Seminars, workshops, roundtables and community moments from ELEOS Research Innovations — every upcoming date in one place.",
};

export default function UpcomingEventsPage() {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow">
      <EventsIndex />
      </main>
      <Footer />
    </div>
  );
}
