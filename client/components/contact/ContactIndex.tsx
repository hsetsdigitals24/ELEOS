"use client";

// components/contact/ContactIndex.tsx — the contact page: the standard
// hero, an editorial split of the custom form (saved to the database via
// the backend) and a contact-details rail, then a full-width framed map
// for directions. Field-level errors come back from the API's Zod
// validation; the form degrades gracefully when the API is offline.

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Send,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { sendContactMessage } from "@/lib/api/contact";
import { ApiError } from "@/lib/api/client";
import type { ContactMessageInput } from "@/types/contact";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const OFFICE_ADDRESS = "Maranatha Tent, Tanke Rd, behind T&K Restaurant, off University Road, Ilorin 240102, Kwara, Nigeria";
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`;
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE_ADDRESS)}`;

const SUBJECTS = [
  "General Enquiry",
  "Research Support",
  "Advocacy & Capacity Building",
  "Seminars & Workshops",
  "Journal Publications",
  "His Story Tellers Media",
  "Marvela Products",
  "Other",
];

const HOURS = [
  { days: "Monday – Friday", hours: "9:00am – 4:00pm (GMT)" },
  { days: "Sat. & Public Hols.", hours: "10:00am – 4:00pm (GMT)" },
  { days: "Sundays", hours: "Closed" },
];

const initialForm: ContactMessageInput = {
  name: "",
  email: "",
  phone: "",
  subject: "General Enquiry",
  message: "",
};

type FormErrors = Partial<Record<keyof ContactMessageInput, string>>;

/** Client-side mirror of the backend's Zod rules — the API remains the
 *  authority, this just catches typos before the round-trip. */
function validateForm(form: ContactMessageInput): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (form.phone && form.phone.trim().length > 40)
    errors.phone = "That phone number looks too long.";
  if (form.subject && form.subject.trim().length > 140)
    errors.subject = "Subject must be at most 140 characters.";
  if (form.message.trim().length < 2) errors.message = "Please write your message.";
  return errors;
}

const inputClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

