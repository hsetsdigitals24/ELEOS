// types/blog.ts — content shape definitions for the blog.
// Hardcoded data for now (see components/blog/blogData.ts); structured so
// it's trivial to swap for API-fetched data when the headless CMS lands.

/** Editorial blocks an article body is composed of. */
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; title?: string; items: string[] }
  | {
      type: "data";
      title: string;
      intro?: string;
      rows: { label: string; value: string }[];
    };

/** A comment imported from the previous WordPress site (archived, read-only). */
export interface ArchivedComment {
  authorName: string;
  body: string;
  /** ISO date string */
  postedAt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Short standfirst / dek shown on cards and at the top of the article. */
  excerpt: string;
  author: string;
  /** ISO date string */
  publishedAt: string;
  /** ISO date string, shown as "Updated …" when present */
  updatedAt?: string;
  categories: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  content: ArticleBlock[];
  /** Comments carried over from the previous site — shown until the API has live data. */
  archivedComments: ArchivedComment[];
}

/* ------------------------------------------------------------------ */
/* API-fetched posts                                                   */
/* ------------------------------------------------------------------ */

/** Who a post is published under — ELEOS itself or its media subsidiary. */
export type PostBrand = "eleos" | "his-story-tellers";

/** Post shape returned by the API (the database is the source of truth). */
export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  brand: PostBrand;
  excerpt: string;
  author: string;
  /** ISO date string */
  publishedAt: string;
  /** ISO date string */
  updatedAt: string;
  categories: string[];
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  /** Rich-text article body (sanitized HTML from the admin editor). */
  contentHtml: string;
  archivedComments: ArchivedComment[];
  isPublished: boolean;
}

export interface BlogPostsPage {
  items: BlogPostItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Payload for creating/updating a post from the admin console. */
export interface BlogPostInput {
  title: string;
  brand: PostBrand;
  excerpt?: string;
  author?: string;
  categories?: string[];
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  contentHtml: string;
  isPublished?: boolean;
  /** ISO date string — omitted means "now". */
  publishedAt?: string;
  slug?: string;
}
