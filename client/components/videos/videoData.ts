// components/videos/videoData.ts — the videos section's content, migrated
// from the previous WordPress site (eleosrein.com). Swap for API-fetched
// data when the CMS lands.

import type { VideoItem } from "@/types/video";

const ELEOS_CHANNEL_URL = "https://youtube.com/@eleosrein";

export const videos: VideoItem[] = [
  {
    slug: "identifying-and-tackling-overnutrition-and-undernutrition",
    title: "Identifying and Tackling Overnutrition and Undernutrition || Dr. Precious Gabriel",
    description:
      "A seminar led by Dr. Precious Gabriel unpacking the double burden of malnutrition — how to spot overnutrition and undernutrition, and what communities can do about both.",
    duration: "55:11",
    publishedAt: "2024-12-02",
    category: "Seminars and Workshops",
    tags: ["Overnutrition", "Undernutrition"],
    views: 2,
    thumbnail:
      "https://eleosrein.com/wp-content/uploads/2024/11/Dr.-Precious-Gabriel-Seminar-Flyer-819x1024.jpg",
    thumbnailAlt: "Seminar flyer — Dr. Precious Gabriel",
    channelUrl: ELEOS_CHANNEL_URL,
  },
  {
    slug: "complete-meal-plans-and-timings-for-optimal-health",
    title: "Complete Meal Plans and Timings for Optimal Health – The Maiden Edition",
    description:
      "For a treasure trove of food and nutrition security tips for improved well-being. Dive deeper into our latest workshop content with the full presentation!",
    duration: "1:49:37",
    publishedAt: "2024-11-26",
    category: "Seminars and Workshops",
    tags: [],
    views: 2,
    thumbnail:
      "https://eleosrein.com/wp-content/uploads/2019/04/Seminars-and-workshops-flyer-e1728475435613.jpg",
    thumbnailAlt: "Seminars and Workshops flyer",
    // The YouTube upload of this seminar, linked from the previous site's homepage.
    youtubeId: "_RETclte_A4",
    channelUrl: ELEOS_CHANNEL_URL,
  },
];

/** Chronologically newest first. */
export const sortedVideos: VideoItem[] = [...videos].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
);

export function getVideoBySlug(slug: string): VideoItem | undefined {
  return videos.find((video) => video.slug === slug);
}
