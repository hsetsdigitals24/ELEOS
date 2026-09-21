// types/comment.ts — shared shapes for the comment system, used by the
// API client (lib/api/comments.ts) and the CommentsSection component.

export type CommentTargetType = "blog" | "video";

/** Public comment shape returned by the API. */
export interface CommentItem {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CommentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsPage {
  items: CommentItem[];
  pagination: CommentPagination;
}

export interface NewCommentInput {
  targetType: CommentTargetType;
  targetId: string;
  authorName: string;
  authorEmail: string;
  body: string;
}
