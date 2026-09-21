// components/admin/consoleShared.tsx — the small building blocks shared by
// the admin console and its tabs (form styling + status/error lines).
//
// Error copy is deliberately written here rather than echoed from the API.
// The admin needs to know that the form they filled in is invalid and which
// field to look at — not which driver threw, which route they hit, or which
// internal field name failed. `describeError` is the one place that decides
// how a failure is worded, so no call site can leak a raw backend message by
// accident, and `FieldError` renders the server's curated per-field messages
// under the inputs they belong to.

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";

export const fieldClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-3.5 py-2.5 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

export const labelClasses =
  "block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-1.5";

/* ------------------------------------------------------------------ */
/* Error wording                                                       */
/* ------------------------------------------------------------------ */

/**
 * The admin-facing field names, keyed by the request-body path the server
 * sends back. Without this the banner would say `contentHtml: …` — the key
 * in our validator, not the label on the admin's screen.
 */
const FIELD_LABELS: Record<string, string> = {
  // Posts & videos
  title: "Title",
  brand: "Published under",
  excerpt: "Excerpt",
  author: "Author",
  categories: "Categories",
  tags: "Tags",
  slug: "Slug",
  contentHtml: "Article",
  archivedComments: "Archived comments",
  isPublished: "Published",
  publishedAt: "Publish date",
  imageUrl: "Main image URL",
  imageAlt: "Image alt text",
  // Videos
  youtubeUrl: "YouTube URL",
  youtubeId: "YouTube link",
  thumbnailUrl: "Thumbnail image URL",
  thumbnailAlt: "Thumbnail alt text",
  description: "Description",
  duration: "Duration",
  category: "Category",
  // Events
  date: "Event date",
  time: "Time",
  venue: "Venue",
  city: "City",
  // Products
  name: "Name",
  price: "Price",
  currency: "Currency",
  selarUrl: "Selar product URL",
  inStock: "In stock",
  // Admin users & roles
  email: "Email",
  password: "Password",
  roleId: "Role",
  isActive: "Active",
  permissions: "Permissions",
  // Event registration form builder
  fields: "Form fields",
  key: "Field key",
  label: "Label",
  type: "Field type",
  placeholder: "Placeholder",
  helpText: "Help text",
  required: "Required",
  options: "Choices",
  isOpen: "Registration open",
  intro: "Intro",
  successMessage: "Success message",
  answers: "Answers",
};

/** `someFieldName` → `Some field name`, for anything not in the map above. */
function humanise(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Turns a request-body path into the label the admin sees. Handles the
 * registration builder's indexed paths — `fields.2.label` reads as
 * "Question 3 — Label" rather than a raw path.
 */
export function fieldLabel(path: string): string {
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) return "";

  const [head, second, ...rest] = segments;
  if (head === "fields" && second !== undefined && /^\d+$/.test(second)) {
    const question = `Question ${Number(second) + 1}`;
    const tail = rest.length > 0 ? rest : [];
    if (tail.length === 0) return question;
    return `${question} — ${tail.map((part) => FIELD_LABELS[part] ?? humanise(part)).join(" ")}`;
  }

  const last = segments[segments.length - 1]!;
  return FIELD_LABELS[last] ?? humanise(last);
}

/**
 * The one-line summary shown for a failed call.
 *
 * Keyed off the status, never off the server's `message`: an unexpected 500
 * would otherwise print a driver error, and a 404 would echo the route. The
 * wording tells the admin what to do next, which is the only thing they can
 * act on.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.isOffline) {
    return "The admin service is unreachable. Check your connection and try again.";
  }

  switch (error.status) {
    case 400:
      return "Some of the details you entered aren't valid. Please check and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "That item no longer exists — it may have been deleted.";
    case 409:
      return "A record with these details already exists.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return error.status >= 500
        ? "The server ran into a problem. Please try again."
        : "Something went wrong. Please try again.";
  }
}

/** The server's per-field messages, keyed by request-body path. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.issues) return {};

  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    // An empty path means the problem is with the submission as a whole, not
    // one input — those belong in the summary banner, not under a field.
    if (issue.field && map[issue.field] === undefined) {
      map[issue.field] = issue.message;
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */

export function StatusLine({
  kind,
  children,
}: {
  kind: "ok" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`flex items-start gap-2 font-sans text-sm ${
        kind === "ok" ? "text-green-700" : "text-brand-primary"
      }`}
    >
      {kind === "ok" ? (
        <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
      )}
      {children}
    </p>
  );
}

/**
 * The banner at the top of a form that failed to submit. Names what failed
 * and points the admin at the highlighted fields; the specific problems are
 * rendered under each input by `FieldError`, so they are not repeated here.
 * Problems raised against the whole submission (which have no field to sit
 * under) are the exception — those are listed.
 */
export function ErrorSummary({
  error,
  what = "save your changes",
}: {
  error: unknown;
  /** Completes the sentence "We couldn't …" — e.g. "save this post". */
  what?: string;
}) {
  const issues = error instanceof ApiError ? error.issues ?? [] : [];
  const formLevel = issues.filter((issue) => !issue.field);
  const hasFieldIssues = issues.some((issue) => issue.field);

  const headline = hasFieldIssues
    ? `We couldn't ${what}. Please check the highlighted fields and try again.`
    : describeError(error);

  return (
    <div className="border border-brand-primary/40 bg-brand-50 rounded-md px-4 py-3.5 space-y-2">
      <p className="flex items-start gap-2 font-sans text-sm text-brand-primary font-semibold">
        <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
        {headline}
      </p>
      {formLevel.length > 0 && (
        <ul className="ml-6 list-disc space-y-1 font-sans text-xs text-ink-700">
          {formLevel.map((issue, index) => (
            <li key={`${issue.message}-${index}`}>{issue.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One field's message, rendered directly under its input. Pass the same map
 * to every field in a form: `const errors = fieldErrors(saveError)`.
 */
export function FieldError({
  errors,
  field,
}: {
  errors: Record<string, string>;
  field: string;
}) {
  const message = errors[field];
  if (!message) return null;

  return (
    <p className="mt-1.5 flex items-start gap-1.5 font-sans text-xs text-brand-primary">
      <AlertCircle size={13} className="shrink-0 mt-px" aria-hidden="true" />
      {message}
    </p>
  );
}

/**
 * A failed call with no form to annotate — a load, a delete, an action.
 * Renders the same vetted wording as everything else.
 */
export function ErrorLine({ error }: { error: unknown }) {
  return <StatusLine kind="error">{describeError(error)}</StatusLine>;
}
