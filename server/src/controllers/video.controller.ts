import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as videoService from "../services/video.service.ts";
import type {
  CreateVideoInput,
  ListVideosQuery,
  UpdateVideoInput,
} from "../validators/video.validator.ts";

/**
 * VideoController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/videos?category=&page=&limit= — public video listing. */
export const listVideos = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListVideosQuery.
  const query = req.query as unknown as ListVideosQuery;
  const result = await videoService.listVideos(query);
  return ApiResponse.success(res, 200, "Videos fetched successfully", result);
});

/** GET /api/v1/admin/videos — every video incl. unpublished (admin console). */
export const listAllVideos = asyncHandler(async (_req: Request, res: Response) => {
  const result = await videoService.listAllVideos();
  return ApiResponse.success(res, 200, "Videos fetched successfully", result);
});

/** GET /api/v1/videos/:slug — one published video by slug. */
export const getVideoBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const video = await videoService.getVideoBySlug(slug);
  return ApiResponse.success(res, 200, "Video fetched successfully", video);
});

/** POST /api/v1/admin/videos — add a video. */
export const createVideo = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreateVideoInput.
  const input = req.body as CreateVideoInput;
  const video = await videoService.createVideo(input);
  return ApiResponse.success(res, 201, "Video created successfully", video);
});

/** PUT /api/v1/admin/videos/:id — update a video. */
export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateVideoInput;
  const video = await videoService.updateVideo(id, input);
  return ApiResponse.success(res, 200, "Video updated successfully", video);
});

/** DELETE /api/v1/admin/videos/:id — remove a video. */
export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await videoService.deleteVideo(id);
  return ApiResponse.success(res, 200, "Video deleted successfully");
});
