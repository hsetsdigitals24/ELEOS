// types/video.ts — content shape definitions for the videos section.
// Hardcoded data for now (see components/videos/videoData.ts); structured
// so it's trivial to swap for API-fetched data later.

import type { PostBrand } from "./blog";

export interface VideoItem {
  slug: string;
  title: string;
  description: string;
  /** Human-readable duration, e.g. "55:11" */
  duration: string;
  /** ISO date string */
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  thumbnail: string;
  thumbnailAlt: string;
  /** YouTube video id — when known, the detail page embeds the player. */
  youtubeId?: string;
  /** Fallback/extra link — the ELEOS YouTube channel. */
  channelUrl: string;
}

/* ------------------------------------------------------------------ */
/* API-fetched videos                                                  */
/* ------------------------------------------------------------------ */

/** Video shape returned by the API (the database is the source of truth). */
export interface VideoItemApi {
  id: string;
  slug: string;
  title: string;
  /** Who the video is published under — ELEOS itself or its media subsidiary. */
  brand: PostBrand;
  description: string;
  /** Human-readable duration, e.g. "55:11" */
  duration: string;
  /** ISO date string */
  publishedAt: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  thumbnailAlt: string;
  /** Any YouTube URL the admin pasted — normalised by the API. */
  youtubeUrl: string;
  /** YouTube video id derived from the URL — the detail page embeds it. */
  youtubeId: string;
  channelUrl: string;
  isPublished: boolean;
}

export interface VideosPage {
  items: VideoItemApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Payload for creating/updating a video from the admin console. */
export interface VideoInput {
  title: string;
  brand?: PostBrand;
  description?: string;
  duration?: string;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  youtubeUrl: string;
  channelUrl?: string;
  isPublished?: boolean;
  /** ISO date string — omitted means "now". */
  publishedAt?: string;
  slug?: string;
}
