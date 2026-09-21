import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as adminUserService from "../services/adminUser.service.ts";
import type { CreateUserInput, UpdateUserInput } from "../validators/adminUser.validator.ts";

/**
 * AdminUserController — thin HTTP layer for /api/v1/admin/users. Every route
 * is behind `authenticate` + `requirePermission("users:manage")`.
 */

/** GET /api/v1/admin/users — list admin users with their roles. */
export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await adminUserService.listUsers();
  return ApiResponse.success(res, 200, "Users fetched successfully", users);
});

/** POST /api/v1/admin/users — create an admin user. */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateUserInput;
  const user = await adminUserService.createUser(input);
  return ApiResponse.success(res, 201, "Admin user created successfully", user);
});

/** PATCH /api/v1/admin/users/:id — rename, re-role, activate/deactivate. */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateUserInput;
  const actor = { id: req.adminUser?.user.id ?? "" };
  const user = await adminUserService.updateUser(id, input, actor);
  return ApiResponse.success(res, 200, "User updated successfully", user);
});

/** DELETE /api/v1/admin/users/:id — remove an admin user. */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const actor = { id: req.adminUser?.user.id ?? "" };
  await adminUserService.deleteUser(id, actor);
  return ApiResponse.success(res, 200, "User deleted successfully");
});

/** POST /api/v1/admin/users/:id/send-reset — email the user a reset link. */
export const sendUserPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await adminUserService.sendUserPasswordReset(id);
  return ApiResponse.success(res, 200, "Password reset email sent");
});
