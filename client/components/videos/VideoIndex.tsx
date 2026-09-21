"use client";

// components/videos/VideoIndex.tsx — the videos front page. A bright cream
// band announces the section, then each seminar gets an editorial card with
// a play moment, duration badge and dateline — portrait flyers cropped into
// landscape frames, echoing the documentary feel of the brand.
//
// Videos come from the API (newest first — the admin's latest upload leads
// the page). The hardcoded data in videoData.ts is only the offline fallback.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CalendarDays, ChevronRight, Eye, Home, Play, Tag } from "lucide-react";
import { sortedVideos } from "./videoData";
import { fetchVideos } from "@/lib/api/posts";
import { formatLongDate } from "@/lib/formatDate";
import type { VideoItem, VideoItemApi } from "@/types/video";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The shape the page renders — unifies static videos and API videos. */
interface DisplayVideo {
  slug: string;
  title: string;
  duration: string;
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  thumbnail: string;
  thumbnailAlt: string;
}

function staticToDisplay(video: VideoItem): DisplayVideo {
  return {
    slug: video.slug,
    title: video.title,
    duration: video.duration,
    publishedAt: video.publishedAt,
    category: video.category,
    tags: video.tags,
    views: video.views,
    thumbnail: video.thumbnail,
    thumbnailAlt: video.thumbnailAlt,
  };
}

function apiToDisplay(video: VideoItemApi): DisplayVideo {
  return {
    slug: video.slug,
    title: video.title,
    duration: video.duration,
    publishedAt: video.publishedAt,
    category: video.category,
    tags: video.tags,
    views: 0,
    thumbnail: video.thumbnailUrl,
    thumbnailAlt: video.thumbnailAlt,
  };
}

function VideoCard({ video, featured }: { video: DisplayVideo; featured?: boolean }) {
  return (
    <article className="video-card group">
      <Link href={`/videos/${video.slug}`} className="block">
        <div className="relative aspect-16/10 overflow-hidden rounded-md">
          <Image
            src={video.thumbnail}
            alt={video.thumbnailAlt}
            fill
            priority={featured}
            sizes={featured ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 38vw"}
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Cinematic scrim + play moment */}
          <div className="absolute inset-0 bg-linear-to-t from-ink-950/40 via-ink-950/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary rounded-full flex items-center justify-center text-cream-50 shadow-xl group-hover:scale-110 group-hover:shadow-[0_0_36px_rgba(227,34,28,0.7)] transition-all duration-300">
              <Play size={26} fill="currentColor" className="ml-1" aria-hidden="true" />
            </span>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-ink-950 px-3 py-1.5 rounded-sm shadow-sm">
            <span className="font-sans text-xs font-semibold tracking-wide">{video.duration}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[0.7rem] uppercase tracking-[0.15em] text-ink-500">
            <span className="text-brand-primary font-semibold">{video.category}</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} aria-hidden="true" />
              <time dateTime={video.publishedAt}>{formatLongDate(video.publishedAt)}</time>
            </span>
            {video.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye size={12} aria-hidden="true" />
                {video.views} {video.views === 1 ? "view" : "views"}
              </span>
            )}
          </div>

          <h2
            className={`mt-3 font-display leading-snug text-ink-900 group-hover:text-brand-hover transition-colors duration-300 ${
              featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            }`}
          >
            {video.title}
          </h2>

          {video.tags.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-2 font-sans text-xs text-ink-500">
              <Tag size={12} className="text-brand-primary" aria-hidden="true" />
              {video.tags.join(" · ")}
            </p>
          )}

          <span className="mt-4 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold group-hover:gap-3.5 transition-all duration-300">
            Watch the session
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function VideoIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Static videos first, then swapped for the API's list once it answers.
  const [videos, setVideos] = useState<DisplayVideo[]>(() =>
    sortedVideos.map(staticToDisplay)
  );

  useEffect(() => {
    fetchVideos({ limit: 50 })
      .then((result) => {
        if (result.items.length > 0) {
          setVideos(result.items.map(apiToDisplay));
        }
      })
      .catch(() => {
        // API unreachable — keep the fallback content already on the page.
      });
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hero entrance — same timeline shape as the other page heroes
      const tl = gsap.timeline();
      tl.fromTo(
        ".hero-title",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
      )
        .fromTo(
          ".hero-subtitle",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-breadcrumb",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );

      gsap.fromTo(
        ".video-card",
        { y: 55, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.16,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".videos-grid",
            start: "top 82%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const [featured, ...rest] = videos;

  return (
    <div ref={sectionRef}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header
        id="videos-hero"
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-cream-50 overflow-hidden text-center"
      >
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-90 bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,20,20,0.04)_100%)] pointer-events-none" />

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto z-10">
          {/* Main Display Title */}
          <h1 className="hero-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.15] mb-5">
            Videos
          </h1>

          {/* Breadcrumb navigation */}
          <nav
            aria-label="Breadcrumb"
            className="hero-breadcrumb inline-flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-ink-500 bg-white border border-ink-900/10 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
            >
              <Home size={13} />
              <span>Home</span>
            </Link>
            <ChevronRight size={12} className="text-ink-500/50" />
            <span className="text-brand-primary font-medium">Videos</span>
          </nav>
        </div>
      </header>

      {/* ── Screening room ─────────────────────────────────────── */}
      <div className="bg-cream-100 px-6 py-14 md:py-20">
        <div className="max-w-330 mx-auto">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold mb-10">
            {videos.length} {videos.length === 1 ? "video" : "videos"} found
          </p>
          <div className="videos-grid grid lg:grid-cols-12 gap-12 lg:gap-14">
            {featured && (
              <div className="lg:col-span-7">
                <VideoCard video={featured} featured />
              </div>
            )}
            {rest.length > 0 && (
              <div className="lg:col-span-5 space-y-12">
                {rest.map((video) => (
                  <VideoCard key={video.slug} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
