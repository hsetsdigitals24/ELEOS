"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Compass, Target, Sparkles, CheckCircle2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MissionVision() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Header entrance
      tl.fromTo(
        ".mv-header > *",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Cards staggered reveal
      tl.fromTo(
        ".mv-card",
        { y: 45, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 px-6 bg-cream-100 text-ink-950 overflow-hidden relative"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="mv-header text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="w-8 h-[2px] bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Our Core Purpose
            </span>
            <span className="w-8 h-[2px] bg-brand-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-950 leading-tight mb-4">
            Our Mission, Vision &amp; Values
          </h2>
          <p className="font-sans text-ink-700 text-sm sm:text-base leading-relaxed">
            The guiding principles that steer our research, community engagements, and advocacy for human security.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: Mission */}
          <div className="mv-card group relative bg-white rounded-2xl p-8 border border-ink-900/10 hover:border-brand-primary/40 shadow-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(227,34,28,0.25)] flex flex-col justify-between">
            {/* Top red accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary rounded-t-2xl group-hover:h-1.5 transition-all duration-300" />

            <div>
              <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 transition-all duration-300 shadow-md">
                <Target size={28} />
              </div>

              <span className="text-[11px] uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold block mb-2">
                Action-Oriented
              </span>
              <h3 className="font-display text-2xl text-ink-950 mb-4 group-hover:text-brand-hover transition-colors">
                Our Mission
              </h3>

              <p className="font-sans text-ink-700 text-sm sm:text-base leading-relaxed mb-6">
                ERI is a research platform that provides adequate knowledge for utilizing food and nutrition appropriately to ensure overall health and well-being; and support additional human security initiatives that target underprivileged communities.
              </p>
            </div>

           
          </div>

          {/* Card 2: Vision */}
          <div className="mv-card group relative bg-white rounded-2xl p-8 border border-ink-900/10 hover:border-brand-primary/40 shadow-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(227,34,28,0.25)] flex flex-col justify-between">
            {/* Top red accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary rounded-t-2xl group-hover:h-1.5 transition-all duration-300" />

            <div>
              <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 transition-all duration-300 shadow-md">
                <Compass size={28} />
              </div>

              <span className="text-[11px] uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold block mb-2">
                Long-Term Horizon
              </span>
              <h3 className="font-display text-2xl text-ink-950 mb-4 group-hover:text-brand-hover transition-colors">
                Our Vision
              </h3>

              <p className="font-sans text-ink-700 text-sm sm:text-base leading-relaxed mb-6">
                With its focus on food and nutrition security, and complementary human security novelties, ERI hopes to become a premier platform that provides knowledge-banks essential for optimal health and wellness for people everywhere.
              </p>
            </div>

           
          </div>

          {/* Card 3: Values */}
          <div className="mv-card group relative bg-white rounded-2xl p-8 border border-ink-900/10 hover:border-brand-primary/40 shadow-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(227,34,28,0.25)] flex flex-col justify-between">
            {/* Top red accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary rounded-t-2xl group-hover:h-1.5 transition-all duration-300" />

            <div>
              <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 transition-all duration-300 shadow-md">
                <Sparkles size={28} />
              </div>

              <span className="text-[11px] uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold block mb-2">
                Ethical Foundation
              </span>
              <h3 className="font-display text-2xl text-ink-950 mb-4 group-hover:text-brand-hover transition-colors">
                Our Values
              </h3>

              <p className="font-sans text-ink-700 text-sm sm:text-base leading-relaxed mb-6">
                Grounding every initiative in rigorous scientific integrity, human empathy, open community dialogue, and sustainable self-reliance for every family we reach.
              </p>
            </div>

           
          </div>
        </div>
      </div>
    </section>
  );
}
