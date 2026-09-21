"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
} from "lucide-react";
import { latestNews, services } from "./serviceData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Shared left rail for the five /service/ pages: service nav tabs, Latest
 * News, and Get in Touch. Rendered inside ServiceLayout's two-column grid —
 * sticky on desktop; on mobile the nav tabs sit above the content and the
 * news/contact blocks drop below it (via the layout's ordering).
 */
export default function ServiceSidebar({ activeSlug }: { activeSlug: string }) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".ssb-block",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: asideRef.current,
            start: "top 85%",
            toggleActions: "play none play reverse",
          },
        }
      );
    },
    { scope: asideRef }
  );

  return (
    <aside
      ref={asideRef}
      aria-label="Service navigation and updates"
      className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-10 max-lg:contents w-80"
    >
      {/* ── 1. Service nav tabs ─────────────────────────── */}
      <nav
        className="ssb-block will-change-transform max-lg:order-1"
        aria-label="Our services"
      >
        <div className="hidden lg:flex items-center gap-3 mb-4">
          <span className="w-8 h-0.5 bg-brand-primary" />
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
            Our Services
          </span>
        </div>

        {/* Vertical chapter list (desktop) / horizontal chip strip (mobile) */}
        <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
          {services.map((service) => {
            const isActive =
              service.slug === activeSlug && pathname === service.href;

            return (
              <li key={service.slug} className="shrink-0 lg:shrink">
                <Link
                  href={service.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 lg:gap-4 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? "lg:border-l-4 lg:border-l-brand-primary bg-brand-primary text-cream-50 border-brand-primary shadow-lg px-4 py-3 lg:pr-5"
                      : "border-cream-200 bg-white/60 lg:border-l-4 lg:border-l-transparent text-ink-700 hover:text-brand-hover hover:border-brand-primary/40 hover:bg-white hover:lg:border-l-brand-primary px-4 py-2.5 lg:pr-5"
                  }`}
                >
                  <span
                    className={`font-display text-xs font-semibold tracking-wider ${
                      isActive
                        ? "text-cream-100/80"
                        : "text-brand-primary/50 group-hover:text-brand-primary"
                    }`}
                  >
                    {service.index}
                  </span>
                  <span className="font-sans text-[0.72rem] lg:text-xs uppercase tracking-widest font-semibold whitespace-nowrap lg:whitespace-normal">
                    {service.tabLabel}
                  </span>
                  <ArrowRight
                    size={13}
                    className={`hidden lg:block ml-auto transition-all duration-300 ${
                      isActive
                        ? "text-cream-100"
                        : "text-brand-primary/0 group-hover:text-brand-primary group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── 2. Latest News ──────────────────────────────── */}
      <section className="ssb-block will-change-transform max-lg:order-3" aria-label="Latest news">
        <div className="hidden lg:flex items-center gap-3 mb-4">
          <span className="w-8 h-0.5 bg-brand-primary" />
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
            Latest News
          </span>
        </div>

        <ul className="bg-white border border-cream-200 rounded-xl p-4 lg:p-5 space-y-4 shadow-sm">
          {latestNews.map((news) => (
            <li
              key={news.id}
              className="group flex items-start gap-3.5 last:border-0 border-b border-cream-200/70 last:pb-0 pb-4"
            >
              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-cream-200 border border-cream-200">
                <Image
                  src={news.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={news.href}
                  className="font-sans text-[0.82rem] leading-snug text-ink-700 group-hover:text-brand-hover transition-colors duration-300 line-clamp-2"
                >
                  {news.title}
                </Link>
                <span className="flex items-center gap-1.5 font-sans text-[11px] text-ink-500/80 mt-1.5">
                  <CalendarDays size={11} className="text-brand-primary" />
                  {news.date}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 3. Get in Touch ─────────────────────────────── */}
      <section
        className="ssb-block will-change-transform max-lg:order-3"
        aria-label="Get in touch"
      >
        <div className="relative bg-white text-ink-700 rounded-xl p-6 overflow-hidden shadow-xl border border-ink-900/10">
          {/* Subtle diagonal texture — echoes the office card on What We Do */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(135deg,#141414_1px,transparent_1px)] bg-size-[1.25rem_1.25rem] pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <PhoneCall size={17} />
              </span>
              <h3 className="font-display text-lg text-ink-950">
                Get in Touch
              </h3>
            </div>

            <p className="font-sans text-sm text-ink-700 leading-relaxed mb-5">
              Have a question about this programme, or want to work with us?
              Reach out — we would love to hear from you.
            </p>

            <ul className="space-y-3 font-sans text-sm mb-6">
              <li>
                <a
                  href="tel:+2348122765292"
                  className="flex items-center gap-2.5 text-ink-700 hover:text-brand-primary transition-colors"
                >
                  <Phone size={14} className="shrink-0 text-brand-primary" />
                  <span>(+234) 8122765292</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:eleosresearchinn@gmail.com"
                  className="flex items-center gap-2.5 text-ink-700 hover:text-brand-primary transition-colors break-all"
                >
                  <Mail size={14} className="shrink-0 text-brand-primary" />
                  <span>eleosresearchinn@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-ink-700">
                <MapPin size={14} className="shrink-0 mt-1 text-brand-primary" />
                <span className="leading-relaxed">
                  Maranatha Complex, Behind T & K Restaurant, Off University Road, Tanke, Ilorin
                </span>
              </li>
            </ul>

            <Link
              href="/contact"
              className="group inline-flex w-full items-center justify-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md shadow-lg hover:bg-brand-hover transition-all duration-300 active:scale-98"
            >
              <span>Contact Us</span>
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>
    </aside>
  );
}
