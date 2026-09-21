"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart3, Users, BookOpen, ArrowRight } from "lucide-react";
import type { ServiceCard } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const iconMap: Record<string, React.ReactNode> = {
  research: <BarChart3 size={20} />,
  community: <Users size={20} />,
  seminars: <BookOpen size={20} />,
};

const services: ServiceCard[] = [
  {
    id: "svc-1",
    title: "Advocacy & Capacity Building",
    description:
      "Strengthening institutions and grassroots stakeholders with essential skills and policy frameworks to enhance human security.",
    iconType: "research",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649258/Advocacy-and-Capacity-building_lf7xmn.jpg",
    href: "/service/advocacy-capacity-building",
  },
  {
    id: "svc-2",
    title: "Socioeconomic Empowerment Programs",
    description:
      "Creating sustainable livelihoods and nutritional support systems for vulnerable households and emerging enterprises.",
    iconType: "community",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Socioeconomic-empowernment-programme_1788618358346_jwlgyv.jpg",
    href: "/service/socioeconomic-empowerment-program",
  },
  {
    id: "svc-3",
    title: "Seminars And Workshops",
    description:
      "Delivering research-grounded masterclasses, academic symposiums, and community workshops on food and health systems.",
    iconType: "seminars",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Seminars-and-workshops_1788618358450_uir1f0.jpg",
    href: "/service/seminars-and-workshops",
  },
];

export default function Services() {
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

      // Header swipe and fade in
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

      // Service Cards swipe up from bottom with stagger
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

      // Bottom CTA fade and slide
      tl.fromTo(
        ".svc-cta",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section-md px-6 overflow-hidden">
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="svc-header text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              What We Do
            </span>
            <span className="w-8 h-[2px] bg-brand-primary" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900 mb-4">
            Our Services
          </h2>
          <p className="font-sans text-ink-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We offer a range of services designed to empower individuals, strengthen communities, and advance sustainable human security.
          </p>
        </div>

        {/* Cards — with smooth hover blur, shadow, and lift */}
        <div className="svc-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {services.map((service, i) => (
            <div
              key={service.id}
              className={`svc-card will-change-transform ${
                i === 1 ? "sm:mt-0 lg:mt-10" : ""
              }`}
            >
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(13,13,13,0.35)] transition-all duration-500 hover:-translate-y-2 border border-black/5 hover:border-brand-primary/30">
                {/* Background Image with Zoom and Blur */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:blur-[1.5px]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-ink-950/15 to-transparent group-hover:from-ink-950/50 group-hover:via-ink-950/20 transition-colors duration-500" />

                {/* Icon badge with interactive glow & lift */}
                <div className="absolute top-4 right-4 w-11 h-11 bg-brand-primary rounded-lg flex items-center justify-center text-cream-50 shadow-md group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(227,34,28,0.6)] transition-all duration-300">
                  {iconMap[service.iconType]}
                </div>

                {/* Content at bottom with subtle frosted glass accent */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                  <div className="backdrop-blur-xs bg-white/90 rounded-lg p-3 -m-3 shadow-sm transition-all duration-300">
                    <h3 className="font-display text-xl md:text-2xl text-ink-900 mb-2.5 group-hover:text-brand-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="font-sans text-ink-700 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-brand-primary font-sans text-xs uppercase tracking-[0.15em] font-semibold group-hover:gap-3 group-hover:text-brand-hover transition-all duration-300"
                    >
                      <span>Read More</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="svc-cta text-center will-change-transform">
          <Link
            href="/what-we-do"
            className="inline-flex items-center gap-2 text-brand-primary font-sans text-sm uppercase tracking-[0.15em] font-semibold hover:gap-4 transition-all duration-300 hover:text-brand-hover"
          >
            Explore More Services
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
