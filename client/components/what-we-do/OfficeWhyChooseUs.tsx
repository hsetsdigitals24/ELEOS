"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Users,
  Award,
  Heart,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

const whyChooseUsItems: WhyChooseUsItem[] = [
  {
    id: "wcu-1",
    title: "Community Focus",
    description:
      "We are committed to empowering individuals, households, and whole communities so as to boost their health security.",
    Icon: Users,
  },
  {
    id: "wcu-2",
    title: "Expertise",
    description:
      "Our team is well experienced in research, advocacy, and capacity-building initiatives.",
    Icon: Award,
  },
  {
    id: "wcu-3",
    title: "Passion",
    description:
      "We're driven by a passion to create a world where everyone has quality access to nutritious food and a secure environment.",
    Icon: Heart,
  },
  {
    id: "wcu-4",
    title: "Innovative Approach",
    description:
      "We use cutting-edge research and innovative solutions to address contemporary challenges in human security.",
    Icon: Lightbulb,
  },
];

const openingHours = [
  { days: "Monday – Friday", hours: "9:00am – 4:00pm (GMT)" },
  { days: "Sat. & Public Hols.", hours: "10:00am – 4:00pm (GMT)" },
  { days: "Sundays", hours: "Closed" },
];

export default function OfficeWhyChooseUs() {
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

      // Section header entrance
      tl.fromTo(
        ".owu-header > *",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Office card slides in from the left
      tl.fromTo(
        ".owu-office-card",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );

      // Why-choose-us items rise with a stagger
      tl.fromTo(
        ".owu-item",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.5"
      );

      // Red underline rule sweeps across the heading
      tl.fromTo(
        ".owu-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: "power3.out",
          transformOrigin: "left center",
        },
        "-=0.6"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="office"
      ref={sectionRef}
      className="py-20 md:py-28 px-6 bg-cream-50 overflow-hidden scroll-mt-20"
    >
      <div className="max-w-330 mx-auto">
        {/* Section header */}
        <div className="owu-header mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Visit Us &amp; Trust Us
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-900 leading-tight max-w-2xl">
            Our Office &amp; Why Communities Choose ERI
          </h2>
          <div className="owu-rule h-0.5 bg-brand-primary/40 w-full max-w-xs mt-6 will-change-transform" />
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Office card — bold structural red field */}
          <div className="owu-office-card lg:col-span-5">
            <div className="relative bg-brand-primary text-cream-50 rounded-xl p-8 md:p-10 shadow-[0_25px_50px_-15px_rgba(227,34,28,0.4)] overflow-hidden">
              {/* Subtle diagonal texture */}
              <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(135deg,#ffffff_1px,transparent_1px)] bg-size-[1.25rem_1.25rem] pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-lg bg-ink-950/25 flex items-center justify-center">
                    <MapPin size={20} />
                  </span>
                  <h3 className="font-display text-2xl">Our Office</h3>
                </div>

                <address className="not-italic font-sans text-cream-100/95 text-base leading-relaxed mb-8">
                  Maranatha Complex,
                  <br />
                  Behind T & K Restaurant,
                  <br />
                  Off University Road,
                  <br />
                  Tanke, Ilorin.
                </address>

                {/* Opening hours */}
                <div className="border-t border-ink-950/20 pt-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={15} className="text-cream-100/80" />
                    <span className="font-sans text-xs uppercase tracking-[0.18em] font-semibold">
                      Opening Hours
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {openingHours.map((entry) => (
                      <li
                        key={entry.days}
                        className="flex items-baseline justify-between gap-4 font-sans text-sm"
                      >
                        <span className="text-cream-100/85">{entry.days}</span>
                        <span
                          className={`font-semibold tracking-wide whitespace-nowrap ${
                            entry.hours === "Closed"
                              ? "text-ink-950/70"
                              : "text-cream-50"
                          }`}
                        >
                          {entry.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct contact */}
                <div className="border-t border-ink-950/20 pt-6 flex flex-col gap-3 font-sans text-sm">
                  <a
                    href="tel:+2348122765292"
                    className="flex items-center gap-2.5 hover:text-ink-950 transition-colors"
                  >
                    <Phone size={15} className="shrink-0" />
                    <span>(+234) 8122765292</span>
                  </a>
                  <a
                    href="mailto:eleosresearchinn@gmail.com"
                    className="flex items-center gap-2.5 hover:text-ink-950 transition-colors"
                  >
                    <Mail size={15} className="shrink-0" />
                    <span>eleosresearchinn@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Why Choose Us — numbered editorial list */}
          <div id="why-choose-us" className="lg:col-span-7 scroll-mt-20">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {whyChooseUsItems.map((item, i) => (
                <div
                  key={item.id}
                  className="owu-item group flex gap-5 p-5 -m-2 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1.5 border border-transparent hover:border-cream-200 will-change-transform cursor-default"
                >
                  {/* Number + Icon */}
                  <div className="shrink-0">
                    <span className="block text-brand-primary/40 group-hover:text-brand-primary font-display text-xs mb-2 transition-colors duration-300 font-semibold tracking-wider">
                      0{i + 1}
                    </span>
                    <div className="w-14 h-14 bg-cream-100 border border-cream-200 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(227,34,28,0.35)] transition-all duration-300">
                      <item.Icon size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg md:text-xl text-ink-900 mb-2 group-hover:text-brand-hover transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="font-sans text-ink-500 text-sm leading-relaxed group-hover:text-ink-700 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
