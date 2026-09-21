// lib/api/posts.ts — typed client for the public blog & videos API.

import { request } from "./client";
import type { BlogPostItem, BlogPostsPage, PostBrand } from "@/types/blog";
import type { VideoItemApi, VideosPage } from "@/types/video";

/** Lists blog posts (newest first), optionally cut by brand, category or date. */
export async function fetchPosts(params: {
  brand?: PostBrand;
  category?: string;
  /** ISO instant — only posts published on or after it (see lib/freshness.ts). */
  since?: string;
  page?: number;
  limit?: number;
} = {}): Promise<BlogPostsPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 24),
  });
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.since) query.set("since", params.since);

  return request<BlogPostsPage>(`/posts?${query.toString()}`, {
    serviceName: "blog service",
  });
}

/** One published post by slug. */
export async function fetchPostBySlug(slug: string): Promise<BlogPostItem> {
  return request<BlogPostItem>(`/posts/${encodeURIComponent(slug)}`, {
    serviceName: "blog service",
  });
}

/** Lists videos (newest first), optionally cut by brand, category or date. */
export async function fetchVideos(params: {
  brand?: PostBrand;
  category?: string;
  /** ISO instant — only videos published on or after it (see lib/freshness.ts). */
  since?: string;
  page?: number;
  limit?: number;
} = {}): Promise<VideosPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 24),
  });
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.since) query.set("since", params.since);

  return request<VideosPage>(`/videos?${query.toString()}`, {
    serviceName: "videos service",
  });
}

/** One published video by slug. */
export async function fetchVideoBySlug(slug: string): Promise<VideoItemApi> {
  return request<VideoItemApi>(`/videos/${encodeURIComponent(slug)}`, {
    serviceName: "videos service",
  });
}
