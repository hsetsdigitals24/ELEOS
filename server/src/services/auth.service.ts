import bcrypt from "bcryptjs";
import { config } from "../config/env.ts";
import {
  AdminUser,
  type AdminUserHydratedDocument,
} from "../models/adminUser.model.ts";
import { RefreshToken, type RefreshTokenHydratedDocument } from "../models/refreshToken.model.ts";
import { Role, type RoleHydratedDocument } from "../models/role.model.ts";
import type { AuthSession, IssuedSession } from "../types/index.ts";
import { AppError } from "../utils/AppError.ts";
import { generateOpaqueToken, hashToken, signAccessToken } from "../utils/tokens.ts";
import { sendMail } from "./mail.service.ts";
import { renderResetPasswordEmail } from "./mail/templates.ts";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "../validators/auth.validator.ts";

/**
 * AuthService — ALL authentication business logic. Login lockout, token
 * issuance/rotation, and the password-reset lifecycle live here; controllers
 * never touch bcrypt, JWTs or the DB directly.
 */

export const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
export const RESET_TOKEN_MINUTES = 15;

/**
 * A hash of an unguessable string, compared against when the email is
 * unknown — the response time of "no such user" then matches "wrong
 * password", so failures can't be timed to enumerate accounts.
 */
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", BCRYPT_ROUNDS);

/** Lean user + role pair as loaded by the session queries. */
interface UserWithRole {
  user: AdminUserHydratedDocument;
  role: RoleHydratedDocument | null;
}

function toSession(entry: UserWithRole): AuthSession {
  const role = entry.role;
  return {
    user: {
      id: entry.user._id.toString(),
      name: entry.user.name,
      email: entry.user.email,
    },
    role: {
      id: role ? role._id.toString() : "",
      name: role?.name ?? "",
      slug: role?.slug ?? "",
    },
    permissions: [...(role?.permissions ?? [])],
  };
}

/** Loads a user with its role; returns null when either side is missing. */
async function loadUserWithRole(userId: string): Promise<UserWithRole | null> {
  const user = await AdminUser.findById(userId).populate("role");
  if (!user) return null;
  return { user, role: (user as unknown as { role: RoleHydratedDocument | null }).role };
}

function lockoutMessage(): string {
  return `Too many failed sign-in attempts. This account is locked for ${LOCK_MINUTES} minutes.`;
}

/* ------------------------------------------------------------------ */
/* Token lifecycle                                                     */
/* ------------------------------------------------------------------ */

/** Mints a fresh access + refresh token pair for a user. */
async function issueSession(user: AdminUserHydratedDocument): Promise<IssuedSession> {
  const entry = await loadUserWithRole(user._id.toString());
  if (!entry || !entry.role) {
    throw new AppError("This account has no valid role", 403);
  }

  const accessToken = signAccessTokenFor(entry);
  const refreshToken = generateOpaqueToken();
  await RefreshToken.create({
    user: entry.user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
  });

  return { session: toSession(entry), accessToken, refreshToken };
}

function signAccessTokenFor(entry: UserWithRole): string {
  return signAccessToken(entry.user._id.toString(), entry.role?._id.toString() ?? "");
}

/** Revokes every outstanding refresh token for a user. */
async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

/* ------------------------------------------------------------------ */
/* Login / logout / refresh                                            */
/* ------------------------------------------------------------------ */

