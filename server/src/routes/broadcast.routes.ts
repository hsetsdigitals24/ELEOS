import { Router } from "express";
import { getBroadcastSettings } from "../controllers/broadcast.controller.ts";

/**
 * Broadcast routes — the public read of the site's live broadcast
 * configuration (audio medium + video link).
 *
 *   GET /api/v1/broadcasts → current broadcast settings
 */
const broadcastRouter = Router();

broadcastRouter.get("/broadcasts", getBroadcastSettings);

export { broadcastRouter };
