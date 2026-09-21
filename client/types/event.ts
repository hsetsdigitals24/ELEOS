// types/event.ts — shape of one upcoming event on the events page.
// The hardcoded data in components/events/eventData.ts is the offline
// fallback; the API (the database) is the source of truth.

export interface UpcomingEvent {
  id: string;
  /** URL segment for the event's own registration page. */
  slug: string;
  title: string;
  /** ISO date — the day the event starts. */
  date: string;
  /** Human time range, e.g. "10:00am – 2:00pm (GMT)". */
  time: string;
  venue: string;
  city: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

/* ------------------------------------------------------------------ */
/* API-fetched events                                                  */
/* ------------------------------------------------------------------ */

/** Event shape returned by the API (the database is the source of truth). */
export interface EventItemApi {
  id: string;
  slug: string;
  title: string;
  /** ISO date string — the day the event starts */
  date: string;
  /** Human time range, e.g. "10:00am – 2:00pm (GMT)" */
  time: string;
  venue: string;
  city: string;
  category: string;
  /** Rich-text HTML (sanitized on write) */
  description: string;
  imageUrl: string;
  imageAlt: string;
  isPublished: boolean;
  /** ISO date string */
  updatedAt: string;
  /** How many people have registered. Admin reads only. */
  registrationCount?: number;
}

export interface EventsPage {
  items: EventItemApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Payload for creating/updating an event from the admin console. */
export interface EventInput {
  title: string;
  /** ISO date string — the day the event starts */
  date: string;
  time?: string;
  venue?: string;
  city?: string;
  category?: string;
  /** Rich-text HTML from the editor */
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  isPublished?: boolean;
  slug?: string;
}
