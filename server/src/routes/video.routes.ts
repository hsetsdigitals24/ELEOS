import { Router } from "express";
import {
  getVideoBySlug,
  listVideos,
} from "../controllers/video.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { listVideosQuerySchema } from "../validators/video.validator.ts";

/**
 * Video routes — the public videos section. Everything is validated with
 * Zod before reaching a controller.
 *
 *   GET /api/v1/videos          → paginated video listing (newest first)
 *   GET /api/v1/videos/:slug    → one published video
 */
const videoRouter = Router();

videoRouter.get("/videos", validate(listVideosQuerySchema, "query"), listVideos);
videoRouter.get("/videos/:slug", getVideoBySlug);

export { videoRouter };
