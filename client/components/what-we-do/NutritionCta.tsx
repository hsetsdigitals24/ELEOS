"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, PhoneCall } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NutritionCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Centered content fades up when the section enters
      gsap.fromTo(
        ".nct-content > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Slow parallax drift on the background image (scrubbed, transform-only)
      gsap.fromTo(
        ".nct-bg",
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="nutrition"
      ref={sectionRef}
      className="relative min-h-90 md:min-h-130 flex items-center justify-center px-6 py-24 md:py-32 overflow-hidden scroll-mt-20"
    >
      {/* Parallax background — placeholder image pending documentary photography */}
      <div className="nct-bg absolute inset-0 -inset-y-16 will-change-transform">
        <Image
          src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895880/row-bg-eight-1-1_y8opb2.jpg"
          alt=""
          aria-hidden
          fill
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Duotone overlay — red-to-ink field, lightened so the photo shows through */}
      <div className="absolute inset-0 bg-linear-to-b from-ink-950/75 via-brand-900/45 to-ink-950/75 pointer-events-none" />

      <div className="nct-content relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-3 mb-6 justify-center">
          <span className="w-8 h-0.5 bg-brand-on-dark" />
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-on-dark font-semibold">
            Begin Your Journey
          </span>
          <span className="w-8 h-0.5 bg-brand-on-dark" />
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl text-cream-50 leading-[1.15] mb-6">
          Start Your Body Changing With Nutrition
        </h2>

        <p className="font-sans text-cream-200/85 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Everyone's body is different, so there's not a one-size-fits-all answer to how long
          it will take to see changes in your body when you start working out.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
         
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 border border-cream-50/40 text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md backdrop-blur-xs hover:bg-cream-50/10 hover:border-cream-50/70 hover:scale-105 active:scale-98 transition-all duration-300">
            <PhoneCall size={15} />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
