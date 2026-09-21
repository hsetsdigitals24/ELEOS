// components/home/Footer.tsx — the site footer.
//
// This half is a server component: it fetches the recent posts so the "Recent
// Posts" column is populated in the server-rendered HTML rather than filling
// in only if a browser fetch succeeds, then hands them to FooterClient. The
// client half re-asks in the background and swaps in anything newer.
//
// Every page imports this component, so the fetch is cached and shared — see
// FOOTER_REVALIDATE for how long a page may reuse it.

import { formatLongDate } from "@/lib/formatDate";
import { fetchRecentPosts, fetchRecentVideos, FOOTER_REVALIDATE } from "@/lib/recentContent";
import type { FooterRecentPost } from "@/types/home";
import FooterClient from "./FooterClient";

export default async function Footer() {
  const [posts, videos] = await Promise.all([
    fetchRecentPosts(3, FOOTER_REVALIDATE),
    fetchRecentVideos(3, FOOTER_REVALIDATE),
  ]);

  // Merge the newest qualifying posts and videos, newest first, keep the top
  // 3. The six-month window is applied by the API before each `limit`, so both
  // lists are already recent and ELEOS-only by the time they merge.
  const recentPosts: FooterRecentPost[] = [
    ...posts.map((post) => ({
      iso: post.publishedAt,
      entry: {
        id: `post-${post.id}`,
        title: post.title,
        date: formatLongDate(post.publishedAt),
        href: `/blog/${post.slug}`,
        imageLink: post.imageUrl,
      },
    })),
    ...videos.map((video) => ({
      iso: video.publishedAt,
      entry: {
        id: `video-${video.id}`,
        title: video.title,
        date: formatLongDate(video.publishedAt),
        href: `/videos/${video.slug}`,
        imageLink: video.thumbnailUrl,
      },
    })),
  ]
    .sort((a, b) => Date.parse(b.iso) - Date.parse(a.iso))
    .slice(0, 3)
    .map(({ entry }) => entry);

  return <FooterClient initialRecentPosts={recentPosts} />;
}
