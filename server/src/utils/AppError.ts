/**
 * AppError — operational error class carrying an HTTP status code.
 * Services throw these; the global error handler formats them into the
 * standardized error response. Anything thrown that is NOT an AppError
 * is treated as an unexpected (500) error.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  /** Operational errors are expected (4xx-level); programming errors are not. */
  public readonly isOperational: boolean;
  /** Optional machine-readable details (e.g. Zod issues) for the error payload. */
  public readonly details?: unknown;
  /**
   * Marks `details` as safe to send in every environment. Validation issues are
   * written for the person filling the form, so the admin console can render
   * them in production too — anything else defaults to development-only, since
   * unexpected details (driver errors, internals) must never leave the server.
   */
  public readonly exposeDetails: boolean;

  constructor(
    message: string,
    statusCode = 500,
    options?: { details?: unknown; exposeDetails?: boolean }
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = statusCode >= 400 && statusCode < 500;
    this.exposeDetails = options?.exposeDetails === true;
    if (options?.details !== undefined) {
      this.details = options.details;
    }

    // Maintains a proper stack trace in V8 without polluting the prototype.
    Error.captureStackTrace?.(this, AppError);
  }
}
