import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError.ts";

type ValidationSource = "body" | "query" | "params";

/**
 * validate — reusable Zod validation middleware. Parses the named request
 * source against the schema and replaces it with the parsed (and coerced/
 * defaulted) result. On failure, throws a 400 AppError carrying the Zod
 * issues so the global error handler formats a standardized response.
 *
 * Usage: router.post("/", validate(createCommentSchema), controller)
 *        router.get("/", validate(listQuerySchema, "query"), controller)
 */
export const validate =
  (schema: ZodTypeAny, source: ValidationSource = "body"): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(
        new AppError("Validation failed", 400, {
          // Zod's messages are written for the person filling the form, so they
          // are safe to hand to the admin console in production as well — this
          // is what lets a rejected form say *which* field needs attention.
          exposeDetails: true,
          details: {
            issues: result.error.issues.map((issue) => ({
              // An empty path means the issue is about the request as a whole
              // (a `.refine` on the object) rather than one field — the client
              // renders those in the summary only. Naming the source ("body")
              // here would invent a field the form doesn't have.
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        })
      );
      return;
    }

    // Narrow assignment keeps the express types happy for all three sources.
    // Express 5 exposes req.query (and req.params) as getters, so those are
    // replaced via defineProperty rather than direct assignment.
    switch (source) {
      case "body":
        req.body = result.data;
        break;
      case "query":
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
        });
        break;
      case "params":
        Object.defineProperty(req, "params", {
          value: result.data,
          writable: true,
          configurable: true,
        });
        break;
    }

    next();
  };
