"use client";

// components/home/FooterClient.tsx — the site footer's markup and motion. The
// server parent fetches the recent posts so the column is populated in the
// first paint; this half re-asks in the background and swaps in anything
// newer.
//
// The "Recent Posts" column lists the newest blog posts and videos from the
// API (merged, newest first), limited to ELEOS entries from the last
// HOME_FRESH_MONTHS. When none qualify it offers the blog index instead — the
// footer never advertises stale or subsidiary content.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Clock,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { fetchPosts, fetchVideos } from "@/lib/api/posts";
import { formatLongDate } from "@/lib/formatDate";
import { recentSinceIso } from "@/lib/freshness";
import BackToTop from "@/components/BackToTop";
import type { OpeningHoursEntry, FooterRecentPost } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function IconFacebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTwitterX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function IconYoutube({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
    </svg>
  );
}

function IconLinkedin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const hours: OpeningHoursEntry[] = [
  { days: "Monday – Friday", hours: "9:00am – 4:00pm (GMT)" },
  { days: "Sat. & Public Hols.", hours: "10:00am – 4:00pm (GMT)" },
  { days: "Sundays", hours: "Closed" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "What We Do", href: "/what-we-do" },
  { label: "FAQs", href: "/faqs" },
];

const socialLinks = [
  { Icon: IconTwitterX, href: "https://x.com/Eleos_ri", label: "Twitter / X" },
  { Icon: IconInstagram, href: "https://www.instagram.com/eleosresearch", label: "Instagram" },
  { Icon: IconYoutube, href: "https://youtube.com/@eleosrein?si=JEjsI7E3lFNlkHh3", label: "YouTube" },
  { Icon: IconLinkedin, href: "https://www.linkedin.com/in/preciousgabriel/", label: "LinkedIn" },
];

