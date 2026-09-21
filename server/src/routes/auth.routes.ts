import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimiter.ts";
import { validate } from "../middlewares/validate.ts";
import { authenticate } from "../middlewares/auth.ts";
import { originCheck } from "../middlewares/originCheck.ts";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  resetPassword,
} from "../controllers/auth.controller.ts";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.ts";

/**
 * Auth routes — /api/v1/auth/*. Credential endpoints sit behind a tight
 * rate limit; every body is Zod-validated before it reaches a controller.
 *
 *   POST /api/v1/auth/login             → sign in (sets session cookies)
 *   POST /api/v1/auth/logout            → sign out (revokes + clears)
 *   GET  /api/v1/auth/me                → current session
 *   POST /api/v1/auth/refresh           → rotate session cookies
 *   POST /api/v1/auth/forgot-password   → email a reset link (generic response)
 *   POST /api/v1/auth/reset-password    → consume reset token, set password
 *   POST /api/v1/auth/change-password   → signed-in password change
 */
const authRouter = Router();

authRouter.post(
  "/login",
  originCheck,
  authLimiter,
  validate(loginSchema, "body"),
  login
);

authRouter.post("/logout", originCheck, logout);

authRouter.get("/me", authenticate, me);

authRouter.post("/refresh", originCheck, authLimiter, refresh);

authRouter.post(
  "/forgot-password",
  originCheck,
  authLimiter,
  validate(forgotPasswordSchema, "body"),
  forgotPassword
);

authRouter.post(
  "/reset-password",
  originCheck,
  authLimiter,
  validate(resetPasswordSchema, "body"),
  resetPassword
);

authRouter.post(
  "/change-password",
  originCheck,
  authenticate,
  validate(changePasswordSchema, "body"),
  changePassword
);

export { authRouter };
