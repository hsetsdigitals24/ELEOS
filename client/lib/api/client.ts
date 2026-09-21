// lib/api/client.ts — shared plumbing for every typed API client.
//
// The Express backend (server/) serves /api/v1. In development the Next.js
// rewrite in next.config.ts proxies /api/v1/* to it (set VITE_API_BASE_URL);
// in production the same path is handled by the deployment's proxy rules.
// Admin sessions live in httpOnly cookies, so requests are same-origin and
// cookies ride along automatically — no token handling in JavaScript.
//
// When the API is unreachable every call rejects with an ApiError (status 0)
// so the UI can degrade gracefully instead of breaking. A 401 from an expired
// access token triggers one silent refresh + retry before the error surfaces.

const API_BASE = "/api/v1";

/** Standardized envelope used by every backend response. */
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiFieldIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  /** HTTP status; 0 means the API was unreachable (network failure). */
  public readonly status: number;
  public readonly issues?: ApiFieldIssue[];

  constructor(message: string, status: number, issues?: ApiFieldIssue[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }

  /** True when the API itself couldn't be reached (offline / not running). */
  public get isOffline(): boolean {
    return this.status === 0;
  }
}

export interface RequestOptions extends RequestInit {
  /** Used in offline error messages, e.g. "comment service". */
  serviceName?: string;
}

/** Paths that must never trigger the automatic refresh-and-retry. */
const NO_RETRY_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

/* ------------------------------------------------------------------ */
/* Session-expiry notifications                                        */
/* ------------------------------------------------------------------ */

type SessionExpiredHandler = () => void;

const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

/**
 * Registers a listener for the moment the session dies while the admin is
 * still working — the refresh token expired, was revoked, or the account was
 * deactivated. Returns an unsubscribe function.
 *
 * This lives here because `request` is the single funnel every API call
 * passes through, so it can see the session die no matter which tab the
 * admin happened to be on.
 */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandlers.add(handler);
  return () => {
    sessionExpiredHandlers.delete(handler);
  };
}

function notifySessionExpired(): void {
  // Copied first: a handler may unsubscribe while we're iterating.
  for (const handler of [...sessionExpiredHandlers]) {
    handler();
  }
}

async function rawRequest(path: string, init: RequestOptions): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // fetch only throws TypeError on network failure — the API is unreachable.
    if (err instanceof TypeError) {
      throw new ApiError(`The ${init.serviceName} is unreachable.`, 0);
    }
    throw new ApiError("Something went wrong. Please try again.", 0);
  }
}

/**
 * Performs a request and unwraps the envelope. An expired session (401) is
 * retried once after a silent token refresh, so a short-lived access token
 * never interrupts the admin mid-task.
 */
export async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { serviceName = "service", ...rest } = init ?? {};

  let response = await rawRequest(path, { ...rest, serviceName });

  if (
    response.status === 401 &&
    !NO_RETRY_PATHS.some((noRetry) => path.startsWith(noRetry))
  ) {
    // Rotate the cookies, then replay the original request exactly once.
    const refreshed = await rawRequest("/auth/refresh", {
      method: "POST",
      serviceName: "auth service",
    });
    if (refreshed.ok) {
      response = await rawRequest(path, { ...rest, serviceName });
    }
  }

  // A 401 that survived the refresh means the session is genuinely gone, and
  // the admin should be sent back to sign-in rather than left staring at a
  // failed panel. `/auth/*` is deliberately excluded: a 401 from `/auth/me`
  // on a cold load only means "not signed in yet" (the console already shows
  // the sign-in form), one from `/auth/login` means bad credentials and
  // belongs inline on that form, and one from `/auth/change-password` means
  // the current password was wrong — none of those are an expired session.
  if (response.status === 401 && !path.startsWith("/auth/")) {
    notifySessionExpired();
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (e.g. a proxy error page) — treat as offline.
    throw new ApiError(`The ${serviceName} returned an invalid response.`, 0);
  }

  if (!response.ok || !envelope.success) {
    const issues = (envelope as { error?: { issues?: ApiFieldIssue[] } }).error?.issues;
    throw new ApiError(envelope.message ?? "Request failed.", response.status, issues);
  }

  // Success envelopes always carry data; the cast keeps the promise type honest.
  return envelope.data as T;
}
