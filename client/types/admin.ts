// types/admin.ts — shapes for the role-based admin auth system. Mirrors the
// server's API responses (server/src/types/index.ts); a password hash never
// appears in any of these.

/** Content areas a role can grant access to (server-side wildcard "*" = all). */
export type Permission =
  | "broadcasts:manage"
  | "products:manage"
  | "messages:manage"
  | "content:manage"
  | "events:manage"
  | "users:manage"
  | "roles:manage";

/** API shape of a role. */
export interface RoleItem {
  id: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** API shape of an admin user (never includes a password hash). */
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: RoleItem;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** What the API returns about the signed-in admin. */
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    slug: string;
  };
  permissions: string[];
}
