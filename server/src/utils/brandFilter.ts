import type { PostBrand } from "../types/index.ts";

/**
 * Builds the brand cut for a public listing (posts and videos alike).
 *
 * `eleos` deliberately means "not the subsidiary" rather than an equality
 * match. Documents written before the brand field existed carry no `brand`
 * key at all, and MongoDB's `{ brand: "eleos" }` does not match a missing
 * field — so an equality filter would silently return nothing and empty any
 * listing asking for ELEOS content. A missing brand already reads as ELEOS
 * everywhere else (see `toPostItem` and `toVideoItem`), and `$ne` matches
 * that reading.
 *
 * `his-story-tellers` keeps a plain equality match: nothing is ever
 * implicitly the subsidiary.
 */
export function brandFilter(brand: PostBrand | undefined): Record<string, unknown> {
  if (brand === undefined) return {};
  return brand === "eleos" ? { brand: { $ne: "his-story-tellers" } } : { brand };
}
