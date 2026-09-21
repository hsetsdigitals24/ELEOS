"use client";

// components/comments/CommentsSection.tsx — the comment system's frontend.
//
// Works against the Express/MongoDB comments API (POST + GET /api/v1/comments)
// and degrades gracefully when the API isn't running. The archived comments
// migrated from the previous site (stored on the post, passed in as props)
// always display beneath any live comments; a failed submit shows an honest
// error instead of faking a posted comment.
//
// Used by both blog articles (targetType="blog") and video pages
// (targetType="video") — the backend keys comments on (targetType, targetId).

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { ApiError, fetchComments, postComment } from "@/lib/api/comments";
import { formatCommentDate } from "@/lib/formatDate";
import type { CommentItem, CommentTargetType } from "@/types/comment";
import type { ArchivedComment } from "@/types/blog";

interface CommentsSectionProps {
  targetType: CommentTargetType;
  /** Slug of the blog post or video the comments attach to. */
  targetId: string;
  /** Comments migrated from the previous site, shown until live data loads. */
  archivedComments?: ArchivedComment[];
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string; issues?: { field: string; message: string }[] };

/** Displayed comment shape — live API comments or archived ones unified. */
interface DisplayComment {
  key: string;
  authorName: string;
  body: string;
  createdAt: string;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar with the commenter's initials — no external avatar service. */
function CommentAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 w-10 h-10 rounded-full bg-brand-primary text-cream-50 flex items-center justify-center font-sans font-semibold text-sm tracking-wide"
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

function CommentList({ comments }: { comments: DisplayComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="font-sans text-sm text-ink-500 py-6 border-t border-ink-900/10">
        No comments yet — be the first to respond.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-ink-900/10">
      {comments.map((comment) => (
        <li key={comment.key} className="py-6 flex gap-4">
          <CommentAvatar name={comment.authorName} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-sans font-semibold text-sm text-ink-900">
                {comment.authorName}
              </span>
              <time
                dateTime={comment.createdAt}
                className="font-sans text-xs text-ink-500 uppercase tracking-wide"
              >
                {formatCommentDate(comment.createdAt)}
              </time>
            </div>
            <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-ink-700 whitespace-pre-line">
              {comment.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function CommentsSection({
  targetType,
  targetId,
  archivedComments = [],
}: CommentsSectionProps) {
  // Live comments from the API. `null` until the first (successful or
  // failed) load resolves — until then the archived comments show.
  const [liveComments, setLiveComments] = useState<CommentItem[] | null>(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [form, setForm] = useState({ authorName: "", authorEmail: "", body: "" });
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    fetchComments({ targetType, targetId, limit: 50 })
      .then((page) => {
        if (cancelled) return;
        setLiveComments(page.items);
        setApiOnline(true);
      })
      .catch(() => {
        // API unreachable (dev without backend, or an outage) — fall back
        // to the archived comments from the previous site.
        if (!cancelled) setApiOnline(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  const displayed: DisplayComment[] = useMemo(() => {
    // Comments migrated from the previous site — always shown, newest of
    // them last (they predate every live comment).
    const archived = archivedComments.map((comment: ArchivedComment, index) => ({
      key: `archived-${index}`,
      authorName: comment.authorName,
      body: comment.body,
      createdAt: comment.postedAt,
    }));
    // Live comments from the API (newest first). Array.isArray guards
    // against a malformed response and covers the `null` state before the
    // first load resolves — until then only the archived comments show.
    const live = Array.isArray(liveComments)
      ? liveComments.map((comment) => ({
          key: comment.id,
          authorName: comment.authorName,
          body: comment.body,
          createdAt: comment.createdAt,
        }))
      : [];
    return [...live, ...archived];
  }, [liveComments, archivedComments]);

  const setField = useCallback((field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitState.kind === "submitting") return;

      // Client-side mirror of the API's validation rules.
      const issues: { field: string; message: string }[] = [];
      if (form.authorName.trim().length < 2) {
        issues.push({ field: "authorName", message: "Name must be at least 2 characters" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.authorEmail.trim())) {
        issues.push({ field: "authorEmail", message: "A valid email address is required" });
      }
      if (form.body.trim().length < 2) {
        issues.push({ field: "body", message: "Comment must be at least 2 characters" });
      }
      if (issues.length > 0) {
        setSubmitState({ kind: "error", message: "Please fix the fields below.", issues });
        return;
      }

      setSubmitState({ kind: "submitting" });
      try {
        const created = await postComment({
          targetType,
          targetId,
          authorName: form.authorName.trim(),
          authorEmail: form.authorEmail.trim(),
          body: form.body.trim(),
        });
        setLiveComments((prev) => [created, ...(prev ?? [])]);
        setApiOnline(true);
        setForm({ authorName: "", authorEmail: "", body: "" });
        setSubmitState({ kind: "success" });
      } catch (err) {
        const apiError = err instanceof ApiError ? err : null;
        setSubmitState({
          kind: "error",
          message: apiError?.isOffline
            ? "The comment service is currently unreachable — your comment was not posted. Please try again later."
            : (apiError?.message ?? "Something went wrong. Please try again."),
          issues: apiError?.issues,
        });
      }
    },
    [form, submitState.kind, targetType, targetId]
  );

  const fieldIssue = (field: string) =>
    submitState.kind === "error" ? submitState.issues?.find((issue) => issue.field === field) : undefined;

  return (
    <section aria-label="Comments" className="mt-20 border-t-4 border-double border-ink-900/20 pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <h2 className="font-display text-2xl sm:text-3xl text-ink-900 flex items-center gap-3">
          <MessageSquare size={22} className="text-brand-primary" aria-hidden="true" />
          {displayed.length} {displayed.length === 1 ? "Response" : "Responses"}
        </h2>
        {!apiOnline && (
          <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink-500">
            Live comments unavailable — showing archived only
          </span>
        )}
      </div>

      <CommentList comments={displayed} />

      {/* Form */}
      <div className="mt-10 bg-white text-ink-950 p-6 sm:p-10 border border-ink-900/10 rounded-md">
        <h3 className="font-display text-xl sm:text-2xl">Leave a Reply</h3>
        <p className="font-sans text-sm text-ink-500 mt-2 mb-8">
          Your email address will not be published.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor={`${targetId}-comment-name`}
                className="block font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-700 mb-2"
              >
                Name <span className="text-brand-primary">*</span>
              </label>
              <input
                id={`${targetId}-comment-name`}
                type="text"
                autoComplete="name"
                value={form.authorName}
                onChange={(e) => setField("authorName", e.target.value)}
                maxLength={80}
                required
                className="w-full bg-cream-50 border border-ink-900/15 rounded-md px-4 py-3 font-sans text-sm text-ink-950 placeholder:text-ink-500/50 outline-none transition-colors duration-300 focus:border-brand-primary"
                placeholder="Your name"
              />
              {fieldIssue("authorName") && (
                <p className="mt-1.5 font-sans text-xs text-brand-primary">
                  {fieldIssue("authorName")?.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={`${targetId}-comment-email`}
                className="block font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-700 mb-2"
              >
                Email <span className="text-brand-primary">*</span>
              </label>
              <input
                id={`${targetId}-comment-email`}
                type="email"
                autoComplete="email"
                value={form.authorEmail}
                onChange={(e) => setField("authorEmail", e.target.value)}
                maxLength={254}
                required
                className="w-full bg-cream-50 border border-ink-900/15 rounded-md px-4 py-3 font-sans text-sm text-ink-950 placeholder:text-ink-500/50 outline-none transition-colors duration-300 focus:border-brand-primary"
                placeholder="you@example.com"
              />
              {fieldIssue("authorEmail") && (
                <p className="mt-1.5 font-sans text-xs text-brand-primary">
                  {fieldIssue("authorEmail")?.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${targetId}-comment-body`}
              className="block font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-700 mb-2"
            >
              Comment <span className="text-brand-primary">*</span>
            </label>
            <textarea
              id={`${targetId}-comment-body`}
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              maxLength={2000}
              rows={5}
              required
              className="w-full bg-cream-50 border border-ink-900/15 rounded-md px-4 py-3 font-sans text-sm text-ink-950 placeholder:text-ink-500/50 outline-none transition-colors duration-300 focus:border-brand-primary resize-y"
              placeholder="Share your thoughts…"
            />
            <div className="flex justify-between mt-1.5">
              {fieldIssue("body") ? (
                <p className="font-sans text-xs text-brand-primary">{fieldIssue("body")?.message}</p>
              ) : (
                <span />
              )}
              <span className="font-sans text-xs text-ink-500">{form.body.length}/2000</span>
            </div>
          </div>

          {/* Status messages */}
          {submitState.kind === "success" && (
            <p className="flex items-center gap-2 font-sans text-sm text-brand-primary" role="status">
              <CheckCircle2 size={16} aria-hidden="true" />
              Your comment has been posted.
            </p>
          )}
          {submitState.kind === "error" && (
            <p className="flex items-start gap-2 font-sans text-sm text-brand-primary" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {submitState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitState.kind === "submitting"}
            className="inline-flex items-center justify-center gap-3 bg-brand-primary text-cream-50 px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <span>{submitState.kind === "submitting" ? "Posting…" : "Post Comment"}</span>
            <Send
              size={14}
              className={submitState.kind === "submitting" ? "animate-pulse" : ""}
              aria-hidden="true"
            />
          </button>
        </form>
      </div>
    </section>
  );
}
