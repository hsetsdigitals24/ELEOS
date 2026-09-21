import type { Request, RequestHandler } from "express";
import type { AuthSession } from "../types/index.ts";
import { AppError } from "../utils/AppError.ts";
import { verifyAccessToken } from "../utils/tokens.ts";
import { ACCESS_COOKIE } from "../utils/cookies.ts";
import { getSession } from "../services/auth.service.ts";

/**
 * authenticate — guards every endpoint that requires a signed-in admin.
 * Verifies the httpOnly access-token cookie (JWT signature + expiry), then
 * re-resolves the user and role from the database so deactivated users,
 * deleted users and revoked roles lose access immediately, even mid-token.
 */

declare module "express-serve-static-core" {
  interface Request {
    /** Set by `authenticate`; the resolved admin session. */
    adminUser?: AuthSession;
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    next(new AppError("Session expired", 401));
    return;
  }

  // Re-check against the DB — the JWT only proves the user signed in.
  getSession(payload.sub)
    .then((session) => {
      req.adminUser = session;
      next();
    })
    .catch(next);
};

/**
 * requirePermission — fine-grained RBAC. The super-admin role carries the
 * "*" wildcard; every other role must list the permission explicitly.
 * Always paired with `authenticate` (which resolves the permissions).
 */
export function requirePermission(permission: string): RequestHandler {
  return (req: Request, _res, next) => {
    const session = req.adminUser;
    if (!session) {
      next(new AppError("Authentication required", 401));
      return;
    }
    if (!session.permissions.includes("*") && !session.permissions.includes(permission)) {
      next(new AppError("You don't have permission to perform this action", 403));
      return;
    }
    next();
  };
}
