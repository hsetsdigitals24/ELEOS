import { AppError } from "../utils/AppError.ts";
import { Comment, type CommentDocument } from "../models/comment.model.ts";
import type {
  CommentTargetType,
  PaginatedResult,
  PublicComment,
} from "../types/index.ts";
import type { CreateCommentInput, ListCommentsQuery } from "../validators/comment.validator.ts";

/**
 * CommentService — ALL comment business logic and database access lives
 * here. Controllers never touch Mongoose directly.
 */

/** Lean comment shape as returned by `.lean()` reads. */
type LeanComment = Omit<CommentDocument, "_id"> & { _id: { toString(): string } };

/** Maps a lean document to the public API shape (email never included). */
function toPublicComment(doc: LeanComment): PublicComment {
  return {
    id: doc._id.toString(),
    targetType: doc.targetType as CommentTargetType,
    targetId: doc.targetId,
    authorName: doc.authorName,
    body: doc.body,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  };
}

export interface CreateCommentServiceInput extends CreateCommentInput {}

export async function createComment(
  input: CreateCommentServiceInput
): Promise<PublicComment> {
  // Comments are visible immediately; `isApproved: false` will be used once
  // a moderation queue + admin panel exist.
  const created = await Comment.create(input);
  return toPublicComment(created.toObject() as LeanComment);
}

export async function listCommentsForTarget(
  query: ListCommentsQuery
): Promise<PaginatedResult<PublicComment>> {
  const { targetType, targetId, page, limit } = query;

  const filter = {
    targetType,
    targetId,
    isDeleted: false,
    isApproved: true,
  };

  const [docs, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toPublicComment(doc as unknown as LeanComment)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Soft-deletes a comment (sets isDeleted). Intended for the future admin
 * panel — not mounted on a public route until auth exists.
 */
export async function softDeleteComment(commentId: string): Promise<PublicComment> {
  const updated = await Comment.findOneAndUpdate(
    { _id: commentId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new AppError("Comment not found", 404);
  }

  return toPublicComment(updated as unknown as LeanComment);
}
