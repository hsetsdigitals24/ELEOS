"use client";

// components/admin/MediaTab.tsx — the "His Story Tellers Media / Content"
// tab: blog posts (published under ELEOS or His Story Tellers Media) and
// videos. The post body uses the reusable RichTextEditor; videos are added
// by pasting a YouTube URL, which the site normalises into the embedded
// player. Structure mirrors the Products tab.

import { useCallback, useEffect, useState } from "react";
import {
  Clapperboard,
  FileText,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createPost,
  createVideo,
  deletePost,
  deleteVideo,
  fetchAdminPosts,
  fetchAdminVideos,
  updatePost,
  updateVideo,
} from "@/lib/api/admin";
import { formatLongDate } from "@/lib/formatDate";
import type { BlogPostItem, PostBrand } from "@/types/blog";
import type { VideoItemApi } from "@/types/video";
import {
  ErrorLine,
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
} from "./consoleShared";
import RichTextEditor from "./RichTextEditor";

type Section = "posts" | "videos";

/** Mirrors the server's slugify so the live slug preview matches what's stored. */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "a, b ,c" → ["a", "b", "c"] */
function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** yyyy-mm-dd (local) → ISO string; empty string stays empty. */
function dateToIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** ISO string → yyyy-mm-dd for <input type="date">. */
function isoToDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

const BRANDS: Array<{ value: PostBrand; label: string }> = [
  { value: "eleos", label: "ELEOS (research & nutrition articles)" },
  { value: "his-story-tellers", label: "His Story Tellers Media (songs & media stories)" },
];

/* ------------------------------------------------------------------ */
/* Posts section                                                       */
/* ------------------------------------------------------------------ */

interface PostFormState {
  title: string;
  brand: PostBrand;
  excerpt: string;
  author: string;
  categories: string;
  tags: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
  contentHtml: string;
  isPublished: boolean;
  slug: string;
}

const emptyPostForm: PostFormState = {
  title: "",
  brand: "eleos",
  excerpt: "",
  author: "admin",
  categories: "",
  tags: "",
  imageUrl: "",
  imageAlt: "",
  publishedAt: "",
  contentHtml: "",
  isPublished: true,
  slug: "",
};

function postToForm(post: BlogPostItem): PostFormState {
  return {
    title: post.title,
    brand: post.brand,
    excerpt: post.excerpt,
    author: post.author,
    categories: post.categories.join(", "),
    tags: post.tags.join(", "),
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    publishedAt: isoToDate(post.publishedAt),
    contentHtml: post.contentHtml,
    isPublished: post.isPublished,
    slug: post.slug,
  };
}

