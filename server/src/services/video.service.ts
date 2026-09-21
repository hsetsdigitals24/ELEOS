import { AppError } from "../utils/AppError.ts";
import { brandFilter } from "../utils/brandFilter.ts";
import { slugify } from "../utils/slugify.ts";
import { Video, type VideoDocument } from "../models/video.model.ts";
import { sanitizeContentHtml } from "./post.service.ts";
import type { PaginatedResult, VideoItem } from "../types/index.ts";
import type {
  CreateVideoInput,
  ListVideosQuery,
  UpdateVideoInput,
} from "../validators/video.validator.ts";

/**
 * VideoService — ALL video business logic and database access lives here.
 * Controllers never touch Mongoose directly.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{6,}$/;

/**
 * Derives the YouTube video id from any YouTube URL shape — the same set
 * the client's lib/youtube.ts handles (watch, share, live, shorts).
 */
export function youtubeIdFromUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host !== "youtube.com" && host !== "youtube-nocookie.com" && host !== "youtu.be") {
    return "";
  }

  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1) || null;
  } else {
    const v = url.searchParams.get("v");
    if (v !== null) {
      id = v;
    } else {
      const pathMatch = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
      id = pathMatch?.[1] ?? null;
    }
  }

  return id && VIDEO_ID.test(id) ? id : "";
}

/** Lean video shape as returned by `.lean()` reads. */
type LeanVideo = Omit<VideoDocument, "_id"> & { _id: { toString(): string } };

/** Maps a lean document to the public API shape. */
function toVideoItem(doc: LeanVideo): VideoItem {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    brand: doc.brand ?? "eleos",
    description: doc.description ?? "",
    duration: doc.duration ?? "",
    publishedAt:
      doc.publishedAt instanceof Date
        ? doc.publishedAt.toISOString()
        : String(doc.publishedAt),
    category: doc.category ?? "",
    tags: doc.tags ?? [],
    thumbnailUrl: doc.thumbnailUrl ?? "",
    thumbnailAlt: doc.thumbnailAlt ?? "",
    youtubeUrl: doc.youtubeUrl,
    youtubeId: youtubeIdFromUrl(doc.youtubeUrl),
    channelUrl: doc.channelUrl ?? "https://youtube.com/@eleosrein",
    isPublished: doc.isPublished ?? true,
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export interface CreateVideoServiceInput extends CreateVideoInput {}

export async function createVideo(input: CreateVideoServiceInput): Promise<VideoItem> {
  const { slug, publishedAt, description, ...rest } = input;
  try {
    const created = await Video.create({
      ...rest,
      slug: slug && slug.length > 0 ? slug : slugify(input.title),
      // The description is rich text from the admin editor — sanitize it.
      ...(description !== undefined ? { description: sanitizeContentHtml(description) } : {}),
      // Omitted (unset) means "now" — the model's default.
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    });
    return toVideoItem(created.toObject() as LeanVideo);
  } catch (err) {
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("A video with that slug already exists", 409);
    }
    throw err;
  }
}

export async function listVideos(
  query: ListVideosQuery
): Promise<PaginatedResult<VideoItem>> {
  const { brand, category, since, page, limit } = query;

  const filter: Record<string, unknown> = { isPublished: true, ...brandFilter(brand) };
  if (category) filter.category = category;
  // Applied before the skip/limit, so a page is filled from the videos inside
  // the window — filtering after the fact would leave short or empty pages.
  if (since) filter.publishedAt = { $gte: since };

  const [docs, total] = await Promise.all([
    Video.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Video.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toVideoItem(doc as unknown as LeanVideo)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Admin listing — includes unpublished entries, newest first. */
export async function listAllVideos(
  page = 1,
  limit = 50
): Promise<PaginatedResult<VideoItem>> {
  const [docs, total] = await Promise.all([
    Video.find({})
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Video.countDocuments({}),
  ]);

  return {
    items: docs.map((doc) => toVideoItem(doc as unknown as LeanVideo)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getVideoBySlug(slug: string): Promise<VideoItem> {
  const doc = await Video.findOne({ slug, isPublished: true }).lean();
  if (!doc) {
    throw new AppError("Video not found", 404);
  }
  return toVideoItem(doc as unknown as LeanVideo);
}

export async function getVideoById(videoId: string): Promise<VideoItem> {
  const doc = await Video.findById(videoId).lean();
  if (!doc) {
    throw new AppError("Video not found", 404);
  }
  return toVideoItem(doc as unknown as LeanVideo);
}

export async function updateVideo(videoId: string, input: UpdateVideoInput): Promise<VideoItem> {
  const patch: Record<string, unknown> = { ...input };
  // The description is rich text from the admin editor — sanitize it.
  if (typeof patch.description === "string") {
    patch.description = sanitizeContentHtml(patch.description);
  }
  // An explicit empty-string slug would break the unique index's meaning —
  // drop it rather than trying to save it.
  if (patch.slug === "") delete patch.slug;

  try {
    const updated = await Video.findOneAndUpdate({ _id: videoId }, { $set: patch }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      throw new AppError("Video not found", 404);
    }

    return toVideoItem(updated as unknown as LeanVideo);
  } catch (err) {
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("A video with that slug already exists", 409);
    }
    throw err;
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  const result = await Video.deleteOne({ _id: videoId });
  if (result.deletedCount === 0) {
    throw new AppError("Video not found", 404);
  }
}
