"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, Handshake } from "lucide-react";
import type { OpeningHoursEntry } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const hours: OpeningHoursEntry[] = [
  { days: "Monday – Friday", hours: "9:00am – 4:00pm (GMT)" },
  { days: "Saturdays & Public Holidays", hours: "10:00am – 4:00pm (GMT)" },
  { days: "Sundays", hours: "Closed" },
];

export default function InfoBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const clockIconRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop Layout Animation (Two Columns with Center-to-Sides Choreography) ──
      mm.add("(min-width: 768px)", () => {
        // Initial setup
        gsap.set(leftPanelRef.current, {
          xPercent: 50,
          yPercent: 45,
          opacity: 0,
          scale: 0.95,
          zIndex: 10,
        });
        gsap.set(rightPanelRef.current, {
          xPercent: -50,
          yPercent: 45,
          opacity: 0,
          scale: 0.95,
          zIndex: 20,
        });
        gsap.set(".hours-header", { y: 25, opacity: 0 });
        gsap.set(".schedule-day, .schedule-time", { y: 20, opacity: 0 });
        gsap.set(".schedule-border", { scaleX: 0, transformOrigin: "left" });
        gsap.set(".partner-header", { y: 25, opacity: 0 });
        gsap.set(".partner-item", { y: 20, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        });

        // 1. Left Card rises from center-bottom into center
        tl.to(leftPanelRef.current, {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
        });

        // 2. Left Card contents flow in from the bottom while at center
        tl.to(
          clockIconRef.current,
          {
            rotation: 360,
            scale: 1.15,
            duration: 0.5,
            ease: "back.out(1.5)",
          },
          "-=0.3"
        ).to(clockIconRef.current, { scale: 1, duration: 0.2 }, "-=0.1");

        tl.to(
          ".hours-header",
          { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
          "-=0.4"
        );

        hours.forEach((_, i) => {
          const row = `.schedule-row-${i}`;
          tl.to(
            [`${row} .schedule-day`, `${row} .schedule-time`],
            {
              y: 0,
              opacity: 1,
              stagger: 0.06,
              duration: 0.35,
              ease: "power2.out",
            },
            "-=0.25"
          );
          tl.to(
            `${row} .schedule-border`,
            { scaleX: 1, duration: 0.35, ease: "power2.out" },
            "-=0.25"
          );
        });

        // 3. Whole Opening Hours card is complete, now moves to the LEFT side
        tl.to(
          leftPanelRef.current,
          {
            xPercent: 0,
            duration: 0.75,
            ease: "power3.inOut",
          },
          "+=0.08"
        );

        // 4. Right Card rises from center-bottom into center
        tl.to(
          rightPanelRef.current,
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.25"
        );

        // 5. Right Card contents flow in from the bottom
        tl.to(
          ".partner-header",
          { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
          "-=0.35"
        );

        tl.to(
          ".partner-item",
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.25"
        );

        // 6. Whole Partnership card is complete, now moves to the RIGHT side
        tl.to(
          rightPanelRef.current,
          {
            xPercent: 0,
            duration: 0.75,
            ease: "power3.inOut",
          },
          "+=0.08"
        );
      });

      // ── Mobile Layout Animation (Stacked Cards with Sequential Bottom Flow) ──
      mm.add("(max-width: 767px)", () => {
        gsap.set([leftPanelRef.current, rightPanelRef.current], {
          yPercent: 35,
          opacity: 0,
          scale: 0.96,
        });
        gsap.set(".hours-header, .partner-header", { y: 20, opacity: 0 });
        gsap.set(".schedule-day, .schedule-time, .partner-item", {
          y: 15,
          opacity: 0,
        });
        gsap.set(".schedule-border", { scaleX: 0, transformOrigin: "left" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        });

        // 1. Left Card flows in from bottom
        tl.to(leftPanelRef.current, {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
        });

        tl.to(
          ".hours-header",
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          "-=0.3"
        );

        hours.forEach((_, i) => {
          const row = `.schedule-row-${i}`;
          tl.to(
            [`${row} .schedule-day`, `${row} .schedule-time`],
            { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
            "-=0.2"
          );
          tl.to(
            `${row} .schedule-border`,
            { scaleX: 1, duration: 0.3, ease: "power2.out" },
            "-=0.2"
          );
        });

        // 2. Right Card flows in from bottom
        tl.to(
          rightPanelRef.current,
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.1"
        );

        tl.to(
          ".partner-header",
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          "-=0.3"
        );

        tl.to(
          ".partner-item",
          {
            y: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.2"
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <div className="bg-cream-100 w-full overflow-hidden">
      <section
        ref={sectionRef}
        className="w-full max-w-340 mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-10 md:py-16 min-h-120 flex items-center justify-center"
      >
        <div className="grid md:grid-cols-2 relative w-full shadow-2xl rounded-2xl md:rounded-none overflow-hidden">
          {/* ── Opening Hours (Bright Left Panel) ───────────────── */}
          <div
            ref={leftPanelRef}
            className="bg-white text-ink-700 px-6 py-10 sm:px-10 md:px-10 lg:px-14 flex flex-col justify-center will-change-transform shadow-xl"
          >
            <div className="hours-header flex items-center gap-3.5 mb-8">
              <div
                ref={clockIconRef}
                className="text-brand-primary flex items-center justify-center"
              >
                <Clock size={24} className="stroke-[2.2]" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-ink-950 tracking-tight">
                Opening Hours
              </h3>
            </div>

            <ul className="space-y-4">
              {hours.map((entry, index) => (
                <li
                  key={entry.days}
                  className={`schedule-row-${index} relative pb-3 flex justify-between items-baseline gap-4`}
                >
                  <span className="schedule-day font-sans text-sm text-ink-700 font-medium">
                    {entry.days}
                  </span>
                  <span
                    className={`schedule-time font-sans text-sm font-semibold tracking-wide ${
                      entry.hours === "Closed"
                        ? "text-brand-primary"
                        : "text-ink-950"
                    }`}
                  >
                    {entry.hours}
                  </span>
                  {/* Expanding bottom divider */}
                  <span className="schedule-border absolute bottom-0 left-0 right-0 h-px bg-ink-900/10 will-change-transform" />
                </li>
              ))}
            </ul>
          </div>

          {/* ── Partnership Panel (Brand Red Right Panel) ──────── */}
          <div
            ref={rightPanelRef}
            className="bg-brand-primary text-cream-50 px-6 py-10 sm:px-10 md:px-10 lg:px-14 flex flex-col justify-center will-change-transform shadow-2xl"
          >
            <div className="partner-header flex items-start sm:items-center gap-3.5 mb-8">
              <div className="w-10 h-10 rounded-full bg-cream-50/15 flex items-center justify-center text-cream-50 shadow-inner shrink-0 mt-1 sm:mt-0">
                <Handshake size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <p className="font-sans text-xs sm:text-sm text-cream-100/90 font-medium">
                    Kindly Partner With Our
                  </p>
                  <button className="rounded-full bg-cream-50 hover:bg-white transition-colors py-1 px-3 text-[0.7rem] uppercase tracking-wider font-semibold text-brand-primary cursor-pointer shadow">
                    Discover More
                  </button>
                </div>
                <h3 className="font-display text-lg sm:text-xl md:text-2xl text-cream-50 tracking-tight leading-snug">
                  Food & Nutrition Support Program (FNSP)
                </h3>
              </div>
            </div>

            <div className="space-y-3 font-sans text-sm text-cream-100/95">
              <div className="partner-item flex justify-between items-center border-b border-cream-50/20 pb-2.5">
                <span className="uppercase tracking-widest text-[0.7rem] font-semibold text-cream-50/80">
                  Bank Name
                </span>
                <span className="font-medium">Zenith Bank</span>
              </div>

              <div className="partner-item flex justify-between items-center border-b border-cream-50/20 pb-2.5">
                <span className="uppercase tracking-widest text-[0.7rem] font-semibold text-cream-50/80">
                  Account Name
                </span>
                <span className="font-medium text-right text-xs sm:text-sm">
                  ELEOS RESEARCH INNOVATIONS LIMITED
                </span>
              </div>

              <div className="partner-item flex justify-between items-center border-b border-cream-50/20 pb-2.5">
                <span className="uppercase tracking-widest text-[0.7rem] font-semibold text-cream-50/80">
                  USD
                </span>
                <span className="font-medium font-mono tracking-wide">
                  5074796363
                </span>
              </div>

              <div className="partner-item flex justify-between items-center pb-1">
                <span className="uppercase tracking-widest text-[0.7rem] font-semibold text-cream-50/80">
                  Naira
                </span>
                <span className="font-medium font-mono tracking-wide">
                  1228468894
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
