import bcrypt from "bcryptjs";
import { config } from "../config/env.ts";
import { AdminUser, type AdminUserHydratedDocument } from "../models/adminUser.model.ts";
import { RefreshToken } from "../models/refreshToken.model.ts";
import { Role, type RoleHydratedDocument, SUPER_ADMIN_ROLE } from "../models/role.model.ts";
import type { AdminUserItem } from "../types/index.ts";
import { AppError } from "../utils/AppError.ts";
import { BCRYPT_ROUNDS, issuePasswordReset, issueResetToken, RESET_TOKEN_MINUTES } from "./auth.service.ts";
import { sendMail } from "./mail.service.ts";
import { renderWelcomeEmail } from "./mail/templates.ts";
import { toRoleItem } from "./role.service.ts";
import type { CreateUserInput, UpdateUserInput } from "../validators/adminUser.validator.ts";

/**
 * AdminUserService — admin-user CRUD. Guards the invariants that keep the
 * console manageable: you can't delete yourself, deactivate yourself, or
 * remove/change the role of the last active super admin.
 */

/** Who is performing the action (from the authenticated session). */
export interface Actor {
  id: string;
}

interface UserWithRole {
  user: AdminUserHydratedDocument;
  role: RoleHydratedDocument | null;
}

function toItem(entry: UserWithRole): AdminUserItem {
  return {
    id: entry.user._id.toString(),
    name: entry.user.name,
    email: entry.user.email,
    role: entry.role ? toRoleItem(entry.role) : {
      id: "",
      name: "Unknown",
      slug: "unknown",
      permissions: [],
      isSystem: false,
      createdAt: "",
      updatedAt: "",
    },
    isActive: entry.user.isActive ?? false,
    createdAt:
      entry.user.createdAt instanceof Date
        ? entry.user.createdAt.toISOString()
        : String(entry.user.createdAt),
    updatedAt:
      entry.user.updatedAt instanceof Date
        ? entry.user.updatedAt.toISOString()
        : String(entry.user.updatedAt),
  };
}

async function loadUserWithRole(id: string): Promise<UserWithRole> {
  const user = await AdminUser.findById(id).populate("role");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { user, role: (user as unknown as { role: RoleHydratedDocument | null }).role };
}

function isSuperAdminRole(role: RoleHydratedDocument | null): boolean {
  return role?.slug === SUPER_ADMIN_ROLE;
}

/** Counts other active users holding the super-admin role. */
async function countOtherActiveSuperAdmins(userId: string): Promise<number> {
  const superRole = await Role.findOne({ slug: SUPER_ADMIN_ROLE });
  if (!superRole) return 0;
  return AdminUser.countDocuments({
    role: superRole._id,
    isActive: true,
    _id: { $ne: userId },
  });
}

export async function listUsers(): Promise<AdminUserItem[]> {
  const users = await AdminUser.find().sort({ createdAt: -1 }).populate("role");
  return users.map((user) => ({
    user,
    role: (user as unknown as { role: RoleHydratedDocument | null }).role,
  })).map(toItem);
}

export async function createUser(input: CreateUserInput): Promise<AdminUserItem> {
  const role = await Role.findById(input.roleId);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const existing = await AdminUser.exists({ email: input.email });
  if (existing) {
    throw new AppError("An admin with this email already exists", 409);
  }

  const passwordHash = input.password !== undefined
    ? await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    : undefined;

  const created = await AdminUser.create({
    name: input.name,
    email: input.email,
    ...(passwordHash !== undefined ? { passwordHash } : {}),
    role: role._id,
    isActive: true,
  });

  const entry = { user: created, role };

  // No password supplied — email the new admin a single-use link so they
  // choose their own password (nothing secrets-y travels in the email).
  if (passwordHash === undefined) {
    const token = await issueResetToken(created._id.toString());
    const setPasswordUrl = `${config.clientUrl}/admin/reset-password?token=${token}`;
    const mail = renderWelcomeEmail({
      name: created.name,
      setPasswordUrl,
      expiresInMinutes: RESET_TOKEN_MINUTES,
    });
    await sendMail({ to: created.email, ...mail });
  }

  return toItem(entry);
}

export async function updateUser(id: string, input: UpdateUserInput, actor: Actor): Promise<AdminUserItem> {
  const entry = await loadUserWithRole(id);
  const { user, role } = entry;
  const isSelf = actor.id === user._id.toString();
  const wasSuperAdmin = isSuperAdminRole(role) && (user.isActive ?? false);

  // Self-management guards — an admin can't lock themselves out.
  if (isSelf && input.isActive === false) {
    throw new AppError("You cannot deactivate your own account", 400);
  }

  let nextRole = role;
  if (input.roleId !== undefined && input.roleId !== role?._id.toString()) {
    const newRole = await Role.findById(input.roleId);
    if (!newRole) {
      throw new AppError("Role not found", 404);
    }
    if (isSelf) {
      throw new AppError("You cannot change your own role", 400);
    }
    if (wasSuperAdmin) {
      const others = await countOtherActiveSuperAdmins(id);
      if (others === 0) {
        throw new AppError("Another active super admin must exist before this one changes role", 403);
      }
    }
    user.role = newRole._id;
    nextRole = newRole;
  }

  if (input.isActive !== undefined) {
    if (wasSuperAdmin && input.isActive === false) {
      const others = await countOtherActiveSuperAdmins(id);
      if (others === 0) {
        throw new AppError("Another active super admin must exist before this one is deactivated", 403);
      }
    }
    user.isActive = input.isActive;
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  await user.save();
  return toItem({ user, role: nextRole });
}

export async function deleteUser(id: string, actor: Actor): Promise<void> {
  const entry = await loadUserWithRole(id);
  const { user, role } = entry;
  const userId = user._id.toString();

  if (actor.id === userId) {
    throw new AppError("You cannot delete your own account", 400);
  }

  if (isSuperAdminRole(role) && (user.isActive ?? false)) {
    const others = await countOtherActiveSuperAdmins(userId);
    if (others === 0) {
      throw new AppError("Another active super admin must exist before this one is deleted", 403);
    }
  }

  await user.deleteOne();
  // Kill any outstanding sessions for the deleted account.
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

/** Emails a user a fresh single-use password-reset link. */
export async function sendUserPasswordReset(id: string): Promise<void> {
  const entry = await loadUserWithRole(id);
  await issuePasswordReset(
    entry.user._id.toString(),
    entry.user.name,
    entry.user.email
  );
}
