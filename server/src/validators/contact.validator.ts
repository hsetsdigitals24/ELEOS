import { z } from "zod";

/**
 * Zod schemas for contact form requests. Schemas live here — controllers
 * and routes never hand-roll validation checks. Each schema parses the
 * request source itself (body / query / params); the `validate`
 * middleware feeds it the matching source.
 */

export const createContactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required")
    .max(254),
  phone: z
    .string()
    .trim()
    .max(40, "Phone must be at most 40 characters")
    .optional()
    .default(""),
  subject: z
    .string()
    .trim()
    .max(140, "Subject must be at most 140 characters")
    .optional()
    .default("General Enquiry"),
  message: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters")
    .max(4000, "Message must be at most 4000 characters"),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;

/**
 * Admin inbox query — paginated, newest first, with an optional
 * `unread=true` filter for triage.
 */
export const listContactMessagesQuerySchema = z.object({
  unread: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListContactMessagesQuery = z.infer<typeof listContactMessagesQuerySchema>;

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

/** Body for marking a message read/unread from the admin inbox. */
export const markContactMessageReadSchema = z.object({
  isRead: z.boolean(),
});

export type MarkContactMessageReadInput = z.infer<typeof markContactMessageReadSchema>;

/** Route params carrying a MongoDB ObjectId. */
export const contactMessageParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
