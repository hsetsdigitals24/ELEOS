"use client";

// components/admin/EventsTab.tsx — the "Events" tab: upcoming events for the
// public events page. The write-up uses the reusable RichTextEditor.
// Structure mirrors the Media tab's sections.

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  createEvent,
  deleteEvent,
  fetchAdminEvents,
  updateEvent,
} from "@/lib/api/admin";
import { formatLongDate } from "@/lib/formatDate";
import type { EventItemApi } from "@/types/event";
import {
  ErrorLine,
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
} from "./consoleShared";
import EventRegistrationPanel from "./EventRegistrationPanel";
import RichTextEditor from "./RichTextEditor";

/** Mirrors the server's slugify so the live slug preview matches what's stored. */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** yyyy-mm-dd (local) → ISO string; empty string stays empty. */
function dateToIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** ISO string → yyyy-mm-dd for <input type="date">. */
function isoToDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

interface EventFormState {
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  isPublished: boolean;
  slug: string;
}

const emptyEventForm: EventFormState = {
  title: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  category: "",
  imageUrl: "",
  imageAlt: "",
  description: "",
  isPublished: true,
  slug: "",
};

function eventToForm(event: EventItemApi): EventFormState {
  return {
    title: event.title,
    date: isoToDate(event.date),
    time: event.time,
    venue: event.venue,
    city: event.city,
    category: event.category,
    imageUrl: event.imageUrl,
    imageAlt: event.imageAlt,
    description: event.description,
    isPublished: event.isPublished,
    slug: event.slug,
  };
}

