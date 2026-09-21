"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, Home, ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const pillars = ["Food Security", "Nutrition Security", "Human Security"];

export default function WhatWeDoHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Respect users who opt out of motion — render everything in place.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline();

      tl.fromTo(
        ".wwd-eyebrow",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      )
        .fromTo(
          ".wwd-title",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
          "-=0.35"
        )
        .fromTo(
          ".wwd-pillar",
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.55,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .fromTo(
          ".wwd-intro",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.35"
        )
        .fromTo(
          ".wwd-breadcrumb",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".wwd-scroll-cue",
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );

      // Gentle parallax drift as the hero scrolls away (scrubbed, transform-only).
      gsap.to(".wwd-hero-inner", {
        y: -64,
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
      id="what-we-do-hero"
      ref={containerRef}
      className="relative pt-32 pb-24 md:pt-44 md:pb-32 px-6 bg-white overflow-hidden text-center"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-90 bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,20,20,0.04)_100%)] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="wwd-hero-inner relative max-w-4xl mx-auto z-10">
        
        {/* Main display title */}
        <h1 className="wwd-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.15] mb-7">
          What We Do
        </h1>

       
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="wwd-breadcrumb inline-flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-ink-700 bg-white border border-ink-900/10 shadow-sm px-4 py-2 rounded-full"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-ink-500" />
          <span className="text-brand-primary font-medium">What We Do</span>
        </nav>
      </div>

      {/* Scroll cue */}
      {/* <a
        href="#office"
        className="wwd-scroll-cue absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-cream-200/50 hover:text-brand-on-dark transition-colors"
        aria-label="Scroll to our office section"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.25em]">
          Scroll
        </span>
        <ChevronDown size={18} className="animate-bounce" />
      </a> */}
    </section>
  );
}
