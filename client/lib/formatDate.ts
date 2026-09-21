// lib/formatDate.ts — date display helpers matching the site's editorial voice.

/** "September 24, 2024" */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "24 Sep 2024" — compact dateline for cards and bylines. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "September 24, 2024 at 1:04 PM" — comment timestamps. */
export function formatCommentDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
