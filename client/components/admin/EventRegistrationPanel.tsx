"use client";

// components/admin/EventRegistrationPanel.tsx — one event's registration
// console: the form builder and the responses, in two sub-tabs.
//
// Both live behind the event row they belong to and both are scoped to that
// event's id, so an admin running several events at once can never edit one
// event's fields or read one event's responses while thinking they're on
// another. The panel names the event at the top for the same reason.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, RefreshCw, X } from "lucide-react";
import { fetchAdminEventForm, updateAdminEventForm } from "@/lib/api/admin";
import type { EventItemApi } from "@/types/event";
import type { EventRegistrationForm, RegistrationField } from "@/types/registration";
import { ErrorLine, StatusLine, fieldClasses, labelClasses } from "./consoleShared";
import EventFormBuilder from "./EventFormBuilder";
import EventRegistrationsPanel from "./EventRegistrationsPanel";

type PanelTab = "form" | "responses";

interface EventRegistrationPanelProps {
  event: EventItemApi;
  /** Called when the panel closes, so the list can refresh its counts. */
  onClose: () => void;
}

export default function EventRegistrationPanel({
  event,
  onClose,
}: EventRegistrationPanelProps) {
  const [tab, setTab] = useState<PanelTab>("form");

  const [form, setForm] = useState<EventRegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  // The builder edits a draft; nothing reaches the server until Save.
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [intro, setIntro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);

  /**
   * The count the responses tab reports once it has loaded, superseding the
   * one baked into the event list — deleting a response here would otherwise
   * leave the tab label overstating the total. The panel is keyed by event,
   * so this never outlives the event it describes.
   */
  const [liveCount, setLiveCount] = useState<number | null>(null);

  // `loading` starts true and is only lowered when the fetch settles — the
  // effect below must not set state synchronously. Re-fetching after a
  // failure goes through `retry`, an event handler, which may.
  const load = useCallback(() => {
    fetchAdminEventForm(event.id)
      .then((result) => {
        setForm(result);
        setFields(result.fields);
        setIsOpen(result.isOpen);
        setIntro(result.intro);
        setSuccessMessage(result.successMessage);
        setSaved(false);
        setLoadError(null);
      })
      .catch((err: unknown) => setLoadError(err))
      .finally(() => setLoading(false));
  }, [event.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    load();
  };

  // Every edit clears the "saved" confirmation, so it can never claim the
  // form on screen matches the server when it doesn't.
  const editFields = (next: RegistrationField[]) => {
    setSaved(false);
    setFields(next);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateAdminEventForm(event.id, {
        fields,
        isOpen,
        intro,
        successMessage,
      });
      setForm(result);
      setFields(result.fields);
      setSaved(true);
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const responseCount = liveCount ?? event.registrationCount ?? 0;

  return (
    <div className="border-2 border-brand-primary/40 bg-white rounded-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 pb-4">
        <div className="min-w-0">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-brand-primary font-semibold">
            Registration
          </p>
          <h4 className="mt-1 font-display text-lg text-ink-900 truncate">{event.title}</h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/upcoming/${event.slug}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm border border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
          >
            <ExternalLink size={13} aria-hidden="true" />
            View page
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration panel"
            className="w-9 h-9 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Sub-tabs — the count sits in the responses tab so the two halves of
          this event can't be confused with another event's. */}
      <div className="flex items-center gap-6 px-6 border-b border-ink-900/12">
        {(
          [
            { id: "form", label: "Registration form" },
            { id: "responses", label: `Responses (${responseCount})` },
          ] as const
        ).map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id}
            className={`-mb-px pb-3 pt-1 font-sans text-xs uppercase tracking-[0.15em] font-semibold border-b-2 transition-colors duration-300 ${
              tab === entry.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-3 text-ink-500">
            <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
            <span className="font-sans text-sm">Loading the form…</span>
          </div>
        ) : loadError !== null ? (
          <div className="space-y-4">
            <ErrorLine error={loadError} />
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
            >
              <RefreshCw size={13} aria-hidden="true" /> Try again
            </button>
          </div>
        ) : tab === "responses" ? (
          <EventRegistrationsPanel event={event} form={form} onCountChange={setLiveCount} />
        ) : (
          <form onSubmit={save} className="space-y-6">
            {/* How the form presents itself, before its fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="form-intro" className={labelClasses}>
                  Intro
                </label>
                <textarea
                  id="form-intro"
                  rows={2}
                  value={intro}
                  onChange={(e) => {
                    setSaved(false);
                    setIntro(e.target.value);
                  }}
                  maxLength={800}
                  placeholder="A line or two above the fields — what registering means."
                  className={`${fieldClasses} resize-y`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="form-success" className={labelClasses}>
                  Thank-you message
                </label>
                <textarea
                  id="form-success"
                  rows={2}
                  value={successMessage}
                  onChange={(e) => {
                    setSaved(false);
                    setSuccessMessage(e.target.value);
                  }}
                  maxLength={400}
                  placeholder="Shown after a successful registration. Leave blank for the default."
                  className={`${fieldClasses} resize-y`}
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => {
                  setSaved(false);
                  setIsOpen(e.target.checked);
                }}
                className="mt-0.5 w-4 h-4 accent-[#e3221c]"
              />
              <span>
                Registration is open
                <span className="block font-sans text-xs text-ink-500">
                  Close it to stop new sign-ups without losing the responses you already have.
                </span>
              </span>
            </label>

            <div className="border-t border-ink-900/12 pt-6">
              <div className="flex items-baseline justify-between gap-4 mb-4">
                <h5 className="font-display text-base text-ink-900">Fields</h5>
                <span className="font-sans text-xs text-ink-500">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </span>
              </div>

              <EventFormBuilder fields={fields} onChange={editFields} errors={saveError} />
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-ink-900/12 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                Save form
              </button>

              {saved && saveError === null && (
                <StatusLine kind="ok">The registration form is saved.</StatusLine>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
