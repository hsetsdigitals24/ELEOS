// components/updates/NotFound.tsx — branded "story not found" screen shared
// by the blog and video detail routes. Rendered in place of the streamed
// content when notFound() is hit (the HTTP status stays 200 because the
// shell has already streamed — Next adds the noindex tag automatically).

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

interface UpdatesNotFoundProps {
  /** What the visitor was looking for, e.g. "story" or "video". */
  kind: string;
  /** Where to send them back to. */
  backHref: string;
  backLabel: string;
}

export default function NotFound({ kind, backHref, backLabel }: UpdatesNotFoundProps) {
  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="w-full grow bg-cream-50 text-ink-950 pt-44 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary font-semibold">
            404 — Not found
          </p>
          <h1 className="mt-5 font-display text-5xl sm:text-6xl leading-none">
            This {kind} isn’t on record.
          </h1>
          <p className="mt-6 font-sans text-base text-ink-500 leading-relaxed">
            The page you’re looking for may have been moved, renamed, or never
            existed. Head back and keep reading — there’s more where that came from.
          </p>
          <Link
            href={backHref}
            className="mt-10 inline-flex items-center gap-3 bg-brand-primary text-cream-50 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {backLabel}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
