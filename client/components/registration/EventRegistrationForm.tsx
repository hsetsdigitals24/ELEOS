"use client";

// components/registration/EventRegistrationForm.tsx — the public face of one
// event's registration form, at /upcoming/[slug]/register.
//
// The event and its form arrive already fetched from the server page; this
// component owns the interaction. Structure follows the contact page (an
// editorial split of form + details rail, field errors from the API's Zod
// validation, graceful degradation when the API is offline) with one extra
// state the contact form doesn't need: registration closed.

import { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Send,
} from "lucide-react";
import { validateRegistrationAnswers } from "@/lib/registration";
import { submitEventRegistration } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { formatLongDate } from "@/lib/formatDate";
import type {
  EventRegistrationForm as RegistrationFormShape,
  RegistrationEventSummary,
} from "@/types/registration";
import RegistrationFields from "./RegistrationFields";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface EventRegistrationFormProps {
  event: RegistrationEventSummary;
  form: RegistrationFormShape;
}

type Status = "idle" | "sending" | "sent" | "duplicate" | "failed";

export default function EventRegistrationForm({ event, form }: EventRegistrationFormProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".reg-split > *",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".reg-split", start: "top 82%" },
        }
      );
    },
    { scope: sectionRef }
  );

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear a field's error as soon as the visitor edits it again.
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const clientErrors = validateRegistrationAnswers(form, values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setStatus("sending");
    setStatusMessage("");

    try {
      await submitEventRegistration(event.slug, values);
      setStatus("sent");
      setValues({});
    } catch (err) {
      if (err instanceof ApiError) {
        // A repeat registration isn't a mistake worth flagging in red — it
        // gets its own reassuring state.
        if (err.status === 409) {
          setStatus("duplicate");
          return;
        }
        setStatus("failed");
        // Surface the API's field-level issues under their inputs.
        const fieldErrors: Record<string, string> = {};
        for (const issue of err.issues ?? []) {
          if (!fieldErrors[issue.field]) fieldErrors[issue.field] = issue.message;
        }
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
        setStatusMessage(
          err.isOffline
            ? "We couldn't reach the server. Please check your connection and try again."
            : err.message
        );
        return;
      }
      setStatus("failed");
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div ref={sectionRef}>
      <div className="bg-cream-100 px-6 py-12 md:py-16">
        <div className="max-w-330 mx-auto reg-split grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-start">
          {/* ── The form ───────────────────────────────────────── */}
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold pb-2 mb-2 border-b border-ink-900/15">
              {form.isOpen ? "Register your interest" : "Registration"}
            </p>

            {!form.isOpen ? (
              <ClosedPanel />
            ) : status === "sent" ? (
              <SentPanel form={form} />
            ) : status === "duplicate" ? (
              <DuplicatePanel event={event} />
            ) : (
              <>
                {form.intro && (
                  <p className="mt-6 font-sans text-sm text-ink-700 leading-relaxed">
                    {form.intro}
                  </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  <RegistrationFields
                    fields={form.fields}
                    values={values}
                    errors={errors}
                    onChange={setField}
                    disabled={status === "sending"}
                    idPrefix="reg"
                  />

                  {status === "failed" && statusMessage && (
                    <p className="flex items-start gap-2 font-sans text-sm text-brand-primary">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                      {statusMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        Registering…
                      </>
                    ) : (
                      <>
                        <Send size={15} aria-hidden="true" />
                        Complete Registration
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── The event rail ─────────────────────────────────── */}
          <aside className="space-y-8 lg:border-l lg:border-ink-900/15 lg:pl-10">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold">
              The event
            </p>

            <h2 className="font-display text-2xl leading-snug text-ink-900">{event.title}</h2>

            <div className="space-y-4 font-sans text-sm text-ink-700">
              <p className="flex items-start gap-3">
                <CalendarDays size={15} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
                <time dateTime={event.date}>{formatLongDate(event.date)}</time>
              </p>
              {event.time && (
                <p className="flex items-start gap-3">
                  <Clock size={15} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{event.time}</span>
                </p>
              )}
              {(event.venue || event.city) && (
                <p className="flex items-start gap-3">
                  <MapPin size={15} className="text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {event.venue}
                    {event.city && <span className="block text-ink-500">{event.city}</span>}
                  </span>
                </p>
              )}
            </div>

            <div className="border-t border-ink-900/15 pt-6">
              <Link
                href="/upcoming"
                className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
              >
                <ArrowLeft size={13} aria-hidden="true" />
                All upcoming events
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The three terminal states                                           */
/* ------------------------------------------------------------------ */

const panelClasses =
  "mt-8 border rounded-md p-8 text-center bg-white border-ink-900/12";

function SentPanel({ form }: { form: RegistrationFormShape }) {
  return (
    <div className={`${panelClasses} border-brand-primary/30 bg-brand-50`}>
      <CheckCircle2 size={32} className="text-brand-primary mx-auto mb-4" aria-hidden="true" />
      <h2 className="font-display text-2xl text-ink-900">You&rsquo;re registered.</h2>
      <p className="mt-3 font-sans text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
        {form.successMessage ||
          "Thank you — your place is noted and the organisers have your details. We'll be in touch with anything you need before the day."}
      </p>
    </div>
  );
}

function DuplicatePanel({ event }: { event: RegistrationEventSummary }) {
  return (
    <div className={panelClasses}>
      <CheckCircle2 size={32} className="text-brand-primary mx-auto mb-4" aria-hidden="true" />
      <h2 className="font-display text-2xl text-ink-900">You&rsquo;re already registered.</h2>
      <p className="mt-3 font-sans text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
        We already have a registration under that email address for {event.title}. There&rsquo;s
        nothing more to do — the organisers will be in touch.
      </p>
    </div>
  );
}

function ClosedPanel() {
  return (
    <div className={panelClasses}>
      <Lock size={30} className="text-ink-500 mx-auto mb-4" aria-hidden="true" />
      <h2 className="font-display text-2xl text-ink-900">Registration has closed.</h2>
      <p className="mt-3 font-sans text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
        Sign-ups for this event are no longer open. Keep an eye on the calendar for what&rsquo;s
        coming next.
      </p>
      <Link
        href="/upcoming"
        className="mt-6 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        All upcoming events
      </Link>
    </div>
  );
}
