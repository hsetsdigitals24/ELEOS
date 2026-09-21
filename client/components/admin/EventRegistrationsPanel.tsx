"use client";

// components/admin/EventRegistrationsPanel.tsx — one event's registrations.
//
// The whole point of this panel is that responses can never be read against
// the wrong event: it is only ever mounted for one event, it says which event
// it is showing, and every request it makes is scoped to that event's id.
//
// Columns come from the event's *current* form, so the table reads like the
// form the admin built. Answers to fields that have since been deleted are
// not lost — they still live in the stored snapshot and appear when a row is
// expanded under their original label.

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Download,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  deleteRegistration,
  fetchEventRegistrations,
  markRegistrationReviewed,
} from "@/lib/api/admin";
import { nameFieldOf, emailFieldOf } from "@/lib/registration";
import { formatLongDate } from "@/lib/formatDate";
import type { EventItemApi } from "@/types/event";
import type {
  EventRegistrationForm,
  EventRegistrationItem,
  RegistrationsPagination,
} from "@/types/registration";
import { ErrorLine, StatusLine } from "./consoleShared";

const PAGE_SIZE = 100;

/** A column in the table — and therefore a column in the CSV. */
interface Column {
  key: string;
  heading: string;
  /** Resolves one registration's cell value. */
  value: (item: EventRegistrationItem) => string;
}

interface EventRegistrationsPanelProps {
  event: EventItemApi;
  /** The event's form, used for column headings. Null while it loads. */
  form: EventRegistrationForm | null;
  /**
   * Reports this event's live response total, so the tab label above can't
   * keep claiming a count that deleting a row just made untrue.
   */
  onCountChange?: (total: number) => void;
}

/** An answer's value by field key, or "". */
function answerValue(item: EventRegistrationItem, key: string): string {
  return item.answers.find((answer) => answer.key === key)?.value ?? "";
}

/** Wraps a value for CSV: quoted, with internal quotes doubled. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * The filter lives in this thin wrapper so flipping it remounts the list
 * below: a fresh mount starts in its loading state and fetches the filtered
 * page, which keeps the switch a single state change rather than a fetch
 * triggered out of an effect.
 */
export default function EventRegistrationsPanel({
  event,
  form,
  onCountChange,
}: EventRegistrationsPanelProps) {
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);

  return (
    <RegistrationsList
      key={unreviewedOnly ? "new-only" : "all"}
      event={event}
      form={form}
      onCountChange={onCountChange}
      unreviewedOnly={unreviewedOnly}
      onToggleFilter={() => setUnreviewedOnly((only) => !only)}
    />
  );
}

interface RegistrationsListProps extends EventRegistrationsPanelProps {
  unreviewedOnly: boolean;
  onToggleFilter: () => void;
}