export default function ContactIndex() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ContactMessageInput>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".contact-split > *",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-split",
            start: "top 82%",
          },
        }
      );

      gsap.fromTo(
        ".contact-map",
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-map",
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const setField = (field: keyof ContactMessageInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the visitor edits it again.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setStatus("sending");
    setStatusMessage("");

    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm(initialForm);
    } catch (err) {
      setStatus("failed");
      if (err instanceof ApiError) {
        // Surface the API's field-level issues under their inputs.
        const fieldErrors: FormErrors = {};
        for (const issue of err.issues ?? []) {
          const field = issue.field as keyof ContactMessageInput;
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        }
        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
        setStatusMessage(
          err.isOffline
            ? "We couldn't reach the server. Please check your connection and try again."
            : err.message
        );
      } else {
        setStatusMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div ref={sectionRef}>
      <PageHero
        id="contact-hero"
        title="Contact Us"
        breadcrumb="Contact Us"
      />

      {/* ── Form + details ─────────────────────────────────────── */}
      <div className="bg-cream-100 px-6 py-12 md:py-16">
        <div className="max-w-330 mx-auto contact-split grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-start">
          {/* The form */}
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold pb-2 mb-2 border-b border-ink-900/15">
              Send us a message
            </p>

            {status === "sent" ? (
              <div className="mt-8 border border-brand-primary/30 bg-brand-50 rounded-md p-8 text-center">
                <CheckCircle2 size={32} className="text-brand-primary mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-display text-2xl text-ink-900">Message sent.</h2>
                <p className="mt-3 font-sans text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out — your message is with us. We read everything
                  and typically reply within two working days.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setStatusMessage("");
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-2"
                    >
                      Full name <span className="text-brand-primary">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      maxLength={80}
                      aria-invalid={Boolean(errors.name)}
                      className={`${inputClasses} ${errors.name ? "border-brand-primary" : ""}`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 font-sans text-xs text-brand-primary">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-2"
                    >
                      Email <span className="text-brand-primary">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      maxLength={254}
                      aria-invalid={Boolean(errors.email)}
                      className={`${inputClasses} ${errors.email ? "border-brand-primary" : ""}`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 font-sans text-xs text-brand-primary">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-2"
                    >
                      Phone <span className="text-ink-500 font-normal">(optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+234 …"
                      autoComplete="tel"
                      maxLength={40}
                      aria-invalid={Boolean(errors.phone)}
                      className={`${inputClasses} ${errors.phone ? "border-brand-primary" : ""}`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 font-sans text-xs text-brand-primary">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      className={inputClasses}
                    >
                      {SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-2"
                  >
                    Message <span className="text-brand-primary">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Tell us what's on your mind…"
                    rows={7}
                    maxLength={4000}
                    aria-invalid={Boolean(errors.message)}
                    className={`${inputClasses} resize-y ${errors.message ? "border-brand-primary" : ""}`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 font-sans text-xs text-brand-primary">{errors.message}</p>
                  )}
                </div>

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
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={15} aria-hidden="true" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Details rail */}
          <aside className="space-y-8 lg:border-l lg:border-ink-900/15 lg:pl-10">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-500 font-semibold">
              Reach us directly
            </p>

            <div className="space-y-5">
              <a
                href="https://maps.google.com/?q=TLAC+Office+Complex,+Ilorin"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4"
              >
                <span className="w-10 h-10 shrink-0 rounded-md bg-cream-50 border border-cream-200 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-cream-50 transition-colors duration-300">
                  <MapPin size={17} aria-hidden="true" />
                </span>
                <span className="font-sans text-sm text-ink-700 leading-relaxed">
                  Maranatha Complex, Behind T & K Restaurant,
                  <span className="block">Off University Road, Tanke, Ilorin</span>
                </span>
              </a>

              <a href="tel:+2348122765292" className="group flex items-center gap-4">
                <span className="w-10 h-10 shrink-0 rounded-md bg-cream-50 border border-cream-200 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-cream-50 transition-colors duration-300">
                  <Phone size={17} aria-hidden="true" />
                </span>
                <span className="font-sans text-sm text-ink-700">(+234) 8122765292</span>
              </a>

              <a
                href="mailto:eleosresearchinn@gmail.com"
                className="group flex items-center gap-4"
              >
                <span className="w-10 h-10 shrink-0 rounded-md bg-cream-50 border border-cream-200 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-cream-50 transition-colors duration-300">
                  <Mail size={17} aria-hidden="true" />
                </span>
                <span className="font-sans text-sm text-ink-700 break-all">
                  eleosresearchinn@gmail.com
                </span>
              </a>
            </div>

            <div className="border-t border-ink-900/15 pt-6">
              <h3 className="flex items-center gap-2.5 font-display text-base text-ink-900 mb-4">
                <Clock size={15} className="text-brand-primary" aria-hidden="true" />
                Opening hours
              </h3>
              <ul className="space-y-2.5">
                {HOURS.map((entry) => (
                  <li key={entry.days} className="font-sans text-sm">
                    <span className="text-ink-500 block">{entry.days}</span>
                    <span
                      className={`font-semibold tracking-wide ${
                        entry.hours === "Closed" ? "text-brand-primary" : "text-ink-900"
                      }`}
                    >
                      {entry.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ── The map — directions to the office ──────────────────── */}
      <section className="bg-cream-100 px-6 pb-16 md:pb-20">
        <div className="max-w-330 mx-auto contact-map">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-brand-primary font-semibold mb-2">
                Find us
              </p>
              <h2 className="font-display text-2xl sm:text-3xl text-ink-900">
                Come say hello
              </h2>
            </div>
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2.5 bg-brand-primary text-cream-50 px-6 py-3 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
            >
              <Navigation size={14} aria-hidden="true" />
              Get Directions
            </a>
          </div>

          <div className="relative rounded-md overflow-hidden border border-ink-900/12 shadow-lg">
            <iframe
              src={MAPS_EMBED_URL}
              title="Map showing the ELEOS Research Innovations office — TLAC Office Complex, Maranatha Tent, Behind Offa Road, Ilorin"
              className="w-full h-95 sm:h-110 block"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="mt-4 font-sans text-xs text-ink-500">
            {OFFICE_ADDRESS}
          </p>
        </div>
      </section>
    </div>
  );
}
