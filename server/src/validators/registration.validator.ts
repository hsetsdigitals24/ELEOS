import { z } from "zod";

/**
 * Zod schemas for event-registration requests. Schemas live here —
 * controllers and routes never hand-roll validation checks. Each schema
 * parses the request source itself (body / query / params); the `validate`
 * middleware feeds it the matching source.
 */

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Mirrors the model's enum so a bad type is caught before Mongoose sees it. */
const fieldTypes = [
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
] as const;

/** The two types whose meaning depends on a list of choices. */
const OPTION_TYPES: ReadonlyArray<string> = ["select", "radio"];

/**
 * One question on the registration form. `key` is minted by the builder
 * when the field is created and must survive every later rename, so it is
 * constrained to a stable slug rather than derived from the label.
 */
export const registrationFieldSchema = z
  .object({
    key: z
      .string()
      .trim()
      .regex(/^[a-z0-9_]{1,40}$/, "field key must be lowercase letters, digits or underscores"),
    label: z
      .string()
      .trim()
      .min(1, "Every field needs a label")
      .max(120, "Label must be at most 120 characters"),
    type: z.enum(fieldTypes),
    placeholder: z
      .string()
      .trim()
      .max(160, "Placeholder must be at most 160 characters")
      .default(""),
    helpText: z
      .string()
      .trim()
      .max(400, "Help text must be at most 400 characters")
      .default(""),
    required: z.boolean().default(false),
    options: z
      .array(z.string().trim().min(1).max(120, "Each choice must be at most 120 characters"))
      .max(50, "A field can have at most 50 choices")
      .default([]),
  })
  .superRefine((field, ctx) => {
    if (OPTION_TYPES.includes(field.type) && field.options.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Add at least one choice for a dropdown or radio field",
      });
    }
  });

export type RegistrationFieldInput = z.infer<typeof registrationFieldSchema>;

/**
 * The admin saving an event's whole form in one go. Replacing the field
 * array wholesale (rather than patching field by field) keeps the builder
 * a single atomic save and makes reordering trivial.
 */
export const updateEventFormSchema = z
  .object({
    fields: z.array(registrationFieldSchema).max(40, "A form can have at most 40 fields"),
    isOpen: z.boolean().optional(),
    intro: z.string().trim().max(800, "Intro must be at most 800 characters").optional(),
    successMessage: z
      .string()
      .trim()
      .max(400, "Success message must be at most 400 characters")
      .optional(),
  })
  .superRefine((value, ctx) => {
    // Two fields sharing a key would make stored answers ambiguous.
    const seen = new Set<string>();
    value.fields.forEach((field, index) => {
      if (seen.has(field.key)) {
        ctx.addIssue({
          code: "custom",
          path: ["fields", index, "key"],
          message: `Duplicate field key "${field.key}"`,
        });
      }
      seen.add(field.key);
    });
  });

export type UpdateEventFormInput = z.infer<typeof updateEventFormSchema>;

/**
 * A public submission. Deliberately COARSE: the form is defined at runtime
 * by the admin, so its rules cannot be expressed in a static schema. This
 * checks only the envelope (a flat map of field key → answer); the service
 * then validates each answer against the live field definitions and raises
 * the same { field, message } issues the `validate` middleware would.
 */
export const submitRegistrationSchema = z.object({
  answers: z
    .record(z.string().max(80), z.string().max(4000, "An answer must be at most 4000 characters"))
    .refine((answers) => Object.keys(answers).length <= 60, {
      message: "Too many answers submitted",
    }),
});

export type SubmitRegistrationInput = z.infer<typeof submitRegistrationSchema>;

/** Admin response listing — one event at a time, newest first. */
export const listRegistrationsQuerySchema = z.object({
  event: z.string().regex(objectIdPattern, "event must be a valid ObjectId"),
  unreviewed: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>;

/** Body for triaging a response from the admin console. */
export const markRegistrationReviewedSchema = z.object({
  isReviewed: z.boolean(),
});

export type MarkRegistrationReviewedInput = z.infer<typeof markRegistrationReviewedSchema>;

/** Route params carrying an event's slug (public registration routes). */
export const eventSlugParamsSchema = z.object({
  slug: z.string().trim().regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)"),
});

/** Route params carrying a MongoDB ObjectId. */
export const registrationParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});

/** Route params for the admin's per-event form endpoint. */
export const eventIdParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
