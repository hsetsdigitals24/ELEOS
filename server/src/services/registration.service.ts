import { AppError } from "../utils/AppError.ts";
import { Event } from "../models/event.model.ts";
import {
  EventRegistrationForm,
  REGISTRATION_FIELD_TYPES,
} from "../models/eventRegistrationForm.model.ts";
import { EventRegistration } from "../models/eventRegistration.model.ts";
import type {
  EventRegistrationFormItem,
  EventRegistrationItem,
  EventRegistrationPage,
  PaginatedResult,
  RegistrationEventSummary,
  RegistrationField,
  RegistrationFieldType,
} from "../types/index.ts";
import type {
  ListRegistrationsQuery,
  MarkRegistrationReviewedInput,
  RegistrationFieldInput,
  SubmitRegistrationInput,
  UpdateEventFormInput,
} from "../validators/registration.validator.ts";

/**
 * RegistrationService — ALL event-registration business logic and database
 * access lives here. Controllers never touch Mongoose directly.
 *
 * Two halves, one per document:
 *
 *   Form      every event owns exactly one form. It is created the moment
 *             the admin adds an event and can then be reshaped freely, so
 *             nothing about it is fixed — see `validateAnswer` for how the
 *             runtime form drives validation.
 *   Response  one submission. Answers are snapshotted with their labels so
 *             later edits to the form never rewrite collected data.
 *
 * This file deliberately reads the Event model directly rather than going
 * through event.service.ts: it needs only the small header projection below,
 * and importing the event service would create a cycle (that service calls
 * `ensureFormForEvent` here).
 */

/* ------------------------------------------------------------------ */
/* Lean read shapes                                                    */
/* ------------------------------------------------------------------ */

interface LeanFormField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
}

interface LeanForm {
  _id: { toString(): string };
  event: { toString(): string };
  fields: LeanFormField[];
  isOpen?: boolean;
  intro?: string;
  successMessage?: string;
  updatedAt: Date | string;
}

interface LeanRegistration {
  _id: { toString(): string };
  event: { toString(): string };
  answers: Array<{ key: string; label: string; value?: string }>;
  name?: string;
  email?: string;
  isReviewed?: boolean;
  createdAt: Date | string;
}

type LeanEventHeader = {
  _id: { toString(): string };
  slug: string;
  title: string;
  date: Date | string;
  time?: string;
  venue?: string;
  city?: string;
  category?: string;
};

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** The two types whose meaning depends on a list of choices. */
const OPTION_TYPES = new Set<RegistrationFieldType>(["select", "radio"]);

/** Mirrors the house pattern of catching the unique index's duplicate key. */
function isDuplicateKey(err: unknown): boolean {
  return typeof (err as { code?: number }).code === "number" && (err as { code: number }).code === 11000;
}

/** Narrows a stored type string back to the enum, defaulting to plain text. */
function normaliseType(value: string): RegistrationFieldType {
  return (REGISTRATION_FIELD_TYPES as readonly string[]).includes(value)
    ? (value as RegistrationFieldType)
    : "text";
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

/**
 * The form a brand-new event starts with. The admin owns it from here —
 * these three are a starting point, not a constraint, and any of them can
 * be renamed or deleted.
 */
const DEFAULT_FIELDS: RegistrationField[] = [
  {
    key: "full_name",
    label: "Full name",
    type: "text",
    placeholder: "Your name",
    helpText: "",
    required: true,
    options: [],
  },
  {
    key: "email",
    label: "Email address",
    type: "email",
    placeholder: "you@example.com",
    helpText: "",
    required: true,
    options: [],
  },
  {
    key: "phone",
    label: "Phone number",
    type: "tel",
    placeholder: "+234 …",
    helpText: "",
    required: false,
    options: [],
  },
];

function toField(field: LeanFormField): RegistrationField {
  const type = normaliseType(field.type);
  return {
    key: field.key,
    label: field.label,
    type,
    placeholder: field.placeholder ?? "",
    helpText: field.helpText ?? "",
    required: field.required ?? false,
    // Choices only mean something for select/radio — anything else is
    // cleared so a field switched away from dropdown keeps nothing stale.
    options: OPTION_TYPES.has(type) ? (field.options ?? []) : [],
  };
}

/** Normalises a validated field payload into what we store. */
function normaliseField(field: RegistrationFieldInput): RegistrationField {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder,
    helpText: field.helpText,
    required: field.required,
    options: OPTION_TYPES.has(field.type) ? field.options : [],
  };
}

function toFormItem(doc: LeanForm): EventRegistrationFormItem {
  return {
    id: doc._id.toString(),
    eventId: doc.event.toString(),
    fields: (doc.fields ?? []).map(toField),
    isOpen: doc.isOpen ?? true,
    intro: doc.intro ?? "",
    successMessage: doc.successMessage ?? "",
    updatedAt: toIso(doc.updatedAt),
  };
}

