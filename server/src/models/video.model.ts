import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Video — one recorded session listed under /videos. Videos are hosted on
 * YouTube: the admin pastes any YouTube URL and the site normalises it into
 * the embedded player (the youtubeId is derived on write, see
 * video.service.ts). Raw video files are never uploaded to this API.
 */
const videoSchema = new Schema(
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
    /** Who the video is published under — ELEOS itself or its media subsidiary. */
    brand: {
      type: String,
      enum: ["eleos", "his-story-tellers"],
      default: "eleos",
      index: true,
    },
    /** Rich-text write-up (sanitized HTML from the admin editor). */
    description: {
      type: String,
      trim: true,
      maxlength: 20000,
      default: "",
    },
    /** Human-readable duration, e.g. "55:11" */
    duration: {
      type: String,
      trim: true,
      maxlength: 16,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: () => new Date(),
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
    thumbnailAlt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    /** Any YouTube URL (watch, share, live, shorts) — normalised on write. */
    youtubeUrl: {
      type: String,
      required: [true, "youtubeUrl is required"],
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (value: string) => /^https:\/\/.+/i.test(value),
        message: "youtubeUrl must be a valid https:// URL",
      },
    },
    /** The ELEOS YouTube channel — fallback "watch here" link. */
    channelUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "https://youtube.com/@eleosrein",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Public listing query: newest first; brand cuts for the subsidiary page.
videoSchema.index({ isPublished: 1, publishedAt: -1 });
videoSchema.index({ brand: 1, publishedAt: -1 });

export type VideoDocument = InferSchemaType<typeof videoSchema>;

interface VideoModel extends Model<VideoDocument> {
  // Placeholder for future statics.
}

export const Video: VideoModel = (mongoose.models.Video ??
  mongoose.model<VideoDocument, VideoModel>("Video", videoSchema)) as VideoModel;
