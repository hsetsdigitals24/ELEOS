// lib/api/server.ts — server-side fetch helper for React Server Components.
//
// Client components go through lib/api/client.ts (relative /api/v1, riding
// the Next.js rewrite); server components cannot fetch relatively, so this
// helper targets the Express backend directly with an absolute URL from the
// same VITE_API_BASE_URL variable the rewrite uses. It unwraps the standard
// envelope and returns null on any failure so pages can fall back to their
// static content instead of erroring.

const API_BASE = process.env.VITE_API_BASE_URL ?? "http://localhost:9000";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ServerRequestOptions {
  /**
   * Seconds this response may be reused before Next.js refetches it in the
   * background. Omit it for content that should be fetched once and kept —
   * anything presented as "latest" wants a value here.
   */
  revalidate?: number;
}

/** Fetches a /api/v1 path from the backend; null when unreachable or failed. */
export async function serverRequest<T>(
  path: string,
  options: ServerRequestOptions = {}
): Promise<T | null> {
  const { revalidate } = options;
  try {
    const response = await fetch(`${API_BASE}/api/v1${path}`, {
      // Passing `next.revalidate` is what makes this a cached-but-refreshing
      // fetch. Without a cache option Next.js fetches once at build time and
      // bakes the result in permanently, so a component that renders "latest"
      // content would still be showing whatever was newest on deploy day.
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
    if (!response.ok) return null;
    const envelope = (await response.json()) as ApiEnvelope<T>;
    return envelope.success && envelope.data !== undefined ? envelope.data : null;
  } catch {
    return null;
  }
}
