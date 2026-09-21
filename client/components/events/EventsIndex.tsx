"use client";

// components/events/EventsIndex.tsx — the upcoming events page: the
// standard hero, then a dated editorial ledger of what's coming — a big
// date block on one side, the story of the event on the other, alternating
// down the page like the Marvela shelf rows.
//
// Events come from the API (the database is the source of truth — the admin
// publishes there). The hardcoded events in eventData.ts are the fallback.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { sortedUpcomingEvents } from "./eventData";
import { fetchEvents } from "@/lib/api/events";
import { formatLongDate } from "@/lib/formatDate";
import type { EventItemApi, UpcomingEvent } from "@/types/event";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Maps an API event onto the unified display shape. */
function apiToDisplay(event: EventItemApi): UpcomingEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date,
    time: event.time,
    venue: event.venue,
    city: event.city,
    category: event.category,
    description: event.description,
    image: event.imageUrl,
    imageAlt: event.imageAlt,
  };
}

/** Day + month pulled apart for the big date block. */
function DateBlock({ date }: { date: string }) {
  const parsed = new Date(date);
  return (
    <div className="text-center shrink-0 w-24 sm:w-28">
      <span className="block font-display text-5xl sm:text-6xl text-brand-primary leading-none font-semibold">
        {parsed.getDate().toString().padStart(2, "0")}
      </span>
      <span className="block mt-2 font-sans text-xs uppercase tracking-[0.25em] text-ink-500 font-semibold">
        {parsed.toLocaleDateString("en-GB", { month: "short" })}
      </span>
      <span className="block mt-0.5 font-sans text-xs uppercase tracking-[0.25em] text-ink-500">
        {parsed.getFullYear()}
      </span>
    </div>
  );
}

function EventRow({ event, index }: { event: UpcomingEvent; index: number }) {
  const imageRight = index % 2 === 1;

  return (
    <article className="evt-row group grid lg:grid-cols-12 gap-8 lg:gap-12 items-center border-t-2 border-ink-900/10 last:border-b-2 py-12 lg:py-14">
      {/* Date + meta — the ledger spine */}
      <div className="lg:col-span-4 flex lg:flex-col items-center lg:items-start gap-6 lg:gap-5">
        <DateBlock date={event.date} />
        <div className="font-sans text-sm text-ink-700 space-y-2.5 min-w-0">
          <p className="flex items-center gap-2">
            <CalendarDays size={14} className="text-brand-primary shrink-0" aria-hidden="true" />
            <time dateTime={event.date}>{formatLongDate(event.date)}</time>
          </p>
          <p className="flex items-center gap-2">
            <Clock size={14} className="text-brand-primary shrink-0" aria-hidden="true" />
            <span>{event.time}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin size={14} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {event.venue}
              <span className="block text-ink-500">{event.city}</span>
            </span>
          </p>
        </div>
      </div>

      {/* The story — image and text swap sides on alternating rows */}
      <div className={`lg:col-span-4 ${imageRight ? "lg:order-3" : "lg:order-1"}`}>
        <div className="relative aspect-4/3 overflow-hidden rounded-md lg:-mx-2">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-cream-200 flex items-center justify-center text-brand-primary/50">
              <CalendarDays size={32} strokeWidth={1.25} aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/10 transition-colors duration-500" />
        </div>
      </div>

      <div className={`lg:col-span-4 ${imageRight ? "lg:order-1" : "lg:order-3"}`}>
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
          {event.category}
        </p>
        <h2 className="mt-2.5 font-display text-2xl leading-tight text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
          {event.title}
        </h2>
        <p
          className="mt-3.5 font-sans text-sm text-ink-500 leading-relaxed"
          // Sanitized on write (server-side allowlist); the static fallback
          // is plain text, which renders unchanged.
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
        <Link
          href={`/upcoming/${event.slug}/register`}
          className="mt-5 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
        >
          Register your interest
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function EventsIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // The static events render immediately; the API list replaces them when
  // reachable (the database is the source of truth — the admin edits there).
  const [events, setEvents] = useState<UpcomingEvent[]>(sortedUpcomingEvents);

  useEffect(() => {
    let cancelled = false;
    fetchEvents({ limit: 50 })
      .then((page) => {
        if (cancelled || page.items.length === 0) return;
        setEvents(page.items.map(apiToDisplay));
      })
      .catch(() => {
        // API unreachable (dev without backend, or an outage) — the static
        // events stay on the page.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Event rows settle in from alternating sides, one after another
      gsap.utils.toArray<HTMLElement>(".evt-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -45 : 45, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef}>
      <PageHero
        id="events-hero"
        title="Upcoming Events"
        breadcrumb="Upcoming Events"
      />

      {/* ── The ledger ─────────────────────────────────────────── */}
      <div className="bg-cream-100 px-6 py-12 md:py-16">
        <div className="max-w-330 mx-auto">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold pb-2">
            {events.length} upcoming {events.length === 1 ? "date" : "dates"} on the calendar
          </p>
          {events.map((event, i) => (
            <EventRow key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>

      {/* ── Missed one? ─────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20 px-6 relative overflow-hidden border-t border-ink-900/10">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-330 mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary font-semibold mb-3">
              Missed one?
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-ink-950 leading-snug">
              Catch the recordings on our video shelf — or plan for the next date.
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
            >
              Watch Recordings
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 border border-ink-900/15 text-ink-900 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
