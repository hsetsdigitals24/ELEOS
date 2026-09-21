"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { HeroSlide } from "@/types/home";

const slides: HeroSlide[] = [
  {
    id: "slide-1",
    eyebrow: "ELEOS Research Innovations",
    headline: "Healthy Choices, Healthy Communities.",
    body: "Promoting healthy lifestyles through advocacy, capacity-building and research outputs.",
    ctas: [
      { label: "Contact Us", href: "/contact", primary: true },
      { label: "Read More", href: "#welcome", primary: false },
    ],
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788650116/slide-1.jpg",
  },
  {
    id: "slide-2",
    eyebrow: "ELEOS Research Innovations",
    headline: "Innovating Food & Nutrition For Human Security",
    highlightedPhrase: "Food & Nutrition",
    body: "We are driving food and nutrition security research to advance sustainable health security.",
    ctas: [
      { label: "Contact Us", href: "/contact", primary: true },
      { label: "Read More", href: "#welcome", primary: false },
    ],
    image: "https://res.cloudinary.com/dr5l3dqnh/image/upload/v1788651914/slide-2-improved.jpg",
  },
];


function renderHeadline(headline: string, highlighted?: string) {
  if (!highlighted) return headline;
  const idx = headline.indexOf(highlighted);
  if (idx === -1) return headline;
  return (
    <>
      {headline.slice(0, idx)}
      <span className="underline decoration-brand-primary decoration-[3px] underline-offset-[6px]">
        {highlighted}
      </span>
      {headline.slice(idx + highlighted.length)}
    </>
  );
}


