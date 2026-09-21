import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Post — one blog article. Posts belong to a brand: most are ELEOS
 * research/nutrition pieces, songs and media stories are published under
 * His Story Tellers Media. The body is rich-text HTML produced by the
 * admin's editor (sanitized on write, see post.service.ts).
 */
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: 220,
      unique: true,
      index: true,
    },
    /** Who the post is published under — ELEOS itself or its media subsidiary. */
    brand: {
      type: String,
      enum: ["eleos", "his-story-tellers"],
      default: "eleos",
      index: true,
    },
    /** Short standfirst / dek shown on cards and at the top of the article. */
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    author: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "admin",
    },
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    /** Rich-text article body (sanitized HTML from the admin editor). */
    contentHtml: {
      type: String,
      required: [true, "contentHtml is required"],
      maxlength: 200000,
    },
    /** Comments carried over from the previous WordPress site (read-only). */
    archivedComments: {
      type: [
        {
          _id: false,
          authorName: { type: String, required: true, trim: true, maxlength: 120 },
          body: { type: String, required: true, trim: true, maxlength: 5000 },
          postedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    /** Display date — allows backdating posts migrated from the old site. */
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Public listing query: newest first; brand cuts for the subsidiary page.
postSchema.index({ isPublished: 1, publishedAt: -1 });
postSchema.index({ brand: 1, publishedAt: -1 });

export type PostDocument = InferSchemaType<typeof postSchema>;

interface PostModel extends Model<PostDocument> {
  // Placeholder for future statics.
}

export const Post: PostModel = (mongoose.models.Post ??
  mongoose.model<PostDocument, PostModel>("Post", postSchema)) as PostModel;
