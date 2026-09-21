// lib/api/auth.ts — typed client for the /api/v1/auth endpoints. Sessions
// live in httpOnly cookies set by the server; these helpers only read the
// JSON bodies.

import { request } from "./client";
import type { AuthSession } from "@/types/admin";

/** Signs an admin in. The server sets the access + refresh cookies. */
export async function login(input: { email: string; password: string }): Promise<AuthSession> {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "auth service",
  });
}

/** Signs out. Revokes the refresh token and clears the cookies. */
export async function logout(): Promise<void> {
  await request<unknown>("/auth/logout", {
    method: "POST",
    serviceName: "auth service",
  });
}

/** The current session — restores the console after a page reload. */
export async function fetchSession(): Promise<AuthSession> {
  return request<AuthSession>("/auth/me", {
    serviceName: "auth service",
  });
}

/**
 * Requests a password-reset email. Always resolves — the response is
 * generic whether or not the email belongs to an account.
 */
export async function forgotPassword(email: string): Promise<void> {
  await request<unknown>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    serviceName: "auth service",
  });
}

/** Consumes a reset token (from the emailed link) and sets a new password. */
export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  await request<unknown>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "auth service",
  });
}

/** Changes the signed-in admin's password (invalidates other sessions). */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await request<unknown>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "auth service",
  });
}
