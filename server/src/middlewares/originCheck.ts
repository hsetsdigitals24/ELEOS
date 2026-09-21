import type { RequestHandler } from "express";
import { config } from "../config/env.ts";
import { AppError } from "../utils/AppError.ts";

/**
 * originCheck — CSRF hardening for cookie-authenticated mutations. Browsers
 * attach cookies automatically, so a malicious site could fire a state-
 * changing request at the API. The SameSite cookie attributes already block
 * the important cases; this middleware additionally rejects any mutating
 * request that carries an Origin (or Referer) we didn't allow.
 *
 * Requests without either header (curl, server-to-server) pass through —
 * they carry no ambient cookie authority a CSRF attacker could leverage.
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const originCheck: RequestHandler = (req, _res, next) => {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  // "*" (dev default) allows every origin.
  if (config.corsOrigins.includes("*")) {
    next();
    return;
  }

  const origin = req.header("origin") ?? req.header("referer");
  if (!origin) {
    next();
    return;
  }

  // Normalize to scheme://host so a full Referer URL compares cleanly and a
  // prefix like "http://localhost:3000.evil.com" can never match.
  let originKey = origin;
  try {
    const parsed = new URL(origin);
    originKey = `${parsed.protocol}//${parsed.host}`;
  } catch {
    // Malformed header — treat as a mismatch.
    next(new AppError("Request not allowed from this origin", 403));
    return;
  }

  if (!config.corsOrigins.includes(originKey)) {
    next(new AppError("Request not allowed from this origin", 403));
    return;
  }

  next();
};