export default function FooterClient({
  initialRecentPosts,
}: {
  /** What the server found — the first paint, before any browser fetch. */
  initialRecentPosts: FooterRecentPost[];
}) {
  const footerRef = useRef<HTMLElement>(null);
  // Seeded from the server. Empty is also a legitimate result, when nothing
  // recent and on-brand qualifies — the column then offers the blog index
  // instead of a stale list.
  const [recentPosts, setRecentPosts] = useState<FooterRecentPost[]>(initialRecentPosts);

  useEffect(() => {
    // Merge the newest qualifying posts and videos, newest first, keep the
    // top 3. The six-month window is applied by the API before each `limit`,
    // so both lists are already recent and ELEOS-only by the time they merge.
    const since = recentSinceIso();
    Promise.all([
      fetchPosts({ brand: "eleos", since, limit: 3 }),
      fetchVideos({ brand: "eleos", since, limit: 3 }),
    ])
      .then(([posts, videos]) => {
        const merged = [
          ...posts.items.map((post) => ({
            iso: post.publishedAt,
            entry: {
              id: `post-${post.id}`,
              title: post.title,
              date: formatLongDate(post.publishedAt),
              href: `/blog/${post.slug}`,
              imageLink: post.imageUrl,
            } as FooterRecentPost,
          })),
          ...videos.items.map((video) => ({
            iso: video.publishedAt,
            entry: {
              id: `video-${video.id}`,
              title: video.title,
              date: formatLongDate(video.publishedAt),
              href: `/videos/${video.slug}`,
              imageLink: video.thumbnailUrl,
            } as FooterRecentPost,
          })),
        ]
          .sort((a, b) => Date.parse(b.iso) - Date.parse(a.iso))
          .slice(0, 3)
          .map(({ entry }) => entry);
        setRecentPosts(merged);
      })
      .catch(() => {
        // Couldn't reach the API. Keep whatever the server rendered rather
        // than blanking the column — the footer still has to show its content
        // when the browser's request is the only thing that failed.
      });
  }, []);

  useGSAP(
    () => {
      // Columns swipe up on scroll with enter/leave
      gsap.fromTo(
        ".footer-col",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            end: "bottom 5%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Bottom copyright & contact bar
      gsap.fromTo(
        ".footer-bottom",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-bottom",
            start: "top 95%",
            end: "bottom 0%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <>
      {/* Outside the <footer>, not inside it: the footer clips its overflow and
          its animated columns carry `will-change-transform`, which would trap
          a fixed-position child in their containing block. */}
      <BackToTop />

      <footer ref={footerRef} className="bg-ink-900 text-cream-200 overflow-hidden">
        {/* ── Main grid ──────────────────────────────────── */}
        <div className="max-w-330 mx-auto px-6 pt-16 md:pt-20 pb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-ink-700">
            {/* Col 1 — About + Social */}
            <div className="footer-col will-change-transform">
              <Link
                href="/"
                className="font-display text-xl text-cream-50 mb-5 inline-block hover:text-brand-tint transition-colors"
              >
                ELEOS RESEARCH INNOVATIONS
              </Link>
              <p className="font-sans text-sm text-cream-200/70 leading-relaxed mb-6">
                We are a research platform that provides adequate knowledge for
                utilizing food and nutrition appropriately to ensure overall health
                and well-being; and support additional human security initiatives
                that target individuals and households.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    aria-label={label}
                    className="w-10 h-10 border border-ink-700 rounded-lg flex items-center justify-center text-cream-200/70 hover:bg-brand-primary hover:border-brand-primary hover:text-cream-50 hover:scale-110 hover:shadow-[0_0_15px_rgba(227,34,28,0.5)] transition-all duration-300"
                  >
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2 — Opening Hours */}
            <div className="footer-col will-change-transform">
              <h4 className="font-display text-cream-50 text-base mb-5 flex items-center gap-2">
                <Clock size={16} className="text-brand-on-dark" />
                Opening Hours
              </h4>
              <ul className="space-y-3">
                {hours.map((entry) => (
                  <li key={entry.days} className="font-sans text-sm">
                    <span className="text-cream-200/70 block mb-0.5">
                      {entry.days}
                    </span>
                    <span
                      className={`font-semibold tracking-wide ${
                        entry.hours === "Closed"
                          ? "text-brand-on-dark"
                          : "text-cream-100"
                      }`}
                    >
                      {entry.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Quick Links */}
            <div className="footer-col will-change-transform">
              <h4 className="font-display text-cream-50 text-base mb-5">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group font-sans text-sm text-cream-200/70 hover:text-brand-on-dark transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowRight size={13} className="text-brand-on-dark group-hover:translate-x-1 transition-transform" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Recent Posts */}
            <div className="footer-col will-change-transform">
              <h4 className="font-display text-cream-50 text-base mb-5">
                Recent Posts
              </h4>
              {recentPosts.length === 0 ? (
                // Nothing recent enough to list — point at the full archive
                // instead of advertising outdated posts.
                <div className="space-y-4">
                  <p className="font-sans text-sm text-cream-200/70">
                    Nothing new just yet.
                  </p>
                  <Link
                    href="/blog"
                    className="group font-sans text-sm text-cream-200/70 hover:text-brand-on-dark transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowRight size={13} className="text-brand-on-dark group-hover:translate-x-1 transition-transform" />
                    <span>Browse the blog</span>
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="border-b border-ink-700/60 pb-3 group flex items-center gap-3.5">
                      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-ink-800 border border-white/5">
                        {/* A post can legitimately have no image — the dark
                            ground stands in rather than handing next/image an
                            empty src. */}
                        {post.imageLink && (
                          <Image
                            src={post.imageLink}
                            alt={post.title}
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={post.href}
                          className="font-sans text-xs sm:text-sm text-cream-200/70 group-hover:text-cream-50 group-hover:translate-x-0.5 transition-all duration-300 block leading-snug line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <span className="font-sans text-[11px] text-cream-200/40 mt-1 block">
                          {post.date}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Bottom bar ───────────────────────────────── */}
          <div className="footer-bottom pt-8 flex flex-col md:flex-row items-center justify-between gap-6 will-change-transform">
            <p className="font-sans text-xs text-cream-200/50 text-center md:text-left">
              Copyright &copy; {new Date().getFullYear()} ELEOS Research Innovations. All rights reserved.
            </p>

            {/* Contact placeholders */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 font-sans text-xs text-cream-200/60">
              <a
                href="mailto:eleosresearchinn@gmail.com"
                className="flex items-center gap-1.5 hover:text-brand-on-dark transition-colors"
              >
                <Mail size={13} className="text-brand-on-dark" />
                <span>eleosresearchinn@gmail.com</span>
              </a>
              <a
                href="tel:+2348122765292"
                className="flex items-center gap-1.5 hover:text-brand-on-dark transition-colors"
              >
                <Phone size={13} className="text-brand-on-dark" />
                <span>(+234) 8122765292</span>
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-brand-on-dark" />
                <span>Maranatha Complex, Behind T & K Restaurant, Off University Road, Tanke, Ilorin</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
