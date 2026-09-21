"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, ExternalLink, Mic, Play, Users, Wrench } from "lucide-react";
import { SectionHeader, Reveal } from "./editorial";
import Image from "next/image";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const formats = [
  {
    icon: Mic,
    title: "Seminars",
    tagline: "Ideas, shared aloud",
    description:
      "Led by researchers, practitioners, and community voices, our seminars put contemporary issues in sustainable development on the table — and invite everyone in the room to weigh them.",
    span: "lg:col-span-7",
  },
  {
    icon: Wrench,
    title: "Workshops",
    tagline: "Learning by doing",
    description:
      "Hands-on, practical, and small enough that no one sits at the edge. Participants leave with skills they have already practised, not just heard about.",
    span: "lg:col-span-5",
  },
  {
    icon: Users,
    title: "Trainings",
    tagline: "Capacity that stays",
    description:
      "Longer-form engagements that build durable capability within communities and institutions — the through-line between our advocacy and our empowerment work.",
    span: "lg:col-span-5",
  },
  {
    icon: CalendarDays,
    title: "Community Forums",
    tagline: "Everyone has a seat",
    description:
      "Open sessions where the questions come from the floor — because the people closest to a problem usually hold the sharpest reading of it.",
    span: "lg:col-span-7",
  },
];

const themes = [
  "Food Security",
  "Nutrition & Public Health",
  "Sustainable Development",
  "Human Security",
  "Community Health",
  "Food Systems",
  "Education",
  "Household Livelihoods",
];

const sessionFlow = [
  {
    step: "Doors Open",
    detail:
      "Registration, materials, and the first conversations — the room starts working before the programme does.",
  },
  {
    step: "The Floor",
    detail:
      "Presentations kept short, questions taken seriously. Discussion is not the Q&A; it is the point.",
  },
  {
    step: "Working Groups",
    detail:
      "Participants break into groups to test ideas against their own contexts and surface pragmatic next steps.",
  },
  {
    step: "Commitments",
    detail:
      "Every session closes with what each of us will do next — and how we will know it happened.",
  },
];

const pastEvents = [
  {
    id: "_RETclte_A4",
    title: "Maiden Edition",
    duration: "0:16",
    thumbnail:
      "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788649284/ERI-Seminar-1448x2048_fr0nbv.png",
  },
];

export default function SeminarsContent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeEventId, setActiveEventId] = useState(pastEvents[0].id);
  const activeEvent = pastEvents.find((event) => event.id === activeEventId) ?? pastEvents[0];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Theme tags pop in with a quick scatter stagger
      gsap.fromTo(
        ".sem-theme-tag",
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: { each: 0.05, from: "random" },
          duration: 0.45,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: ".sem-themes",
            start: "top 85%",
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
        <Image src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788907296/Seminars_m0tbmi.jpg" className="h-full" alt="Advocacy intro" width={600} height={700} />
      </div>
      {/* ── Intro ────────────────────────────────────────── */}
      <Reveal>
        <p className="font-sans text-base sm:text-lg text-ink-700 leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1.5">
          ERI offers a platform for knowledge sharing where experts exchange knowledge and experiences; in our seminars and workshop events, we help participants develop new skills and enhance existing ones for personal and professional growth. We provide networking opportunities for like-minded individuals, industry experts, and potential collaborators. ERI engages in information dissemination on research findings, industry trends, and best practices; our seminars and workshops inspire and motivate participants to take action, pursue new ideas, or adopt new perspectives on food and nutrition security for optimal health. We are contributing to continued education and professional development by helping individuals stay updated in the field of human security. <br /> <br />
          Our interactive forums facilitate discussions, foster collaboration, and unearth pragmatic solutions to contemporary issues in sustainable development. We build communities of interest, promote social inclusion; and provide feedback and evaluation mechanisms to help improve future events and outcomes. Our approaches cover in-person (on-site), online (webinars, virtual workshops), hybrid, self-paced (recorded sessions), and interactive sessions. <br /><br />
          Our strategies include hands-on training and skill-building; interactive exercises and group work; practical application and implementation; feedback and coaching; and leadership development and empowerment, with a central desire to enhance human security and wellbeing.
        </p>
       
      </Reveal>

      <section className="mt-16 md:mt-24 border-t border-ink-900/10 pt-12 md:pt-16">
        <SectionHeader
          eyebrow="Missed an event?"
          title="We recommend taking a look at our video gallery of past seminars and workshops."
        />

        <Reveal className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-12 items-start">
          <div className="border border-ink-900/10 bg-cream-50">
            <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
              <h3 className="font-display text-xl text-ink-900">Past Events</h3>
              <span className="font-sans text-xs text-ink-500">
                {pastEvents.length} {pastEvents.length === 1 ? "Video" : "Videos"}
              </span>
            </div>

            <div role="tablist" aria-label="Past seminar videos" className="p-3">
              {pastEvents.map((event) => {
                const isActive = event.id === activeEventId;

                return (
                  <button
                    key={event.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`seminar-video-${event.id}`}
                    onClick={() => setActiveEventId(event.id)}
                    className={`group flex w-full items-center gap-3 p-2 text-left transition-colors ${isActive ? "bg-brand-tint" : "hover:bg-cream-100"
                      }`}
                  >
                    <span className="relative h-14 w-20 shrink-0 overflow-hidden bg-cream-200">
                      <Image
                        src={event.thumbnail}
                        alt=""
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-ink-950/35 text-cream-50">
                        <Play size={16} fill="currentColor" />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-sm font-medium text-ink-900">
                        {event.title}
                      </span>
                      <span className="mt-1 block font-sans text-xs text-ink-500">
                        {event.duration}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <a
              href="https://www.youtube.com/@eleosrein/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-5 mb-5 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary hover:text-brand-hover"
            >
              Browse all videos
              <ExternalLink size={13} />
            </a>
          </div>

          <div
            id={`seminar-video-${activeEvent.id}`}
            role="tabpanel"
            aria-label={activeEvent.title}
            className="relative aspect-video overflow-hidden rounded-lg bg-cream-200 shadow-xl border border-ink-900/10"
          >
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${activeEvent.id}`}
              title={`${activeEvent.title} seminar recording`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
