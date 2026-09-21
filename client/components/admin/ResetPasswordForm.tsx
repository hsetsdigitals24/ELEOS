"use client";

// components/admin/ResetPasswordForm.tsx — the landing page for the emailed
// reset link. Reads the ?token= query parameter (the parent page wraps this
// component in <Suspense> per the Next.js useSearchParams contract).

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const fieldClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-3.5 py-2.5 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

const labelClasses =
  "block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-1.5";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.isOffline) {
        setError("The admin service is unreachable.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.message);
      } else if (err instanceof ApiError && err.issues && err.issues.length > 0) {
        setError(err.issues.map((issue) => issue.message).join(" · "));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="max-w-md mx-auto py-16">
      <div className="border border-ink-900/12 bg-white rounded-md p-8 space-y-6">
        <div className="text-center">
          <span className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-primary mx-auto mb-5">
            <KeyRound size={22} aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl text-ink-900">Choose a new password</h1>
          <p className="mt-2 font-sans text-sm text-ink-500 leading-relaxed">
            At least 8 characters, with at least one letter and one number.
          </p>
        </div>
        {children}
      </div>
    </div>
  );

  if (!token) {
    return shell(
      <div className="space-y-6">
        <p className="flex items-start gap-2 font-sans text-sm text-brand-primary">
          <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          This link is missing its token. Use the reset link from your email, or
          request a new one.
        </p>
        <p className="text-center">
          <Link
            href="/admin/forgot-password"
            className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
          >
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return shell(
      <div className="space-y-6">
        <p className="flex items-start gap-2 font-sans text-sm text-green-700">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          Your password has been updated. Sign in with the new password.
        </p>
        <p className="text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
          >
            Go to sign in
          </Link>
        </p>
      </div>
    );
  }

  return shell(
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className={labelClasses}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClasses}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className={labelClasses}>
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={fieldClasses}
        />
      </div>

      {error && (
        <p className="flex items-start gap-2 font-sans text-sm text-brand-primary">
          <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        Save new password
      </button>
    </form>
  );
}
