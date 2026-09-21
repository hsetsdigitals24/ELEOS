import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as commentService from "../services/comment.service.ts";
import type { CreateCommentInput, ListCommentsQuery } from "../validators/comment.validator.ts";

/**
 * CommentController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** POST /api/v1/comments — publish a comment on a blog post or video. */
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreateCommentInput.
  const input = req.body as CreateCommentInput;
  const comment = await commentService.createComment(input);
  return ApiResponse.success(res, 201, "Comment posted successfully", comment);
});

/** GET /api/v1/comments?targetType=blog&targetId=…&page=&limit= */
export const listComments = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListCommentsQuery.
  const query = req.query as unknown as ListCommentsQuery;
  const result = await commentService.listCommentsForTarget(query);
  return ApiResponse.success(res, 200, "Comments fetched successfully", result);
});
