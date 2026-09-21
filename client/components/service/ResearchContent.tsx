"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Database,
  FileSearch,
  GraduationCap,
  Users2,
} from "lucide-react";
import { SectionHeader, Reveal, NextChapter } from "./editorial";
import Image from "next/image";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const fields = [
  "Social Sciences",
  "Humanities",
  "Interdisciplinary Studies",
  "Food & Nutrition Research",
  "Public Health",
  "Development Studies",
];

const supportPillars = [
  {
    icon: Compass,
    title: "Direction",
    description:
      "From refining a research question to designing a study that can actually answer it — experienced researchers walk alongside yours.",
  },
  {
    icon: Database,
    title: "Resources",
    description:
      "Access to data, reference materials, and methodological tools that would otherwise sit behind institutional walls.",
  },
  {
    icon: Users2,
    title: "Community",
    description:
      "A network of fellow researchers, mentors, and practitioners across disciplines — because no good study happens in isolation.",
  },
  {
    icon: FileSearch,
    title: "Review",
    description:
      "Rigorous, respectful peer feedback that strengthens work before it faces the wider world.",
  },
];

const journey = [
  {
    step: "The Question",
    detail:
      "We help shape raw curiosity into a focused, answerable research question worth months of your life.",
  },
  {
    step: "The Design",
    detail:
      "Methodology, ethics, and fieldwork planning — built to survive contact with reality.",
  },
  {
    step: "The Field",
    detail:
      "Support during data collection and analysis, with people who have walked these roads before.",
  },
  {
    step: "The Page",
    detail:
      "Findings shaped into publications — carried through our Journal Publications arm.",
  },
];

export default function ResearchContent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Journey steps reveal in sequence down the page
      gsap.fromTo(
        ".rsch-step",
        { x: -35, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".rsch-journey",
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef}>
      <div className="mb-12 sm:mb-16 md:h-80 flex justify-center">
        <Image src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895880/row-bg-eight-1-1_y8opb2.jpg" className="h-full" alt="Advocacy intro" width={600} height={700} />
      </div>
      {/* ── Intro ────────────────────────────────────────── */}
      <Reveal>
        <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
          We fuel academic innovation and discovery in social science, humanities and interdisciplinary studies. We provide expert services that empower researchers, scholars, and businesses to uncover new knowledge, validate ideas, and drive progress. With our team of seasoned researchers, analysts, and experts, we offer tailored solutions, navigate complex research landscapes, and bridge gaps in expertise and resources. From literature reviews to data collection, analysis, and interpretation, we provide end-to-end support. Through our research service, we identify knowledge gaps and research opportunities; design methodologies and study protocols; conduct systematic reviews and analyses; collect, analyse, and visualize data; and result interpretations, conclusions, and recommendations writing. <br /> <br />
          ERI facilitates collaboration and connects clients with diverse expertise and networks, and we foster networks where interdisciplinary approaches thrive. 
        </p>
       
      </Reveal>
    </div>
  );
}
