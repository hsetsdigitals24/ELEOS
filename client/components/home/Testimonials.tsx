"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, MoveHorizontal, Quote } from "lucide-react";
import type { TestimonialItem } from "@/types/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials: TestimonialItem[] = [
  {
    id: "test-1",
    name: "Adeleye Gbemisola",
    role: "Data Analyst",
    quote:
      "ERI has significantly impacted my household's well-being in several ways. Through ERI's research outputs on nutrition, our feeding improved, and we now enjoy better health. I have been able to replace my unhealthy food cravings with healthy ones. I recommend ERI for every health-loving individual. Remember, health is wealth.",
  },
  {
    id: "test-2",
    name: "Adeyeye Deborah",
    role: "Research Personnel, McBright Literacy",
    quote:
      "ERI has influenced my cooking greatly, I now place retaining nutritional value ahead of other interests in my food choices. My love for natural ingredients, spices and herbs has heightened through ERI. My household no longer pays frequent visits to hospitals, all thanks to ERI for creating awareness on healthy diet. I can recommend ERI to anyone, anytime and anywhere.",
  },
  {
    id: "test-3",
    name: "Abidemi Sam-Agbaje",
    role: "MD, Atunak Prints",
    quote:
    "Since I got to know ERI, my feeding pattern changed from choosing refined and processed foods to nutrient dense foods. ERI showed me cooking patterns that retain food nutrients thereby enriching my household health. ERI significantly helped me to achieve healthy, and yet very tasty meals. I recommend ERI for everyone who loves to stay healthy, remember we are what we eat.",
  },
  {
    id: "test-4",
    name: "Adeola Isaac-Oluyede",
    role: "CEO, Pure Aure",
    quote:
      "For information and a paradigm shift on feeding and food preparation practices, ERI is a reliable and highly recommended resource. The enlightening seminars offered by ERI made me aware of veggies and herbs that enhance diets. My health has improved in unprecedented ways, now that I chose my foods based on their nutrient content.",
  },
  {
    id: "test-5",
    name: "Sarah Bamidele",
    role: "MD, TGIE",
    quote:
      "For reliable information on diet and nutrition, I have turned to ERI. I can now cook wholesome meals for my family thanks to my experience with ERI. Finding healthier substitutes for harmful spices has also been made easier by ERI's research.",
  },
  {
    id: "test-6",
    name: "Komolafe Eniola",
    role: "EO, WAEC Ilorin",
    quote:
      "ERI's study on spices and herbs has improved my quality of life, helping me to remove harmful components in my meals, enhancing my household well-being, and assisting me to incorporate smoothies for want of essential vitamins and nutrients in cooked meals. Overall, the quality of life of my household has been enhanced.",
  },
  {
    id: "test-7",
    name: "Adesanya Glory",
    role: "Manager, Lifefount Hospital",
    quote:
      "My feeding pattern has changed since I encountered ERI, which in turn has improved my family's health.",
  },
  {
    id: "test-8",
    name: "Samuel Comfort",
    role: "Proprietress Kingdom Elites Academy",
    quote:
      "I'm delighted to share my exceptional experience with ERI! Their expert food and nutritional knowledge has been a game-changer for me. With their guidance, I've gained a deeper understanding of healthy eating and gained better household well-being. Thank you, ERI for helping me unlock a healthier, happier me!",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const goToRef = useRef<(index: number) => void>(() => {});
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      // ---- Carousel state ----
      let inView = false;
      let hoverPaused = false;
      let dragging = false;
      let entranceDone = false;
      let tween: gsap.core.Tween | null = null;
      let resumeCall: gsap.core.Tween | null = null;
      let rafId: number | null = null;
      let snapTimer: ReturnType<typeof setTimeout> | null = null;
      let lastIndex = 0;

      const cards = () => Array.from(track.children) as HTMLElement[];
      const stride = () => {
        const c = cards();
        return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : (c[0]?.offsetWidth ?? 0);
      };
      const currentIndex = () => {
        const total = cards().length;
        return Math.min(Math.max(Math.round(track.scrollLeft / stride()), 0), total - 1);
      };

      const killAutoplay = () => {
        tween?.kill();
        resumeCall?.kill();
        tween = null;
        resumeCall = null;
      };

      // ---- Scroll-driven emphasis: the leading card is full-scale and lit,
      //      the rest sit slightly smaller and dimmed ----
      const update = () => {
        rafId = null;
        const idx = currentIndex();
        cards().forEach((card, i) => {
          card.dataset.active = i === idx ? "true" : "false";
        });
        if (idx !== lastIndex) {
          lastIndex = idx;
          setActiveIndex(idx);
        }
      };

      // ---- GSAP-managed snapping (no CSS snap — it fights JS-driven
      //      scrollLeft animation and makes the motion look like a hard cut) ----
      const snapToNearest = () => {
        if (dragging || tween || !entranceDone) return;
        const target = Math.round(track.scrollLeft / stride()) * stride();
        if (Math.abs(target - track.scrollLeft) < 2) return;
        tween = gsap.to(track, {
          scrollLeft: target,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            tween = null;
          },
        });
      };

      const onScroll = () => {
        if (!rafId) rafId = requestAnimationFrame(update);
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(snapToNearest, 160);
      };

      // ---- Autoplay slideshow ----
      const schedule = (delay: number) => {
        resumeCall?.kill();
        resumeCall = gsap.delayedCall(delay, () => {
          resumeCall = null;
          if (!inView || hoverPaused || dragging) return;
          step();
        });
      };

      const step = () => {
        if (tween) {
          schedule(0.5);
          return;
        }
        const c = cards();
        if (c.length < 2 || track.scrollWidth - track.clientWidth <= 4) return;

        const next = currentIndex() + 1;
        const target = next >= c.length ? 0 : c[next].offsetLeft;

        tween = gsap.to(track, {
          scrollLeft: target,
          duration: target === 0 ? 1.6 : 1.15,
          ease: "power3.inOut",
          onComplete: () => {
            tween = null;
            if (!hoverPaused) schedule(2.8);
          },
        });
      };

      // User interacted — pause hard, resume after they go idle
      const pauseForUser = () => {
        killAutoplay();
        resumeCall = gsap.delayedCall(4, () => {
          resumeCall = null;
          if (inView && !hoverPaused && !dragging) schedule(0.6);
        });
      };

      // ---- Arrow / dot navigation ----
      const goTo = (index: number) => {
        const c = cards();
        if (!c.length) return;
        const clamped = Math.min(Math.max(index, 0), c.length - 1);
        killAutoplay();
        tween = gsap.to(track, {
          scrollLeft: c[clamped].offsetLeft,
          duration: 0.9,
          ease: "power3.inOut",
          onComplete: () => {
            tween = null;
            if (inView && !hoverPaused) schedule(2.8);
          },
        });
      };
      goToRef.current = goTo;

      // ---- Mouse drag-to-scroll (touch uses native scrolling) ----
      let dragStartX = 0;
      let dragStartScroll = 0;

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        dragging = true;
        dragStartX = e.clientX;
        dragStartScroll = track.scrollLeft;
        track.setPointerCapture(e.pointerId);
        e.preventDefault(); // avoid text selection while dragging
        killAutoplay();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        track.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        track.releasePointerCapture(e.pointerId);
        pauseForUser();
      };

      const onTouchStart = () => pauseForUser();
      const onWheel = (e: WheelEvent) => {
        // Only pause for horizontal scroll intent (trackpads / shift+wheel)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) pauseForUser();
      };
      const onMouseEnter = () => {
        hoverPaused = true;
        resumeCall?.kill();
        resumeCall = null;
      };
      const onMouseLeave = () => {
        hoverPaused = false;
        if (inView) schedule(0.8);
      };

      // ---- Autoplay runs while the section is in (or near) view ----
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          inView = true;
          schedule(2.6); // let the entrance animation settle first
        },
        onEnterBack: () => {
          inView = true;
          schedule(0.8);
        },
        onLeave: () => {
          inView = false;
          killAutoplay();
        },
        onLeaveBack: () => {
          inView = false;
          killAutoplay();
        },
      });

      track.addEventListener("scroll", onScroll, { passive: true });
      track.addEventListener("pointerdown", onPointerDown);
      track.addEventListener("pointermove", onPointerMove);
      track.addEventListener("pointerup", onPointerUp);
      track.addEventListener("pointercancel", onPointerUp);
      track.addEventListener("touchstart", onTouchStart, { passive: true });
      track.addEventListener("wheel", onWheel, { passive: true });
      track.addEventListener("mouseenter", onMouseEnter);
      track.addEventListener("mouseleave", onMouseLeave);

      // ---- Entrance animation ----
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        onComplete: () => {
          entranceDone = true;
          update();
        },
      });

      // Header reveal
      tl.fromTo(
        ".test-header > *",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
        }
      );

      // Cards slide in horizontally with stagger; clearProps hands styling
      // back to the CSS data-active emphasis once the intro finishes
      tl.fromTo(
        ".test-card",
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.09,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
        },
        "-=0.3"
      );

      return () => {
        killAutoplay();
        if (rafId) cancelAnimationFrame(rafId);
        if (snapTimer) clearTimeout(snapTimer);
        track.removeEventListener("scroll", onScroll);
        track.removeEventListener("pointerdown", onPointerDown);
        track.removeEventListener("pointermove", onPointerMove);
        track.removeEventListener("pointerup", onPointerUp);
        track.removeEventListener("pointercancel", onPointerUp);
        track.removeEventListener("touchstart", onTouchStart);
        track.removeEventListener("wheel", onWheel);
        track.removeEventListener("mouseenter", onMouseEnter);
        track.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section-md px-6 overflow-hidden">
      <div className="max-w-330 mx-auto">
        {/* Header + carousel controls */}
        <div className="test-header mb-14 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 bg-brand-primary" />
              <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-primary font-semibold">
                Testimonials
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900">
              What People Say
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-5 shrink-0 pb-1">
            <span className="font-sans text-xs tracking-[0.2em] text-ink-500 tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="mx-1.5 text-cream-200">/</span>
              {String(testimonials.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous testimonial"
                disabled={activeIndex === 0}
                onClick={() => goToRef.current(activeIndex - 1)}
                className="w-11 h-11 rounded-full border border-cream-200 bg-white flex items-center justify-center text-ink-700 hover:bg-brand-primary hover:border-brand-primary hover:text-cream-50 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-cream-200 disabled:hover:text-ink-700 disabled:cursor-default"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                disabled={activeIndex === testimonials.length - 1}
                onClick={() => goToRef.current(activeIndex + 1)}
                className="w-11 h-11 rounded-full border border-cream-200 bg-white flex items-center justify-center text-ink-700 hover:bg-brand-primary hover:border-brand-primary hover:text-cream-50 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-cream-200 disabled:hover:text-ink-700 disabled:cursor-default"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal swipeable track — drag / swipe to browse,
            auto-advances like a slideshow while in view.
            Card widths leave a partial card peeking so it always
            reads as scrollable. */}
        <div
          ref={trackRef}
          className="test-track flex gap-6 lg:gap-8 overflow-x-auto py-6 -my-2 cursor-grab active:cursor-grabbing [-ms-overflow-style:none] scrollbar-none"
        >
          {testimonials.map((item, i) => (
            <div
              key={item.id}
              data-active={i === 0 ? "true" : "false"}
              className="test-card group shrink-0 w-4/5 sm:w-3/5 md:w-2/5 lg:w-[29%]"
            >
              <div className="relative h-full bg-white border border-cream-200 rounded-xl overflow-hidden shadow-md scale-[0.94] opacity-55 group-hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.15)] group-hover:opacity-90 group-hover:border-brand-primary/40 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100 group-data-[active=true]:border-brand-primary/30 transition-[transform,opacity,box-shadow,border-color] duration-500">
                {/* Red accent top stripe that expands on hover */}
                <div className="h-1 bg-brand-primary w-full group-hover:h-1.5 transition-all duration-300" />

                <div className="p-7 md:p-8 flex flex-col justify-between h-[calc(100%-4px)]">
                  <div>
                    <Quote
                      size={32}
                      className="text-brand-100 group-hover:text-brand-primary group-hover:scale-115 transition-all duration-300 mb-5 origin-left"
                    />
                    <p className="font-sans text-ink-700 text-sm leading-relaxed mb-6 italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="border-t border-cream-200/80 pt-4 flex items-center gap-3.5">
                    {/* Avatar circle */}
                    <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center font-display text-brand-primary font-bold text-sm group-hover:bg-brand-primary group-hover:text-cream-50 group-hover:scale-105 transition-all duration-300">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display text-ink-900 text-sm font-semibold group-hover:text-brand-primary transition-colors duration-300">
                        {item.name}
                      </p>
                      <p className="font-sans text-ink-500 text-xs">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress dots + swipe hint */}
        <div className="mt-8 flex items-center justify-between md:justify-start gap-6">
          <div className="flex items-center gap-2">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goToRef.current(i)}
                className={`h-1 rounded-full transition-all duration-400 ${
                  i === activeIndex
                    ? "w-8 bg-brand-primary"
                    : "w-4 bg-cream-200 hover:bg-brand-300"
                }`}
              />
            ))}
          </div>

          <div className="md:hidden flex items-center gap-2 text-ink-500">
            <MoveHorizontal size={16} className="text-brand-primary" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-sans">
              Swipe to explore
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
