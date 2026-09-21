import type { Types } from "mongoose";
import { AdminUser } from "../models/adminUser.model.ts";
import {
  Role,
  type RoleDocument,
  type RoleHydratedDocument,
  SUPER_ADMIN_ROLE,
} from "../models/role.model.ts";
import type { RoleItem } from "../types/index.ts";
import { AppError } from "../utils/AppError.ts";
import { slugify } from "../utils/slugify.ts";
import type { CreateRoleInput, UpdateRoleInput } from "../validators/role.validator.ts";

/**
 * RoleService — role CRUD. System roles (the seeded super-admin) are
 * immutable, and a role still assigned to a user cannot be deleted.
 */

type LeanRole = Omit<RoleDocument, "_id"> & { _id: { toString(): string } };

/** Maps a role document to its API shape — shared with the user service,
 *  which embeds roles inside AdminUserItem. */
export function toRoleItem(doc: RoleHydratedDocument | LeanRole): RoleItem {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    permissions: [...doc.permissions],
    isSystem: doc.isSystem ?? false,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export async function listRoles(): Promise<RoleItem[]> {
  const docs = await Role.find().sort({ isSystem: -1, name: 1 }).lean();
  return docs.map((doc) => toRoleItem(doc as LeanRole));
}

export async function createRole(input: CreateRoleInput): Promise<RoleItem> {
  const slug = slugify(input.name);
  if (slug === SUPER_ADMIN_ROLE) {
    throw new AppError("That role name is reserved", 409);
  }

  const exists = await Role.findOne({ slug });
  if (exists) {
    throw new AppError("A role with this name already exists", 409);
  }

  const created = await Role.create({ ...input, slug });
  return toRoleItem(created);
}

async function loadRole(id: string): Promise<RoleHydratedDocument> {
  const role = await Role.findById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return role;
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleItem> {
  const role = await loadRole(id);
  if (role.isSystem) {
    throw new AppError("System roles cannot be edited", 403);
  }

  if (input.name !== undefined) {
    const slug = slugify(input.name);
    if (slug === SUPER_ADMIN_ROLE) {
      throw new AppError("That role name is reserved", 409);
    }
    const clash = await Role.findOne({ slug, _id: { $ne: role._id } });
    if (clash) {
      throw new AppError("A role with this name already exists", 409);
    }
    role.name = input.name;
    role.slug = slug;
  }
  if (input.permissions !== undefined) {
    role.permissions = input.permissions;
  }

  await role.save();
  return toRoleItem(role);
}

export async function deleteRole(id: string): Promise<void> {
  const role = await loadRole(id);
  if (role.isSystem) {
    throw new AppError("System roles cannot be deleted", 403);
  }

  const inUse = await AdminUser.exists({ role: role._id });
  if (inUse) {
    throw new AppError("This role is still assigned to one or more users", 409);
  }

  await role.deleteOne();
}
