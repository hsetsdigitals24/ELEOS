// app/videos/[slug]/page.tsx — a single video session: embedded player
// (when the YouTube upload is known), dateline and description, a
// "you may also like" moment, and the same comment system as the blog
// (the backend keys comments on targetType="video").
//
// Videos come from the API (the database is the source of truth — the admin
// publishes there). The hardcoded videos in videoData.ts are the fallback.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Eye, Play, SquarePlay, Tag } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CommentsSection from "@/components/comments/CommentsSection";
import { getVideoBySlug, sortedVideos } from "@/components/videos/videoData";
import { serverRequest } from "@/lib/api/server";
import { formatLongDate } from "@/lib/formatDate";
import type { VideoItem, VideoItemApi } from "@/types/video";

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

/** The unified view of a video — either a static video or an API video. */
interface VideoView {
  slug: string;
  title: string;
  description: string;
  duration: string;
  /** ISO date string */
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  thumbnail: string;
  thumbnailAlt: string;
  /** YouTube video id — embedded when present. */
  youtubeId?: string;
  channelUrl: string;
}

/** A lighter shape for the "you may also like" rail. */
interface VideoTeaser {
  slug: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
  thumbnailAlt: string;
}

export function generateStaticParams() {
  return sortedVideos.map((video) => ({ slug: video.slug }));
}

/** Resolves a slug to a video: API first, hardcoded data as fallback. */
async function getVideo(slug: string): Promise<VideoView | null> {
  const apiVideo = await serverRequest<VideoItemApi>(`/videos/${encodeURIComponent(slug)}`);
  if (apiVideo) {
    return {
      slug: apiVideo.slug,
      title: apiVideo.title,
      description: apiVideo.description,
      duration: apiVideo.duration,
      publishedAt: apiVideo.publishedAt,
      category: apiVideo.category,
      tags: apiVideo.tags,
      views: 0,
      thumbnail: apiVideo.thumbnailUrl,
      thumbnailAlt: apiVideo.thumbnailAlt,
      youtubeId: apiVideo.youtubeId.length > 0 ? apiVideo.youtubeId : undefined,
      channelUrl: apiVideo.channelUrl,
    };
  }

  const staticVideo = getVideoBySlug(slug);
  if (!staticVideo) return null;
  return staticVideo;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) return { title: "Video not found | ELEOS Research Innovations" };

  return {
    title: `${video.title} | ELEOS Research Innovations (ERI)`,
    description: video.description,
  };
}

export default async function VideoDetailPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) notFound();

  // The "you may also like" rail — the API's newest-first list when
  // reachable, the hardcoded order as fallback.
  const page = await serverRequest<{ items: VideoItemApi[] }>("/videos?limit=50");
  const others: VideoTeaser[] =
    page && page.items.length > 0
      ? page.items
          .filter((item) => item.slug !== video.slug)
          .map((item) => ({
            slug: item.slug,
            title: item.title,
            duration: item.duration,
            category: item.category,
            thumbnail: item.thumbnailUrl,
            thumbnailAlt: item.thumbnailAlt,
          }))
      : sortedVideos
          .filter((item) => item.slug !== video.slug)
          .map((item) => ({
            slug: item.slug,
            title: item.title,
            duration: item.duration,
            category: item.category,
            thumbnail: item.thumbnail,
            thumbnailAlt: item.thumbnailAlt,
          }));

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Navbar />
      <main id={`video-${video.slug}`} className="w-full grow bg-cream-100">
        {/* ── Headline block ─────────────────────────────────── */}
        <header className="pt-36 md:pt-44 pb-10 px-6">
          <div className="max-w-4xl mx-auto">
            <nav
              aria-label="Breadcrumb"
              className="font-sans text-xs uppercase tracking-[0.15em] text-ink-500"
            >
              <Link href="/videos" className="hover:text-brand-primary transition-colors">
                Videos
              </Link>
              <span className="mx-2 text-ink-900/30">/</span>
              <span className="text-brand-primary font-semibold">{video.category}</span>
            </nav>

            <h1 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-ink-900">
              {video.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-xs text-ink-500 uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-brand-primary" aria-hidden="true" />
                <time dateTime={video.publishedAt}>{formatLongDate(video.publishedAt)}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-brand-primary" aria-hidden="true" />
                {video.duration}
              </span>
              {video.views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye size={13} className="text-brand-primary" aria-hidden="true" />
                  {video.views} {video.views === 1 ? "view" : "views"}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── Player ─────────────────────────────────────────── */}
        <div className="px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {video.youtubeId ? (
              <div className="relative aspect-video w-full bg-cream-200 rounded-md overflow-hidden border border-ink-900/10">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            ) : (
              /* No public embed for this session yet — point viewers at the
                 channel instead of pretending to host the video. */
              <div className="relative aspect-video w-full bg-cream-200 rounded-md overflow-hidden border border-ink-900/10">
                <Image
                  src={video.thumbnail}
                  alt={video.thumbnailAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover object-top opacity-30"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                  <span className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-cream-50 shadow-xl">
                    <Play size={26} fill="currentColor" className="ml-1" aria-hidden="true" />
                  </span>
                  <p className="font-sans text-sm text-ink-700 max-w-sm">
                    This session isn’t embeddable here yet — watch it on our YouTube channel.
                  </p>
                  <a
                    href={video.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 bg-brand-primary text-cream-50 px-7 py-3 text-[0.8rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-md hover:bg-brand-hover transition-colors duration-300"
                  >
                    <SquarePlay size={16} aria-hidden="true" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Description & tags ─────────────────────────────── */}
        <div className="px-6 py-10">
          <div className="max-w-2xl mx-auto">
            <div
              className="font-sans text-[1.05rem] leading-[1.85] text-ink-700"
              // Rich text from the admin editor — sanitized on write (server
              // allowlist); plain-text values render unchanged.
              dangerouslySetInnerHTML={{ __html: video.description }}
            />

            {video.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-ink-900/15 flex flex-wrap items-center gap-2.5 font-sans text-xs">
                <Tag size={13} className="text-brand-primary" aria-hidden="true" />
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="uppercase tracking-[0.12em] font-semibold border border-ink-900/15 text-ink-700 px-3 py-1.5 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── You may also like ──────────────────────────────── */}
        {others.length > 0 && (
          <section className="px-6 py-14 bg-cream-50 border-t border-ink-900/10">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl text-ink-900 mb-8">You may also like</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/videos/${other.slug}`}
                    className="group flex gap-5 items-center border border-ink-900/10 rounded-md p-4 hover:border-brand-primary transition-colors duration-300"
                  >
                    <div className="relative w-28 shrink-0 aspect-square overflow-hidden rounded-sm">
                      <Image
                        src={other.thumbnail}
                        alt={other.thumbnailAlt}
                        fill
                        sizes="112px"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brand-primary font-semibold">
                        {other.duration} — {other.category}
                      </p>
                      <h3 className="mt-2 font-display text-base leading-snug text-ink-900 group-hover:text-brand-hover transition-colors">
                        {other.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Comments ───────────────────────────────────────── */}
        <div id="comments" className="px-6 py-16 bg-cream-100 scroll-mt-28">
          <div className="max-w-2xl mx-auto">
            <CommentsSection targetType="video" targetId={video.slug} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