function PostsSection() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editing, setEditing] = useState<BlogPostItem | "new" | null>(null);
  const [form, setForm] = useState<PostFormState>(emptyPostForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchAdminPosts({ limit: 50 })
      .then((result) => {
        setPosts(result.items);
        setLoadError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setEditing("new");
    setForm(emptyPostForm);
    setSaveError(null);
  };

  const startEdit = (post: BlogPostItem) => {
    setEditing(post);
    setForm(postToForm(post));
    setSaveError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    const publishedAt = dateToIso(form.publishedAt);
    const payload = {
      title: form.title.trim(),
      brand: form.brand,
      excerpt: form.excerpt.trim() || undefined,
      author: form.author.trim() || undefined,
      categories: parseList(form.categories),
      tags: parseList(form.tags),
      imageUrl: form.imageUrl.trim() || undefined,
      imageAlt: form.imageAlt.trim() || undefined,
      contentHtml: form.contentHtml,
      isPublished: form.isPublished,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
    };

    try {
      if (editing === "new") {
        await createPost(payload);
      } else if (editing) {
        await updatePost(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: BlogPostItem) => {
    if (!window.confirm(`Delete the post “${post.title}”?`)) return;
    setActionError(null);
    try {
      await deletePost(post.id);
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  // Field-keyed messages from the last rejected save, so each input can show
  // its own. Empty whenever the form hasn't failed (or failed without issues).
  const fieldIssues = fieldErrors(saveError);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Blog posts{" "}
          <span className="font-sans text-sm text-ink-500">({posts.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          New post
        </button>
      </div>

      {actionError !== null && <ErrorLine error={actionError} />}

      {/* Create / edit form */}
      {editing !== null && (
        <form
          onSubmit={submit}
          className="border-2 border-brand-primary/40 bg-white rounded-md p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-ink-900">
              {editing === "new" ? "New blog post" : `Editing — ${editing.title}`}
            </h4>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close form"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {saveError !== null && (
            <ErrorSummary error={saveError} what="save this post" />
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="post-title" className={labelClasses}>
                Title <span className="text-brand-primary">*</span>
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="title" />
              <p className="mt-1.5 font-sans text-xs text-ink-500">
                /blog/{form.slug.trim() ? slugify(form.slug) : slugify(form.title) || "…"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="post-brand" className={labelClasses}>
                Published under <span className="text-brand-primary">*</span>
              </label>
              <select
                id="post-brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value as PostBrand })}
                className={fieldClasses}
              >
                {BRANDS.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
              <FieldError errors={fieldIssues} field="brand" />
            </div>
            <div>
              <label htmlFor="post-author" className={labelClasses}>
                Author
              </label>
              <input
                id="post-author"
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                maxLength={120}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="author" />
            </div>
            <div>
              <label htmlFor="post-date" className={labelClasses}>
                Publish date
              </label>
              <input
                id="post-date"
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="publishedAt" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="post-excerpt" className={labelClasses}>
                Excerpt (standfirst shown on cards &amp; at the top of the article)
              </label>
              <textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                maxLength={500}
                className={`${fieldClasses} resize-y`}
              />
              <FieldError errors={fieldIssues} field="excerpt" />
            </div>
            <div>
              <label htmlFor="post-categories" className={labelClasses}>
                Categories (comma-separated)
              </label>
              <input
                id="post-categories"
                type="text"
                value={form.categories}
                onChange={(e) => setForm({ ...form, categories: e.target.value })}
                placeholder="e.g. Diet, Lifestyle"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="categories" />
            </div>
            <div>
              <label htmlFor="post-tags" className={labelClasses}>
                Tags (comma-separated)
              </label>
              <input
                id="post-tags"
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="tags" />
            </div>
            <div>
              <label htmlFor="post-image" className={labelClasses}>
                Main image URL
              </label>
              <input
                id="post-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageUrl" />
            </div>
            <div>
              <label htmlFor="post-image-alt" className={labelClasses}>
                Image alt text
              </label>
              <input
                id="post-image-alt"
                type="text"
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageAlt" />
            </div>
          </div>

          {/* The article body — the reusable rich-text editor */}
          <RichTextEditor
            label={
              <span>
                Article <span className="text-brand-primary">*</span>
              </span>
            }
            value={form.contentHtml}
            onChange={(html) => setForm((current) => ({ ...current, contentHtml: html }))}
            placeholder="Write the article…"
          />
          <FieldError errors={fieldIssues} field="contentHtml" />

          <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-[#e3221c]"
            />
            Published (visible on the site)
          </label>

          <FieldError errors={fieldIssues} field="isPublished" />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || form.contentHtml.trim().length === 0}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {editing === "new" ? "Publish post" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* The list */}
      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading posts…</span>
        </div>
      ) : loadError !== null ? (
        <div className="space-y-4">
          <ErrorLine error={loadError} />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
          >
            <RefreshCw size={13} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-6">
          No posts yet — write the first story.
        </p>
      ) : (
        <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
          {posts.map((post) => (
            <li key={post.id} className="py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-cream-200 shrink-0">
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt || post.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
                    <FileText size={18} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-ink-900 truncate">
                  {post.title}
                </p>
                <p className="font-sans text-xs text-ink-500">
                  {post.brand === "his-story-tellers" ? "His Story Tellers Media" : "ELEOS"}
                  {" · "}
                  {formatLongDate(post.publishedAt)}
                  {!post.isPublished && (
                    <span className="ml-2 text-brand-primary font-semibold">Draft</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(post)}
                aria-label={`Edit ${post.title}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(post)}
                aria-label={`Delete ${post.title}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Videos section                                                      */
/* ------------------------------------------------------------------ */

interface VideoFormState {
  title: string;
  brand: PostBrand;
  youtubeUrl: string;
  description: string;
  duration: string;
  category: string;
  tags: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  publishedAt: string;
  isPublished: boolean;
  slug: string;
}

const emptyVideoForm: VideoFormState = {
  title: "",
  brand: "eleos",
  youtubeUrl: "",
  description: "",
  duration: "",
  category: "",
  tags: "",
  thumbnailUrl: "",
  thumbnailAlt: "",
  publishedAt: "",
  isPublished: true,
  slug: "",
};

function videoToForm(video: VideoItemApi): VideoFormState {
  return {
    title: video.title,
    brand: video.brand,
    youtubeUrl: video.youtubeUrl,
    description: video.description,
    duration: video.duration,
    category: video.category,
    tags: video.tags.join(", "),
    thumbnailUrl: video.thumbnailUrl,
    thumbnailAlt: video.thumbnailAlt,
    publishedAt: isoToDate(video.publishedAt),
    isPublished: video.isPublished,
    slug: video.slug,
  };
}

function VideosSection() {
  const [videos, setVideos] = useState<VideoItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editing, setEditing] = useState<VideoItemApi | "new" | null>(null);
  const [form, setForm] = useState<VideoFormState>(emptyVideoForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchAdminVideos({ limit: 50 })
      .then((result) => {
        setVideos(result.items);
        setLoadError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setEditing("new");
    setForm(emptyVideoForm);
    setSaveError(null);
  };

  const startEdit = (video: VideoItemApi) => {
    setEditing(video);
    setForm(videoToForm(video));
    setSaveError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    const publishedAt = dateToIso(form.publishedAt);
    const payload = {
      title: form.title.trim(),
      brand: form.brand,
      youtubeUrl: form.youtubeUrl.trim(),
      description: form.description.trim() || undefined,
      duration: form.duration.trim() || undefined,
      category: form.category.trim() || undefined,
      tags: parseList(form.tags),
      thumbnailUrl: form.thumbnailUrl.trim() || undefined,
      thumbnailAlt: form.thumbnailAlt.trim() || undefined,
      isPublished: form.isPublished,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
    };

    try {
      if (editing === "new") {
        await createVideo(payload);
      } else if (editing) {
        await updateVideo(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (video: VideoItemApi) => {
    if (!window.confirm(`Delete the video “${video.title}”?`)) return;
    setActionError(null);
    try {
      await deleteVideo(video.id);
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  // Field-keyed messages from the last rejected save — see PostsSection.
  const fieldIssues = fieldErrors(saveError);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Videos{" "}
          <span className="font-sans text-sm text-ink-500">({videos.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          New video
        </button>
      </div>

      {actionError !== null && <ErrorLine error={actionError} />}

      {/* Create / edit form */}
      {editing !== null && (
        <form
          onSubmit={submit}
          className="border-2 border-brand-primary/40 bg-white rounded-md p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-ink-900">
              {editing === "new" ? "New video" : `Editing — ${editing.title}`}
            </h4>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close form"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <p className="font-sans text-sm text-ink-500">
            Paste the YouTube link (watch, share, live or shorts URL) — the site
            normalises it into the embedded player.
          </p>

          {saveError !== null && (
            <ErrorSummary error={saveError} what="save this video" />
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="video-title" className={labelClasses}>
                Title <span className="text-brand-primary">*</span>
              </label>
              <input
                id="video-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="title" />
              <p className="mt-1.5 font-sans text-xs text-ink-500">
                /videos/{form.slug.trim() ? slugify(form.slug) : slugify(form.title) || "…"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="video-brand" className={labelClasses}>
                Published under <span className="text-brand-primary">*</span>
              </label>
              <select
                id="video-brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value as PostBrand })}
                className={fieldClasses}
              >
                {BRANDS.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
              <FieldError errors={fieldIssues} field="brand" />
              <p className="mt-1.5 font-sans text-xs text-ink-500">
                Only ELEOS videos appear on the homepage.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="video-url" className={labelClasses}>
                YouTube URL <span className="text-brand-primary">*</span>
              </label>
              <input
                id="video-url"
                type="url"
                required
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="youtubeUrl" />
            </div>
            <div>
              <label htmlFor="video-duration" className={labelClasses}>
                Duration (e.g. 55:11)
              </label>
              <input
                id="video-duration"
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                maxLength={16}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="duration" />
            </div>
            <div>
              <label htmlFor="video-date" className={labelClasses}>
                Publish date
              </label>
              <input
                id="video-date"
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="publishedAt" />
            </div>
            <div>
              <label htmlFor="video-category" className={labelClasses}>
                Category
              </label>
              <input
                id="video-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Seminars and Workshops"
                maxLength={60}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="category" />
            </div>
            <div>
              <label htmlFor="video-tags" className={labelClasses}>
                Tags (comma-separated)
              </label>
              <input
                id="video-tags"
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="tags" />
            </div>
            <div>
              <label htmlFor="video-thumbnail" className={labelClasses}>
                Thumbnail image URL
              </label>
              <input
                id="video-thumbnail"
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="thumbnailUrl" />
            </div>
            <div>
              <label htmlFor="video-thumbnail-alt" className={labelClasses}>
                Thumbnail alt text
              </label>
              <input
                id="video-thumbnail-alt"
                type="text"
                value={form.thumbnailAlt}
                onChange={(e) => setForm({ ...form, thumbnailAlt: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="thumbnailAlt" />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor
                label="Description"
                value={form.description}
                onChange={(html) => setForm((current) => ({ ...current, description: html }))}
                placeholder="Describe the video…"
                minHeight="10rem"
              />
              <FieldError errors={fieldIssues} field="description" />
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 accent-[#e3221c]"
            />
            Published (visible on the site)
          </label>

          <FieldError errors={fieldIssues} field="isPublished" />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {editing === "new" ? "Add video" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* The list */}
      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading videos…</span>
        </div>
      ) : loadError !== null ? (
        <div className="space-y-4">
          <ErrorLine error={loadError} />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
          >
            <RefreshCw size={13} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-6">
          No videos yet — add the first one.
        </p>
      ) : (
        <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
          {videos.map((video) => (
            <li key={video.id} className="py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-cream-200 shrink-0">
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL
                  <img
                    src={video.thumbnailUrl}
                    alt={video.thumbnailAlt || video.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
                    <Clapperboard size={18} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-ink-900 truncate">
                  {video.title}
                </p>
                <p className="font-sans text-xs text-ink-500">
                  {video.brand === "his-story-tellers" ? "His Story Tellers Media" : "ELEOS"}
                  {" · "}
                  {video.duration ? `${video.duration} · ` : ""}
                  {formatLongDate(video.publishedAt)}
                  {!video.youtubeId && (
                    <span className="ml-2 text-ink-500/70">no embeddable player</span>
                  )}
                  {!video.isPublished && (
                    <span className="ml-2 text-brand-primary font-semibold">Draft</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(video)}
                aria-label={`Edit ${video.title}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(video)}
                aria-label={`Delete ${video.title}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The tab                                                             */
/* ------------------------------------------------------------------ */

const SECTIONS: Array<{ id: Section; label: string; icon: typeof Newspaper }> = [
  { id: "posts", label: "Blog posts", icon: Newspaper },
  { id: "videos", label: "Videos", icon: Clapperboard },
];

export default function MediaTab() {
  const [section, setSection] = useState<Section>("posts");

  return (
    <div className="space-y-8">
      <p className="font-sans text-sm text-ink-500">
        Publish stories under ELEOS or His Story Tellers Media — new posts and videos
        appear at the top of the blog, the videos page, the homepage and the footer
        automatically.
      </p>

      <div className="flex flex-wrap gap-2 border-b border-ink-900/15 pb-4" role="tablist">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] font-semibold px-4 py-2.5 rounded-sm border transition-colors duration-300 ${
              section === id
                ? "bg-brand-primary text-cream-50 border-brand-primary"
                : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {section === "posts" && <PostsSection />}
      {section === "videos" && <VideosSection />}
    </div>
  );
}
