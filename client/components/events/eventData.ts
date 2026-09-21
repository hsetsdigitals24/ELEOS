// components/events/eventData.ts — the upcoming events page's content.
// Placeholder entries with the real rhythm of the org's calendar; swap for
// API-fetched data when the CMS lands. Images are placeholders (picsum)
// until real flyers are uploaded.

import type { UpcomingEvent } from "@/types/event";

export const upcomingEvents: UpcomingEvent[] = [];

/** Chronologically soonest first. */
export const sortedUpcomingEvents: UpcomingEvent[] = [...upcomingEvents].sort(
  (a, b) => Date.parse(a.date) - Date.parse(b.date)
);
