"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SubsidiaryCard } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const subsidiaries: SubsidiaryCard[] = [
  {
    id: "sub-1",
    title: "His Story Tellers Media",
    description:
      "",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/WhatsApp-Image-2026-01-01-at-7.54.05-PM_1788618357926_dn5qqo.jpg",
    href: "/his-story-tellers-media",
  },
  {
    id: "sub-2",
    title: "Marvela Business Enterprise",
    description:
      "",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640358/pexels-ifreestock-616833-1-scaled_1788618358031_ddchem.jpg",
    href: "/marvela-business-enterprise",
  },
];

export default function Subsidiaries() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header text fades in on scroll
      gsap.from(".sub-header > *", {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // Cards: SCRUB-BASED slide from opposite sides
      const cards = sectionRef.current!.querySelectorAll(".sub-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { x: i === 0 ? -120 : 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              end: "top 65%",
              scrub: 0.4,
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section-md px-6 bg-cream-100" id="subsidiaries">
      <div className="max-w-330 mx-auto">
        {/* Header */}
        <div className="sub-header mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Subsidiaries
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900 mb-6">
            Check Our Subsidiaries
          </h2>

          <p className="font-sans text-ink-500 text-base md:text-lg leading-relaxed max-w-3xl">
            ELEOS operates through purpose-driven subsidiaries that extend our mission of human security and social impact into media and food systems. Each subsidiary addresses critical societal needs through innovation, creativity, and ethical enterprise, strengthening communities while advancing economic and cultural value. From transformative storytelling to the production of nutritious food solutions, our subsidiaries reflect ELEOS’ holistic approach to human development and wellbeing
          </p>
        </div>

        {/* Asymmetric cards with rich blur, shadow and hover animations */}
        <div className="grid md:grid-cols-5 gap-6 lg:gap-8 mb-10">
          {subsidiaries.map((sub, i) => (
            <Link
              key={sub.id}
              href={sub.href}
              className={`sub-card group relative overflow-hidden rounded-xl block shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(13,13,13,0.35)] transition-all duration-500 hover:-translate-y-2 border border-black/5 hover:border-brand-primary/40 ${
                i === 0
                  ? "md:col-span-3 aspect-4/3"
                  : "md:col-span-2 aspect-3/4 md:aspect-3/4"
              }`}
            >
              {/* Background Image with Zoom & Blur on Hover */}
              <Image
                src={sub.image}
                alt={sub.title}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:blur-[2px]"
                sizes={
                  i === 0
                    ? "(max-width: 768px) 100vw, 60vw"
                    : "(max-width: 768px) 100vw, 40vw"
                }
              />

              {/* Gradient Overlay with subtle backdrop blur enhancement */}
              <div className="absolute inset-0 bg-linear-to-t from-ink-950/35 via-ink-950/10 to-transparent group-hover:from-ink-950/45 group-hover:via-ink-950/20 transition-colors duration-500" />

              {/* Red accent stripe that expands on hover */}
              <div className="absolute top-0 left-0 w-1.5 h-16 group-hover:h-24 bg-brand-primary transition-all duration-500 shadow-md" />

              {/* Floating Top-Right Action Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-ink-900/10 flex items-center justify-center text-ink-900 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                <ArrowUpRight size={18} className="text-ink-900 group-hover:text-brand-primary transition-colors" />
              </div>

              {/* Bottom Content with Frosted Glass Panel effect */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="backdrop-blur-xs bg-white/90 rounded-lg p-2 -m-2 shadow-sm transition-all duration-300">
                  <h3 className="font-display text-2xl md:text-3xl text-ink-900 mb-2 group-hover:text-brand-primary transition-colors duration-300">
                    {sub.title}
                  </h3>
                  {sub.description && (
                    <p className="font-sans text-ink-700 text-sm leading-relaxed max-w-md">
                      {sub.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-brand-primary text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <span>Learn More</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/what-we-do"
          className="inline-flex items-center gap-2 text-brand-primary font-sans text-sm uppercase tracking-[0.15em] font-semibold hover:gap-4 transition-all duration-300"
        >
          Explore Our Services
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
