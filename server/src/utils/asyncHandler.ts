import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * asyncHandler — wraps an async route handler so any rejection is forwarded
 * to the global error middleware. Keeps controllers free of try/catch
 * boilerplate while still satisfying the "no unhandled rejections" rule.
 */
export const asyncHandler =
  (handler: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
