import { BroadcastSetting, type BroadcastSettingDocument } from "../models/broadcast.model.ts";
import { sanitizeContentHtml } from "./post.service.ts";
import type {
  AudioBroadcastMedium,
  AudioBroadcastSettings,
  BroadcastSettings,
  VideoBroadcastSettings,
  } from "../types/index.ts";
  import type { UpdateBroadcastInput } from "../validators/broadcast.validator.ts";

  /**
   * BroadcastService — ALL broadcast-setting business logic and database
   * access lives here. Controllers never touch Mongoose directly.
   *
   * The settings live in one singleton document; reads create it on first
   * access so the public endpoint always returns a fully-formed shape.
   */

  const SINGLETON_ID = "global";

/** Defaults shown before the admin has ever saved a configuration. */
export const DEFAULT_AUDIO_SETTINGS: AudioBroadcastSettings = {
  medium: "none",
  url: "",
  title: "",
  description: "",
  isLive: false,
};

export const DEFAULT_VIDEO_SETTINGS: VideoBroadcastSettings = {
  url: "",
  title: "",
  description: "",
  isLive: false,
};

/** Maps a lean document to the public API shape. */
function toSettings(doc: BroadcastSettingDocument | null): BroadcastSettings {
  return {
    audio: {
      medium: (doc?.audio?.medium ?? "none") as AudioBroadcastMedium,
      url: doc?.audio?.url ?? "",
      title: doc?.audio?.title ?? "",
      description: doc?.audio?.description ?? "",
      isLive: doc?.audio?.isLive ?? false,
    },
    video: {
      url: doc?.video?.url ?? "",
      title: doc?.video?.title ?? "",
      description: doc?.video?.description ?? "",
      isLive: doc?.video?.isLive ?? false,
    },
    updatedAt:
      doc?.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc?.updatedAt ?? ""),
  };
}

/** Reads the singleton, creating it with defaults if it doesn't exist yet. */
async function getOrCreateSettings(): Promise<BroadcastSettingDocument> {
  const existing = await BroadcastSetting.findOne({ singletonId: SINGLETON_ID });
  if (existing) return existing;
  return BroadcastSetting.create({ singletonId: SINGLETON_ID });
}

export async function getBroadcastSettings(): Promise<BroadcastSettings> {
  return toSettings(await getOrCreateSettings());
}

/** Merges a partial patch over a base without letting undefined clobber
 *  existing values — returns the full, fully-typed settings block. */
function mergeSettings<T extends object>(
  base: T,
  patch: { [K in keyof T]?: T[K] | undefined }
): T {
  const merged = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

export async function updateBroadcastSettings(
  input: UpdateBroadcastInput
): Promise<BroadcastSettings> {
  const current = toSettings(await getOrCreateSettings());

  const set: { audio?: AudioBroadcastSettings; video?: VideoBroadcastSettings } = {};

  if (input.audio) {
    const merged = mergeSettings(current.audio, input.audio);
    // The description is rich text from the admin editor — sanitize it.
    merged.description = sanitizeContentHtml(merged.description);
    // Medium "none" (or a cleared URL) resets the whole block to defaults,
    // so the public page shows its placeholder instead of a dead player.
    set.audio =
      merged.medium === "none" || merged.url === ""
        ? { ...DEFAULT_AUDIO_SETTINGS }
        : merged;
  }

  if (input.video) {
    const merged = mergeSettings(current.video, input.video);
    merged.description = sanitizeContentHtml(merged.description);
    set.video = merged.url === "" ? { ...DEFAULT_VIDEO_SETTINGS } : merged;
  }

  const updated = await BroadcastSetting.findOneAndUpdate(
    { singletonId: SINGLETON_ID },
    { $set: set },
    { new: true, runValidators: true }
  );

  return toSettings(updated);
}
