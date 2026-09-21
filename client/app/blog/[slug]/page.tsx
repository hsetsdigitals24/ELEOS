// app/blog/[slug]/page.tsx — a single article, laid out like a long-form
// editorial feature: kicker + display headline + byline, a full-bleed image
// moment, then a reading column whose data/quote blocks break out into
// wider visual beats. Comments live at the foot of the piece.
//
// Posts come from the API (the database is the source of truth — the admin
// publishes there). The hardcoded posts in blogData.ts are the fallback.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MessageSquare,
  Tag,
  User,
} from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CommentsSection from "@/components/comments/CommentsSection";
import ArticleHtml from "@/components/blog/ArticleHtml";
import { getPostBySlug, sortedBlogPosts } from "@/components/blog/blogData";
import { serverRequest } from "@/lib/api/server";
import { formatLongDate } from "@/lib/formatDate";
import type { ArchivedComment, ArticleBlock, BlogPostItem } from "@/types/blog";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** The unified view of an article — either a static post or an API post. */
interface ArticleView {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  /** ISO date string */
  publishedAt: string;
  /** ISO date string, shown as "Updated …" when present */
  updatedAt?: string;
  categories: string[];
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  /** Editorial blocks — static posts only. */
  content?: ArticleBlock[];
  /** Rich-text body — API posts only. */
  contentHtml?: string;
  archivedComments: ArchivedComment[];
}

export function generateStaticParams() {
  return sortedBlogPosts.map((post) => ({ slug: post.slug }));
}

