import { Router } from "express";
import { createComment, listComments } from "../controllers/comment.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { commentWriteLimiter } from "../middlewares/rateLimiter.ts";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "../validators/comment.validator.ts";

/**
 * Comment routes — public endpoints. Write access is rate-limited to
 * blunt spam; everything is validated with Zod before reaching a controller.
 *
 *   POST /api/v1/comments                     → post a comment
 *   GET  /api/v1/comments?targetType&targetId → list a target's comments
 */
const commentRouter = Router();

commentRouter.post(
  "/comments",
  commentWriteLimiter,
  validate(createCommentSchema, "body"),
  createComment
);

commentRouter.get("/comments", validate(listCommentsQuerySchema, "query"), listComments);

export { commentRouter };
