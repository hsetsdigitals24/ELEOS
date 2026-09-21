import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { clearSessionCookies, REFRESH_COOKIE, setSessionCookies } from "../utils/cookies.ts";
import * as authService from "../services/auth.service.ts";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "../validators/auth.validator.ts";

/**
 * AuthController — thin HTTP layer for the /api/v1/auth endpoints. Reads
 * the validated request, delegates to the auth service, and sets/clears the
 * session cookies on the way out.
 */

/** POST /api/v1/auth/login — sign in; sets access + refresh cookies. */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const issued = await authService.login(input);
  setSessionCookies(res, issued.accessToken, issued.refreshToken);
  return ApiResponse.success(res, 200, "Signed in successfully", issued.session);
});

/** POST /api/v1/auth/logout — revokes the refresh token, clears cookies. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE] as string | undefined);
  clearSessionCookies(res);
  return ApiResponse.success(res, 200, "Signed out successfully");
});

/** GET /api/v1/auth/me — the current session (used to restore the console). */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const session = req.adminUser; // resolved by the authenticate middleware
  return ApiResponse.success(res, 200, "Session fetched successfully", session);
});

/** POST /api/v1/auth/refresh — rotates the session cookies. */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const issued = await authService.refresh(req.cookies?.[REFRESH_COOKIE] as string | undefined);
  setSessionCookies(res, issued.accessToken, issued.refreshToken);
  return ApiResponse.success(res, 200, "Session refreshed successfully", issued.session);
});

/**
 * POST /api/v1/auth/forgot-password — always the same response, whether or
 * not the email belongs to an account (prevents user enumeration).
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ForgotPasswordInput;
  await authService.forgotPassword(input);
  return ApiResponse.success(
    res,
    200,
    "If an account exists for that email, a reset link has been sent."
  );
});

/** POST /api/v1/auth/reset-password — consume a reset token, set a password. */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ResetPasswordInput;
  await authService.resetPassword(input);
  return ApiResponse.success(res, 200, "Password updated. You can sign in with it now.");
});

/** POST /api/v1/auth/change-password — signed-in password change. */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ChangePasswordInput;
  const session = req.adminUser; // resolved by the authenticate middleware
  if (!session) {
    return ApiResponse.error(res, 401, "Authentication required");
  }
  await authService.changePassword(session.user.id, input);
  clearSessionCookies(res);
  return ApiResponse.success(res, 200, "Password updated. Please sign in again.");
});
