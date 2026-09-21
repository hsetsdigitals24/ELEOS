// lib/api/comments.ts — typed client for the comments API.
//
// The Express backend (server/) serves /api/v1. In development the Next.js
// rewrite in next.config.ts proxies /api/v1/* to it (set VITE_API_BASE_URL);
// in production the same path is handled by the deployment's proxy rules.
// When the API is unreachable every call rejects with an ApiError
// (status 0) so the UI can degrade gracefully instead of breaking.

import { request, type ApiFieldIssue, ApiError } from "./client";
import type {
  CommentItem,
  CommentsPage,
  CommentTargetType,
  NewCommentInput,
} from "@/types/comment";

// Re-exported for callers that import the error types from this module.
// ApiError is re-exported as a value — callers use `instanceof` on it.
export { ApiError, type ApiFieldIssue };

/** Lists approved comments for one blog post or video (newest first). */
export async function fetchComments(params: {
  targetType: CommentTargetType;
  targetId: string;
  page?: number;
  limit?: number;
}): Promise<CommentsPage> {
  const query = new URLSearchParams({
    targetType: params.targetType,
    targetId: params.targetId,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });

  return request<CommentsPage>(`/comments?${query.toString()}`, {
    serviceName: "comment service",
  });
}

/** Posts a new comment. Returns the created comment on success. */
export async function postComment(input: NewCommentInput): Promise<CommentItem> {
  return request<CommentItem>("/comments", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "comment service",
  });
}
