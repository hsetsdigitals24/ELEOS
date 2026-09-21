import { z } from "zod";

/**
 * Zod schemas for comment request validation. Schemas live here —
 * controllers and routes never hand-roll validation checks.
 * Each schema parses the request source itself (body / query / params);
 * the `validate` middleware feeds it the matching source.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const targetTypeSchema = z.enum(["blog", "video"], {
  message: "targetType must be 'blog' or 'video'",
});

const targetIdSchema = z
  .string()
  .min(1, "targetId is required")
  .max(160)
  .regex(slugPattern, "targetId must be a slug");

export const createCommentSchema = z.object({
  targetType: targetTypeSchema,
  targetId: targetIdSchema,
  authorName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  authorEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required")
    .max(254),
  body: z
    .string()
    .trim()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment must be at most 2000 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * Public listing query. A targetType/targetId pair is required so the
 * public endpoint never dumps the whole comment collection — sitewide
 * listings are an admin concern. Both fields are always present after
 * defaults are applied, so the refine can rely on them.
 */
export const listCommentsQuerySchema = z.object({
  targetType: targetTypeSchema,
  targetId: targetIdSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

/** Route params carrying a MongoDB ObjectId (used by future admin routes). */
export const objectIdParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
