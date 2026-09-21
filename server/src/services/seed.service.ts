import bcrypt from "bcryptjs";
import { config } from "../config/env.ts";
import { AdminUser } from "../models/adminUser.model.ts";
import { Role, SUPER_ADMIN_ROLE } from "../models/role.model.ts";
import { BCRYPT_ROUNDS } from "./auth.service.ts";

/**
 * SeedService — guarantees the super admin exists at boot. The initial
 * password ("password123") is bcrypt-hashed BEFORE it is written to the
 * database, and it is only ever set on creation — a password changed later
 * is never overwritten by a restart.
 */

const INITIAL_PASSWORD = "password123";

export async function ensureSuperAdmin(): Promise<void> {
  const role = await Role.findOneAndUpdate(
    { slug: SUPER_ADMIN_ROLE },
    {
      $setOnInsert: {
        name: "Super Admin",
        permissions: ["*"],
        isSystem: true,
      },
    },
    { upsert: true, new: true }
  );
  if (!role) {
    throw new Error("Failed to ensure the super-admin role");
  }

  const existing = await AdminUser.findOne({ email: config.adminEmail });

  if (!existing) {
    await AdminUser.create({
      email: config.adminEmail,
      name: "Super Admin",
      passwordHash: bcrypt.hashSync(INITIAL_PASSWORD, BCRYPT_ROUNDS),
      role: role._id,
      isActive: true,
    });
    console.log(
      `[seed] Super admin created (${config.adminEmail}) with the initial password — change it after first sign-in.`
    );
    return;
  }

  // Keep the configured admin email attached to the super-admin role.
  if (existing.role.toString() !== role._id.toString()) {
    existing.role = role._id;
    await existing.save();
    console.log(`[seed] ${config.adminEmail} re-attached to the super-admin role.`);
  }
}
