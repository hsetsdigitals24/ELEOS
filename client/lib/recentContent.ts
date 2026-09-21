// lib/recentContent.ts — the server-side fetch behind every "latest content"
// surface (the homepage's Latest Blog & Video cards, the footer's Recent
// Posts column).
//
// These run in React Server Components, so the content is present in the
// first paint instead of appearing only if a browser fetch happens to
// succeed. The client halves of those components then re-ask in the
// background and swap in anything newer.
//
// Server-only by construction: it reads the absolute API URL, and nothing
// client-side imports it.

import { serverRequest } from "@/lib/api/server";
import { recentSinceIso } from "@/lib/freshness";
import type { BlogPostItem, BlogPostsPage } from "@/types/blog";
import type { VideoItemApi, VideosPage } from "@/types/video";

/**
 * How long the server-rendered content may be reused before Next.js refetches
 * it. The browser's background refresh is what keeps these surfaces current,
 * so these are only a floor — they decide how stale a first paint can be.
 *
 * The footer's is longer because it renders on every page, not just the
 * homepage.
 */
export const HOME_UPDATES_REVALIDATE = 60;
export const FOOTER_REVALIDATE = 300;

/**
 * The newest ELEOS posts published inside the freshness window, newest first.
 *
 * The window is handed to the API as `since` rather than applied here: it is
 * applied *before* `limit`, so asking for one row returns the newest
 * qualifying row — not the newest row, which we would then have to discard
 * (leaving the card empty whenever that one happened to be stale).
 */
export async function fetchRecentPosts(
  limit: number,
  revalidate: number
): Promise<BlogPostItem[]> {
  const query = new URLSearchParams({
    brand: "eleos",
    since: recentSinceIso(),
    page: "1",
    limit: String(limit),
  });
  const page = await serverRequest<BlogPostsPage>(`/posts?${query.toString()}`, {
    revalidate,
  });
  return page?.items ?? [];
}

/** The newest ELEOS videos published inside the freshness window, newest first. */
export async function fetchRecentVideos(
  limit: number,
  revalidate: number
): Promise<VideoItemApi[]> {
  const query = new URLSearchParams({
    brand: "eleos",
    since: recentSinceIso(),
    page: "1",
    limit: String(limit),
  });
  const page = await serverRequest<VideosPage>(`/videos?${query.toString()}`, {
    revalidate,
  });
  return page?.items ?? [];
}
