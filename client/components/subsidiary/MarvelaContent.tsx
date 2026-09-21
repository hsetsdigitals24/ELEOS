"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowRight,
  Droplets,
  GlassWater,
  GraduationCap,
  HeartPulse,
  Leaf,
  Quote,
  Sparkles,
  Users,
  Wheat,
} from "lucide-react";
import Link from "next/link";
import { SectionHeader, Reveal } from "@/components/service/editorial";
import { NextSubsidiary } from "./NextSubsidiary";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const categories = [
  {
    index: "01",
    icon: Sparkles,
    title: "Personal Care",
    items: ["Body Wash", "Cream"],
  },
  {
    index: "02",
    icon: Leaf,
    title: "Natural & Herbal Products",
    items: ["Scent Leaf", "Moringa", "Miracle Leaf", "Ashwagandha"],
  },
  {
    index: "03",
    icon: Wheat,
    title: "Food & Grains",
    items: ["Oats", "Wheat", "Bean Flour", "Cereal"],
  },
  {
    index: "04",
    icon: Droplets,
    title: "Oils & Essentials",
    items: ["Coconut Oil", "Soya Oil", "Salt", "Honey", "Cayenne Pepper"],
  },
  {
    index: "05",
    icon: GlassWater,
    title: "Drinks & Beverages",
    items: ["Soya Milk", "Natural Drinks"],
  },
];

const stats = [
  {
    target: 45,
    suffix: "",
    icon: GraduationCap,
    caption: "Skilled yoga instructors provide quality learning.",
  },
  {
    target: 784,
    suffix: "",
    icon: Activity,
    caption: "Yoga improves strength, balance and flexibility",
  },
  {
    target: 50,
    suffix: "",
    icon: Users,
    caption: "Yoga connects you with a supportive community.",
  },
  {
    target: 12,
    suffix: "k",
    icon: HeartPulse,
    caption: "Benefits heart health, reduce levels of stress.",
  },
];

const testimonials = [
  {
    quote:
      "ERI has significantly impacted my household's well-being in several ways. Through ERI's research outputs on nutrition, our feeding improved, and we now enjoy better health. I have been able to replace my unhealthy food cravings with healthy ones. I recommend ERI for every health-loving individual. Remember, health is wealth.",
    name: "ADELEYE Gbemisola",
    role: "Data Analyst",
    featured: true,
  },
  {
    quote:
      "ERI has influenced my cooking greatly, I now place retaining nutritional value ahead of other interests in my food choices. My love for natural ingredients, spices and herbs has heightened through ERI. My household no longer pays frequent visits to hospitals, all thanks to ERI for creating awareness on healthy diet. I can recommend ERI to anyone, anytime and anywhere.",
    name: "Adeyeye Deborah",
    role: "Research Personnel, McBright Literacy",
    featured: false,
  },
  {
    quote:
      "Since I got to know ERI, my feeding pattern changed from choosing refined and processed foods to nutrient dense foods. ERI showed me cooking patterns that retain food nutrients thereby enriching my household health. ERI significantly helped me to achieve healthy, and yet very tasty meals. I recommend ERI for everyone who loves to stay healthy, remember we are what we eat.",
    name: "Abidemi Sam-Agbaje",
    role: "MD, Atunak Prints.",
    featured: false,
  },
];

