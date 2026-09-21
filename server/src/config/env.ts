import "dotenv/config";
import { z } from "zod";

/**
 * Environment configuration. Validated once at boot with Zod — the process
 * exits loudly on an invalid environment rather than failing silently later.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(9000),
    /** MongoDB connection string. Defaults to a local dev database. */
    MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/eleos"),
    /**
     * Comma-separated list of allowed CORS origins (the Next.js frontend).
     * "*" allows every origin — convenient for local development only.
     */
    CLIENT_ORIGIN: z.string().min(1).default("*"),
    /**
     * The email address of the super admin user seeded at boot.
     */
    ADMIN_EMAIL: z.string().email().default("oladoyeajiboye@gmail.com"),
    /**
     * Secret used to sign admin session JWTs. Must be at least 32 chars.
     * Required in production; development falls back to a known default.
     */
    JWT_SECRET: z.string().min(32).optional(),
    /** Access-token lifetime (jsonwebtoken format, e.g. "30m", "1h"). */
    ACCESS_TOKEN_TTL: z.string().min(1).default("30m"),
    /** Refresh-token lifetime in days. */
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
    /**
     * Base URL of the frontend — used to build password-reset links.
     */
    CLIENT_URL: z.string().url().default("http://localhost:3000"),
    /**
     * SMTP transport. When SMTP_HOST is unset (local development) the mail
     * service logs emails to the console instead of sending them.
     */
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    /** "true" for SMTPS (usually port 465); anything else means STARTTLS. */
    SMTP_SECURE: z.string().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    /** From-address for outgoing mail. */
    MAIL_FROM: z.string()
      .min(3)
      .default("ELEOS Research Innovations <no-reply@eleosrein.com>"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && !env.JWT_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "JWT_SECRET is required in production",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  // Fail fast and loudly — never run with an invalid environment.
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  mongodbUri: env.MONGODB_URI,
  adminEmail: env.ADMIN_EMAIL,
  corsOrigins: env.CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  /**
   * JWT signing secret. Production requires an explicit secret; only
   * development falls back to a known default.
   */
  jwtSecret: env.JWT_SECRET ?? "development-only-jwt-secret-change-me-in-production",
  accessTokenTtl: env.ACCESS_TOKEN_TTL,
  refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  clientUrl: env.CLIENT_URL,
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true",
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  mailFrom: env.MAIL_FROM,
} as const;
