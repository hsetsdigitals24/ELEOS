import { z } from "zod";

/**
 * Zod schemas for video requests. Schemas live here — controllers and
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

/** Any YouTube URL shape (watch, share, live, shorts) — normalised on write. */
const youtubeUrl = httpsUrl.refine(
  (value) => {
    try {
      const host = new URL(value).hostname.replace(/^www\.|^m\./, "");
      return host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be";
    } catch {
      return false;
    }
  },
  { message: "Must be a YouTube URL (youtube.com or youtu.be)" }
);

/**
 * Default-free field shapes. The update schema composes these directly so an
 * absent key stays absent — reusing the create fields would let their Zod
 * `.default()`s fill the key in, silently turning a partial update into an
 * overwrite.
 */
const baseVideoFields = {
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
  /** Rich-text HTML from the admin editor — sanitized on write in the service. */
  description: z.string().trim().max(20000, "Description must be at most 20,000 characters"),
  /** Human-readable duration, e.g. "55:11" */
  duration: z.string().trim().max(16),
  category: z.string().trim().max(60),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  thumbnailUrl: httpsUrl.optional(),
  thumbnailAlt: z.string().trim().max(200, "Thumbnail alt must be at most 200 characters"),
  youtubeUrl,
  channelUrl: httpsUrl,
  isPublished: z.boolean(),
  /** Allows backdating videos migrated from the previous site. */
  publishedAt: z.coerce.date().optional(),
};

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)")
  .max(220)
  .optional();

export const createVideoSchema = z.object({
  ...baseVideoFields,
  brand: baseVideoFields.brand.default("eleos"),
  description: baseVideoFields.description.default(""),
  duration: baseVideoFields.duration.default(""),
  category: baseVideoFields.category.default(""),
  tags: baseVideoFields.tags.default([]),
  thumbnailUrl: baseVideoFields.thumbnailUrl.default(""),
  channelUrl: baseVideoFields.channelUrl.default("https://youtube.com/@eleosrein"),
  isPublished: baseVideoFields.isPublished.default(true),
  /**
   * Optional on create — when omitted, the service slugifies the title.
   * A duplicate slug surfaces as the model's unique-index 409.
   */
  slug: slugField,
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;

/** Partial update — every field is optional, at least one is required. */
export const updateVideoSchema = z
  .object({
    title: baseVideoFields.title.optional(),
    brand: baseVideoFields.brand.optional(),
    description: baseVideoFields.description.optional(),
    duration: baseVideoFields.duration.optional(),
    category: baseVideoFields.category.optional(),
    tags: baseVideoFields.tags.optional(),
    thumbnailUrl: baseVideoFields.thumbnailUrl,
    thumbnailAlt: baseVideoFields.thumbnailAlt.optional(),
    youtubeUrl: baseVideoFields.youtubeUrl.optional(),
    channelUrl: baseVideoFields.channelUrl.optional(),
    isPublished: baseVideoFields.isPublished.optional(),
    publishedAt: baseVideoFields.publishedAt,
    slug: slugField,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

/** Public listing query — paginated, newest first, optional cuts. */
export const listVideosQuerySchema = z.object({
  brand: z.enum(["eleos", "his-story-tellers"]).optional(),
  category: z.string().trim().max(60).optional(),
  /**
   * Only videos published on or after this instant. Callers that advertise
   * "latest" content send their own boundary; the archives send none and so
   * still list everything. Applied before `limit`, so a page is filled from
   * the qualifying set rather than filtered down to nothing.
   */
  since: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type ListVideosQuery = z.infer<typeof listVideosQuerySchema>;

/** Route params carrying a MongoDB ObjectId. */
export const videoParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
