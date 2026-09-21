"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  FileEdit,
  Globe2,
  Scale,
  UserCheck,
} from "lucide-react";
import { SectionHeader, Reveal, NextChapter } from "./editorial";
import Image from "next/image";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const authorOffers = [
  {
    icon: UserCheck,
    title: "Rigorous Peer Review",
    description:
      "Double-blind review by scholars who take your work seriously — feedback that makes the paper better, not just shorter.",
  },
  {
    icon: FileEdit,
    title: "Editorial Support",
    description:
      "Structural editing, formatting, and reference care from a team that sweats the details so reviewers and readers do not have to.",
  },
  {
    icon: Globe2,
    title: "Genuine Reach",
    description:
      "Published work disseminated through our research network, media channels, and community platforms — written to be read, not shelved.",
  },
  {
    icon: Scale,
    title: "Fair Access",
    description:
      "Support and opportunities for the academia and other researchers — including first-time authors who need a door opened, not closed politely.",
  },
];

const ethicsPoints = [
  "Original work only — plagiarism is screened at submission and before publication.",
  "Informed consent and ethical approval required for all human-subject research.",
  "Authorship reflects contribution; conflicts of interest are disclosed.",
  "Corrections and retractions are issued promptly and transparently.",
];

export default function JournalsContent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Call-for-papers headline grows in from the red field
      gsap.fromTo(
        ".jnl-cfp > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.13,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".jnl-cfp",
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
      <div className="mb-12 sm:mb-16 md:h-80 flex justify-center">
        <Image src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788895137/Publications_w4vber.jpg" className="h-full" alt="Advocacy intro" width={600} height={700} />
      </div>
      {/* ── Intro ────────────────────────────────────────── */}
      <Reveal>
        <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
          At ERI, we provide adequate support and opportunities to the academia and other researchers to publish their works; our service incorporates manuscript editing (language, grammar, syntax); proofreading (error detection); formatting (journal-specific guidelines); manuscript review (peer review support); research design and methodology consulting; statistical analysis support; and plagiarism checking. <br /> <br />
          Our platform serves as a trusted e-library that gathers research outputs and promotes the dissemination of research findings contained in articles and other research outputs. We know how crucial it is to protect our articles from being plagiarized, thus we have implemented data encryption and safe output storage for all of our products. ERI supplies skilled support that enhances manuscript quality; improves visibility and citations; promotes articles (social media, email marketing); and offers indexing support. Our platform affords researchers, policymakers, and practitioners the prospect of sharing their findings, ideas, and innovations. <br /> <br />
          By assisting in the distribution of these insights, we hope to promote academic discussions, evidence-based solutions, and contribute at large to the global contemporary issues in social sciences and humanities.
        </p>
       
      </Reveal>
    </div>
  );
}
