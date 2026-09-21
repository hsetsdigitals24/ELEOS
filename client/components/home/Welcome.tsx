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

export default function Welcome() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Image clip-path wipe reveal
      gsap.fromTo(
        ".welcome-img-wrapper",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );

      // Text slides in from the right
      gsap.from(".welcome-text > *", {
        x: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section-md px-6 bg-cream-50" id="welcome">
      <div className="max-w-330 mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Image */}
        <div className="welcome-img-wrapper relative aspect-4/5 lg:aspect-3/4 rounded-md overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640359/Why-Choose-Us-e1725925859153_1788618358137_vk01kc.jpg"
            alt="Eleos Research Innovations"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          
        </div>

        {/* Text content */}
        <div className="welcome-text">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Welcome To ELEOS RESEARCH INNOVATIONS (ERI)
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-snug mb-8">
            We advocate for human security with primary focus on{" "}
            <span className="underline decoration-brand-primary decoration-2 underline-offset-4">
              food and nutrition security
            </span>
            .
          </h2>

          <div className="space-y-5 font-sans text-ink-500 text-base leading-relaxed mb-10">
            <p>
              We&apos;re focused on empowering individuals and households
              through food and nutrition security. We believe that everyone has a
              right to lead a productive and healthy life, therefore we provide
              adequate and quality access to knowledge.
            </p>
            <p>
              We are passionate about driving impactful change through strategic
              advocacy, capacity-building, and innovative solutions to address
              human security challenges. From research support to socioeconomic
              empowerment programs, we are committed to uplifting individuals and
              households and as such, fostering a safer, healthy world for all.
            </p>
            <p>
              Our commitment extends beyond providing knowledge; we aim to
              empower individuals and communities by equipping them with the
              necessary tools for good health and well beings.
            </p>
          </div>

          <Link
            href="/who-we-are"
            className="inline-flex items-center gap-3 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
          >
            Discover More!
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
