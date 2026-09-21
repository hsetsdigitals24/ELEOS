/**
 * Shared TypeScript interfaces used across layers (services, controllers,
 * validators). Keeping them here avoids circular imports between the
 * HTTP layer and the business-logic layer.
 */

/** Content types a comment can be attached to. */
export type CommentTargetType = "blog" | "video";

/** Public-facing shape of a comment — never exposes the author's email. */
export interface PublicComment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

/** Standard pagination envelope returned by list endpoints. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

/* ------------------------------------------------------------------ */
/* Contact messages                                                    */
/* ------------------------------------------------------------------ */

/** Public-facing shape of a contact message as stored (admin-only reads). */
export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/** Public-facing shape of a Marvela product listed in the shop. */
export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  selarUrl: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Blog posts                                                          */
/* ------------------------------------------------------------------ */

/** Who a post is published under — ELEOS itself or its media subsidiary. */
export type PostBrand = "eleos" | "his-story-tellers";

/** A comment imported from the previous WordPress site (archived, read-only). */
export interface ArchivedCommentItem {
  authorName: string;
  body: string;
  /** ISO date string */
  postedAt: string;
}

/** Public-facing shape of a blog post. */
export interface PostItem {
  id: string;
  slug: string;
  title: string;
  brand: PostBrand;
  excerpt: string;
  author: string;
  categories: string[];
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  contentHtml: string;
  archivedComments: ArchivedCommentItem[];
  isPublished: boolean;
  /** ISO date string */
  publishedAt: string;
  /** ISO date string */
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */

/** Public-facing shape of a recorded video session. */
export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  brand: PostBrand;
  description: string;
  duration: string;
  /** ISO date string */
  publishedAt: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  thumbnailAlt: string;
  youtubeUrl: string;
  /** YouTube video id derived from the URL — the detail page embeds it. */
  youtubeId: string;
  channelUrl: string;
  isPublished: boolean;
  /** ISO date string */
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Upcoming events                                                     */
/* ------------------------------------------------------------------ */

/** Public-facing shape of one upcoming event on the events page. */
export interface EventItem {
  id: string;
  slug: string;
  title: string;
  /** ISO date string — the day the event starts */
  date: string;
  /** Human time range, e.g. "10:00am – 2:00pm (GMT)" */
  time: string;
  venue: string;
  city: string;
  category: string;
  /** Rich-text HTML (sanitized on write) */
  description: string;
  imageUrl: string;
  imageAlt: string;
  isPublished: boolean;
  /** ISO date string */
  updatedAt: string;
  /** How many people have registered. Only populated on admin reads. */
  registrationCount?: number;
}

/* ------------------------------------------------------------------ */
/* Event registration forms                                            */
/* ------------------------------------------------------------------ */

/** Every field type the admin can put on an event's registration form. */
export type RegistrationFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox";

/** One question on an event's registration form. */
export interface RegistrationField {
  /**
   * Stable identifier, minted when the field is created and never changed
   * when it is renamed — this is what ties an old answer to its question.
   */
  key: string;
  label: string;
  type: RegistrationFieldType;
  placeholder: string;
  helpText: string;
  required: boolean;
  /** Choices for `select` / `radio`; empty for every other type. */
  options: string[];
}

/** Public-facing shape of one event's registration form. */
export interface EventRegistrationFormItem {
  id: string;
  eventId: string;
  fields: RegistrationField[];
  /** When false the form renders closed and submissions are refused. */
  isOpen: boolean;
  intro: string;
  successMessage: string;
  /** ISO date string */
  updatedAt: string;
}

/** One answer as stored on a submission. */
export interface RegistrationAnswer {
  key: string;
  /**
   * The question's label AT SUBMIT TIME. Snapshotted deliberately: renaming
   * or deleting a field later must not rewrite what was already collected.
   */
  label: string;
  value: string;
}

/** Admin-facing shape of one submitted registration. */
export interface EventRegistrationItem {
  id: string;
  eventId: string;
  answers: RegistrationAnswer[];
  /** Best-effort convenience for the response list — derived on write. */
  name: string;
  /** Empty when the form has no email field. Doubles as the dedupe key. */
  email: string;
  isReviewed: boolean;
  /** ISO date string */
  createdAt: string;
}

/** The slice of an event the public registration page needs for its header. */
export interface RegistrationEventSummary {
  id: string;
  slug: string;
  title: string;
  /** ISO date string */
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
}

/** Everything the public registration page renders, in one payload. */
export interface EventRegistrationPage {
  event: RegistrationEventSummary;
  form: EventRegistrationFormItem;
}

/* ------------------------------------------------------------------ */
/* Broadcast settings                                                  */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Admin auth                                                          */
/* ------------------------------------------------------------------ */

/** API shape of a role — permissions are resolved from the role at
 *  request time, so role edits apply to every user immediately. */
export interface RoleItem {
  id: string;
  name: string;
  slug: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** API shape of an admin user — never includes a password hash. */
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: RoleItem;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** What the client receives about the signed-in admin. */
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    slug: string;
  };
  permissions: string[];
}

/** Fresh session tokens as issued by the auth service. */
export interface IssuedSession {
  session: AuthSession;
  accessToken: string;
  refreshToken: string;
}
