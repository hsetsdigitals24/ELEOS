"use client";

// components/shared/PageHero.tsx — the standard page hero: a bright cream
// masthead with ambient brand glows and grid texture, serif display title,
// subtitle, breadcrumb chip, and the double newspaper rule beneath.
// Extracted from the blog/videos/faqs heroes so every new page stays in
// lockstep with them; the hero-* class names drive the same GSAP entrance
// timeline.

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronRight, Home } from "lucide-react";

interface PageHeroProps {
  /** Anchor id for this hero — must be unique per page. */
  id: string;
  title: string;
  subtitle?: string;
  /** Breadcrumb label for the current page. */
  breadcrumb: string;
  /** Extra content under the breadcrumb (e.g. a live badge). */
  children?: React.ReactNode;
}

export default function PageHero({
  id,
  title,
  subtitle,
  breadcrumb,
  children,
}: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Same timeline shape as the other page heroes
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
        )
        .fromTo(
          ".hero-extra",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
    },
    { scope: sectionRef }
  );

  return (
    <header
      ref={sectionRef}
      id={id}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-cream-50 overflow-hidden text-center border-b border-ink-900/10"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-90 bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,20,20,0.04)_100%)] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Main display title */}
        <h1 className="hero-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.15] mb-5">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="hero-subtitle font-sans text-ink-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
        )}

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
          <span className="text-brand-primary font-medium">{breadcrumb}</span>
        </nav>

        {children && (
          <div className="hero-extra mt-8 flex justify-center">{children}</div>
        )}
      </div>
    </header>
  );
}