function RegistrationsList({
  event,
  form,
  onCountChange,
  unreviewedOnly,
  onToggleFilter,
}: RegistrationsListProps) {
  const [items, setItems] = useState<EventRegistrationItem[]>([]);
  const [pagination, setPagination] = useState<RegistrationsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  /** Ids mid-flight, so one row's spinner doesn't freeze the whole table. */
  const [busy, setBusy] = useState<Set<string>>(new Set());

  // `loading` starts true and is only lowered when a fetch settles — the
  // effect below must not set state synchronously. Anything that raises a
  // spinner again (reload, load more) is an event handler, so it may.
  const load = useCallback(
    (page: number) => {
      fetchEventRegistrations({
        event: event.id,
        unreviewed: unreviewedOnly,
        page,
        limit: PAGE_SIZE,
      })
        .then((result) => {
          setItems((prev) => (page === 1 ? result.items : [...prev, ...result.items]));
          setPagination(result.pagination);
          // Only the unfiltered total describes the event — under the
          // unreviewed filter it counts a subset.
          if (!unreviewedOnly) onCountChange?.(result.pagination.total);
          setLoadError(null);
        })
        .catch((err: unknown) => setLoadError(err))
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [event.id, unreviewedOnly, onCountChange]
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const refresh = () => {
    setLoading(true);
    load(1);
  };

  const loadMore = () => {
    setLoadingMore(true);
    load((pagination?.page ?? 1) + 1);
  };

  const setRowBusy = (id: string, isBusy: boolean) => {
    setBusy((prev) => {
      const next = new Set(prev);
      if (isBusy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleReviewed = async (item: EventRegistrationItem) => {
    setActionError(null);
    setRowBusy(item.id, true);
    try {
      await markRegistrationReviewed(item.id, !item.isReviewed);
      // Under the unreviewed filter, marking one reviewed removes it from the
      // list — dropping it here keeps the table honest without a re-fetch.
      if (unreviewedOnly && !item.isReviewed) {
        setItems((prev) => prev.filter((row) => row.id !== item.id));
      } else {
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, isReviewed: !row.isReviewed } : row))
        );
      }
    } catch (err) {
      setActionError(err);
    } finally {
      setRowBusy(item.id, false);
    }
  };

  const remove = async (item: EventRegistrationItem) => {
    const who = item.name || item.email || "this registration";
    if (!window.confirm(`Delete the registration from “${who}”? This can't be undone.`)) return;
    setActionError(null);
    setRowBusy(item.id, true);
    try {
      await deleteRegistration(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      const nextTotal = Math.max(0, (pagination?.total ?? items.length) - 1);
      setPagination((prev) => (prev ? { ...prev, total: nextTotal } : prev));
      if (!unreviewedOnly) onCountChange?.(nextTotal);
    } catch (err) {
      setActionError(err);
    } finally {
      setRowBusy(item.id, false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ---- Columns ---------------------------------------------------- */

  // The identity fields already appear in the row's "who" block, so they'd be
  // printed twice if they were columns too.
  const identityKeys = new Set(
    [nameFieldOf(form ?? EMPTY_FORM)?.key, emailFieldOf(form ?? EMPTY_FORM)?.key].filter(
      (key): key is string => typeof key === "string"
    )
  );

  const columns: Column[] =
    form && form.fields.length > 0
      ? form.fields
          .filter((field) => !identityKeys.has(field.key))
          .map((field) => ({
            key: field.key,
            heading: field.label,
            value: (item) => answerValue(item, field.key),
          }))
      : // No form definition (still loading, or unreachable) — fall back to
        // whatever keys the responses themselves carry, so nothing is hidden.
        unionAnswerColumns(items);

  /* ---- CSV -------------------------------------------------------- */

  const exportCsv = () => {
    const header = ["Name", "Email", "Registered", "Reviewed", ...columns.map((c) => c.heading)];
    const rows = items.map((item) => [
      item.name,
      item.email,
      new Date(item.createdAt).toISOString(),
      item.isReviewed ? "yes" : "no",
      ...columns.map((column) => column.value(item)),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => csvCell(String(cell))).join(","))
      .join("\r\n");

    // A BOM so Excel opens the file as UTF-8 rather than mangling names.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug || "event"}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const unreviewedCount = items.filter((item) => !item.isReviewed).length;
  const total = pagination?.total ?? items.length;
  const hasMore = pagination !== null && items.length < pagination.total;

  /* ---- Render ----------------------------------------------------- */

  return (
    <div className="space-y-5">
      {/* Which event these belong to — the answer to "am I looking at the
          right list?" before any row is read. */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-900/10 pb-4">
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold text-ink-900 truncate">
            {event.title}
          </p>
          <p className="mt-0.5 font-sans text-xs text-ink-500">
            {formatLongDate(event.date)}
            {event.venue ? ` · ${event.venue}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleFilter}
            aria-pressed={unreviewedOnly}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm border transition-colors duration-300 ${
              unreviewedOnly
                ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
            }`}
          >
            {unreviewedOnly ? "Showing new only" : "New only"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm border border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 disabled:opacity-40 disabled:hover:border-ink-900/20 disabled:hover:text-ink-700"
          >
            <Download size={13} aria-hidden="true" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={refresh}
            aria-label="Reload responses"
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="font-sans text-xs text-ink-500">
        {total === 0
          ? "No registrations yet."
          : `${total} registration${total === 1 ? "" : "s"}${
              unreviewedCount > 0 ? ` · ${unreviewedCount} not yet reviewed` : ""
            }`}
      </p>

      {actionError !== null && <ErrorLine error={actionError} />}

      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading registrations…</span>
        </div>
      ) : loadError !== null ? (
        <div className="space-y-4">
          <ErrorLine error={loadError} />
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
          >
            <RefreshCw size={13} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <StatusLine kind="ok">
          {unreviewedOnly
            ? "Everything here has been reviewed."
            : "Nobody has registered for this event yet."}
        </StatusLine>
      ) : (
        <>
          {/* Wide tables scroll inside their own box rather than pushing the
              console sideways. */}
          <div className="overflow-x-auto border border-ink-900/12 rounded-md bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ink-900/12 bg-cream-100">
                  <th scope="col" className="w-8" />
                  <th scope="col" className={headClasses}>
                    Registrant
                  </th>
                  {columns.map((column) => (
                    <th key={column.key} scope="col" className={headClasses}>
                      {column.heading}
                    </th>
                  ))}
                  <th scope="col" className={headClasses}>
                    Registered
                  </th>
                  <th scope="col" className={headClasses}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isOpen = expanded.has(item.id);
                  const isBusy = busy.has(item.id);

                  return (
                    // The row and its answer sheet are siblings in the table
                    // body, so they share one keyed fragment.
                    <Fragment key={item.id}>
                      <tr
                        className={`border-b border-ink-900/8 align-top ${
                          item.isReviewed ? "" : "bg-brand-primary/5"
                        }`}
                      >
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.id)}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Hide full answers" : "Show full answers"}
                            className="w-7 h-7 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary transition-colors"
                          >
                            {isOpen ? (
                              <ChevronUp size={14} aria-hidden="true" />
                            ) : (
                              <ChevronDown size={14} aria-hidden="true" />
                            )}
                          </button>
                        </td>
                        <td className={cellClasses}>
                          <span className="block font-semibold text-ink-900">
                            {item.name || <span className="text-ink-500 font-normal">Unnamed</span>}
                          </span>
                          {item.email && (
                            <span className="block text-ink-500 text-xs">{item.email}</span>
                          )}
                          {!item.isReviewed && (
                            <span className="inline-block mt-1 font-sans text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-brand-primary">
                              New
                            </span>
                          )}
                        </td>
                        {columns.map((column) => {
                          const value = column.value(item);
                          return (
                            <td key={column.key} className={cellClasses}>
                              {value ? (
                                <span className="block max-w-60 truncate" title={value}>
                                  {value}
                                </span>
                              ) : (
                                <span className="text-ink-500/60">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className={cellClasses}>
                          <span className="whitespace-nowrap">
                            {formatLongDate(item.createdAt)}
                          </span>
                        </td>
                        <td className={cellClasses}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void toggleReviewed(item)}
                              disabled={isBusy}
                              aria-label={
                                item.isReviewed ? "Mark as not reviewed" : "Mark as reviewed"
                              }
                              title={item.isReviewed ? "Mark as not reviewed" : "Mark as reviewed"}
                              className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                            >
                              {isBusy ? (
                                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                              ) : item.isReviewed ? (
                                <CheckCircle2 size={14} className="text-green-700" aria-hidden="true" />
                              ) : (
                                <Circle size={14} aria-hidden="true" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => void remove(item)}
                              disabled={isBusy}
                              aria-label="Delete registration"
                              className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="border-b border-ink-900/8 bg-cream-50">
                          <td />
                          <td colSpan={columns.length + 3} className="px-3 pb-5 pt-1">
                            <AnswerSheet item={item} form={form} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold disabled:opacity-60"
            >
              {loadingMore && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              Load {Math.min(PAGE_SIZE, total - items.length)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The expanded row                                                    */
/* ------------------------------------------------------------------ */

const headClasses =
  "text-left font-sans text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-ink-700 px-3 py-2.5 whitespace-nowrap";
const cellClasses = "px-3 py-3 font-sans text-sm text-ink-900";

const EMPTY_FORM: EventRegistrationForm = {
  id: "",
  eventId: "",
  fields: [],
  isOpen: true,
  intro: "",
  successMessage: "",
  updatedAt: "",
};

/** Answer columns inferred from the responses when no form definition exists. */
function unionAnswerColumns(items: EventRegistrationItem[]): Column[] {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const answer of item.answers) {
      if (!seen.has(answer.key)) seen.set(answer.key, answer.label || answer.key);
    }
  }
  return [...seen].map(([key, heading]) => ({
    key,
    heading,
    value: (item) => answerValue(item, key),
  }));
}

/**
 * Everything the registrant submitted, under the labels as they were when
 * they submitted — including fields the admin has since removed from the
 * form, which a column-based table would otherwise silently drop.
 */
function AnswerSheet({
  item,
  form,
}: {
  item: EventRegistrationItem;
  form: EventRegistrationForm | null;
}) {
  const liveKeys = new Set(form?.fields.map((field) => field.key) ?? []);

  if (item.answers.length === 0) {
    return <p className="font-sans text-xs text-ink-500">This registration has no answers.</p>;
  }

  return (
    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
      {item.answers.map((answer) => {
        const retired = form !== null && !liveKeys.has(answer.key);
        return (
          <div key={answer.key}>
            <dt className="font-sans text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-ink-500">
              {answer.label || answer.key}
              {retired && (
                <span className="ml-2 normal-case tracking-normal font-normal italic">
                  (no longer on the form)
                </span>
              )}
            </dt>
            <dd className="mt-1 font-sans text-sm text-ink-900 break-words whitespace-pre-wrap">
              {answer.value || "—"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
