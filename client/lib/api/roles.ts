// lib/api/roles.ts — typed client for the /api/v1/admin/roles endpoints.
// Reads are open to any signed-in admin; mutations require `roles:manage`.

import { request } from "./client";
import type { RoleItem } from "@/types/admin";

/** Lists roles (system roles first). Feeds the role dropdown in the user form. */
export async function fetchRoles(): Promise<RoleItem[]> {
  return request<RoleItem[]>("/admin/roles", {
    serviceName: "admin service",
  });
}

/** Creates a role with a set of permissions. */
export async function createRole(input: {
  name: string;
  permissions: string[];
}): Promise<RoleItem> {
  return request<RoleItem>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Renames a role or changes its permissions. */
export async function updateRole(
  roleId: string,
  input: { name?: string; permissions?: string[] }
): Promise<RoleItem> {
  return request<RoleItem>(`/admin/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes a role (refused for system roles and roles still in use). */
export async function deleteRole(roleId: string): Promise<void> {
  await request<unknown>(`/admin/roles/${roleId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}
