import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * ContactMessage — one submission of the site's custom contact form.
 * Written by the public POST /api/v1/contact endpoint, read by the admin
 * inbox. `isRead` lets the admin triage; messages are never edited, so
 * there is no soft-delete machinery here — the admin can hard-delete
 * outright once a message is handled.
 */
const contactMessageSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    /** Optional — some enquiries are easier to answer by phone. */
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 140,
      default: "General Enquiry",
    },
    message: {
      type: String,
      required: [true, "message is required"],
      trim: true,
      minlength: 2,
      maxlength: 4000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Admin inbox query: newest first, optionally only unread.
contactMessageSchema.index({ isRead: 1, createdAt: -1 });

export type ContactMessageDocument = InferSchemaType<typeof contactMessageSchema>;

interface ContactMessageModel extends Model<ContactMessageDocument> {
  // Placeholder for future statics.
}

export const ContactMessage: ContactMessageModel = (mongoose.models.ContactMessage ??
  mongoose.model<ContactMessageDocument, ContactMessageModel>(
    "ContactMessage",
    contactMessageSchema
  )) as ContactMessageModel;
