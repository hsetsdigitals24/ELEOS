"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronRight, HelpCircle, Home } from "lucide-react";

export default function FaqHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".faq-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      )
        .fromTo(
          ".faq-title",
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".faq-subtitle",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".faq-breadcrumb",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-white overflow-hidden text-center"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(13,13,13,0.05)_100%)] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto z-10">

        {/* Main Title */}
        <h1 className="faq-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.15] mb-5">
          Frequently Asked Questions
        </h1>

        {/* Subtitle */}
        <p className="faq-subtitle font-sans text-ink-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          At ELEOS Research Innovations, we're committed to transparency and openness. Here are some frequently asked
questions about our organization and services. We are constantly adding most asked question to this page.
        </p>

        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          className="faq-breadcrumb inline-flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-ink-700 bg-white border border-ink-900/10 shadow-sm px-4 py-2 rounded-full"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-ink-400" />
          <span className="text-brand-primary font-medium">FAQs</span>
        </nav>
      </div>
    </section>
  );
}
