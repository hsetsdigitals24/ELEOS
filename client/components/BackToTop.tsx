"use client";

// components/BackToTop.tsx — the single back-to-top button for the whole site.
//
// It is a button, not a navigation: the site already has a navbar, so this
// does one thing only. It stays hidden while the top of the page is on
// screen, fades in once the reader has scrolled a little way down, and then
// holds its place at the bottom-right for the rest of the page. Clicking it
// scrolls smoothly back to the top — which is also how it disappears again.
//
// Rendered by FooterClient, so every page with a footer gets it, including
// pages added later, with no per-page wiring.

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowUp } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

/**
 * How far down the page the reader has to be before the button is offered.
 * Roughly one navbar's height: far enough that it can't be mistaken for a
 * navigation control, close enough that it appears as soon as they set off.
 */
const SHOW_AFTER_PX = 120;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > SHOW_AFTER_PX;
      // Returning the current value untouched lets React skip the re-render,
      // so scrolling doesn't re-render this on every frame.
      setVisible((current) => (current === past ? current : past));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    // A reader who has asked for reduced motion wants the destination, not
    // the journey — jump rather than animate.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.to(window, {
      duration: reduced ? 0 : 0.9,
      scrollTo: 0,
      ease: "power3.inOut",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Scroll back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 w-11 h-11 rounded-lg bg-brand-primary text-cream-50 border border-brand-primary shadow-xl flex items-center justify-center hover:bg-brand-hover hover:scale-110 active:scale-95 transition-all duration-500 ease-out cursor-pointer ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
