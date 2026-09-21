"use client";

// components/blog/BlogIndex.tsx — the blog front page, art-directed like a
// newspaper: a bright cream masthead with a double rule, a lead story with a
// big serif headline, a ruled "also in this edition" rail, and category
// chips + search that re-cut the page like an editor's desk.
//
// Posts come from the API (newest first — the admin's latest publish leads
// the page). The hardcoded data in blogData.ts is only the offline fallback.

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronRight, Home, MessageSquare, Search, User } from "lucide-react";
import { sortedBlogPosts } from "./blogData";
import { fetchPosts } from "@/lib/api/posts";
import { formatLongDate, formatShortDate } from "@/lib/formatDate";
import type { BlogPost, BlogPostItem } from "@/types/blog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The shape the page renders — unifies static posts and API posts. */
interface DisplayPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  categories: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  commentCount: number;
}

function staticToDisplay(post: BlogPost): DisplayPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    categories: post.categories,
    tags: post.tags,
    image: post.image,
    imageAlt: post.imageAlt,
    commentCount: post.archivedComments.length,
  };
}

function apiToDisplay(post: BlogPostItem): DisplayPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt,
    categories: post.categories,
    tags: post.tags,
    image: post.imageUrl,
    imageAlt: post.imageAlt,
    commentCount: post.archivedComments.length,
  };
}

/** Lead story — the newest post, given full editorial weight. */
function LeadStory({ post }: { post: DisplayPost }) {
  return (
    <article className="lead-story group">
      <Link href={`/blog/${post.slug}`} className="block">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-brand-primary font-semibold mb-4">
          {post.categories.join(" · ")}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05] text-ink-900 hover:text-brand-hover transition-colors duration-300">
          {post.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-ink-500 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <User size={13} className="text-brand-primary" aria-hidden="true" />
            {post.author}
          </span>
          <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={13} className="text-brand-primary" aria-hidden="true" />
            {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>

        <div className="relative aspect-16/10 overflow-hidden mt-7 rounded-md">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/10 transition-colors duration-500" />
        </div>

        <p className="mt-6 font-sans text-base leading-relaxed text-ink-700 max-w-2xl">
          {post.excerpt}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold group-hover:gap-3.5 transition-all duration-300">
          Read the full story
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}

/** Secondary story for the ruled right-hand rail. */
function RailStory({ post }: { post: DisplayPost }) {
  return (
    <article className="rail-story group pb-8 border-b border-ink-900/15 last:border-b-0 last:pb-0">
      <Link href={`/blog/${post.slug}`} className="flex gap-5">
        <div className="relative w-28 sm:w-36 shrink-0 aspect-square overflow-hidden rounded-sm">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
        <div className="min-w-0">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
            {formatShortDate(post.publishedAt)} — {post.categories[0]}
          </p>
          <h3 className="mt-2 font-display text-lg leading-snug text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
            {post.title}
          </h3>
          <p className="mt-2 font-sans text-sm text-ink-500 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Compact row used once a filter or search is active. */
function StoryRow({ post }: { post: DisplayPost }) {
  return (
    <article className="story-row group border-t border-ink-900/15 py-7 grid sm:grid-cols-[1fr_220px] gap-6 items-center">
      <div>
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
          {formatShortDate(post.publishedAt)} — {post.categories.join(" · ")}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="mt-2.5 font-sans text-sm text-ink-500 leading-relaxed line-clamp-2 max-w-xl">
          {post.excerpt}
        </p>
      </div>
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-4/3 overflow-hidden rounded-sm"
      >
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, 220px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>
    </article>
  );
}

export default function BlogIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Static posts first, then swapped for the API's list once it answers.
  const [posts, setPosts] = useState<DisplayPost[]>(() =>
    sortedBlogPosts.map(staticToDisplay)
  );

  useEffect(() => {
    fetchPosts({ limit: 50 })
      .then((result) => {
        if (result.items.length > 0) {
          setPosts(result.items.map(apiToDisplay));
        }
      })
      .catch(() => {
        // API unreachable — keep the fallback content already on the page.
      });
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const category of post.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [posts]);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === null || post.categories.includes(activeCategory);
      const matchesSearch =
        query === "" ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.categories.some((category) => category.toLowerCase().includes(query)) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, query]);

  const isBrowsing = activeCategory === null && query === "";
  const [lead, ...rest] = filtered;

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
        ".front-page > *",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".front-page",
            start: "top 82%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header
        id="blog-masthead"
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
            Blogs
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
            <span className="text-brand-primary font-medium">Blogs</span>
          </nav>
        </div>
      </header>
    
      {/* ── Front page ───────────────────────────────────────────── */}
      <div className="bg-cream-100 px-6 py-10 md:py-14">
        <div className="max-w-330 mx-auto">
          {/* Editor's desk: category chips + search */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 pb-8 border-b border-ink-900/15">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`font-sans text-xs uppercase tracking-[0.12em] font-semibold px-3.5 py-2 rounded-sm border transition-colors duration-300 ${
                  activeCategory === null
                    ? "bg-brand-primary text-cream-50 border-brand-primary"
                    : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() =>
                    setActiveCategory((prev) => (prev === category.name ? null : category.name))
                  }
                  className={`font-sans text-xs uppercase tracking-[0.12em] font-semibold px-3.5 py-2 rounded-sm border transition-colors duration-300 ${
                    activeCategory === category.name
                      ? "bg-brand-primary text-cream-50 border-brand-primary"
                      : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
                  }`}
                >
                  {category.name}
                  <span className="ml-1.5 opacity-60">{category.count}</span>
                </button>
              ))}
            </div>

            <div className="relative lg:ml-auto lg:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the journal…"
                aria-label="Search blog posts"
                className="w-full bg-cream-50 border border-ink-900/20 rounded-sm pl-9 pr-4 py-2.5 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary"
              />
            </div>
          </div>

          {/* The page itself */}
          {filtered.length === 0 ? (
            <p className="font-sans text-sm text-ink-500 py-16 text-center">
              Nothing filed under that byline — try a different search or category.
            </p>
          ) : isBrowsing ? (
            /* Front-page layout: lead story + ruled rail */
            <div className="front-page grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-14 pt-10">
              {lead && <LeadStory post={lead} />}
              <aside className="lg:border-l lg:border-ink-900/15 lg:pl-10 space-y-8">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold">
                  Also in this edition
                </p>
                {rest.map((post) => (
                  <RailStory key={post.slug} post={post} />
                ))}
              </aside>
            </div>
          ) : (
            /* Filtered/searching: uniform rows */
            <div className="pt-4">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold py-4">
                {filtered.length} {filtered.length === 1 ? "story" : "stories"} found
              </p>
              {filtered.map((post) => (
                <StoryRow key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
