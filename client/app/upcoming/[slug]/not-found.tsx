import NotFound from "@/components/updates/NotFound";

export default function EventNotFound() {
  return (
    <NotFound kind="event" backHref="/upcoming" backLabel="Back to Upcoming Events" />
  );
}
