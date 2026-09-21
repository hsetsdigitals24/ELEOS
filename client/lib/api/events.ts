// lib/api/events.ts — typed client for the public upcoming-events API.

import { request } from "./client";
import type { EventsPage } from "@/types/event";

/** Lists upcoming events (soonest first). */
export async function fetchEvents(params: {
  page?: number;
  limit?: number;
} = {}): Promise<EventsPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 24),
  });

  return request<EventsPage>(`/events?${query.toString()}`, {
    serviceName: "events service",
  });
}

/**
 * Submits a registration. `answers` maps a field's key to its value.
 *
 * Reading the form itself is not here: the registration page is a server
 * component and fetches through `lib/api/server.ts`, which has no session to
 * refresh and doesn't belong in a browser bundle.
 */
export async function submitEventRegistration(
  slug: string,
  answers: Record<string, string>
): Promise<{ id: string }> {
  return request<{ id: string }>(`/events/${encodeURIComponent(slug)}/registrations`, {
    method: "POST",
    body: JSON.stringify({ answers }),
    serviceName: "events service",
  });
}
