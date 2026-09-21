// lib/api/users.ts — typed client for the /api/v1/admin/users endpoints.
// All calls require the `users:manage` permission (enforced server-side).

import { request } from "./client";
import type { AdminUserItem } from "@/types/admin";

/** Lists admin users with their roles, newest first. */
export async function fetchUsers(): Promise<AdminUserItem[]> {
  return request<AdminUserItem[]>("/admin/users", {
    serviceName: "admin service",
  });
}

/**
 * Creates an admin user. Omit `password` to email the person a single-use
 * set-password link instead of choosing a password for them.
 */
export async function createUser(input: {
  name: string;
  email: string;
  roleId: string;
  password?: string;
}): Promise<AdminUserItem> {
  return request<AdminUserItem>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Renames a user, changes their role, or activates/deactivates them. */
export async function updateUser(
  userId: string,
  input: { name?: string; roleId?: string; isActive?: boolean }
): Promise<AdminUserItem> {
  return request<AdminUserItem>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes an admin user and revokes their sessions. */
export async function deleteUser(userId: string): Promise<void> {
  await request<unknown>(`/admin/users/${userId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/** Emails a user a fresh single-use password-reset link. */
export async function sendUserPasswordReset(userId: string): Promise<void> {
  await request<unknown>(`/admin/users/${userId}/send-reset`, {
    method: "POST",
    serviceName: "admin service",
  });
}
