"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

export default function Loader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hide loader after initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  // Show loader on route change and hide once new page renders
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 380);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger smooth transition immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("#") &&
        !target.getAttribute("target") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.pathname !== window.location.pathname) {
            setLoading(true);
          }
        } catch {
          // ignore external/invalid urls
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  return (
    <div
      aria-hidden={!loading}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-cream-50/75 backdrop-blur-md transition-all duration-300 ease-out ${
        loading
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Sleek Floating Loader Capsule */}
      <div
        className={`flex flex-col items-center justify-center px-7 py-6 rounded-2xl bg-white/95 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12)] border border-cream-200/90 transition-all duration-300 ease-out ${
          loading ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        {/* Compact, clean animated GIF */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
          <Image
            src="/brand/loader1.gif"
            alt="Loading ELEOS..."
            width={64}
            height={64}
            unoptimized
            priority
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
          />
        </div>

        {/* Elegant Micro-status with pulsing badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
          </span>
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink-700 font-semibold">
            Loading ELEOS
          </span>
        </div>
      </div>
    </div>
  );
}
