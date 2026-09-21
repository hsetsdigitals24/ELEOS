"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  Clapperboard,
  MonitorPlay,
  SquarePlay,
  Video,
} from "lucide-react";
import { SectionHeader, Reveal } from "@/components/service/editorial";
import HisStoryTellersLatest from "./HisStoryTellersLatest";
import { NextSubsidiary } from "./NextSubsidiary";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const mediums = [
  {
    index: "01",
    icon: Clapperboard,
    title: "Movies",
    tagline: "Cinema with a conscience",
    description:
      "Enriching movies produced to inform, inspire, and shape societal values — stories told with the craft to carry them.",
    span: "lg:col-span-7",
  },
  {
    index: "02",
    icon: Video,
    title: "Documentaries",
    tagline: "Truth, held steady",
    description:
      "Documentaries that hold a mirror to society — powerful tools for social reflection, education, and transformation.",
    span: "lg:col-span-5",
  },
  {
    index: "03",
    icon: MonitorPlay,
    title: "Digital Media",
    tagline: "Where generations watch",
    description:
      "Purpose-driven storytelling carried onto digital platforms — content that resonates across generations and contributes meaningfully to cultural and moral discourse.",
    span: "lg:col-span-12",
  },
];

const themes = [
  "Social Themes",
  "Cultural Identity",
  "Faith",
  "Ethics",
  "Human Development",
];

export default function HisStoryTellersContent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Image moments — slow scrubbed parallax drift (transform-only)
      gsap.fromTo(
        ".hstm-intro-img",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".hstm-intro-img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        ".hstm-featured-img",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".hstm-featured-img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Mediums rise with a stagger — transform/opacity only
      gsap.fromTo(
        ".hstm-medium",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-mediums",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Theme lines sweep up out of the red field, one after another
      gsap.fromTo(
        ".hstm-theme > *",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-themes",
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Featured production — text column settles in
      gsap.fromTo(
        ".hstm-featured-copy > *",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-featured-copy",
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // YouTube band — title swipes from the left, button from the right
      gsap.fromTo(
        ".hstm-yt-title",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-yt",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
      gsap.fromTo(
        ".hstm-yt-btn",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hstm-yt",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef}>
      {/* ── 01. The story — image moment + drop-cap narrative ── */}
      <section className="py-20 md:py-28 px-6 bg-cream-100">
        <div className="max-w-330 mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Image bleeding toward the left edge, parallax drift */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg shadow-xl lg:-ml-10 xl:-ml-16">
              <Image
                src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/WhatsApp-Image-2026-01-01-at-7.54.05-PM_1788618357926_dn5qqo.jpg"
                alt="His Story Tellers Media — creative media and film production still"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="hstm-intro-img object-cover scale-110 will-change-transform"
              />
              {/* Red accent frame, offset from the image edge */}
              <span className="absolute -bottom-3 -right-3 w-full h-full border-2 border-brand-primary -z-10 rounded-lg" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="A subsidiary of Eleos"
              title="His Story Tellers Media"
            />
            <Reveal>
              <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
                His Story Tellers Media is a creative media and film production
                subsidiary committed to producing enriching movies and media
                content that inform, inspire, and shape societal values. Rooted
                in purpose-driven storytelling, the brand leverages film,
                documentaries, and digital media to address social themes,
                cultural identity, faith, ethics, and human development.
                <br />
                <br />
                Through compelling narratives and high-quality production, His
                Story Tellers Media uses storytelling as a powerful tool for
                social reflection, education, and transformation. The company is
                dedicated to creating content that resonates across generations
                while contributing meaningfully to cultural and moral discourse.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 04. Featured production — My Help ───────────────── */}
      <section className="hstm-featured py-20 md:py-28 px-6 bg-cream-50">
        <div className="max-w-330 mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Image moment with parallax drift, bleeding right */}
          <div className="lg:col-span-7 relative order-1">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg shadow-xl lg:-mr-10 xl:-mr-16">
              <Image
                src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640357/My-Help-600x500_1788618358556_r5g6tu.jpg"
                alt="My Help — a faith-based drama by His Story Tellers Media"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="hstm-featured-img object-cover scale-110 will-change-transform"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/20 to-transparent pointer-events-none" />
            </div>
          </div>

          <div className="hstm-featured-copy lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 bg-brand-primary" />
              <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
                Featured Production
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-ink-900 leading-tight mb-3">
              My Help Lyrics
            </h2>
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink-500 font-semibold mb-6">
              Written by Precious Gabriel &amp; Bukunmi Adaramola · January 1,
              2026
            </p>
            <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] mb-8">
              My Help is a faith-based drama about endurance and trust, where a
              demanding journey becomes a testimony of God&rsquo;s steady
              guidance, grace and faithfulness.
            </p>
            <Link
              href="/blog/my-help-lyrics"
              className="group inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-6 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md shadow-lg hover:bg-brand-hover transition-all duration-300 active:scale-98"
            >
              <span>Read More</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>

        {/* Continue the story — cross-link to the other subsidiary */}
        <div className="max-w-330 mx-auto mt-16 md:mt-24">
          <NextSubsidiary fromSlug="his-story-tellers-media" />
        </div>
      </section>

      {/* ── 04b. Latest stories & videos from the studio ──── */}
      <HisStoryTellersLatest />

      {/* ── 05. YouTube call-to-action — closing band ───────── */}
      <section className="hstm-yt bg-cream-100 py-16 md:py-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-330 mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative">
          <h2 className="hstm-yt-title flex items-center gap-4 font-display text-2xl md:text-3xl text-ink-950 text-center md:text-left max-w-xl will-change-transform">
            <SquarePlay
              size={34}
              className="text-brand-primary shrink-0"
              aria-hidden
            />
            Subscribe to our Youtube channel for latest uploads
          </h2>
          <a
            href="https://www.youtube.com/@YouandIinLifeChannel"
            target="_blank"
            rel="noopener noreferrer"
            className="hstm-yt-btn group shrink-0 inline-flex items-center gap-3 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md shadow-lg hover:bg-brand-hover hover:scale-105 active:scale-98 transition-all duration-300 will-change-transform"
          >
            <span>View Youtube Channel</span>
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </a>
        </div>
      </section>
    </div>
  );
}
