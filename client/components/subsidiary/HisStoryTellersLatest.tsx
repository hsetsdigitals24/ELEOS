"use client";

// components/subsidiary/HisStoryTellersLatest.tsx — the "Latest from His
// Story Tellers Media" strip on the subsidiary page. It merges the newest
// HSTM-brand blog posts with the newest videos (newest first); the
// hardcoded data is only the offline fallback.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CalendarDays, Play } from "lucide-react";
import { sortedBlogPosts } from "@/components/blog/blogData";
import { sortedVideos } from "@/components/videos/videoData";
import { fetchPosts, fetchVideos } from "@/lib/api/posts";
import { formatShortDate } from "@/lib/formatDate";
import { SectionHeader } from "@/components/service/editorial";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** One card in the strip — a blog post or a video. */
interface LatestItem {
  kind: "post" | "video";
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  image: string;
  imageAlt: string;
}

/** Plain-text standfirst from a rich-text (HTML) description. */
function htmlToExcerpt(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Offline fallback — the hardcoded HSTM post plus the static videos. */
function fallbackItems(): LatestItem[] {
  const posts = sortedBlogPosts
    .filter((post) => post.categories.includes("His Story Tellers Media"))
    .map<LatestItem>((post) => ({
      kind: "post",
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      image: post.image,
      imageAlt: post.imageAlt,
    }));
  const videos = sortedVideos.map<LatestItem>((video) => ({
    kind: "video",
    slug: video.slug,
    title: video.title,
    excerpt: video.description,
    publishedAt: video.publishedAt,
    image: video.thumbnail,
    imageAlt: video.thumbnailAlt,
  }));
  return [...posts, ...videos].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
}

function LatestCard({ item }: { item: LatestItem }) {
  const href = item.kind === "post" ? `/blog/${item.slug}` : `/videos/${item.slug}`;
  return (
    <article className="hstm-latest-card group">
      <Link href={href} className="block">
        <div className="relative aspect-16/10 overflow-hidden rounded-md">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {item.kind === "video" && (
            <>
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/40 via-ink-950/10 to-transparent" />
              <span className="absolute inset-0 m-auto w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-cream-50 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play size={22} fill="currentColor" className="ml-1" aria-hidden="true" />
              </span>
            </>
          )}
        </div>

        <p className="mt-5 flex items-center gap-1.5 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-ink-500">
          <CalendarDays size={12} aria-hidden="true" />
          <time dateTime={item.publishedAt}>{formatShortDate(item.publishedAt)}</time>
          <span className="mx-1 text-ink-900/30">·</span>
          <span className="text-brand-primary font-semibold">
            {item.kind === "post" ? "Story" : "Video"}
          </span>
        </p>

        <h3 className="mt-2.5 font-display text-lg leading-snug text-ink-900 group-hover:text-brand-hover transition-colors duration-300 line-clamp-2">
          {item.title}
        </h3>

        <p className="mt-2 font-sans text-sm text-ink-500 leading-relaxed line-clamp-2">
          {item.excerpt}
        </p>

        <span className="mt-4 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold group-hover:gap-3.5 transition-all duration-300">
          {item.kind === "post" ? "Read the story" : "Watch the session"}
          <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}

export default function HisStoryTellersLatest() {
  const sectionRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState<LatestItem[]>(fallbackItems);

  useEffect(() => {
    Promise.all([
      fetchPosts({ brand: "his-story-tellers", limit: 6 }),
      fetchVideos({ limit: 6 }),
    ])
      .then(([posts, videos]) => {
        const merged: LatestItem[] = [
          ...posts.items.map((post) => ({
            kind: "post" as const,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt,
            image: post.imageUrl,
            imageAlt: post.imageAlt,
          })),
          ...videos.items.map((video) => ({
            kind: "video" as const,
            slug: video.slug,
            title: video.title,
            excerpt: htmlToExcerpt(video.description),
            publishedAt: video.publishedAt,
            image: video.thumbnailUrl,
            imageAlt: video.thumbnailAlt,
          })),
        ].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
        if (merged.length > 0) setItems(merged);
      })
      .catch(() => {
        // API unreachable — keep the fallback content already on the page.
      });
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".hstm-latest-card",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-latest-grid",
            start: "top 82%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-6 bg-cream-100">
      <div className="max-w-330 mx-auto">
        <SectionHeader
          eyebrow="Fresh from the studio"
          title="Latest from His Story Tellers Media"
        />
        <div className="hstm-latest-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mt-12">
          {items.slice(0, 6).map((item) => (
            <LatestCard key={`${item.kind}-${item.slug}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
