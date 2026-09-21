"use client";

// components/admin/ForgotPasswordForm.tsx — requests the password-reset
// email. The response is always generic, so this shows the same
// "check your inbox" confirmation either way.

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, MailQuestion } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const fieldClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-3.5 py-2.5 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

const labelClasses =
  "block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-1.5";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.isOffline
          ? "The admin service is unreachable."
          : "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="border border-ink-900/12 bg-white rounded-md p-8 space-y-6">
        <div className="text-center">
          <span className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-primary mx-auto mb-5">
            <MailQuestion size={22} aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl text-ink-900">Reset your password</h1>
          <p className="mt-2 font-sans text-sm text-ink-500 leading-relaxed">
            Enter the email of your admin account and we&rsquo;ll send you a single-use
            link to choose a new password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <p className="flex items-start gap-2 font-sans text-sm text-green-700">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
              If an account exists for that email, a reset link has been sent. It
              expires in 15 minutes.
            </p>
            <p className="text-center">
              <Link
                href="/admin"
                className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className={labelClasses}>
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {sending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              Send reset link
            </button>

            <p className="text-center">
              <Link
                href="/admin"
                className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
