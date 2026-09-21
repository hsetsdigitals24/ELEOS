import { z } from "zod";

/**
 * Zod schemas for product requests. Schemas live here — controllers and
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

/** Fields the admin can set on a product. */
const productFields = {
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(60, "Category must be at most 60 characters"),
  /** Rich-text HTML from the admin editor — sanitized on write in the service. */
  description: z.string().trim().max(20000, "Description must be at most 20,000 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code (e.g. NGN)")
    .default("NGN"),
  imageUrl: httpsUrl.optional().default(""),
  imageAlt: z.string().trim().max(200, "Image alt must be at most 200 characters"),
  selarUrl: httpsUrl,
  inStock: z.boolean().default(true),
};

export const createProductSchema = z.object({
  ...productFields,
  description: productFields.description.default(""),
  /**
   * Optional on create — when omitted, the service slugifies the name.
   * A duplicate slug surfaces as the model's unique-index 409.
   */
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)")
    .max(160)
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** Partial update — every field is optional, at least one is required. */
export const updateProductSchema = z
  .object({
    name: productFields.name.optional(),
    category: productFields.category.optional(),
    description: productFields.description.optional(),
    price: productFields.price.optional(),
    currency: productFields.currency.optional(),
    imageUrl: productFields.imageUrl.optional(),
    imageAlt: productFields.imageAlt.optional(),
    selarUrl: productFields.selarUrl.optional(),
    inStock: productFields.inStock.optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(slugPattern, "slug must be a slug (lowercase words separated by dashes)")
      .max(160)
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/** Public listing query — paginated, newest first, optional category cut. */
export const listProductsQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

/** Route params carrying a MongoDB ObjectId. */
export const productParamsSchema = z.object({
  id: z.string().regex(objectIdPattern, "id must be a valid ObjectId"),
});