export default function MarvelaContent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Image moment — slow scrubbed parallax drift (transform-only)
      gsap.fromTo(
        ".mrv-intro-img",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".mrv-intro-img",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Shelf rows settle in from alternating sides, one after another
      gsap.utils.toArray<HTMLElement>(".mrv-shelf-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -45 : 45, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Product chips pop in with a quick scatter stagger
      gsap.fromTo(
        ".mrv-chip",
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: { each: 0.04, from: "random" },
          duration: 0.45,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: ".mrv-shelf",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Stat band — blocks rise with a stagger
      gsap.fromTo(
        ".mrv-stat",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".mrv-stats",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Stat figures count up from zero as the band enters (and back down
      // when it leaves, matching the house toggleActions pattern). The final
      // value lives in the markup, so no-JS and reduced-motion users still
      // see the real figures.
      gsap.utils.toArray<HTMLElement>(".mrv-stat-figure").forEach((el) => {
        const target = Number(el.dataset.target ?? 0);
        const suffix = el.dataset.suffix ?? "";
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          snap: { val: 1 },
          scrollTrigger: {
            trigger: ".mrv-stats",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
          onUpdate: () => {
            el.textContent = `${counter.val}${suffix}`;
          },
        });
      });

      // Testimonials rise with a stagger
      gsap.fromTo(
        ".mrv-quote",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.16,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".mrv-testimonials",
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef}>
      {/* ── 01. The story — drop-cap narrative + image moment ── */}
      <section className="py-20 md:py-28 px-6 bg-cream-100">
        <div className="max-w-330 mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 lg:order-1 max-lg:order-2">
            <SectionHeader
              eyebrow="Your Trusted Source for Healthy Living"
              title=""
            />
            <Reveal>
              <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
                Marvela Business Enterprise provides a wide range of natural,
                healthy, and everyday essential products designed to support
                better living. From food items and herbal products to oils and
                healthy snacks, we are committed to delivering quality you can
                trust.
              </p>
            </Reveal>
          </div>

          {/* Image bleeding toward the right edge, parallax drift */}
          <div className="lg:col-span-5 lg:order-2 max-lg:order-1 relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg shadow-xl lg:-mr-10 xl:-mr-16">
              <Image
                src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640358/pexels-ifreestock-616833-1-scaled_1788618358031_ddchem.jpg"
                alt="Marvela Business Enterprise — natural and healthy everyday essentials"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="mrv-intro-img object-cover scale-110 will-change-transform"
              />
              {/* Red accent frame, offset from the image edge */}
              <span className="absolute -bottom-3 -left-3 w-full h-full border-2 border-brand-primary -z-10 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 02. The shelf — five categories, editorial rows ── */}
      <section className="py-20 md:py-28 px-6 bg-cream-100">
        <div className="max-w-330 mx-auto">
          <SectionHeader
            eyebrow="Marvela Business Enterprise"
            title="We offer a diverse selection of healthy and natural products."
          />

          <div className="mrv-shelf">
            {categories.map((category, i) => (
              <div
                key={category.index}
                className={`mrv-shelf-row group grid lg:grid-cols-12 gap-6 lg:gap-10 items-center border-t-2 border-ink-900/10 last:border-b-2 py-8 lg:py-10 will-change-transform ${
                  i % 2 === 1 ? "lg:pl-8" : ""
                }`}
              >
                {/* Category name — number, icon, serif title */}
                <div className="lg:col-span-4 flex items-center gap-5">
                  <span className="font-display text-3xl sm:text-4xl text-brand-primary/30 group-hover:text-brand-primary transition-colors duration-300 font-semibold shrink-0">
                    {category.index}
                  </span>
                  <div>
                    <span className="w-11 h-11 rounded-lg bg-cream-50 border border-cream-200 flex items-center justify-center text-brand-primary mb-3 group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-110 transition-all duration-300">
                      <category.icon size={20} />
                    </span>
                    <h3 className="font-display text-xl md:text-2xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300 leading-tight">
                      {category.title}
                    </h3>
                  </div>
                </div>

                {/* Products — chip strip */}
                <div className="lg:col-span-8 flex flex-wrap gap-2.5">
                  {category.items.map((item) => (
                    <span
                      key={item}
                      className="mrv-chip inline-flex items-center rounded-md border border-cream-200 bg-white px-4 py-2 font-sans text-sm text-ink-700 shadow-sm will-change-transform hover:border-brand-primary hover:text-brand-hover hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

         
        </div>
      </section>

      {/* ── 03. The numbers — full-bleed red stat band ─────── */}
    
      {/* ── 04. Testimonials — bright field, voices of clients ── */}
      <section className="mrv-testimonials bg-cream-50 py-20 md:py-28 px-6 relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-330 mx-auto relative z-10">
          <SectionHeader
            tone="light"
            eyebrow="Testimonials"
            title="What Our Clients Say!"
          />

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Featured pull-quote — large display serif */}
            <figure className="mrv-quote lg:col-span-7 will-change-transform">
              <Quote
                size={36}
                className="text-brand-primary mb-6"
                aria-hidden
              />
              <blockquote className="font-display text-xl md:text-2xl text-ink-950 leading-relaxed mb-8">
                {testimonials[0].quote}
              </blockquote>
              <figcaption className="border-t border-ink-900/10 pt-5">
                <span className="block font-sans text-sm font-semibold uppercase tracking-[0.15em] text-ink-950">
                  {testimonials[0].name}
                </span>
                <span className="block font-sans text-xs text-ink-500 mt-1.5">
                  {testimonials[0].role}
                </span>
              </figcaption>
            </figure>

            {/* Supporting quotes — smaller, stacked */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {testimonials.slice(1).map((t) => (
                <figure
                  key={t.name}
                  className="mrv-quote will-change-transform"
                >
                  <Quote
                    size={22}
                    className="text-brand-primary mb-4"
                    aria-hidden
                  />
                  <blockquote className="font-sans text-sm text-ink-700 leading-relaxed mb-5">
                    {t.quote}
                  </blockquote>
                  <figcaption className="border-t border-ink-900/10 pt-4">
                    <span className="block font-sans text-sm font-semibold uppercase tracking-[0.15em] text-ink-950">
                      {t.name}
                    </span>
                    <span className="block font-sans text-xs text-ink-500 mt-1.5">
                      {t.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 05. Continue the story — cross-link on cream ──── */}
      <section className="py-14 md:py-16 px-6 bg-cream-100">
        <div className="max-w-330 mx-auto">
          <NextSubsidiary fromSlug="marvela-business-enterprise" />
        </div>
      </section>
    </div>
  );
}
