// lib/api/admin.ts — typed client for the guarded /api/v1/admin/* API.
//
// Authorization is cookie-based: the signed-in admin's session rides along
// automatically and the server enforces per-route permissions.

import { request } from "./client";
import type { ContactMessagesPage } from "@/types/contact";
import type { ProductItem, ProductInput } from "@/types/product";
import type { BroadcastSettings, UpdateBroadcastInput } from "@/types/broadcast";
import type { BlogPostInput, BlogPostItem, BlogPostsPage } from "@/types/blog";
import type { VideoInput, VideoItemApi, VideosPage } from "@/types/video";
import type { EventInput, EventItemApi, EventsPage } from "@/types/event";
import type {
  EventRegistrationForm,
  EventRegistrationsPage,
  UpdateEventFormInput,
} from "@/types/registration";

/** Updates the live broadcast configuration (audio and/or video). */
export async function updateBroadcastSettings(
  input: UpdateBroadcastInput
): Promise<BroadcastSettings> {
  return request<BroadcastSettings>("/admin/broadcasts", {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Adds a product to the shop. */
export async function createProduct(input: ProductInput): Promise<ProductItem> {
  return request<ProductItem>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Updates a product by id. */
export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>
): Promise<ProductItem> {
  return request<ProductItem>(`/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes a product by id. */
export async function deleteProduct(productId: string): Promise<void> {
  await request<unknown>(`/admin/products/${productId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/** Admin inbox — paginated contact messages, newest first. */
export async function fetchContactMessages(
  params: { page?: number; limit?: number; unread?: boolean } = {}
): Promise<ContactMessagesPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.unread) query.set("unread", "true");

  return request<ContactMessagesPage>(`/admin/contact-messages?${query.toString()}`, {
    serviceName: "admin service",
  });
}

/** Marks a contact message read or unread. */
export async function markContactMessageRead(
  messageId: string,
  isRead: boolean
): Promise<void> {
  await request<unknown>(`/admin/contact-messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
    serviceName: "admin service",
  });
}

/** Deletes a contact message. */
export async function deleteContactMessage(messageId: string): Promise<void> {
  await request<unknown>(`/admin/contact-messages/${messageId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/* ------------------------------------------------------------------ */
/* Blog posts & videos (content:manage)                                */
/* ------------------------------------------------------------------ */

/** Admin listing — every post including unpublished, newest first. */
export async function fetchAdminPosts(
  params: { page?: number; limit?: number } = {}
): Promise<BlogPostsPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
  });
  return request<BlogPostsPage>(`/admin/posts?${query.toString()}`, {
    serviceName: "admin service",
  });
}

/** Publishes a blog post. */
export async function createPost(input: BlogPostInput): Promise<BlogPostItem> {
  return request<BlogPostItem>("/admin/posts", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Updates a blog post by id. */
export async function updatePost(
  postId: string,
  input: Partial<BlogPostInput>
): Promise<BlogPostItem> {
  return request<BlogPostItem>(`/admin/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes a blog post by id. */
export async function deletePost(postId: string): Promise<void> {
  await request<unknown>(`/admin/posts/${postId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/** Admin listing — every video including unpublished, newest first. */
export async function fetchAdminVideos(
  params: { page?: number; limit?: number } = {}
): Promise<VideosPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
  });
  return request<VideosPage>(`/admin/videos?${query.toString()}`, {
    serviceName: "admin service",
  });
}

/** Adds a video. */
export async function createVideo(input: VideoInput): Promise<VideoItemApi> {
  return request<VideoItemApi>("/admin/videos", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Updates a video by id. */
export async function updateVideo(
  videoId: string,
  input: Partial<VideoInput>
): Promise<VideoItemApi> {
  return request<VideoItemApi>(`/admin/videos/${videoId}`, {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes a video by id. */
export async function deleteVideo(videoId: string): Promise<void> {
  await request<unknown>(`/admin/videos/${videoId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/* ------------------------------------------------------------------ */
/* Upcoming events (events:manage)                                     */
/* ------------------------------------------------------------------ */

/** Admin listing — every event including unpublished, soonest first. */
export async function fetchAdminEvents(
  params: { page?: number; limit?: number } = {}
): Promise<EventsPage> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
  });
  return request<EventsPage>(`/admin/events?${query.toString()}`, {
    serviceName: "admin service",
  });
}

/** Adds an upcoming event. */
export async function createEvent(input: EventInput): Promise<EventItemApi> {
  return request<EventItemApi>("/admin/events", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Updates an upcoming event by id. */
export async function updateEvent(
  eventId: string,
  input: Partial<EventInput>
): Promise<EventItemApi> {
  return request<EventItemApi>(`/admin/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** Removes an upcoming event by id. */
export async function deleteEvent(eventId: string): Promise<void> {
  await request<unknown>(`/admin/events/${eventId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}

/* ------------------------------------------------------------------ */
/* Event registration (events:manage)                                  */
/* ------------------------------------------------------------------ */

/**
 * Loads an event's registration form for the builder. The server creates
 * the default form on first read, so events that predate this feature
 * return one rather than 404ing.
 */
export async function fetchAdminEventForm(
  eventId: string
): Promise<EventRegistrationForm> {
  return request<EventRegistrationForm>(`/admin/events/${eventId}/registration-form`, {
    serviceName: "admin service",
  });
}

/** Saves an event's whole registration form in one atomic write. */
export async function updateAdminEventForm(
  eventId: string,
  input: UpdateEventFormInput
): Promise<EventRegistrationForm> {
  return request<EventRegistrationForm>(`/admin/events/${eventId}/registration-form`, {
    method: "PUT",
    body: JSON.stringify(input),
    serviceName: "admin service",
  });
}

/** One event's responses, newest first — always scoped to a single event. */
export async function fetchEventRegistrations(
  params: { event: string; unreviewed?: boolean; page?: number; limit?: number }
): Promise<EventRegistrationsPage> {
  const query = new URLSearchParams({
    event: params.event,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 100),
  });
  if (params.unreviewed) query.set("unreviewed", "true");

  return request<EventRegistrationsPage>(`/admin/registrations?${query.toString()}`, {
    serviceName: "admin service",
  });
}

/** Marks a registration reviewed or unreviewed. */
export async function markRegistrationReviewed(
  registrationId: string,
  isReviewed: boolean
): Promise<void> {
  await request<unknown>(`/admin/registrations/${registrationId}`, {
    method: "PATCH",
    body: JSON.stringify({ isReviewed }),
    serviceName: "admin service",
  });
}

/** Deletes a registration. */
export async function deleteRegistration(registrationId: string): Promise<void> {
  await request<unknown>(`/admin/registrations/${registrationId}`, {
    method: "DELETE",
    serviceName: "admin service",
  });
}
