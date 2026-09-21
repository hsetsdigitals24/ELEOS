import { Router } from "express";
import {
  getPostBySlug,
  listPosts,
} from "../controllers/post.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { listPostsQuerySchema } from "../validators/post.validator.ts";

/**
 * Post routes — the public blog. Everything is validated with Zod
 * before reaching a controller.
 *
 *   GET /api/v1/posts          → paginated blog listing (newest first)
 *   GET /api/v1/posts/:slug    → one published post
 */
const postRouter = Router();

postRouter.get("/posts", validate(listPostsQuerySchema, "query"), listPosts);
postRouter.get("/posts/:slug", getPostBySlug);

export { postRouter };
