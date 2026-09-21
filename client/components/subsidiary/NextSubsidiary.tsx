"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/service/editorial";
import { subsidiaries } from "./subsidiaryData";

/**
 * "Continue the story" cross-link between the two subsidiary pages. Wraps
 * around from Marvela back to His Story Tellers Media, closing each page as
 * a chapter rather than a dead end — the subsidiary counterpart of the
 * service pages' NextChapter.
 */
export function NextSubsidiary({ fromSlug }: { fromSlug: string }) {
  const i = subsidiaries.findIndex((s) => s.slug === fromSlug);
  const next = subsidiaries[(i + 1) % subsidiaries.length];

  return (
    <Reveal>
      <Link
        href={next.href}
        className="group flex items-center justify-between gap-6 border-t-2 border-ink-900/10 pt-8"
        aria-label={`Next subsidiary: ${next.title}`}
      >
        <div>
          <span className="block font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold mb-2">
            Next Subsidiary
          </span>
          <span className="font-display text-2xl sm:text-3xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300 leading-tight">
            {next.title}
          </span>
        </div>
        <span className="shrink-0 w-14 h-14 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-300">
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </span>
      </Link>
    </Reveal>
  );
}
