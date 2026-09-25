"use client";

// components/broadcast/AudioBroadcast.tsx — the live audio broadcast page.
// The medium (YouTube, Mixlr, Facebook, or an external platform) is chosen
// by the admin from the console and served by the backend; this page reads
// it and renders the matching player — or a branded "off air" studio
// placeholder when nothing is configured.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, ExternalLink, Headphones, RefreshCw } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import LiveBadge from "./LiveBadge";
import { fetchBroadcastSettings } from "@/lib/api/broadcasts";
import { ApiError } from "@/lib/api/client";
import { toYouTubeEmbedUrl, toYouTubeWatchUrl } from "@/lib/youtube";
import type { AudioBroadcastSettings } from "@/types/broadcast";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Turns a Mixlr profile URL into its player embed, or passes an embed
 *  URL through unchanged. */
function toMixlrEmbedUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (!url.hostname.endsWith("mixlr.com")) return rawUrl;
    if (url.pathname.includes("/embed")) return rawUrl;
    // Profile pages are /users/<name> — the player lives at /users/<name>/embed
    return `https://mixlr.com${url.pathname.replace(/\/$/, "")}/embed?autoplay=false&artwork=true`;
  } catch {
    return rawUrl;
  }
}

/** The "off air" studio panel — animated sound bars, no player. */
function OffAirPanel() {
  return (
    <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-7 bg-cream-100 border border-ink-900/10 rounded-md overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sound bars — CSS-animated, still visible (static) with reduced motion */}
      <div className="flex items-end gap-1.5 h-12" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <span
            key={bar}
            className="w-1.5 rounded-full bg-brand-primary/70 animate-[eq_1.6s_ease-in-out_infinite] motion-reduce:animate-none"
            style={{
              height: `${[18, 34, 26, 44, 30, 40, 22][bar]}px`,
              animationDelay: `${bar * 0.13}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-6">
        <p className="font-display text-2xl sm:text-3xl text-ink-950">
          We&rsquo;re off air.
        </p>
        <p className="mt-3 font-sans text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
          No live audio broadcast is running right now. When we go live — seminars, healthy
          living conversations and community moments — this is where you&rsquo;ll hear it.
        </p>
      </div>
    </div>
  );
}

function AudioBroadcast() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [audio, setAudio] = useState<AudioBroadcastSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await fetchBroadcastSettings();
        if (!cancelled) {
          setAudio(settings.audio);
          setState("ready");
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => {
    setState("loading");
    void fetchBroadcastSettings()
      .then((settings) => {
        setAudio(settings.audio);
        setState("ready");
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setState("error");
      });
  };

  const hasPlayer =
    audio !== null &&
    audio.medium !== "none" &&
    audio.url !== "" &&
    (audio.medium === "youtube" || audio.medium === "mixlr");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".studio-panel > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".studio-panel",
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [state] }
  );

  return (
    <div ref={sectionRef}>
      <PageHero
        id="audio-hero"
        title="Live Audio Broadcast"
        breadcrumb="Live Audio Broadcast"
      >
        <LiveBadge isLive={audio?.isLive ?? false} liveLabel="On air now" />
      </PageHero>

      {/* ── The studio ─────────────────────────────────────────── */}
      <div className="bg-cream-50 py-16 md:py-20 px-6 relative overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 studio-panel space-y-8">
          {state === "loading" && (
            <div className="aspect-video w-full bg-cream-200 rounded-md animate-pulse" aria-hidden="true" />
          )}

          {state === "error" && (
            <div className="aspect-video w-full flex flex-col items-center justify-center gap-4 bg-cream-100 border border-ink-900/10 rounded-md text-center px-6">
              <AlertCircle size={26} className="text-brand-primary" aria-hidden="true" />
              <p className="font-sans text-sm text-ink-700 max-w-sm">{errorMsg}</p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
              >
                <RefreshCw size={13} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {state === "ready" && (
            <>
              {/* Title block */}
              <div className="text-center">
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary font-semibold mb-3">
                  {audio?.isLive ? "On air" : "The studio"}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-ink-950 leading-snug">
                  {audio?.title || "The ELEOS Broadcast"}
                </h2>
                {audio?.description && (
                  <div
                    className="mt-4 font-sans text-sm text-ink-700 max-w-xl mx-auto leading-relaxed"
                    // Rich text from the admin editor — sanitized on write
                    // (server allowlist); plain-text values render unchanged.
                    dangerouslySetInnerHTML={{ __html: audio.description }}
                  />
                )}
              </div>

              {/* The player — medium chosen by the admin */}
              {hasPlayer && audio && (
                <div className="rounded-md overflow-hidden border border-ink-900/10 shadow-2xl">
                  <iframe
                    src={
                      audio.medium === "youtube"
                        ? (toYouTubeEmbedUrl(audio.url) ?? audio.url)
                        : toMixlrEmbedUrl(audio.url)
                    }
                    title={audio.title || "ELEOS live audio broadcast"}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}

              {/* External-only mediums (Facebook / other platforms) */}
              {state === "ready" && audio && audio.medium !== "none" && audio.url !== "" && !hasPlayer && (
                <div className="text-center">
                  <a
                    href={audio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
                  >
                    <Headphones size={16} aria-hidden="true" />
                    Listen live on{" "}
                    {audio.medium === "facebook" ? "Facebook" : "our broadcast platform"}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                  <p className="mt-4 font-sans text-xs text-ink-500">
                    The broadcast opens in a new tab on the platform hosting it.
                  </p>
                </div>
              )}

              {/* Off air */}
              {(audio === null || audio.medium === "none" || audio.url === "") && (
                <OffAirPanel />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── While you wait ──────────────────────────────────────── */}
      <section className="bg-cream-100 py-14 md:py-16 px-6">
        <div className="max-w-330 mx-auto grid md:grid-cols-2 gap-8">
          <Link
            href="/upcoming"
            className="group border-t-2 border-ink-900/10 pt-6 hover:border-brand-primary transition-colors duration-300"
          >
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold">
              Plan ahead
            </span>
            <p className="mt-2 font-display text-xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
              See our upcoming events
            </p>
          </Link>
          <Link
            href="/videos"
            className="group border-t-2 border-ink-900/10 pt-6 hover:border-brand-primary transition-colors duration-300"
          >
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold">
              Catch up
            </span>
            <p className="mt-2 font-display text-xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
              Watch past recordings
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AudioBroadcast;
