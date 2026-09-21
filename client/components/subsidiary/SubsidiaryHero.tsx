"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, Home } from "lucide-react";
import type { SubsidiaryInfo } from "./subsidiaryData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Shared chapter-opener hero for the two subsidiary pages. Full-bleed dark
 * field with the "A Subsidiary of Eleos" eyebrow, display-serif title,
 * tagline, and breadcrumb — mirrors the What We Do / service heroes.
 */
export default function SubsidiaryHero({
  subsidiary,
}: {
  subsidiary: SubsidiaryInfo;
}) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline();

      tl.fromTo(
        ".subh-eyebrow",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
      )
        .fromTo(
          ".subh-title",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".subh-tagline",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".subh-breadcrumb",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.35"
        );

      // Gentle parallax drift as the hero scrolls away (scrubbed, transform-only).
      gsap.to(".subh-hero-inner", {
        y: -56,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="subsidiary-hero"
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 bg-white overflow-hidden text-center"
    >
      {/* Ambient glow + grid — echoes the What We Do / service heroes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-90 bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,20,20,0.04)_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none" />

      <div className="subh-hero-inner relative max-w-4xl mx-auto z-10">

        {/* Main display title */}
        <h1 className="subh-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.12] mb-7">
          {subsidiary.title}
        </h1>

        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="subh-breadcrumb inline-flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-ink-700 bg-white border border-ink-900/10 shadow-sm px-4 py-2 rounded-full"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-ink-500" />
          <span className="hover:text-brand-primary transition-colors">
            Our Subsidiaries
          </span>
          <ChevronRight size={12} className="text-ink-500" />
          <span className="text-brand-primary font-medium">
            {subsidiary.tabLabel}
          </span>
        </nav>
      </div>
    </section>
  );
}
