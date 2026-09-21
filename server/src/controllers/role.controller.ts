import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as roleService from "../services/role.service.ts";
import type { CreateRoleInput, UpdateRoleInput } from "../validators/role.validator.ts";

/**
 * RoleController — thin HTTP layer for /api/v1/admin/roles. Reads are open
 * to any authenticated admin (they feed the user form); mutations require
 * the `roles:manage` permission.
 */

/** GET /api/v1/admin/roles — list roles. */
export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await roleService.listRoles();
  return ApiResponse.success(res, 200, "Roles fetched successfully", roles);
});

/** POST /api/v1/admin/roles — create a role. */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateRoleInput;
  const role = await roleService.createRole(input);
  return ApiResponse.success(res, 201, "Role created successfully", role);
});

/** PATCH /api/v1/admin/roles/:id — rename a role / change its permissions. */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateRoleInput;
  const role = await roleService.updateRole(id, input);
  return ApiResponse.success(res, 200, "Role updated successfully", role);
});

/** DELETE /api/v1/admin/roles/:id — remove an unused, non-system role. */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await roleService.deleteRole(id);
  return ApiResponse.success(res, 200, "Role deleted successfully");
});
