import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "../config/env.ts";
import { AppError } from "../utils/AppError.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";

/**
 * notFoundHandler — any request that falls through the route table gets a
 * standardized 404 instead of Express' default HTML error page.
 *
 * The echoed method + path is a development convenience only; in production
 * the response says nothing about which routes do or don't exist.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      config.isDevelopment
        ? `Route not found: ${req.method} ${req.originalUrl}`
        : "The requested resource was not found.",
      404
    )
  );
};

/**
 * Global error handling middleware — the single exit point for every error
 * in the app. Translates known error types (AppError, Zod, Mongoose) into
 * the standardized error envelope. Unexpected errors are logged with the
 * stack in development and masked as a generic 500 in production.
 *
 * `details` normally stays development-only so internals never leak. The
 * exception is validation: those messages are written for the person filling
 * the form, so they are marked `exposeDetails` and travel in every
 * environment — without them a rejected form in production can only say
 * "Validation failed" and the admin has no idea which field to fix.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let details: unknown;
  let exposeDetails = false;

  /** Shapes a field-keyed error map into the client's `{ field, message }`. */
  const toIssues = (errors: Record<string, { message: string }> | undefined) =>
    Object.entries(errors ?? {}).map(([field, entry]) => ({
      field,
      message: entry.message,
    }));

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    exposeDetails = err.exposeDetails;
    if (err.details !== undefined) {
      details = err.details;
    }
  } else if (err instanceof ZodError) {
    // Defensive: validation middleware already handles Zod, but services
    // may also parse with Zod.
    statusCode = 400;
    message = "Validation failed";
    exposeDetails = true;
    details = {
      issues: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  } else if (err instanceof Error) {
    if (err.name === "ValidationError") {
      // Mongoose schema validation — the model's own messages ("Path `title`
      // is required"), which name fields the admin form already shows.
      statusCode = 400;
      message = "Validation failed";
      exposeDetails = true;
      details = {
        issues: toIssues(
          (err as { errors?: Record<string, { message: string }> }).errors
        ),
      };
    } else if (err.name === "CastError") {
      statusCode = 400;
      message = "Malformed identifier";
    } else if ((err as { code?: number }).code === 11000) {
      statusCode = 409;
      message = "A record with these details already exists";
    } else {
      // Unexpected error — log it, never leak internals to the client.
      console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    }
  }

  // The `error` field is only included in development, unless the error
  // declares its details safe to expose (see `exposeDetails` above).
  ApiResponse.error(
    res,
    statusCode,
    message,
    (config.isDevelopment || exposeDetails) && details !== undefined
      ? details
      : undefined
  );
};
