// lib/freshness.ts — how recent content must be to earn a place on the homepage.
//
// The homepage advertises "latest" content, so anything it shows has to be
// recent or it misrepresents the organisation. The rule lives here once, and
// the components hand the resulting boundary to the API as a `since` query
// parameter — filtering after the fetch would leave a card empty whenever the
// single newest row happened to be stale, even with fresh rows further down.

/** Months of age after which content is too old for the homepage. */
export const HOME_FRESH_MONTHS = 6;

/**
 * The ISO instant `months` before now — the API's `since` boundary.
 *
 * Calendar months rather than a day count, since the rule is stated in months.
 * Note this reads the visitor's clock: a badly-set device shifts the window.
 * Acceptable for a presentation rule on a client-rendered page, and it keeps
 * the API a general data API with no editorial policy baked in.
 */
export function recentSinceIso(months = HOME_FRESH_MONTHS, now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  return cutoff.toISOString();
}
