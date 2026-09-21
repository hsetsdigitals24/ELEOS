"use client";

// components/home/LatestUpdatesClient.tsx — the homepage "Latest Blog & Video"
// cards. The server renders these from its own fetch; this half keeps them
// current by re-asking the API in the background and swapping the cards when
// something newer lands.
//
// Only entries ELEOS published within the last HOME_FRESH_MONTHS qualify: a
// card whose content is stale, or belongs to a subsidiary, is left out rather
// than shown. When neither card qualifies the section is omitted, so the page
// never advertises content under a heading that claims it is current.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Calendar, User, Tag, ArrowRight } from "lucide-react";
import { fetchPosts, fetchVideos } from "@/lib/api/posts";
import { formatLongDate } from "@/lib/formatDate";
import { recentSinceIso } from "@/lib/freshness";
import type { BlogPreview, VideoPreview } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LatestUpdatesClient({
  initialBlogPost,
  initialVideo,
}: {
  /** What the server found — the first paint, before any browser fetch. */
  initialBlogPost: BlogPreview | null;
  initialVideo: VideoPreview | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  // Seeded from the server, so the section is complete in the first paint.
  // Null still means "no qualifying entry" — which is a legitimate answer, not
  // just the state before a fetch settles.
  const [blogPost, setBlogPost] = useState<BlogPreview | null>(initialBlogPost);
  const [video, setVideo] = useState<VideoPreview | null>(initialVideo);

  useEffect(() => {
    // The window is applied by the API, before its `limit` — so the single row
    // that comes back is the newest *qualifying* entry, not the newest entry
    // which we then discard. Requesting limit:1 and filtering here would empty
    // the card whenever the newest post happened to be stale.
    const since = recentSinceIso();

    Promise.all([
      fetchPosts({ brand: "eleos", since, limit: 1 }),
      fetchVideos({ brand: "eleos", since, limit: 1 }),
    ])
      .then(([posts, videos]) => {
        const [latestPost] = posts.items;
        if (latestPost) {
          setBlogPost({
            id: latestPost.id,
            title: latestPost.title,
            date: formatLongDate(latestPost.publishedAt),
            author: latestPost.author,
            categories: latestPost.categories,
            excerpt: latestPost.excerpt,
            image: latestPost.imageUrl,
            href: `/blog/${latestPost.slug}`,
          });
        }
        const [latestVideo] = videos.items;
        if (latestVideo) {
          setVideo({
            id: latestVideo.id,
            title: latestVideo.title,
            duration: latestVideo.duration,
            date: formatLongDate(latestVideo.publishedAt),
            thumbnail: latestVideo.thumbnailUrl,
            href: `/videos/${latestVideo.slug}`,
          });
        }
      })
      .catch(() => {
        // Couldn't reach the API. Keep whatever the server rendered rather
        // than blanking the section — the page still needs to show its
        // content when the browser's request is the only thing that failed.
      });
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Header swipe
      tl.fromTo(
        ".updates-header > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Blog card slides from left — only when there is one to slide.
      if (blogPost) {
        tl.fromTo(
          ".blog-card",
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        );
      }

      // Video card slides from right — likewise.
      if (video) {
        tl.fromTo(
          ".video-card",
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }
    },
    { scope: sectionRef, dependencies: [blogPost, video], revertOnUpdate: true }
  );

  const cardCount = (blogPost ? 1 : 0) + (video ? 1 : 0);
  // Nothing recent enough to show — omit the section entirely rather than
  // leave a heading standing over empty space.
  if (cardCount === 0) return null;

  return (
    <section ref={sectionRef} className="py-section-md px-6 bg-cream-50 overflow-hidden" id="updates">
      <div className="max-w-330 mx-auto">
        {/* Header */}
        <div className="updates-header text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Latest Updates
            </span>
            <span className="w-8 h-0.5 bg-brand-primary" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900">
            Latest Blog &amp; Video
          </h2>
        </div>

        {/* One card gets a single centred column; only two share the row. */}
        <div
          className={`updates-grid grid gap-8 lg:gap-10 ${
            cardCount === 2 ? "lg:grid-cols-2" : "max-w-2xl mx-auto"
          }`}
        >
          {/* ── Blog Card ────────────────────────────── */}
          {blogPost && (
            <article className="blog-card group will-change-transform p-5 -m-2 rounded-2xl bg-white border border-ink-900/5 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-cream-200">
                {/* A post can legitimately have no image — the cream ground
                    stands in rather than handing next/image an empty src. */}
                {blogPost.image && (
                  <Image
                    src={blogPost.image}
                    alt={blogPost.title}
                    fill
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:blur-[1px]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Date badge */}
                <div className="absolute top-4 left-4 bg-brand-primary text-cream-50 px-3.5 py-1.5 rounded-md shadow-md">
                  <span className="font-sans text-xs font-semibold tracking-wide">
                    {blogPost.date}
                  </span>
                </div>
              </div>

              <h3 className="font-display text-xl md:text-2xl text-ink-900 mb-3 group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                <Link href={blogPost.href}>{blogPost.title}</Link>
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 font-sans text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-brand-primary" /> {blogPost.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-primary" /> {blogPost.date}
                </span>
                {blogPost.categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1.5 text-brand-700 font-medium">
                    <Tag size={13} /> {cat}
                  </span>
                ))}
              </div>

              <p className="font-sans text-ink-500 text-sm leading-relaxed mb-4 line-clamp-3">
                {blogPost.excerpt}
              </p>

              <Link
                href={blogPost.href}
                className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-wider font-semibold group-hover:gap-3 transition-all duration-300"
              >
                <span>Read Full Article</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </article>
          )}

          {/* ── Video Card ────────────────────────────── */}
          {video && (
            <div className="video-card group will-change-transform p-5 -m-2 rounded-2xl bg-white border border-ink-900/5 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between">
              <div>
                {/* Without a thumbnail the scrim sits on a dark panel, so the
                    play button still reads as a deliberate affordance. */}
                <div
                  className={`relative aspect-[16/10] rounded-xl overflow-hidden mb-5 ${
                    video.thumbnail ? "bg-cream-200" : "bg-ink-900"
                  }`}
                >
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:blur-[1px] object-top"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  {/* Dark scrim + play button */}
                  <div className="absolute inset-0 bg-ink-950/40 flex items-center justify-center group-hover:bg-ink-950/30 transition-colors duration-300">
                    <Link
                      href={video.href}
                      {...(video.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary rounded-full flex items-center justify-center text-cream-50 shadow-xl group-hover:scale-120 group-hover:shadow-[0_0_30px_rgba(227,34,28,0.8)] group-hover:rotate-6 transition-all duration-300"
                      aria-label="Play video"
                    >
                      <Play size={28} fill="currentColor" className="ml-1" />
                    </Link>
                  </div>
                  {/* Date badge — mirrors the blog card, so how recent each
                      entry is stays visible on both. */}
                  <div className="absolute top-4 left-4 bg-brand-primary text-cream-50 px-3.5 py-1.5 rounded-md shadow-md">
                    <span className="font-sans text-xs font-semibold tracking-wide">
                      {video.date}
                    </span>
                  </div>
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-4 right-4 bg-ink-950/80 backdrop-blur-sm text-cream-50 px-3 py-1 rounded-md">
                      <span className="font-sans text-xs font-semibold">
                        {video.duration}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-display text-xl md:text-2xl text-ink-900 mb-3 group-hover:text-brand-primary transition-colors duration-300">
                  {video.title}
                </h3>

                <p className="font-sans text-ink-500 text-sm leading-relaxed mb-6">
                  Explore our recorded workshops, expert interviews, and community field sessions addressing food systems and human security.
                </p>
              </div>

              <div>
                <Link
                  href={video.href}
                  {...(video.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex items-center justify-center gap-3 bg-brand-primary text-cream-50 px-7 py-3 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover hover:shadow-lg transition-all duration-300 group-hover:shadow-[0_4px_15px_rgba(227,34,28,0.4)]"
                >
                  <span>Watch On YouTube</span>
                  <Play size={14} fill="currentColor" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
