"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Quote } from "lucide-react";
import { SectionHeader, Reveal, NextChapter } from "./editorial";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const advocacyChannels = [
  {
    index: "01",
    title: "Policy Engagement",
    description:
      "We work with government agencies, traditional institutions, and civil society to place food and nutrition security where it belongs — at the centre of public policy conversations.",
  },
  {
    index: "02",
    title: "Public Awareness Campaigns",
    description:
      "Through media, community outreach, and strategic campaigns, we raise public awareness of how nutrition intersects with health, education, and economic development.",
  },
  {
    index: "03",
    title: "Community Mobilization",
    description:
      "Real change begins in communities. We convene households, community leaders, and local organizations to own the food-security agenda where they live.",
  },
  {
    index: "04",
    title: "Capacity-Building Training",
    description:
      "Awareness must become ability. Our trainings equip individuals and groups with practical knowledge — from nutrition education to livelihood skills they can use immediately.",
  },
];

const audiences = [
  {
    title: "Community Health Workers",
    detail:
      "Frontline responders who carry nutrition knowledge house to house.",
  },
  {
    title: "Women's Groups",
    detail:
      "Women anchor household nutrition — we strengthen their voice and their livelihoods.",
  },
  {
    title: "Young People",
    detail:
      "Students and youth corps members who will carry the advocacy further than we can.",
  },
  {
    title: "Local Institutions",
    detail:
      "Schools, faith communities, and associations that make change stick.",
  },
];

export default function AdvocacyContent() {
  const quoteRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Duotone image break — slow parallax drift on the background
      gsap.fromTo(
        ".adv-quote-bg",
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Quote line sweeps in
      gsap.fromTo(
        ".adv-quote > *",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: quoteRef }
  );

  return (
    <div>
      {/* ── Narrative intro — drop cap + side rail ───────── */}
      <div className="mb-12 sm:mb-16 md:h-80 flex justify-center">
        <Image src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649258/Advocacy-and-Capacity-building_lf7xmn.jpg" className="h-full" alt="Advocacy intro" width={600} height={700} />
      </div>
      <Reveal className="grid sm:grid-cols-12 gap-8 w-full">
        <div className="sm:col-span-12">
          <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
            At the heart of our advocacy is the passion to make food security a fundamental right, rather than a privilege. We are ensuring that every individual has access to nutritious food, unlock their full potential and lead a vibrant, and productive life. Through our tireless advocacy, voices are amplified, and attention is drawn to the plight of vulnerable populations struggling to access nutritious food and other core human security needs. <br /> <br />
            Our strategic campaigns raise awareness about the intersectionality of food and nutrition security with health, education, and economic development. Our capacity building initiatives involve various training programs, workshops, and knowledge-sharing platforms that enhance the expertise of farmers, community leaders, and policymakers; as local capacities are strengthened, communities become resilient and self-sufficient, and are better equipped to address their human security challenges. Our campaigns motivate leaders to spearhead initiatives that promotes sustainable agriculture, nutrition education, and social safety nets among other programs. Synergizing advocacy and capacity building has enabled us to ignite transformative change that empowers communities to break free from cycles of poverty, food insecurity and malnutrition. 

          </p>
          <p className="font-sans text-sm sm:text-base text-ink-500 leading-relaxed mt-6">
            
          </p>
        </div>

      </Reveal>


    </div>
  );
}
