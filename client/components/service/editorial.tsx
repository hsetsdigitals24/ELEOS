"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { services } from "./serviceData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/* SectionHeader — the recurring eyebrow + display-serif heading + red */
/* rule that punctuates every editorial block on the service pages.   */
/* ------------------------------------------------------------------ */

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  /** "light" sits on cream/white, "dark" sits on ink-900. */
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  tone = "light",
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const isDark = tone === "dark";
  const accent = isDark ? "text-brand-on-dark" : "text-brand-primary";

  return (
    <div
      className={`mb-10 md:mb-14 ${
        align === "center" ? "text-center" : ""
      } ${className}`}
    >
      <div
        className={`flex items-center gap-3 mb-4 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span
          className={`w-8 h-0.5 ${isDark ? "bg-brand-on-dark" : "bg-brand-primary"}`}
        />
        <span
          className={`text-xs uppercase tracking-[0.2em] font-sans ${accent} font-semibold`}
        >
          {eyebrow}
        </span>
        {align === "center" && (
          <span
            className={`w-8 h-0.5 ${isDark ? "bg-brand-on-dark" : "bg-brand-primary"}`}
          />
        )}
      </div>
      <h2
        className={`font-display text-3xl sm:text-4xl leading-tight ${
          isDark ? "text-cream-50" : "text-ink-900"
        } ${align === "center" ? "max-w-3xl mx-auto" : "max-w-2xl"}`}
      >
        {title}
      </h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — generic scroll-triggered fade-up wrapper. Staggers direct  */
/* children when used as a container; animates itself when it wraps a */
/* single node. Transform/opacity only, respects reduced motion.      */
/* ------------------------------------------------------------------ */

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger between direct children, in seconds. */
  stagger?: number;
}

export function Reveal({ children, className = "", stagger = 0.12 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ref.current!.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 82%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NextChapter — "continue the story" link to the next service page.  */
/* Wraps around from 05 back to 01. Closes every service article as  */
/* a chapter, not a dead end.                                         */
/* ------------------------------------------------------------------ */

export function NextChapter({ fromSlug }: { fromSlug: string }) {
  const i = services.findIndex((s) => s.slug === fromSlug);
  const next = services[(i + 1) % services.length];

  return (
    <Reveal className="mt-16 md:mt-20">
      <Link
        href={next.href}
        className="group flex items-center justify-between gap-6 border-t-2 border-ink-900/10 pt-8"
        aria-label={`Next service: ${next.title}`}
      >
        <div>
          <span className="block font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold mb-2">
            Next Chapter — {next.index}
          </span>
          <span className="font-display text-2xl sm:text-3xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300 leading-tight">
            {next.title}
          </span>
        </div>
        <span className="shrink-0 w-14 h-14 rounded-full bg-brand-primary text-cream-50 flex items-center justify-center group-hover:bg-brand-hover group-hover:scale-110 transition-all duration-300">
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </span>
      </Link>
    </Reveal>
  );
}
