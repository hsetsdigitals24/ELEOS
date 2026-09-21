import type { Response } from "express";
import { config } from "../config/env.ts";

/**
 * Session cookies — both tokens live in httpOnly cookies scoped to /api/v1,
 * so JavaScript (including any injected script) can never read them.
 *
 * - Access token: SameSite=Lax (must survive ordinary top-level navigation).
 * - Refresh token: SameSite=Strict (only ever sent by same-origin fetches).
 */

export const ACCESS_COOKIE = "eri_access";
export const REFRESH_COOKIE = "eri_refresh";

const baseCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  path: "/api/v1",
} as const;

export function setSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60, // 1h — comfortably outlives the 30m token
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * config.refreshTokenTtlDays,
  });
}

export function clearSessionCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOptions, sameSite: "lax" });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions, sameSite: "strict" });
}
