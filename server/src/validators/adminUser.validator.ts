import { z } from "zod";
import { passwordSchema } from "./auth.validator.ts";

/**
 * AdminUser validators — user management bodies and params.
 */

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Invalid id");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  /** Optional — when omitted, the new user is emailed a set-password link. */
  password: passwordSchema.optional(),
  roleId: objectIdSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    roleId: objectIdSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userIdParamsSchema = z.object({
  id: objectIdSchema,
});
