// lib/youtube.ts — turns whatever YouTube URL the admin pasted into an
// embeddable one. Handles watch links, share links, live links, shorts,
// and channel live streams; returns null when the URL can't be embedded
// (e.g. a bare channel handle), so the caller can fall back to an
// external "Watch on YouTube" link.

const VIDEO_ID = /^[A-Za-z0-9_-]{6,}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{20,}$/;

export function toYouTubeEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host !== "youtube.com" && host !== "youtube-nocookie.com" && host !== "youtu.be") {
    return null;
  }

  // A channel's live stream embeds through the live_stream player.
  const channelParam = url.searchParams.get("channel");
  if (channelParam && CHANNEL_ID.test(channelParam)) {
    return `https://www.youtube.com/embed/live_stream?channel=${channelParam}`;
  }
  const channelMatch = url.pathname.match(/^\/channel\/(UC[A-Za-z0-9_-]{20,})(?:\/live)?$/);
  if (channelMatch) {
    return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}`;
  }

  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (url.searchParams.get("v")) {
    id = url.searchParams.get("v");
  } else {
    const pathMatch = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
    id = pathMatch ? pathMatch[1] : null;
  }

  if (!id || !VIDEO_ID.test(id)) return null;
  return `https://www.youtube.com/embed/${id}`;
}

/** A watchable URL for "Watch/Listen on YouTube" external buttons. */
export function toYouTubeWatchUrl(rawUrl: string): string {
  const embed = toYouTubeEmbedUrl(rawUrl);
  const id = embed?.match(/\/embed\/([A-Za-z0-9_-]{6,})/)?.[1];
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return rawUrl;
}
