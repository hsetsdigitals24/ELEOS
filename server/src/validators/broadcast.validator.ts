import { z } from "zod";

/**
 * Zod schemas for broadcast settings. Schemas live here — controllers and
 * routes never hand-roll validation checks.
 */

const httpsUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(2048)
  .regex(/^https?:\/\//i, "Must be a valid http(s):// URL");

/**
 * PUT /api/v1/admin/broadcasts body. Both blocks are optional — the admin
 * can update just the audio side or just the video side in one request.
 */
export const updateBroadcastSchema = z
  .object({
    audio: z
      .object({
        medium: z.enum(["none", "youtube", "mixlr", "facebook", "external"]),
        url: z.string().trim().max(2048),
        title: z.string().trim().max(160),
        /** Rich-text HTML from the admin editor — sanitized on write in the service. */
        description: z.string().trim().max(20000),
        isLive: z.boolean(),
      })
      .partial()
      .refine((value) => Object.keys(value).length > 0, {
        message: "audio must set at least one field",
      })
      .optional(),
    video: z
      .object({
        url: z.string().trim().max(2048),
        title: z.string().trim().max(160),
        /** Rich-text HTML from the admin editor — sanitized on write in the service. */
        description: z.string().trim().max(20000),
        isLive: z.boolean(),
      })
      .partial()
      .refine((value) => Object.keys(value).length > 0, {
        message: "video must set at least one field",
      })
      .optional(),
  })
  .refine((value) => value.audio !== undefined || value.video !== undefined, {
    message: "At least one of audio or video must be provided",
  });

export type UpdateBroadcastInput = z.infer<typeof updateBroadcastSchema>;

/** Reusable helper the service also uses when normalising a set URL. */
export const broadcastUrlSchema = httpsUrl;
