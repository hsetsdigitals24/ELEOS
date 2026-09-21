import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-cream-50/75 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center px-7 py-6 rounded-2xl bg-white/95 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12)] border border-cream-200/90">
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
