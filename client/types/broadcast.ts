// types/broadcast.ts — shared shapes for the live broadcast settings, used
// by the API clients (lib/api/broadcasts.ts, lib/api/admin.ts) and the
// broadcast pages.

/** Where a live audio broadcast is carried. */
export type AudioBroadcastMedium =
  | "none"
  | "youtube"
  | "mixlr"
  | "facebook"
  | "external";

export interface AudioBroadcastSettings {
  medium: AudioBroadcastMedium;
  url: string;
  title: string;
  description: string;
  isLive: boolean;
}

export interface VideoBroadcastSettings {
  url: string;
  title: string;
  description: string;
  isLive: boolean;
}

/** The singleton broadcast configuration the admin maintains. */
export interface BroadcastSettings {
  audio: AudioBroadcastSettings;
  video: VideoBroadcastSettings;
  updatedAt: string;
}

/** Payload for updating broadcast settings from the admin console. */
export interface UpdateBroadcastInput {
  audio?: Partial<AudioBroadcastSettings>;
  video?: Partial<VideoBroadcastSettings>;
}
