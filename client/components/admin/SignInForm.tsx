"use client";

// components/admin/SignInForm.tsx — the admin sign-in card. Replaces the old
// shared-key unlock: real identities, real passwords, cookie sessions.

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthSession } from "@/types/admin";

const fieldClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-3.5 py-2.5 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

const labelClasses =
  "block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-1.5";

export default function SignInForm({
  onSignedIn,
  notice,
}: {
  onSignedIn: (session: AuthSession) => void;
  /**
   * Why the admin is looking at this form when they didn't ask to be — e.g.
   * an expired session. Rendered above the fields so the redirect explains
   * itself even after the banner that announced it has gone.
   */
  notice?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    try {
      const session = await login({ email: email.trim(), password });
      onSignedIn(session);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message);
      } else if (err instanceof ApiError && err.isOffline) {
        setError("The admin service is unreachable.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="border border-ink-900/12 bg-white rounded-md p-8 space-y-6">
        <div className="text-center">
          <span className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-primary mx-auto mb-5">
            <Lock size={22} aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl text-ink-900">Admin Console</h1>
          <p className="mt-2 font-sans text-sm text-ink-500 leading-relaxed">
            Sign in with your admin account to manage broadcasts, products, messages,
            roles and users.
          </p>
        </div>

        {notice && (
          <p
            role="status"
            className="flex items-start gap-2 font-sans text-sm text-brand-primary bg-brand-50 border border-brand-primary/30 rounded-sm px-3.5 py-3"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className={labelClasses}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={labelClasses}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={signingIn}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
          >
            {signingIn && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            Sign in
          </button>
        </form>

        <p className="text-center">
          <Link
            href="/admin/forgot-password"
            className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
