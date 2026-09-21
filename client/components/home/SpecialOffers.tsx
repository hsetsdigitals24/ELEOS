"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SpecialOffers() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Parallax on the background image — scrub-based with smooth easing
      gsap.to(".offer-bg", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Text content swipe and fade in on viewport enter/leave
      gsap.fromTo(
        ".offer-content > *",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-125 md:min-h-137.5 flex items-center"
    >
      {/* Parallax background — oversized to allow movement */}
      <div className="offer-bg absolute inset-[-20%] scale-100 will-change-transform">
        <Image
          src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788818894/Gemini_Generated_Image_nn18c4nn18c4nn18_wd8mg7.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Readability overlay — base dark wash + directional gradient behind the text column */}
        <div className="absolute inset-0 bg-ink-950/40" />
        <div className="absolute inset-0 bg-linear-to-r from-ink-950/80 via-ink-950/55 to-ink-950/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-330 mx-auto px-6 py-section-md w-full">
        <div className="offer-content will-change-transform md:flex flex-col justify-betweeen w-full">
          <div>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 bg-brand-on-dark" />
              <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-on-dark font-semibold">
                Special Offers
              </span>
            </div>


            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-cream-50 leading-snug mb-6">
              7-DAY BASIC NIGERIAN MEAL PLAN FOR BREAKFAST, LUNCH AND DINNER WITH RECOMMENDED TIMINGS
            </h2>
          </div>

          <p className="font-sans text-cream-200/85 text-base leading-relaxed mb-8">
            This meal plan is not tailored to fit a specific diet plan, but a sample of a basic meal plan. We encourage you to adjust yours to suit your food preferences, but avoid unhealthy food choices. Our tips for healthy eating include the avoidance of late-night eating (conclude eating at least two hours before bedtime to support better sleep and digestion), stay hydrated by drinking water throughout the day, aim at least two to three litres, be mindful of your body and eat when you are hungry until you are satisfied not full, and know that metabolism may reduce with increased age, therefore choose the right foods and consumption times.
          </p>

          {/* <Link
            href="/offers"
            className="group inline-flex items-center gap-3 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover hover:shadow-[0_4px_20px_rgba(227,34,28,0.5)] hover:scale-105 active:scale-98 transition-all duration-300"
          >
            <span>Learn More</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </Link> */}
        </div>
      </div>
    </section>
  );
}
