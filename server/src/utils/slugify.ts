/**
 * slugify — converts arbitrary text (post titles, names, …) into a
 * URL-safe slug. Shared utility so every module slugs identically.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop non-alphanumerics
    .replace(/[\s_-]+/g, "-") // collapse whitespace/underscores to a single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}
