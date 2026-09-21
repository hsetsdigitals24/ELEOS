"use client";

// components/broadcast/VideoBroadcast.tsx — the live video broadcast page.
// The admin sets a YouTube link from the console; whatever form it's pasted
// in (watch link, share link, live link, channel), it's normalised into an
// embed and presented in a dark theater frame. No link set yet — a branded
// "off air" screen with a route to the YouTube channel.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertCircle, Play, RefreshCw, SquarePlay } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import LiveBadge from "./LiveBadge";
import { fetchBroadcastSettings } from "@/lib/api/broadcasts";
import { ApiError } from "@/lib/api/client";
import { toYouTubeEmbedUrl, toYouTubeWatchUrl } from "@/lib/youtube";
import type { VideoBroadcastSettings } from "@/types/broadcast";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ELEOS_CHANNEL_URL = "https://youtube.com/@eleosrein";

/** The "off air" theater screen — a resting play button, no player. */
function OffAirPanel() {
  return (
    <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-7 bg-cream-100 border border-ink-900/10 rounded-md overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <span className="relative w-20 h-20 rounded-full border border-brand-primary/30 flex items-center justify-center text-brand-primary/70">
        <Play size={30} className="translate-x-0.5" fill="currentColor" aria-hidden="true" />
      </span>

      <div className="relative text-center px-6">
        <p className="font-display text-2xl sm:text-3xl text-ink-950">
          We&rsquo;re off air.
        </p>
        <p className="mt-3 font-sans text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
          No live video broadcast is running right now. When ELEOS goes live — seminars,
          workshops and special moments — this screen becomes the stage.
        </p>
        <a
          href={ELEOS_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
        >
          <SquarePlay size={14} aria-hidden="true" />
          Browse the channel meanwhile
        </a>
      </div>
    </div>
  );
}

function VideoBroadcast() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [video, setVideo] = useState<VideoBroadcastSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await fetchBroadcastSettings();
        if (!cancelled) {
          setVideo(settings.video);
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
        setVideo(settings.video);
        setState("ready");
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setState("error");
      });
  };

  const embedUrl = video && video.url ? toYouTubeEmbedUrl(video.url) : null;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".theater-panel > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".theater-panel",
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
        id="video-hero"
        title="Live Video Broadcast"
        breadcrumb="Live Video Broadcast"
      >
        <LiveBadge isLive={video?.isLive ?? false} liveLabel="Streaming now" />
      </PageHero>
      {/* ── The theater ─────────────────────────────────────────── */}
      <div className="bg-cream-50 py-16 md:py-20 px-6 relative overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 theater-panel space-y-8">
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
                  {video?.isLive ? "Streaming now" : "The stage"}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-ink-950 leading-snug">
                  {video?.title || "The ELEOS Live Stream"}
                </h2>
                {video?.description && (
                  <div
                    className="mt-4 font-sans text-sm text-ink-700 max-w-xl mx-auto leading-relaxed"
                    // Rich text from the admin editor — sanitized on write
                    // (server allowlist); plain-text values render unchanged.
                    dangerouslySetInnerHTML={{ __html: video.description }}
                  />
                )}
              </div>

              {/* The player */}
              {embedUrl ? (
                <div className="rounded-md overflow-hidden border border-ink-900/10 shadow-2xl">
                  <iframe
                    src={embedUrl}
                    title={video?.title || "ELEOS live video broadcast"}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : video && video.url ? (
                /* A YouTube URL we can't embed (e.g. a bare channel handle) —
                    route the viewer out instead of a broken frame. */
                <div className="text-center">
                  <a
                    href={toYouTubeWatchUrl(video.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
                  >
                    <SquarePlay size={16} aria-hidden="true" />
                    Watch on YouTube
                  </a>
                </div>
              ) : (
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
            href="/videos"
            className="group border-t-2 border-ink-900/10 pt-6 hover:border-brand-primary transition-colors duration-300"
          >
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold">
              On demand
            </span>
            <p className="mt-2 font-display text-xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
              Watch recorded sessions
            </p>
          </Link>
          <Link
            href="/live-audio-broadcast"
            className="group border-t-2 border-ink-900/10 pt-6 hover:border-brand-primary transition-colors duration-300"
          >
            <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-brand-primary font-semibold">
              Prefer to listen?
            </span>
            <p className="mt-2 font-display text-xl text-ink-900 group-hover:text-brand-hover transition-colors duration-300">
              Check the audio broadcast
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default VideoBroadcast;
