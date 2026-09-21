"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight, Home } from "lucide-react";
import type { ServiceInfo } from "./serviceData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Shared chapter-opener hero for the /service/ pages. Full-bleed bright field
 * with the chapter index, display-serif title, lead paragraph, and an
 * asymmetric documentary image bleeding off the right edge.
 */
export default function ServiceHero({ service }: { service: ServiceInfo }) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline();

      tl.fromTo(
        ".sh-eyebrow",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
      )
        .fromTo(
          ".sh-chapter",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".sh-title",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".sh-lead",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".sh-breadcrumb",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.35"
        )
        .fromTo(
          ".sh-image",
          { x: 60, opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" },
          "-=0.8"
        );

      // Gentle parallax drift as the hero scrolls away (scrubbed, transform-only).
      gsap.to(".sh-hero-inner", {
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
      id="service-hero"
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 bg-white overflow-hidden"
    >
      {/* Ambient glow + grid — echoes the What We Do hero */}
      <div className="absolute top-1/4 left-1/3 w-162.5 h-90 bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(13,13,13,0.05)_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none" />

      <div className="sh-hero-inner relative max-w-330 mx-auto z-10">
        <div className="flex justify-center text-center gap-12 lg:gap-10 items-center">
          {/* Text column */}
          <div className="lg:col-span-7">
           
            <h1 className="sh-title font-display text-4xl sm:text-5xl md:text-6xl text-ink-950 leading-[1.12] mb-7 max-w-2xl">
              {service.title}
            </h1>

            <nav
              aria-label="Breadcrumb"
              className="sh-breadcrumb inline-flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-ink-700 bg-white border border-ink-900/10 shadow-sm px-4 py-2 rounded-full"
            >
              <Link
                href="/"
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
              >
                <Home size={13} />
                <span>Home</span>
              </Link>
              <ChevronRight size={12} className="text-ink-400" />
              <Link
                href="/what-we-do"
                className="hover:text-brand-primary transition-colors"
              >
                What We Do
              </Link>
              <ChevronRight size={12} className="text-ink-400" />
              <span className="text-brand-primary font-medium">
                {service.tabLabel}
              </span>
            </nav>
          </div>

          
        </div>
      </div>
    </section>
  );
}
