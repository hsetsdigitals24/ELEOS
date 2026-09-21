"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Handshake } from "lucide-react";
import { SectionHeader, Reveal, NextChapter } from "./editorial";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const outcomes = [
  { figure: "100%", label: "Community-centred program design" },
  { figure: "3", label: "Security pillars advanced together" },
  { figure: "1", label: "Household at a time" },
];

const pathways = [
  {
    index: "01",
    title: "Skills Acquisition",
    description:
      "Vocational and practical skills training that turns aptitude into income — from food processing to craft, agribusiness to services.",
  },
  {
    index: "02",
    title: "Entrepreneurship Support",
    description:
      "Seed knowledge, business mentoring, and market guidance for individuals and groups ready to build livelihoods of their own.",
  },
  {
    index: "03",
    title: "Women & Youth First",
    description:
      "Our programmes deliberately centre women and young people — the two groups whose empowerment lifts entire households.",
  },
  {
    index: "04",
    title: "Household Resilience",
    description:
      "Everything we do compounds at the household level: better income, better food choices, better ability to withstand shocks.",
  },
];

export default function SocioeconomicContent() {
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // The red stat band's figures count up in as the band enters
      gsap.fromTo(
        ".sem-stat",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".sem-stat-band",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Image moment — slow parallax drift
      gsap.fromTo(
        ".sem-image",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: imageRef }
  );

  return (
    <div ref={imageRef}>
      <div className="mb-12 sm:mb-16 md:h-80 flex justify-center">
        <Image src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Socioeconomic-empowernment-programme_1788618358346_jwlgyv.jpg" className="h-full" alt="Advocacy intro" width={600} height={700} />
      </div>
      {/* ── Intro — plain-spoken editorial ───────────────── */}
      <Reveal>
        <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
          Implementing programs that are tailored towards uplifting and empowering the underprivileged communities. Our socioeconomic empowerment initiatives are geared to interrupt the loop of varied vulnerabilities and create long-term community resilience. ERI promotes socioeconomic well-being of individuals, communities, or groups through various noble efforts such as entrepreneurship and business development; vocational training programs; community-based food services; education scholarships and mentorship; financial literacy and access to credit; women’s economic empowerment initiatives; job training and employment; and youth development programs. <br /> <br />
          At ERI, our methodologies encompass community-led and participatory approaches; context-specific and culturally sensitive design; collaboration and partnership building; capacity building and training; monitoring and evaluation for impact assessment; policy advocacy and reform; and collaboration with stakeholders and partners. ERI is positioned to achieve improved quality of life, increased economic stability and security, enhanced social cohesion and inclusion for individuals and communities, and promote sustainable socioeconomic development. <br /> <br />
           Our programs are intended to assist low-income households, underprivileged individuals and orphans, minority groups (racial, ethnic, disabled), and underserved communities.
        </p>
       
      </Reveal>

      {/* ── Partnership Panel (Brand Red Right Panel) ──────── */}
          <div
         
            className="bg-brand-primary text-cream-50 px-6 py-10 sm:px-10 md:px-10 lg:px-14 flex flex-col justify-center will-change-transform shadow-2xl mt-5"
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
  );
}