export default function EventsTab() {
  const [events, setEvents] = useState<EventItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editing, setEditing] = useState<EventItemApi | "new" | null>(null);
  /**
   * The event whose registration console is open. Kept separate from
   * `editing` so the event's own details and its registration form are two
   * deliberate, distinct places — opening one closes the other.
   */
  const [registrationFor, setRegistrationFor] = useState<EventItemApi | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyEventForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchAdminEvents({ limit: 50 })
      .then((result) => {
        setEvents(result.items);
        setLoadError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setRegistrationFor(null);
    setEditing("new");
    setForm(emptyEventForm);
    setSaveError(null);
  };

  const startEdit = (event: EventItemApi) => {
    setRegistrationFor(null);
    setEditing(event);
    setForm(eventToForm(event));
    setSaveError(null);
  };

  const openRegistration = (event: EventItemApi) => {
    setEditing(null);
    setRegistrationFor(event);
  };

  /** Closing the console reloads the list so response counts stay truthful. */
  const closeRegistration = () => {
    setRegistrationFor(null);
    load();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = dateToIso(form.date);
    if (date === undefined) return;
    setSaving(true);
    setSaveError(null);

    const payload = {
      title: form.title.trim(),
      date,
      time: form.time.trim() || undefined,
      venue: form.venue.trim() || undefined,
      city: form.city.trim() || undefined,
      category: form.category.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      imageAlt: form.imageAlt.trim() || undefined,
      description: form.description,
      isPublished: form.isPublished,
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
    };

    try {
      if (editing === "new") {
        await createEvent(payload);
      } else if (editing) {
        await updateEvent(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (event: EventItemApi) => {
    if (!window.confirm(`Delete the event “${event.title}”?`)) return;
    setActionError(null);
    try {
      await deleteEvent(event.id);
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  // Field-keyed messages from the last rejected save, so each input can show
  // its own.
  const fieldIssues = fieldErrors(saveError);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Upcoming events{" "}
          <span className="font-sans text-sm text-ink-500">({events.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          New event
        </button>
      </div>

      {actionError !== null && <ErrorLine error={actionError} />}

      {/* The registration console for one event — its form and its responses.
          Keyed by event so switching rows mounts a fresh console rather than
          carrying the previous event's draft or counts across. */}
      {registrationFor !== null && (
        <EventRegistrationPanel
          key={registrationFor.id}
          event={registrationFor}
          onClose={closeRegistration}
        />
      )}

      {/* Create / edit form */}
      {editing !== null && (
        <form
          onSubmit={submit}
          className="border-2 border-brand-primary/40 bg-white rounded-md p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-ink-900">
              {editing === "new" ? "New event" : `Editing — ${editing.title}`}
            </h4>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close form"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {saveError !== null && (
            <ErrorSummary error={saveError} what="save this event" />
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="event-title" className={labelClasses}>
                Title <span className="text-brand-primary">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="title" />
              <p className="mt-1.5 font-sans text-xs text-ink-500">
                {form.slug.trim() ? slugify(form.slug) : slugify(form.title) || "…"}
              </p>
            </div>
            <div>
              <label htmlFor="event-date" className={labelClasses}>
                Date <span className="text-brand-primary">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="date" />
            </div>
            <div>
              <label htmlFor="event-time" className={labelClasses}>
                Time (e.g. 10:00am – 2:00pm (GMT))
              </label>
              <input
                id="event-time"
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                maxLength={120}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="time" />
            </div>
            <div>
              <label htmlFor="event-venue" className={labelClasses}>
                Venue
              </label>
              <input
                id="event-venue"
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Online"
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="venue" />
            </div>
            <div>
              <label htmlFor="event-city" className={labelClasses}>
                City
              </label>
              <input
                id="event-city"
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Ilorin, Kwara State"
                maxLength={120}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="city" />
            </div>
            <div>
              <label htmlFor="event-category" className={labelClasses}>
                Category
              </label>
              <input
                id="event-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Roundtable"
                maxLength={60}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="category" />
            </div>
            <div>
              <label htmlFor="event-image" className={labelClasses}>
                Image URL
              </label>
              <input
                id="event-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageUrl" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="event-image-alt" className={labelClasses}>
                Image alt text
              </label>
              <input
                id="event-image-alt"
                type="text"
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageAlt" />
            </div>
          </div>

          {/* The write-up — the reusable rich-text editor */}
          <RichTextEditor
            label={
              <span>
                Description <span className="text-brand-primary">*</span>
              </span>
            }
            value={form.description}
            onChange={(html) => setForm((current) => ({ ...current, description: html }))}
            placeholder="Describe the event…"
            minHeight="12rem"
          />
          <FieldError errors={fieldIssues} field="description" />

          <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-[#e3221c]"
            />
            Published (visible on the site)
          </label>

          <FieldError errors={fieldIssues} field="isPublished" />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !form.date || form.description.trim().length === 0}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {editing === "new" ? "Add event" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* The list */}
      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading events…</span>
        </div>
      ) : loadError !== null ? (
        <div className="space-y-4">
          <ErrorLine error={loadError} />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
          >
            <RefreshCw size={13} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : events.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-6">
          No events yet — put the first date on the calendar.
        </p>
      ) : (
        <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
          {events.map((event) => (
            <li key={event.id} className="py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-cream-200 shrink-0">
                {event.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL
                  <img
                    src={event.imageUrl}
                    alt={event.imageAlt || event.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
                    <CalendarDays size={18} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-ink-900 truncate">
                  {event.title}
                </p>
                <p className="font-sans text-xs text-ink-500">
                  {formatLongDate(event.date)}
                  {event.venue ? ` · ${event.venue}` : ""}
                  {event.category ? ` · ${event.category}` : ""}
                  {!event.isPublished && (
                    <span className="ml-2 text-brand-primary font-semibold">Draft</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openRegistration(event)}
                aria-label={`Registration form and responses for ${event.title}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors shrink-0"
              >
                <Users size={13} aria-hidden="true" />
                Responses ({event.registrationCount ?? 0})
              </button>
              <button
                type="button"
                onClick={() => startEdit(event)}
                aria-label={`Edit ${event.title}`}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(event)}
                aria-label={`Delete ${event.title}`}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
