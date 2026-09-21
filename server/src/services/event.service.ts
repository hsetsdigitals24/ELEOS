import { AppError } from "../utils/AppError.ts";
import { slugify } from "../utils/slugify.ts";
import { Event, type EventDocument } from "../models/event.model.ts";
import { sanitizeContentHtml } from "./post.service.ts";
import {
  countRegistrationsByEvent,
  deleteRegistrationsForEvent,
  ensureFormForEvent,
} from "./registration.service.ts";
import type { PaginatedResult, EventItem } from "../types/index.ts";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "../validators/event.validator.ts";

/**
 * EventService — ALL upcoming-event business logic and database access
 * lives here. Controllers never touch Mongoose directly.
 */

/** Lean event shape as returned by `.lean()` reads. */
type LeanEvent = Omit<EventDocument, "_id"> & { _id: { toString(): string } };

/** Maps a lean document to the public API shape. */
function toEventItem(doc: LeanEvent, registrationCount?: number): EventItem {
  const item: EventItem = {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
    time: doc.time ?? "",
    venue: doc.venue ?? "",
    city: doc.city ?? "",
    category: doc.category ?? "",
    description: doc.description,
    imageUrl: doc.imageUrl ?? "",
    imageAlt: doc.imageAlt ?? "",
    isPublished: doc.isPublished ?? true,
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
  // Only admin reads carry a count — the public listing has no use for it.
  if (registrationCount !== undefined) {
    item.registrationCount = registrationCount;
  }
  return item;
}

export interface CreateEventServiceInput extends CreateEventInput {}

export async function createEvent(input: CreateEventServiceInput): Promise<EventItem> {
  const { slug, description, ...rest } = input;
  try {
    const created = await Event.create({
      ...rest,
      slug: slug && slug.length > 0 ? slug : slugify(input.title),
      description: sanitizeContentHtml(description),
    });

    // Every event carries a registration form from the moment it exists, so
    // the admin can shape it before the event is ever announced. The service
    // also creates one lazily on read, which covers events that predate this.
    await ensureFormForEvent(created._id.toString());

    return toEventItem(created.toObject() as LeanEvent);
  } catch (err) {
    // Surface a duplicate slug as a friendly 409, like the posts module.
    if (err instanceof Error && err.name === "ValidationError") throw err;
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("An event with that slug already exists", 409);
    }
    throw err;
  }
}

export async function listEvents(query: ListEventsQuery): Promise<PaginatedResult<EventItem>> {
  const { page, limit } = query;
  const filter = { isPublished: true };

  const [docs, total] = await Promise.all([
    Event.find(filter)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toEventItem(doc as unknown as LeanEvent)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Admin listing — includes unpublished events, soonest first. */
export async function listAllEvents(
  page = 1,
  limit = 50
): Promise<PaginatedResult<EventItem>> {
  const [docs, total, counts] = await Promise.all([
    Event.find({})
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments({}),
    countRegistrationsByEvent(),
  ]);

  return {
    items: docs.map((doc) => {
      const id = doc._id.toString();
      // The count drives the "Responses (n)" affordance per row.
      return toEventItem(doc as unknown as LeanEvent, counts.get(id) ?? 0);
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getEventById(eventId: string): Promise<EventItem> {
  const doc = await Event.findById(eventId).lean();
  if (!doc) {
    throw new AppError("Event not found", 404);
  }
  return toEventItem(doc as unknown as LeanEvent);
}

export async function updateEvent(eventId: string, input: UpdateEventInput): Promise<EventItem> {
  const patch: Record<string, unknown> = { ...input };

  // Sanitize the write-up whenever it changes.
  if (typeof patch.description === "string") {
    patch.description = sanitizeContentHtml(patch.description);
  }
  // An explicit empty-string slug would break the unique index's meaning —
  // drop it rather than trying to save it.
  if (patch.slug === "") delete patch.slug;

  try {
    const updated = await Event.findOneAndUpdate({ _id: eventId }, { $set: patch }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      throw new AppError("Event not found", 404);
    }

    return toEventItem(updated as unknown as LeanEvent);
  } catch (err) {
    if (typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000) {
      throw new AppError("An event with that slug already exists", 409);
    }
    throw err;
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const result = await Event.deleteOne({ _id: eventId });
  if (result.deletedCount === 0) {
    throw new AppError("Event not found", 404);
  }
  // The event's registration form and every response it collected go with
  // it — an orphaned form has no event to render under, so it could never
  // be reached again.
  await deleteRegistrationsForEvent(eventId);
}
