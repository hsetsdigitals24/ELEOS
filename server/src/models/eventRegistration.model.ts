import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * EventRegistration — one person's submission to an event's registration
 * form. Written by the public POST /api/v1/events/:slug/registrations
 * endpoint, read by the admin console's Events tab.
 *
 * Answers are stored as a snapshot: each carries the question's label as
 * it read at submit time, so the admin can freely rename or delete fields
 * afterwards without rewriting what was already collected.
 *
 * `name` and `email` are derived on write purely so the response list has
 * something to sort and search by. `email` is deliberately OMITTED rather
 * than stored empty when the form has no email field — the partial index
 * below depends on its absence, not on it being falsy.
 */
const answerSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, "answer key is required"],
      trim: true,
      maxlength: 40,
    },
    /** The question's label at submit time — see the note above. */
    label: {
      type: String,
      required: [true, "answer label is required"],
      trim: true,
      maxlength: 120,
    },
    value: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: "",
    },
  },
  { _id: false }
);

const eventRegistrationSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "event is required"],
      index: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    /**
     * No default: when the form has no email field the key is left off the
     * document entirely so the partial unique index doesn't apply.
     */
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    /** The admin triages responses the same way the inbox does. */
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// The admin's per-event response list: newest first.
eventRegistrationSchema.index({ event: 1, createdAt: -1 });

/**
 * One registration per email per event — but ONLY when the form actually
 * asked for an email. A form without one stores many email-less documents,
 * which is exactly what the partial filter permits. `partialFilterExpression`
 * supports $exists but not $ne, hence "omit the key" over "store empty string".
 */
eventRegistrationSchema.index(
  { event: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);

export type EventRegistrationDocument = InferSchemaType<typeof eventRegistrationSchema>;

interface EventRegistrationModel extends Model<EventRegistrationDocument> {
  // Placeholder for future statics.
}

export const EventRegistration: EventRegistrationModel =
  (mongoose.models.EventRegistration ??
    mongoose.model<EventRegistrationDocument, EventRegistrationModel>(
      "EventRegistration",
      eventRegistrationSchema
    )) as EventRegistrationModel;
