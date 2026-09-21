import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { CommentTargetType } from "../types/index.ts";

/**
 * Comment — a reader comment attached to a piece of content (blog post or
 * video) identified by the (targetType, targetId) pair, where targetId is
 * the content's slug. This keeps comments decoupled from any specific
 * content model, so new content types only extend the enum.
 *
 * Soft deletes via `isDeleted` let admins recover moderation mistakes, and
 * `isApproved` allows holding comments for moderation without data loss.
 */
const commentSchema = new Schema(
  {
    targetType: {
      type: String,
      enum: ["blog", "video"] satisfies CommentTargetType[],
      required: [true, "targetType is required"],
      index: true,
    },
    targetId: {
      type: String,
      required: [true, "targetId is required"],
      trim: true,
      maxlength: 160,
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "authorName is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    /** Never selected in public reads — privacy by default. */
    authorEmail: {
      type: String,
      required: [true, "authorEmail is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
      select: false,
    },
    body: {
      type: String,
      required: [true, "body is required"],
      trim: true,
      minlength: 2,
      maxlength: 2000,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Compound index backing the public list query (comments for one target,
// newest first) and the admin list query.
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export type CommentDocument = InferSchemaType<typeof commentSchema>;

interface CommentModel extends Model<CommentDocument> {
  // Placeholder for future statics (e.g. lookups used by the admin panel).
}

export const Comment: CommentModel = (mongoose.models.Comment ?? mongoose.model<CommentDocument, CommentModel>(
  "Comment",
  commentSchema
)) as CommentModel;
