"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Heading swipe from left
      gsap.fromTo(
        ".cta-title",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Button swipe from right
      gsap.fromTo(
        ".cta-btn",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-brand-primary py-16 md:py-20 px-6 overflow-hidden">
      <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <h2 className="cta-title font-display text-2xl md:text-3xl lg:text-4xl text-cream-50 text-center md:text-left max-w-xl will-change-transform drop-shadow-sm">
          Have you any question for work consultation
        </h2>
        <Link
          href="/contact"
          className="cta-btn group shrink-0 inline-flex items-center gap-3 bg-cream-50 text-brand-primary px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md shadow-lg hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-98 transition-all duration-300 will-change-transform"
        >
          <span>Contact Us</span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
