"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WhoWeAreQuote {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  tag: string;
}

const testimonialsData: WhoWeAreQuote[] = [
  {
    id: "q-1",
    name: "Adeyeye Deborah",
    role: "Research Personnel, McBright Literacy",
    quote:
      "ERI has influenced my cooking greatly, I now place retaining nutritional value ahead of other interests in my food choices. My love for natural ingredients, spices and herbs has heightened through ERI. My household no longer pays frequent visits to hospitals, all thanks to ERI for creating awareness on healthy diet. I can recommend ERI to anyone, anytime and anywhere.",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640358/scent-leaf-image-150x150_1788618358875_sxdhne.jpg",
    tag: "Nutritional Transformation",
  },
  {
    id: "q-2",
    name: "Samuel Comfort",
    role: "Proprietress, Kingdom Elites Academy",
    quote:
      "I'm delighted to share my exceptional experience with ERI! Their expert food and nutritional knowledge has been a game-changer for me. With their guidance, I've gained a deeper understanding of healthy eating and gained better household well-being. Thank you, ERI for helping me unlock a healthier, happier me!",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640357/My-Help-600x500_1788618358556_r5g6tu.jpg",
    tag: "Institutional Leader",
  },
  {
    id: "q-3",
    name: "Sarah Bamidele",
    role: "MD, TGIE",
    quote:
      "For reliable information on diet and nutrition, I have turned to ERI. I can now cook wholesome meals for my family thanks to my experience with ERI. Finding healthier substitutes for harmful spices has also been made easier by ERI's research.",
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788640442/Life-plant-image-dry-leafgrowing-150x150_1788618358979_p7h7mv.jpg",
    tag: "Family Wellness",
  },
];

export default function WhoWeAreTestimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTestimonial = testimonialsData[activeIndex];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        ".testi-header > *",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      tl.fromTo(
        ".testi-card-box",
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28 px-6 bg-cream-50 overflow-hidden relative">
      <div className="max-w-330 mx-auto">
        {/* Header */}
        <div className="testi-header text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <span className="w-8 h-0.5 bg-brand-primary" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
              Real Impact Stories
            </span>
            <span className="w-8 h-0.5 bg-brand-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-900 leading-tight mb-4">
            What Our Community Says About ERI
          </h2>
          <p className="font-sans text-ink-600 text-sm sm:text-base leading-relaxed">
            Enriched nutrition is one of the foundational keys to a disease-free life. Discover how our research and dietary mentoring transform families and institutions.
          </p>
        </div>

        {/* Testimonial Showcase Box */}
        <div className="testi-card-box max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-cream-200/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] relative">
          {/* Top Red Accent */}
          <div className="absolute top-0 left-12 right-12 h-1 bg-linear-to-r from-transparent via-brand-primary to-transparent" />

          <div className="grid gap-8 lg:gap-10 items-center align-center">
            

            {/* Right Quote Body */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <Quote size={40} className="text-brand-200 mb-4" />
                <blockquote className="font-sans text-ink-800 text-base sm:text-lg leading-relaxed italic mb-6">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </blockquote>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-cream-100">
                <div>
                  <h4 className="font-display text-lg sm:text-xl text-ink-900 font-semibold">
                    {activeTestimonial.name}
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-ink-500">
                    {activeTestimonial.role}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                    className="w-10 h-10 rounded-full border border-cream-200 bg-cream-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="w-10 h-10 rounded-full border border-cream-200 bg-cream-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-4">
            {testimonialsData.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? "w-7 bg-brand-primary" : "w-2 bg-cream-200 hover:bg-ink-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