/** Resolves a slug to an article: API first, hardcoded data as fallback. */
async function getArticle(slug: string): Promise<ArticleView | null> {
  const apiPost = await serverRequest<BlogPostItem>(`/posts/${encodeURIComponent(slug)}`);
  if (apiPost) {
    return {
      slug: apiPost.slug,
      title: apiPost.title,
      excerpt: apiPost.excerpt,
      author: apiPost.author,
      publishedAt: apiPost.publishedAt,
      updatedAt: apiPost.updatedAt,
      categories: apiPost.categories,
      tags: apiPost.tags,
      imageUrl: apiPost.imageUrl,
      imageAlt: apiPost.imageAlt,
      contentHtml: apiPost.contentHtml,
      archivedComments: apiPost.archivedComments,
    };
  }

  const staticPost = getPostBySlug(slug);
  if (!staticPost) return null;
  return {
    slug: staticPost.slug,
    title: staticPost.title,
    excerpt: staticPost.excerpt,
    author: staticPost.author,
    publishedAt: staticPost.publishedAt,
    updatedAt: staticPost.updatedAt,
    categories: staticPost.categories,
    tags: staticPost.tags,
    imageUrl: staticPost.image,
    imageAlt: staticPost.imageAlt,
    content: staticPost.content,
    archivedComments: staticPost.archivedComments,
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return { title: "Story not found | ELEOS Research Innovations" };

  return {
    title: `${post.title} | ELEOS Research Innovations (ERI)`,
    description: post.excerpt,
  };
}

/** Renders one editorial block. Data/quote blocks break the reading column. */
function Block({ block, isLead }: { block: ArticleBlock; isLead: boolean }) {
  switch (block.type) {
    case "p":
      return (
        <p
          className={`font-sans text-[1.05rem] leading-[1.85] text-ink-700 whitespace-pre-line ${
            isLead ? "first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-brand-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1.5" : ""
          }`}
        >
          {block.text}
        </p>
      );

    case "quote":
      return (
        <figure className="relative my-14 py-8 pl-8 border-l-4 border-brand-primary">
          <blockquote className="font-display text-2xl sm:text-[1.75rem] leading-snug text-ink-900 italic">
            {block.text}
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-4 font-sans text-xs uppercase tracking-[0.15em] text-ink-500">
              — {block.attribution}
            </figcaption>
          )}
        </figure>
      );

    case "list":
      return (
        <div className="my-10 bg-cream-200/70 border border-ink-900/10 rounded-md p-7 sm:p-9">
          {block.title && (
            <h3 className="font-display text-xl text-ink-900 mb-5">{block.title}</h3>
          )}
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {block.items.map((item) => (
              <li key={item} className="font-sans text-sm text-ink-700 flex items-baseline gap-2.5">
                <span aria-hidden="true" className="text-brand-primary font-bold">›</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "data":
      return (
        <figure className="my-14 bg-white text-ink-950 rounded-md overflow-hidden border border-ink-900/10">
          <div className="border-b-4 border-brand-primary px-7 sm:px-9 pt-7 pb-5">
            <h3 className="font-display text-xl sm:text-2xl">{block.title}</h3>
            {block.intro && (
              <p className="font-sans text-sm text-ink-500 mt-1.5">{block.intro}</p>
            )}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            {block.rows.map((row) => (
              <div
                key={row.label}
                className="px-7 sm:px-9 py-5 border-t border-ink-900/10 odd:border-r sm:border-r sm:last:border-r-0"
              >
                <dt className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-ink-500">
                  {row.label}
                </dt>
                <dd className="font-display text-lg sm:text-xl mt-1.5 text-ink-950">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      );
  }
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();

  // The reading order for prev/next navigation — the API's newest-first
  // list when reachable, the hardcoded order as fallback.
  const page = await serverRequest<{ items: BlogPostItem[] }>("/posts?limit=50");
  const orderedSlugs =
    page && page.items.length > 0
      ? page.items.map((item) => item.slug)
      : sortedBlogPosts.map((item) => item.slug);
  const index = orderedSlugs.indexOf(post.slug);
  const newer = index > 0 ? orderedSlugs[index - 1] : undefined;
  const older =
    index >= 0 && index < orderedSlugs.length - 1 ? orderedSlugs[index + 1] : undefined;
  const newerTitle = newer ? (page?.items.find((item) => item.slug === newer)?.title ?? newer) : null;
  const olderTitle = older ? (page?.items.find((item) => item.slug === older)?.title ?? older) : null;

  // Comment count for the byline — archived comments on the post plus the
  // live ones from the comments API (limit=1 keeps the payload tiny; only
  // pagination.total is used).
  const commentsPage = await serverRequest<{
    pagination: { total: number };
  }>(`/comments?targetType=blog&targetId=${encodeURIComponent(post.slug)}&limit=1`);
  const commentCount = post.archivedComments.length + (commentsPage?.pagination.total ?? 0);

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main id={`article-${post.slug}`} className="w-full grow bg-cream-100">
        {/* ── Headline block ─────────────────────────────────── */}
        <header className="pt-36 md:pt-44 pb-10 px-6">
          <div className="max-w-4xl mx-auto">
            <nav aria-label="Breadcrumb" className="font-sans text-xs uppercase tracking-[0.15em] text-ink-500">
              <Link href="/blog" className="hover:text-brand-primary transition-colors">
                Blog
              </Link>
              <span className="mx-2 text-ink-900/30">/</span>
              <span className="text-brand-primary font-semibold">{post.categories[0]}</span>
            </nav>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink-900">
              {post.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-xs text-ink-500 uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-brand-primary" aria-hidden="true" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-brand-primary" aria-hidden="true" />
                <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
              </span>
              {post.updatedAt && (
                <span>
                  Updated <time dateTime={post.updatedAt}>{formatLongDate(post.updatedAt)}</time>
                </span>
              )}
              <a
                href="#comments"
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
              >
                <MessageSquare size={13} className="text-brand-primary" aria-hidden="true" />
                {commentCount} {commentCount === 1 ? "comment" : "comments"}
              </a>
            </div>
          </div>
        </header>

        {/* ── Full-bleed image moment ────────────────────────── */}
        <div className="relative aspect-21/9 min-h-56 max-h-140 w-full">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* ── Reading column ─────────────────────────────────── */}
        <div className="px-6 py-14 md:py-20">
          <div className="max-w-2xl mx-auto space-y-7">
            <p className="font-display text-xl sm:text-2xl leading-snug text-ink-900 border-l-4 border-brand-primary pl-6">
              {post.excerpt}
            </p>
            {post.content ? (
              post.content.map((block, i) => (
                <Block key={i} block={block} isLead={i === 0} />
              ))
            ) : (
              <ArticleHtml html={post.contentHtml ?? ""} />
            )}
          </div>

          {/* Tags & categories */}
          <div className="max-w-2xl mx-auto mt-14 pt-8 border-t border-ink-900/15">
            <div className="flex flex-wrap items-center gap-2.5 font-sans text-xs">
              <Tag size={13} className="text-brand-primary" aria-hidden="true" />
              {[...post.categories, ...post.tags].map((label) => (
                <span
                  key={label}
                  className="uppercase tracking-[0.12em] font-semibold border border-ink-900/15 text-ink-700 px-3 py-1.5 rounded-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Post navigation ────────────────────────────────── */}
        <nav
          aria-label="Post navigation"
          className="border-t-4 border-double border-ink-900/20 px-6 py-12 bg-cream-50"
        >
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
            {older ? (
              <Link
                href={`/blog/${older}`}
                className="group text-left border border-ink-900/10 rounded-md p-6 hover:border-brand-primary transition-colors duration-300"
              >
                <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-ink-500 group-hover:text-brand-primary transition-colors">
                  <ArrowLeft size={13} aria-hidden="true" /> Previous
                </span>
                <span className="block mt-3 font-display text-lg leading-snug text-ink-900">
                  {olderTitle}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/blog/${newer}`}
                className="group text-right border border-ink-900/10 rounded-md p-6 hover:border-brand-primary transition-colors duration-300 sm:col-start-2"
              >
                <span className="flex items-center justify-end gap-2 font-sans text-xs uppercase tracking-[0.15em] text-ink-500 group-hover:text-brand-primary transition-colors">
                  Next <ArrowRight size={13} aria-hidden="true" />
                </span>
                <span className="block mt-3 font-display text-lg leading-snug text-ink-900">
                  {newerTitle}
                </span>
              </Link>
            )}
          </div>
        </nav>

        {/* ── Comments ───────────────────────────────────────── */}
        <div id="comments" className="px-6 pb-20 pt-4 scroll-mt-28">
          <div className="max-w-2xl mx-auto">
            <CommentsSection
              targetType="blog"
              targetId={post.slug}
              archivedComments={post.archivedComments}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
