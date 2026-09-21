"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Home, Award, Heart, Lightbulb } from "lucide-react";
import type { WhyChooseUsItem } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const iconMap: Record<string, React.ReactNode> = {
  household: <Home size={24} />,
  expertise: <Award size={24} />,
  passion: <Heart size={24} />,
  innovation: <Lightbulb size={24} />,
};

const items: WhyChooseUsItem[] = [
  {
    id: "wcu-1",
    title: "Household Focus",
    description:
      "We’re committed to empowering individuals and households so as to boost their health security.",
    iconType: "household",
  },
  {
    id: "wcu-2",
    title: "Expertise",
    description:
      "Our team is well experienced in research, advocacy, and capacity-building initiatives.",
    iconType: "expertise",
  },
  {
    id: "wcu-3",
    title: "Passion",
    description:
      "We’re driven by a passion to create a world where everyone has quality access to nutritious food and a secure environment.",
    iconType: "passion",
  },
  {
    id: "wcu-4",
    title: "Innovative Approach",
    description:
      "We use cutting-edge research and innovative solutions to address contemporary challenges in human security.",
    iconType: "innovation",
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Header swipe
      tl.fromTo(
        ".wcu-header > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Red rule scaleX
      tl.fromTo(
        ".wcu-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.65,
          ease: "power3.out",
          transformOrigin: "left center",
        },
        "-=0.3"
      );

      // Items stagger from left with swipe animation
      tl.fromTo(
        ".wcu-item",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section-md px-6 bg-white overflow-hidden">
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="wcu-header mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Who We Are
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-950">
            Why Choose Us!
          </h2>
        </div>

        {/* Red rule — animated */}
        <div className="wcu-rule h-[2px] bg-brand-primary/40 w-full max-w-xs mb-14 will-change-transform" />

        {/* Grid with hover animations */}
        <div className="wcu-grid grid sm:grid-cols-2 gap-x-10 gap-y-10 lg:gap-x-16 lg:gap-y-12">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="wcu-item group flex gap-5 p-5 -m-2 rounded-xl transition-all duration-300 hover:bg-ink-900/5 hover:shadow-xl hover:-translate-y-1.5 border border-transparent hover:border-ink-900/10 will-change-transform cursor-default"
            >
              {/* Number + Icon */}
              <div className="shrink-0">
                <span className="block text-brand-primary/40 group-hover:text-brand-primary font-display text-xs mb-2 transition-colors duration-300 font-semibold tracking-wider">
                  0{i + 1}
                </span>
                <div className="w-14 h-14 bg-cream-100 border border-ink-900/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(227,34,28,0.5)] transition-all duration-300">
                  {iconMap[item.iconType]}
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl text-ink-950 mb-2 group-hover:text-brand-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="font-sans text-ink-700 text-sm leading-relaxed group-hover:text-ink-900 transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
