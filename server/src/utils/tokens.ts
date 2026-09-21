import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.ts";

/**
 * Token helpers — the only place session tokens are created and verified.
 *
 * - Access tokens are short-lived JWTs (HS256, minimal claims).
 * - Refresh and password-reset tokens are opaque 256-bit random strings;
 *   only their sha256 digests are ever stored.
 */

export interface AccessTokenPayload {
  /** AdminUser id. */
  sub: string;
  /** Role id at sign-in time — re-checked against the DB on every request. */
  roleId: string;
}

export function signAccessToken(userId: string, roleId: string): string {
  return jwt.sign({ sub: userId, roleId } satisfies AccessTokenPayload, config.jwtSecret, {
    algorithm: "HS256",
    // The env value is validated as a time string ("30m", "1h", …) but the
    // @types package narrows it to ms' StringValue template type — cast to
    // the defined subset (exactOptionalPropertyTypes rejects undefined).
    expiresIn: config.accessTokenTtl as Exclude<SignOptions["expiresIn"], undefined>,
  });
}

/** Verifies signature + expiry; returns null for any invalid token. */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "object" && decoded !== null && typeof decoded.sub === "string") {
      const payload = decoded as AccessTokenPayload & { roleId?: unknown };
      if (typeof payload.roleId === "string") {
        return { sub: payload.sub, roleId: payload.roleId };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Fresh 256-bit opaque token (refresh tokens, reset tokens). */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

/** sha256 hex digest — how opaque tokens are stored. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time comparison of two equal-length hex digests. */
export function digestsMatch(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
