import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as broadcastService from "../services/broadcast.service.ts";
import type { UpdateBroadcastInput } from "../validators/broadcast.validator.ts";

/**
 * BroadcastController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/broadcasts — the current live broadcast configuration. */
export const getBroadcastSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await broadcastService.getBroadcastSettings();
  return ApiResponse.success(res, 200, "Broadcast settings fetched successfully", settings);
});

/** PUT /api/v1/admin/broadcasts — update the configuration. */
export const updateBroadcastSettings = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed UpdateBroadcastInput.
  const input = req.body as UpdateBroadcastInput;
  const settings = await broadcastService.updateBroadcastSettings(input);
  return ApiResponse.success(res, 200, "Broadcast settings updated successfully", settings);
});
