import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.ts";
import { generalApiLimiter } from "./middlewares/rateLimiter.ts";
import { registerRoutes } from "./routes/index.ts";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.ts";

/**
 * Creates and configures the Express app. Separated from server.ts so the
 * app can be mounted by tests without opening a socket or touching the DB.
 */
export function createApp(): Express {
  const app = express();

  // Trust the proxy in production (Vercel/Render/nginx) so rate limiting
  // and request logging see real client IPs.
  if (config.isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      // "*" (dev default) allows every origin; in production set
      // CLIENT_ORIGIN to the frontend's origin(s).
      origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
    })
  );
  // Rich-text article bodies (with inline image URLs) comfortably exceed
  // the Express default of 100kb.
  app.use(express.json({ limit: "2mb" }));
  // Session cookies (access + refresh tokens) are httpOnly — parsed here.
  app.use(cookieParser());
  app.use(generalApiLimiter);

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
