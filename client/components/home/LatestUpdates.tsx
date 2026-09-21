// components/home/LatestUpdates.tsx — the homepage "Latest Blog & Video"
// section.
//
// This half is a server component: it asks the API for the newest qualifying
// post and video so both cards are in the server-rendered HTML, then hands
// them to LatestUpdatesClient. That matters even when the browser can't reach
// the API — the section arrives complete rather than appearing late, or not
// at all. The client half then re-asks in the background and swaps in
// anything newer.

import { formatLongDate } from "@/lib/formatDate";
import { fetchRecentPosts, fetchRecentVideos, HOME_UPDATES_REVALIDATE } from "@/lib/recentContent";
import type { BlogPreview, VideoPreview } from "@/types/home";
import LatestUpdatesClient from "./LatestUpdatesClient";

export default async function LatestUpdates() {
  const [posts, videos] = await Promise.all([
    fetchRecentPosts(1, HOME_UPDATES_REVALIDATE),
    fetchRecentVideos(1, HOME_UPDATES_REVALIDATE),
  ]);

  // Dates are formatted here, on the server, and passed down as strings — the
  // client the section hydrates into shows what the server decided, so the
  // two can't disagree about what day an entry landed on.
  const [latestPost] = posts;
  const blogPost: BlogPreview | null = latestPost
    ? {
        id: latestPost.id,
        title: latestPost.title,
        date: formatLongDate(latestPost.publishedAt),
        author: latestPost.author,
        categories: latestPost.categories,
        excerpt: latestPost.excerpt,
        image: latestPost.imageUrl,
        href: `/blog/${latestPost.slug}`,
      }
    : null;

  const [latestVideo] = videos;
  const video: VideoPreview | null = latestVideo
    ? {
        id: latestVideo.id,
        title: latestVideo.title,
        duration: latestVideo.duration,
        date: formatLongDate(latestVideo.publishedAt),
        thumbnail: latestVideo.thumbnailUrl,
        href: `/videos/${latestVideo.slug}`,
      }
    : null;

  return <LatestUpdatesClient initialBlogPost={blogPost} initialVideo={video} />;
}
