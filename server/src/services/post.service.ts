import sanitizeHtml from "sanitize-html";
import { AppError } from "../utils/AppError.ts";
import { brandFilter } from "../utils/brandFilter.ts";
import { slugify } from "../utils/slugify.ts";
import { Post, type PostDocument } from "../models/post.model.ts";
import type { PaginatedResult, PostItem } from "../types/index.ts";
import type {
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from "../validators/post.validator.ts";

/**
 * PostService — ALL blog-post business logic and database access lives
 * here. Controllers never touch Mongoose directly.
 */

/**
 * Allowlist for the rich-text article body. The admin editor (Tiptap)
 * produces a known set of tags; anything else — inline handlers, scripts,
 * iframes — is stripped before the HTML ever reaches the database, so the
 * client can render it with dangerouslySetInnerHTML safely.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "sub", "sup",
    "blockquote", "ul", "ol", "li", "a", "img", "span", "br", "hr",
    "code", "pre", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
    span: ["style"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
  },
  // Only the inline styles the editor emits survive.
  allowedStyles: {
    "*": {
      color: [/.*/],
      "background-color": [/.*/],
      "font-family": [/.*/],
      "text-align": [/.*/],
      "font-size": [/.*/],
    },
  },
  // Links the admin inserts keep pointing safely outward.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** Lean post shape as returned by `.lean()` reads. */
type LeanPost = Omit<PostDocument, "_id"> & { _id: { toString(): string } };

/** Maps a lean document to the public API shape. */
function toPostItem(doc: LeanPost): PostItem {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    brand: doc.brand ?? "eleos",
    excerpt: doc.excerpt ?? "",
    author: doc.author ?? "admin",
    categories: doc.categories ?? [],
    tags: doc.tags ?? [],
    imageUrl: doc.imageUrl ?? "",
    imageAlt: doc.imageAlt ?? "",
    contentHtml: doc.contentHtml,
    archivedComments: (doc.archivedComments ?? []).map((comment) => ({
      authorName: comment.authorName,
      body: comment.body,
      postedAt:
        comment.postedAt instanceof Date
          ? comment.postedAt.toISOString()
          : String(comment.postedAt),
    })),
    isPublished: doc.isPublished ?? true,
    publishedAt:
      doc.publishedAt instanceof Date
        ? doc.publishedAt.toISOString()
        : String(doc.publishedAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export interface CreatePostServiceInput extends CreatePostInput {}

export async function createPost(input: CreatePostServiceInput): Promise<PostItem> {
  const { slug, contentHtml, publishedAt, ...rest } = input;
  try {
    const created = await Post.create({
      ...rest,
      slug: slug && slug.length > 0 ? slug : slugify(input.title),
      contentHtml: sanitizeContentHtml(contentHtml),
      // Omitted (unset) means "now" — the model's default.
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    });
    return toPostItem(created.toObject() as LeanPost);
  } catch (err) {
    // Surface a duplicate slug as a friendly 409, like the products module.
    if (err instanceof Error && err.name === "ValidationError") throw err;
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("A post with that slug already exists", 409);
    }
    throw err;
  }
}

export async function listPosts(query: ListPostsQuery): Promise<PaginatedResult<PostItem>> {
  const { brand, category, since, page, limit } = query;

  const filter: Record<string, unknown> = { isPublished: true, ...brandFilter(brand) };
  if (category) filter.categories = category;
  // Applied before the skip/limit, so a page is filled from the posts inside
  // the window — filtering after the fact would leave short or empty pages.
  if (since) filter.publishedAt = { $gte: since };

  const [docs, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toPostItem(doc as unknown as LeanPost)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Admin listing — includes unpublished drafts, newest first. */
export async function listAllPosts(
  page = 1,
  limit = 50
): Promise<PaginatedResult<PostItem>> {
  const [docs, total] = await Promise.all([
    Post.find({})
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments({}),
  ]);

  return {
    items: docs.map((doc) => toPostItem(doc as unknown as LeanPost)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getPostBySlug(slug: string): Promise<PostItem> {
  const doc = await Post.findOne({ slug, isPublished: true }).lean();
  if (!doc) {
    throw new AppError("Post not found", 404);
  }
  return toPostItem(doc as unknown as LeanPost);
}

export async function getPostById(postId: string): Promise<PostItem> {
  const doc = await Post.findById(postId).lean();
  if (!doc) {
    throw new AppError("Post not found", 404);
  }
  return toPostItem(doc as unknown as LeanPost);
}

export async function updatePost(postId: string, input: UpdatePostInput): Promise<PostItem> {
  const patch: Record<string, unknown> = { ...input };

  // Sanitize the article body whenever it changes.
  if (typeof patch.contentHtml === "string") {
    patch.contentHtml = sanitizeContentHtml(patch.contentHtml);
  }
  // An explicit empty-string slug would break the unique index's meaning —
  // drop it rather than trying to save it.
  if (patch.slug === "") delete patch.slug;

  try {
    const updated = await Post.findOneAndUpdate({ _id: postId }, { $set: patch }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      throw new AppError("Post not found", 404);
    }

    return toPostItem(updated as unknown as LeanPost);
  } catch (err) {
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("A post with that slug already exists", 409);
    }
    throw err;
  }
}

export async function deletePost(postId: string): Promise<void> {
  const result = await Post.deleteOne({ _id: postId });
  if (result.deletedCount === 0) {
    throw new AppError("Post not found", 404);
  }
}
