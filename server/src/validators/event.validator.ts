import { z } from "zod";

/**
 * Zod schemas for upcoming-event requests. Schemas live here — controllers
 * and routes never hand-roll validation checks. Each schema parses the
 * request source itself (body / query / params); the `validate` middleware
 * feeds it the matching source.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const httpsUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(2048)
  .regex(/^https:\/\//i, "Must be a secure https:// URL");

/**
 * Default-free field shapes. The update schema composes these directly so an
 * absent key stays absent — reusing the create fields would let their Zod
 * `.default()`s fill the key in, silently turning a partial update into an
 * overwrite (same pitfall the post/video validators document).
 */
const baseEventFields = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  /** The day the event starts. */
  date: z.coerce.date(),
  /** Human time range, e.g. "10:00am – 2:00pm (GMT)". */
  time: z.string().trim().max(120, "Time must be at most 120 characters"),
  venue: z.string().trim().max(200, "Venue must be at most 200 characters"),
  city: z.string().trim().max(120, "City must be at most 120 characters"),
  category: z.string().trim().max(60, "Category must be at most 60 characters"),
  /** Rich-text HTML from the admin editor — sanitized on write in the service. */
  description: z
    .string()
    .min(1, "The description cannot be empty")
    .max(20000, "The description must be at most 20,000 characters"),
  imageUrl: httpsUrl.optional(),
  imageAlt: z.string().trim().max(200, "Image alt must be at most 200 characters"),
  isPublished: z.boolean(),
};

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)")
  .max(220)
  .optional();

export const createEventSchema = z.object({
  ...baseEventFields,
  time: baseEventFields.time.default(""),
  venue: baseEventFields.venue.default(""),
  city: baseEventFields.city.default(""),
  category: baseEventFields.category.default(""),
  imageUrl: baseEventFields.imageUrl.default(""),
  imageAlt: baseEventFields.imageAlt.default(""),
  isPublished: baseEventFields.isPublished.default(true),
  /**
   * Optional on create — when omitted, the service slugifies the title.
   * A duplicate slug surfaces as the model's unique-index 409.
   */
  slug: slugField,
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/** Partial update — every field is optional, at least one is required. */
export const updateEventSchema = z
  .object({
    title: baseEventFields.title.optional(),
    date: baseEventFields.date.optional(),
    time: baseEventFields.time.optional(),
    venue: baseEventFields.venue.optional(),
    city: baseEventFields.city.optional(),
    category: baseEventFields.category.optional(),
    description: baseEventFields.description.optional(),
    imageUrl: baseEventFields.imageUrl,
    imageAlt: baseEventFields.imageAlt.optional(),
    isPublished: baseEventFields.isPublished.optional(),
    slug: slugField,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/** Public listing query — paginated, soonest first. */
export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

/** Route params carrying a MongoDB ObjectId. */
export const eventParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
