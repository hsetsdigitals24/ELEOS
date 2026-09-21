"use client";

// components/broadcast/LiveBadge.tsx — the on-air indicator shared by the
// audio and video broadcast pages: a pulsing red dot when live, a muted
// grey one when off air.

interface LiveBadgeProps {
  isLive: boolean;
  liveLabel?: string;
  offLabel?: string;
}

export default function LiveBadge({
  isLive,
  liveLabel = "Live now",
  offLabel = "Off air",
}: LiveBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-semibold px-4 py-2 rounded-full border backdrop-blur-sm shadow-sm ${
        isLive
          ? "bg-brand-primary/15 border-brand-primary/40 text-brand-primary"
          : "bg-white border-ink-900/10 text-ink-500"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75 motion-reduce:hidden" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? "bg-brand-primary" : "bg-ink-500/40"
          }`}
        />
      </span>
      {isLive ? liveLabel : offLabel}
    </span>
  );
}