function toRegistrationItem(doc: LeanRegistration): EventRegistrationItem {
  return {
    id: doc._id.toString(),
    eventId: doc.event.toString(),
    answers: (doc.answers ?? []).map((answer) => ({
      key: answer.key,
      label: answer.label,
      value: answer.value ?? "",
    })),
    name: doc.name ?? "",
    email: doc.email ?? "",
    isReviewed: doc.isReviewed ?? false,
    createdAt: toIso(doc.createdAt),
  };
}

/** Resolves a published event to the small header the form page renders. */
async function findPublishedEventHeader(slug: string): Promise<RegistrationEventSummary> {
  const doc = (await Event.findOne({ slug, isPublished: true }).lean()) as unknown as
    | LeanEventHeader
    | null;

  if (!doc) {
    throw new AppError("Event not found", 404);
  }

  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    date: toIso(doc.date),
    time: doc.time ?? "",
    venue: doc.venue ?? "",
    city: doc.city ?? "",
    category: doc.category ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

/**
 * Returns an event's registration form, creating the default one on first
 * touch. Called after an event is created (see event.service.ts) so a new
 * event has a form immediately, and from every read path so events that
 * predate this feature grow one the first time anyone opens them.
 */
export async function ensureFormForEvent(eventId: string): Promise<EventRegistrationFormItem> {
  const existing = await EventRegistrationForm.findOne({ event: eventId }).lean();
  if (existing) {
    return toFormItem(existing as unknown as LeanForm);
  }

  try {
    const created = await EventRegistrationForm.create({
      event: eventId,
      fields: DEFAULT_FIELDS,
    });
    return toFormItem(created.toObject() as unknown as LeanForm);
  } catch (err) {
    // Two requests raced to open the first form and the unique index on
    // `event` rejected this one — read whatever the winner wrote.
    if (isDuplicateKey(err)) {
      const winner = await EventRegistrationForm.findOne({ event: eventId }).lean();
      if (winner) return toFormItem(winner as unknown as LeanForm);
    }
    throw err;
  }
}

/** The admin's view of one event's form. */
export async function getFormForEvent(eventId: string): Promise<EventRegistrationFormItem> {
  return ensureFormForEvent(eventId);
}

/** Replaces an event's form definition — the builder's single atomic save. */
export async function updateFormForEvent(
  eventId: string,
  input: UpdateEventFormInput
): Promise<EventRegistrationFormItem> {
  // Guarantees a document exists to update, so saving works on events that
  // predate this feature without a separate migration.
  await ensureFormForEvent(eventId);

  const patch: Record<string, unknown> = {
    fields: input.fields.map(normaliseField),
  };
  if (input.isOpen !== undefined) patch.isOpen = input.isOpen;
  if (input.intro !== undefined) patch.intro = input.intro;
  if (input.successMessage !== undefined) patch.successMessage = input.successMessage;

  const updated = await EventRegistrationForm.findOneAndUpdate(
    { event: eventId },
    { $set: patch },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new AppError("Event not found", 404);
  }

  return toFormItem(updated as unknown as LeanForm);
}

/* ------------------------------------------------------------------ */
/* Public form page                                                    */
/* ------------------------------------------------------------------ */

/**
 * Everything the public registration page needs: the event's header and its
 * form. A CLOSED form still resolves — the page renders the closed state,
 * which is friendlier than a 404 for someone following an old link.
 */
export async function getRegistrationPage(slug: string): Promise<EventRegistrationPage> {
  const event = await findPublishedEventHeader(slug);
  const form = await ensureFormForEvent(event.id);
  return { event, form };
}

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

export interface FieldIssue {
  field: string;
  message: string;
}

/**
 * Per-type ceilings. The model allows 4000 characters for any answer; these
 * are the tighter, type-appropriate limits a visitor is actually held to.
 */
const MAX_LENGTH: Record<RegistrationFieldType, number> = {
  text: 200,
  textarea: 2000,
  email: 254,
  tel: 40,
  number: 40,
  date: 40,
  select: 120,
  radio: 120,
  checkbox: 5,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks one answer against its field definition. The form is built at
 * runtime by the admin, so these rules can't live in a Zod schema — this
 * function IS the schema, and its messages are worded to be shown verbatim
 * under the matching input.
 */
function validateAnswer(field: RegistrationField, raw: string): string | null {
  const value = raw.trim();

  if (value.length === 0) {
    return field.required ? `${field.label} is required` : null;
  }
  if (value.length > MAX_LENGTH[field.type]) {
    return `${field.label} must be at most ${MAX_LENGTH[field.type]} characters`;
  }

  switch (field.type) {
    case "email":
      return EMAIL_PATTERN.test(value) ? null : `${field.label} must be a valid email address`;
    case "number":
      return Number.isFinite(Number(value)) ? null : `${field.label} must be a number`;
    case "date":
      return Number.isNaN(Date.parse(value)) ? `${field.label} must be a date` : null;
    case "select":
    case "radio":
      return field.options.includes(value)
        ? null
        : `${field.label} has an unrecognised choice`;
    case "checkbox":
      return value === "true" || value === "false"
        ? null
        : `${field.label} must be answered yes or no`;
    default:
      return null;
  }
}

export async function submitRegistration(
  slug: string,
  input: SubmitRegistrationInput
): Promise<EventRegistrationItem> {
  const event = await findPublishedEventHeader(slug);
  const form = await ensureFormForEvent(event.id);

  if (!form.isOpen) {
    throw new AppError("Registration for this event is closed", 403);
  }

  const answers = input.answers ?? {};
  const issues: FieldIssue[] = [];

  for (const field of form.fields) {
    const message = validateAnswer(field, answers[field.key] ?? "");
    if (message !== null) {
      issues.push({ field: field.key, message });
    }
  }

  if (issues.length > 0) {
    // The same envelope the `validate` middleware emits, so the client's
    // ApiError.issues maps straight onto the form's inputs. Unanswered
    // keys the form no longer defines are ignored rather than rejected.
    throw new AppError("Validation failed", 400, { details: { issues } });
  }

  // Snapshot every answered field, label included, so a later rename or
  // delete cannot rewrite what was collected.
  const snapshot = form.fields
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: (answers[field.key] ?? "").trim(),
    }))
    .filter((answer) => answer.value.length > 0);

  // Best-effort convenience fields for the admin's response list.
  const nameField = form.fields.find((field) => field.type === "text");
  const emailField = form.fields.find((field) => field.type === "email");
  const email = emailField ? (answers[emailField.key] ?? "").trim().toLowerCase() : "";

  const doc: Record<string, unknown> = {
    event: event.id,
    answers: snapshot,
    name: nameField ? (answers[nameField.key] ?? "").trim().slice(0, 120) : "",
  };
  // Only set `email` when the form actually asked for one. The partial
  // unique index below keys off the key's ABSENCE, which is what lets a
  // form without an email field accept repeat submissions.
  if (email.length > 0) {
    doc.email = email;
  }

  try {
    const created = await EventRegistration.create(doc);
    return toRegistrationItem(created.toObject() as unknown as LeanRegistration);
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new AppError("You're already registered for this event", 409);
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Responses (admin)                                                   */
/* ------------------------------------------------------------------ */

/** One event's responses, newest first, optionally only the unreviewed. */
export async function listRegistrations(
  query: ListRegistrationsQuery
): Promise<PaginatedResult<EventRegistrationItem>> {
  const { event, unreviewed, page, limit } = query;

  const filter: Record<string, unknown> = { event };
  if (unreviewed === true) filter.isReviewed = false;

  const [docs, total] = await Promise.all([
    EventRegistration.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    EventRegistration.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toRegistrationItem(doc as unknown as LeanRegistration)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * event id → response count, for the admin's event list. One aggregation
 * covering every event rather than a count query per row.
 */
export async function countRegistrationsByEvent(): Promise<Map<string, number>> {
  const rows = await EventRegistration.aggregate<{ _id: unknown; count: number }>([
    { $group: { _id: "$event", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function markRegistrationReviewed(
  registrationId: string,
  input: MarkRegistrationReviewedInput
): Promise<EventRegistrationItem> {
  const updated = await EventRegistration.findOneAndUpdate(
    { _id: registrationId },
    { $set: { isReviewed: input.isReviewed } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new AppError("Registration not found", 404);
  }

  return toRegistrationItem(updated as unknown as LeanRegistration);
}

/** Hard-deletes a response the admin has finished with. */
export async function deleteRegistration(registrationId: string): Promise<void> {
  const result = await EventRegistration.deleteOne({ _id: registrationId });
  if (result.deletedCount === 0) {
    throw new AppError("Registration not found", 404);
  }
}

/**
 * Removes everything an event owned. Called when the admin deletes the
 * event itself — collected responses are deliberately destroyed with it,
 * since a form with no event behind it is unreachable and would only
 * accumulate as orphans.
 */
export async function deleteRegistrationsForEvent(eventId: string): Promise<void> {
  await Promise.all([
    EventRegistration.deleteMany({ event: eventId }),
    EventRegistrationForm.deleteOne({ event: eventId }),
  ]);
}
