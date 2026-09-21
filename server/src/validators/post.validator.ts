import { z } from "zod";

/**
 * Zod schemas for blog post requests. Schemas live here — controllers and
 * routes never hand-roll validation checks. Each schema parses the request
 * source itself (body / query / params); the `validate` middleware feeds it
 * the matching source.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const httpsUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(2048)
  .regex(/^https:\/\//i, "Must be a secure https:// URL");

const archivedCommentSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(5000),
  postedAt: z.coerce.date(),
});

/**
 * Default-free field shapes. The update schema composes these directly so an
 * absent key stays absent — reusing the create fields would let their Zod
 * `.default()`s fill the key in, silently turning a partial update into an
 * overwrite (e.g. editing only the excerpt would reset brand to "eleos").
 */
const basePostFields = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  brand: z
    .string()
    .trim()
    .refine((value) => value === "eleos" || value === "his-story-tellers", {
      message: "brand must be 'eleos' or 'his-story-tellers'",
    }),
  excerpt: z.string().trim().max(500, "Excerpt must be at most 500 characters"),
  author: z.string().trim().min(1).max(120),
  categories: z.array(z.string().trim().min(1).max(60)).max(10),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  imageUrl: httpsUrl.optional(),
  imageAlt: z.string().trim().max(200, "Image alt must be at most 200 characters"),
  /** Rich-text HTML from the admin editor — sanitized on write in the service. */
  contentHtml: z
    .string()
    .min(1, "The article body cannot be empty")
    .max(200000, "The article body must be at most 200,000 characters"),
  archivedComments: z.array(archivedCommentSchema),
  isPublished: z.boolean(),
  /** Allows backdating posts migrated from the previous site. */
  publishedAt: z.coerce.date().optional(),
};

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)")
  .max(220)
  .optional();

export const createPostSchema = z.object({
  ...basePostFields,
  brand: basePostFields.brand.default("eleos"),
  author: basePostFields.author.default("admin"),
  categories: basePostFields.categories.default([]),
  tags: basePostFields.tags.default([]),
  imageUrl: basePostFields.imageUrl.default(""),
  archivedComments: basePostFields.archivedComments.default([]),
  isPublished: basePostFields.isPublished.default(true),
  /**
   * Optional on create — when omitted, the service slugifies the title.
   * A duplicate slug surfaces as the model's unique-index 409.
   */
  slug: slugField,
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/** Partial update — every field is optional, at least one is required. */
export const updatePostSchema = z
  .object({
    title: basePostFields.title.optional(),
    brand: basePostFields.brand.optional(),
    excerpt: basePostFields.excerpt.optional(),
    author: basePostFields.author.optional(),
    categories: basePostFields.categories.optional(),
    tags: basePostFields.tags.optional(),
    imageUrl: basePostFields.imageUrl,
    imageAlt: basePostFields.imageAlt.optional(),
    contentHtml: basePostFields.contentHtml.optional(),
    archivedComments: basePostFields.archivedComments.optional(),
    isPublished: basePostFields.isPublished.optional(),
    publishedAt: basePostFields.publishedAt,
    slug: slugField,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

/** Public listing query — paginated, newest first, optional cuts. */
export const listPostsQuerySchema = z.object({
  brand: z.enum(["eleos", "his-story-tellers"]).optional(),
  category: z.string().trim().max(60).optional(),
  /**
   * Only posts published on or after this instant. Callers that advertise
   * "latest" content send their own boundary; the archives send none and so
   * still list everything. Applied before `limit`, so a page is filled from
   * the qualifying set rather than filtered down to nothing.
   */
  since: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

/** Route params carrying a MongoDB ObjectId. */
export const postParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
