"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Users, Award, ShieldCheck, Heart } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutStory() {
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

      // Left Image container slide in
      tl.fromTo(
        ".story-image-wrap",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85, ease: "power3.out" }
      );

      // Right Text elements slide in with stagger
      tl.fromTo(
        ".story-content > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.5"
      );

      // Stat cards scale in
      tl.fromTo(
        ".story-stat",
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.12,
          duration: 0.6,
          ease: "back.out(1.4)",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-6 bg-cream-50 overflow-hidden">
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Layered Media with floating badges */}
        <div className="story-image-wrap lg:col-span-5 relative">
          {/* Main Photo Frame */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-cream-200">
            <Image
              src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649309/Who-we-are-1024x683_or5vgw.jpg"
              alt="Researcher with wholesome farm-fresh nutrition"
              fill
              unoptimized
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Badge Top-Left */}
          <div className="absolute -top-4 -left-3 sm:-left-6 bg-white text-ink-950 px-4 py-2.5 rounded-xl border border-ink-900/10 shadow-lg flex items-center gap-2.5">
            <Heart size={16} className="text-brand-primary animate-pulse" />
            <span className="font-sans text-xs font-medium tracking-wide">
              Empowering Households
            </span>
          </div>
        </div>

        {/* Right: Narrative & Metrics */}
        <div className="story-content lg:col-span-7">
          {/* Tag */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              ELEOS Research Innovations
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-900 leading-[1.2] mb-6">
            Ensuring Overall Health And Well-Being.
          </h2>

          {/* Story Paragraphs */}
          <div className="space-y-4 font-sans text-ink-600 text-base leading-relaxed mb-8">
            <p>
              <strong className="text-ink-900 font-medium">
                ELEOS Research Innovations (ERI)
              </strong>{" "}
              is focused on advancing food and nutrition security for individuals and households. We strive to build lasting resilience through our strategic advocacy, capacity-building programs, and comprehensive research support.
            </p>
            <p>
              Our commitment extends far beyond providing abstract knowledge; we aim to empower communities by equipping them with the practical tools, culinary guidance, and empirical insights essential for optimal health, chronic disease prevention, and lifelong vitality.
            </p>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            <div className="story-stat bg-white p-5 rounded-xl border border-cream-200/90 shadow-sm hover:border-brand-primary/30 hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-primary flex items-center justify-center mb-3">
                <Users size={18} />
              </div>
              <span className="font-display text-3xl font-bold text-ink-900 block leading-tight">
                20+
              </span>
              <span className="font-sans text-xs text-ink-500 uppercase tracking-wider font-semibold">
                Happy Clients
              </span>
            </div>

            <div className="story-stat bg-white p-5 rounded-xl border border-cream-200/90 shadow-sm hover:border-brand-primary/30 hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-primary flex items-center justify-center mb-3">
                <Award size={18} />
              </div>
              <span className="font-display text-3xl font-bold text-ink-900 block leading-tight">
                2+
              </span>
              <span className="font-sans text-xs text-ink-500 uppercase tracking-wider font-semibold">
                Seminars &amp; Workshops
              </span>
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}
