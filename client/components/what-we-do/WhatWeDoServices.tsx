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

interface ServiceEntry {
  id: string;
  index: string;
  title: string;
  description: string;
  href: string;
  image: string;
  isPlaceholderImage?: boolean;
}

/* Hrefs mirror the five dropdown links under "What We Do" in the Navbar.
   Images 4 & 5 are placeholders (picsum) pending real documentary
   photography — swap the URLs when assets are sourced. */
const services: ServiceEntry[] = [
  {
    id: "svc-advocacy",
    index: "01",
    title: "Advocacy & Capacity Building",
    description:
      "Our strategic campaigns raise awareness about the intersectionality of food and nutrition security with health, education, and economic development.",
    href: "/service/advocacy-capacity-building",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649258/Advocacy-and-Capacity-building_lf7xmn.jpg",
  },
  {
    id: "svc-socioeconomic",
    index: "02",
    title: "Socioeconomic Empowerment Program",
    description:
      "Implementing programs that are tailored towards uplifting and empowering the underprivileged communities.",
    href: "/service/socioeconomic-empowerment-program",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Socioeconomic-empowernment-programme_1788618358346_jwlgyv.jpg",
  },
  {
    id: "svc-seminars",
    index: "03",
    title: "Seminars & Workshops",
    description:
      "Our interactive forums facilitate discussions, foster collaboration, and unearth pragmatic solutions to contemporary issues in sustainable development.",
    href: "/service/seminars-and-workshops",
    image:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Seminars-and-workshops_1788618358450_uir1f0.jpg",
  },
  {
    id: "svc-research",
    index: "04",
    title: "Research Support",
    description:
      "We fuel academic innovation and discovery in social science, humanities and interdisciplinary studies.",
    href: "/service/research-support",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895185/Research_dlafdo.jpg",
    isPlaceholderImage: true,
  },
  {
    id: "svc-journals",
    index: "05",
    title: "Journal Publications",
    description:
      "At ERI, we provide adequate support and opportunities to the academia and other researchers to publish their works;",
    href: "/service/journal-publications",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895137/Publications_w4vber.jpg",
    isPlaceholderImage: true,
  },
];

export default function WhatWeDoServices() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
        ".svc-header > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Cards rise with a stagger — transform/opacity only
      tl.fromTo(
        ".svc-card",
        { y: 55, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.12,
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
      id="services"
      ref={sectionRef}
      className="py-20 md:py-28 px-6 bg-cream-100 text-ink-950 overflow-hidden relative scroll-mt-20"
    >
      {/* Ambient lighting */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-330 mx-auto relative z-10">
        {/* Header */}
        <div className="svc-header text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              What We Do
            </span>
            <span className="w-8 h-0.5 bg-brand-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-950 leading-tight mb-4">
            Our Services
          </h2>
          <p className="font-sans text-ink-700 text-sm sm:text-base leading-relaxed">
            Your body believes what you think, your thought becomes action, Action becomes
            behavior so keep your Positive attitude alive!
          </p>
        </div>

        {/* Varied 2 + 3 editorial rhythm (no uniform icon grid) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <div
              key={service.id}
              className={`svc-card will-change-transform ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"
                }`}
            >
              <Link
                href={service.href}
                className="group relative block aspect-4/5 sm:aspect-3/4 lg:aspect-auto lg:h-full lg:min-h-105 overflow-hidden rounded-xl shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(13,13,13,0.35)] transition-all duration-500 hover:-translate-y-2 border border-ink-900/10 hover:border-brand-primary/40"
              >
                {/* Background image with slow zoom on hover */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes={
                    i < 2
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 via-ink-950/30 to-transparent group-hover:from-ink-950/90 group-hover:via-ink-950/45 transition-colors duration-500" />

                {/* Chapter index — recurring narrative punctuation */}
                <span className="absolute top-5 left-5 font-display text-3xl text-cream-50/90 font-bold drop-shadow-md">
                  {service.index}
                </span>

                {/* Red accent bar — grows on hover */}
                <span className="absolute top-0 left-0 h-1 w-0 bg-brand-primary group-hover:w-full transition-all duration-500 ease-out" />

                {/* Content anchored to the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                  <div className="backdrop-blur-xs bg-ink-950/20 rounded-lg p-3 -m-3">
                    <h3 className="font-display text-xl md:text-2xl text-cream-50 mb-2.5 group-hover:text-brand-tint transition-colors duration-300 drop-shadow-md">
                      {service.title}
                    </h3>
                    <p className="font-sans text-cream-200/80 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-brand-on-dark font-sans text-xs uppercase tracking-[0.15em] font-semibold group-hover:gap-3.5 transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
