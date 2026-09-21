import { z } from "zod";
import { PERMISSIONS } from "../models/role.model.ts";

/**
 * Role validators — role management bodies and params.
 */

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Invalid id");

const permissionsSchema = z
  .array(z.enum(PERMISSIONS))
  .max(PERMISSIONS.length)
  .default([]);

export const createRoleSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  permissions: permissionsSchema,
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    permissions: permissionsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const roleIdParamsSchema = z.object({
  id: objectIdSchema,
});
