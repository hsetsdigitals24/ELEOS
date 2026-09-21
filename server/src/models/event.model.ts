import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Event — one upcoming event on the public events page. The description is
 * rich-text HTML produced by the admin's editor (sanitized on write, see
 * event.service.ts). The admin decides when an event leaves the page by
 * unpublishing or deleting it — the listing itself is sorted soonest-first.
 */
const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: 220,
      unique: true,
      index: true,
    },
    /** The day the event starts — the ledger sorts by this, soonest first. */
    date: {
      type: Date,
      required: [true, "date is required"],
    },
    /** Human time range, e.g. "10:00am – 2:00pm (GMT)". */
    time: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    venue: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    /** Rich-text write-up (sanitized HTML from the admin editor). */
    description: {
      type: String,
      required: [true, "description is required"],
      maxlength: 20000,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Public listing query: soonest first.
eventSchema.index({ isPublished: 1, date: 1 });

export type EventDocument = InferSchemaType<typeof eventSchema>;

interface EventModel extends Model<EventDocument> {
  // Placeholder for future statics.
}

export const Event: EventModel = (mongoose.models.Event ??
  mongoose.model<EventDocument, EventModel>("Event", eventSchema)) as EventModel;
