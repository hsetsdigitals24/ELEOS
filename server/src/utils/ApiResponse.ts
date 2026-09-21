import type { Response } from "express";

/**
 * ApiResponse — the ONLY way responses leave the API. Guarantees the
 * standardized envelope required by the project conventions:
 *
 *   Success: { success: true,  message: string, data: T }
 *   Error:   { success: false, message: string, error?: details }  // error only in development
 */
export class ApiResponse {
  private constructor() {
    // Static utility class — never instantiated.
  }

  public static success<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    const payload: { success: true; message: string; data?: T } = { success: true, message };
    if (data !== undefined) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    statusCode: number,
    message: string,
    error?: unknown
  ): Response {
    const payload: { success: false; message: string; error?: unknown } = { success: false, message };
    if (error !== undefined) {
      payload.error = error;
    }
    return res.status(statusCode).json(payload);
  }
}
