import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as postService from "../services/post.service.ts";
import type {
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from "../validators/post.validator.ts";

/**
 * PostController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/posts?brand=&category=&page=&limit= — public blog listing. */
export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListPostsQuery.
  const query = req.query as unknown as ListPostsQuery;
  const result = await postService.listPosts(query);
  return ApiResponse.success(res, 200, "Posts fetched successfully", result);
});

/** GET /api/v1/admin/posts — every post incl. unpublished (admin console). */
export const listAllPosts = asyncHandler(async (_req: Request, res: Response) => {
  const result = await postService.listAllPosts();
  return ApiResponse.success(res, 200, "Posts fetched successfully", result);
});

/** GET /api/v1/posts/:slug — one published post by slug. */
export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const post = await postService.getPostBySlug(slug);
  return ApiResponse.success(res, 200, "Post fetched successfully", post);
});

/** POST /api/v1/admin/posts — publish a blog post. */
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreatePostInput.
  const input = req.body as CreatePostInput;
  const post = await postService.createPost(input);
  return ApiResponse.success(res, 201, "Post created successfully", post);
});

/** PUT /api/v1/admin/posts/:id — update a blog post. */
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdatePostInput;
  const post = await postService.updatePost(id, input);
  return ApiResponse.success(res, 200, "Post updated successfully", post);
});

/** DELETE /api/v1/admin/posts/:id — remove a blog post. */
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await postService.deletePost(id);
  return ApiResponse.success(res, 200, "Post deleted successfully");
});