export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const isAnimating = useRef(false);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Touch / swipe tracking refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  /* ---- Slide transition with physical zoom and line-by-line swiping ---- */

  const changeSlide = useCallback((nextIndex: number): boolean => {
    if (!containerRef.current || isAnimating.current) return false;
    const currentIndex = activeRef.current;
    if (nextIndex === currentIndex) return false;

    isAnimating.current = true;

    const container = containerRef.current;
    const currentEl = container.querySelector(
      `[data-slide="${currentIndex}"]`
    ) as HTMLElement;
    const nextEl = container.querySelector(
      `[data-slide="${nextIndex}"]`
    ) as HTMLElement;
    if (!currentEl || !nextEl) {
      isAnimating.current = false;
      return false;
    }

    // Layering setup:
    // currentEl stays on top (zIndex: 2, opacity: 1) while it animates its zoom and swiping upward exit.
    // nextEl sits below (zIndex: 1, opacity: 1), preparing its incoming zoom-out and swiping upward entrance.
    gsap.set(currentEl, { zIndex: 2, opacity: 1 });
    gsap.set(nextEl, { zIndex: 1, opacity: 1 });

    // Prepare next slide initial state
    const nextImg = nextEl.querySelector(".hero-img");
    const nextTexts = nextEl.querySelectorAll(".hero-text");
    const currentImg = currentEl.querySelector(".hero-img");
    const currentTexts = currentEl.querySelectorAll(".hero-text");

    gsap.set(nextImg, { scale: 1.25 });
    gsap.set(nextTexts, { y: 80, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(currentEl, { zIndex: 1, opacity: 0 });
        gsap.set(currentImg, { scale: 1 });
        gsap.set(currentTexts, { y: 0, opacity: 0 });
        gsap.set(nextEl, { zIndex: 2, opacity: 1 });
        isAnimating.current = false;
      },
    });

    // 1. Outgoing background picture zooms IN (slow start, accelerating with power3.in)
    tl.to(
      currentImg,
      {
        scale: 1.35,
        duration: 1.2,
        ease: "power3.in",
      },
      0
    );

    // 2. Outgoing texts swipe UP line-by-line and fade out (slow start, accelerating)
    tl.to(
      currentTexts,
      {
        y: -70,
        opacity: 0,
        stagger: 0.08,
        duration: 0.75,
        ease: "power3.in",
      },
      0
    );

    // 3. Outgoing slide fades out as it zooms and accelerates
    tl.to(
      currentEl,
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
      },
      0.45
    );

    // 4. Incoming background picture zooms OUT from 1.25 to 1.0 (smooth deceleration)
    tl.to(
      nextImg,
      {
        scale: 1.0,
        duration: 2.2,
        ease: "power2.out",
      },
      0.2
    );

    // 5. Incoming texts slide UP line-by-line into position like a swiping entrance
    tl.to(
      nextTexts,
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1.0,
        ease: "power3.out",
      },
      0.45
    );

    activeRef.current = nextIndex;
    setDisplayIndex(nextIndex);
    return true;
  }, []);

  /* ---- Autoplay ---- */

  const resetAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    const tick = () => {
      autoplayTimer.current = setTimeout(() => {
        const next = (activeRef.current + 1) % slides.length;
        changeSlide(next);
        tick();
      }, 7000);
    };
    tick();
  }, [changeSlide]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    };
  }, [resetAutoplay]);

  /* ---- Manual Navigation ---- */

  const goNext = useCallback(() => {
    const ok = changeSlide((activeRef.current + 1) % slides.length);
    if (ok) resetAutoplay();
  }, [changeSlide, resetAutoplay]);

  const goPrev = useCallback(() => {
    const ok = changeSlide(
      (activeRef.current - 1 + slides.length) % slides.length
    );
    if (ok) resetAutoplay();
  }, [changeSlide, resetAutoplay]);

  const goTo = useCallback(
    (i: number) => {
      const ok = changeSlide(i);
      if (ok) resetAutoplay();
    },
    [changeSlide, resetAutoplay]
  );

  /* ---- Swipe Gestures ---- */

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    // Trigger swipe if horizontal displacement is significant and greater than vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next slide
        goNext();
      } else {
        // Swiped Right -> Prev slide
        goPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  /* ---- Initial entrance animation on load ---- */

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-slide="0"] .hero-img',
        { scale: 1.25 },
        { scale: 1, duration: 2.4, ease: "power2.out" }
      );
      gsap.fromTo(
        '[data-slide="0"] .hero-text',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.16,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.3,
        }
      );
    },
    { scope: containerRef }
  );

  /* ---- Render ---- */

  return (
    <section
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-screen min-h-150 overflow-hidden bg-cream-200 select-none cursor-grab active:cursor-grabbing"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          data-slide={i}
          className={`absolute inset-0 will-change-transform ${
            i === 0 ? "opacity-100 z-2" : "opacity-0 z-1"
          }`}
        >
          {/* Background image with red duotone overlay */}
          <div className="hero-img absolute inset-0 origin-center will-change-transform">
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
            {/* Duotone: light brand-red wash + softened dark scrim so the
                photography reads through (brighter, elderly-friendly) */}
            <div className="absolute inset-0 bg-brand-600/25 mix-blend-multiply" />
            <div className="absolute inset-0 bg-ink-950/35" />
            {/* Left-side gradient keeps the headline legible without
                darkening the whole image */}
            <div className="absolute inset-0 bg-linear-to-r from-ink-950/45 via-ink-950/15 to-transparent" />
          </div>

          {/* Content — positioned left, vertically centred */}
          <div className="relative z-10 h-full flex items-end pb-32 md:items-center md:pb-0 pointer-events-none">
            <div className="max-w-330 mx-auto px-6 w-full pointer-events-auto">
              <div className="max-w-2xl">
                <p className="hero-text text-[0.7rem] md:text-xs uppercase tracking-[0.25em] font-sans text-brand-300 font-semibold mb-5 opacity-0">
                  {slide.eyebrow}
                </p>
                <h1 className="hero-text font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] text-cream-50 leading-[1.08] mb-6 opacity-0">
                  {renderHeadline(slide.headline, slide.highlightedPhrase)}
                </h1>
                <p className="hero-text font-sans text-cream-200/90 text-base md:text-lg leading-relaxed mb-10 max-w-lg opacity-0">
                  {slide.body}
                </p>
                <div className="hero-text flex flex-wrap gap-4 opacity-0">
                  {slide.ctas.map((cta) => (
                    <Link
                      key={cta.label}
                      href={cta.href}
                      className={`inline-block px-8 py-3.5 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm transition-all duration-300 ${
                        cta.primary
                          ? "bg-brand-primary text-cream-50 hover:bg-brand-hover shadow-lg"
                          : "border-2 border-cream-50/30 text-cream-50 hover:border-cream-50 hover:bg-cream-50/10"
                      }`}
                    >
                      {cta.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom gradient for indicator readability */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-ink-950/70 to-transparent z-11 pointer-events-none" />

      {/* Centered Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="py-3 px-1 group cursor-pointer focus:outline-none"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                i === displayIndex
                  ? "w-12 bg-brand-primary shadow-[0_0_12px_rgba(227,34,28,0.7)]"
                  : "w-5 bg-cream-50/40 group-hover:bg-cream-50/70 group-hover:w-7"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