export async function login(input: LoginInput): Promise<IssuedSession> {
  const user = await AdminUser.findOne({ email: input.email }).select(
    "+passwordHash +failedAttempts +lockUntil"
  );

  // Unknown email — burn the same bcrypt time as a real compare, then fail
  // with the exact same message as a wrong password.
  if (!user) {
    await bcrypt.compare(input.password, DUMMY_HASH);
    throw new AppError("Invalid email or password", 401);
  }

  if (user.lockUntil !== null && user.lockUntil !== undefined && user.lockUntil > new Date()) {
    throw new AppError(lockoutMessage(), 429);
  }

  // Invited users have no password yet — respond exactly like a wrong
  // password (same dummy-hash timing, same generic message).
  if (!user.passwordHash) {
    await bcrypt.compare(input.password, DUMMY_HASH);
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    const attempts = (user.failedAttempts ?? 0) + 1;
    user.failedAttempts = attempts;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedAttempts = 0; // the lock resets the count
    }
    await user.save();
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  // Success — clear any lockout state.
  user.failedAttempts = 0;
  user.lockUntil = null;
  await user.save();

  return issueSession(user);
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

/**
 * Rotates the refresh token. Replaying an already-rotated (revoked) token is
 * treated as theft: every session for that user is revoked immediately.
 */
export async function refresh(refreshToken: string | undefined): Promise<IssuedSession> {
  if (!refreshToken) {
    throw new AppError("Session expired", 401);
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) });

  if (!stored) {
    throw new AppError("Session expired", 401);
  }

  if (stored.revokedAt !== null && stored.revokedAt !== undefined) {
    // Token reuse — assume compromise and kill every session for the user.
    await revokeAllRefreshTokens(stored.user.toString());
    throw new AppError("Session expired", 401);
  }

  if (stored.expiresAt <= new Date()) {
    throw new AppError("Session expired", 401);
  }

  const entry = await loadUserWithRole(stored.user.toString());
  if (!entry || !entry.role || !entry.user.isActive) {
    await revokeAllRefreshTokens(stored.user.toString());
    throw new AppError("Session expired", 401);
  }

  // Rotate: retire the presented token, issue a fresh pair.
  stored.revokedAt = new Date();
  await stored.save();

  const accessToken = signAccessTokenFor(entry);
  const newRefreshToken = generateOpaqueToken();
  await RefreshToken.create({
    user: entry.user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
  });

  return { session: toSession(entry), accessToken, refreshToken: newRefreshToken };
}

/** Resolves the current session for /auth/me and the authenticate middleware. */
export async function getSession(userId: string): Promise<AuthSession> {
  const entry = await loadUserWithRole(userId);
  if (!entry || !entry.role || !entry.user.isActive) {
    throw new AppError("Session expired", 401);
  }
  return toSession(entry);
}

/* ------------------------------------------------------------------ */
/* Password reset                                                      */
/* ------------------------------------------------------------------ */

/**
 * Issues a single-use reset token for a user and returns the raw token.
 * Callers compose the email (reset vs. welcome) around it.
 */
export async function issueResetToken(userId: string): Promise<string> {
  const token = generateOpaqueToken();
  await AdminUser.updateOne(
    { _id: userId },
    {
      $set: {
        resetTokenHash: hashToken(token),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000),
      },
    }
  );
  return token;
}

/** Issues a reset token for a user and emails the branded reset link.
 *  Exported so the admin user service can trigger the same flow. */
export async function issuePasswordReset(
  userId: string,
  name: string,
  email: string
): Promise<void> {
  const token = await issueResetToken(userId);
  const resetUrl = `${config.clientUrl}/admin/reset-password?token=${token}`;
  const mail = renderResetPasswordEmail({
    name,
    resetUrl,
    expiresInMinutes: RESET_TOKEN_MINUTES,
  });
  await sendMail({ to: email, ...mail });
}

/**
 * Forgot-password request. Always succeeds from the caller's perspective —
 * the response is identical whether or not the email belongs to an account,
 * so the endpoint can't be used to enumerate users.
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await AdminUser.findOne({ email: input.email }).select(
    "+resetTokenHash"
  );

  if (!user || !user.isActive) return; // swallow — generic response

  await issuePasswordReset(
    user._id.toString(),
    user.name,
    user.email
  );
}

/** Consumes a reset token and sets the new password. Single-use, 15-min TTL. */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const user = await AdminUser.findOne({
    resetTokenHash: hashToken(input.token),
  }).select("+resetTokenHash +resetTokenExpiresAt");

  const expired =
    !user ||
    user.resetTokenExpiresAt === null ||
    user.resetTokenExpiresAt === undefined ||
    user.resetTokenExpiresAt <= new Date();

  if (expired) {
    throw new AppError("This reset link is invalid or has expired", 400);
  }

  const userId = user._id.toString();
  user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  user.resetTokenHash = null;
  user.resetTokenExpiresAt = null;
  user.failedAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // Any stolen session dies with the old password.
  await revokeAllRefreshTokens(userId);
}

/* ------------------------------------------------------------------ */
/* Change password (signed-in user)                                    */
/* ------------------------------------------------------------------ */

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await AdminUser.findById(userId).select("+passwordHash");
  if (!user) {
    throw new AppError("Session expired", 401);
  }

  const matches =
    user.passwordHash !== null &&
    user.passwordHash !== undefined &&
    (await bcrypt.compare(input.currentPassword, user.passwordHash));
  if (!matches) {
    throw new AppError("The current password is incorrect", 400);
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  await user.save();

  // Force a fresh sign-in everywhere.
  await revokeAllRefreshTokens(userId);
}
