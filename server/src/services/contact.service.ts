import { AppError } from "../utils/AppError.ts";
import { ContactMessage, type ContactMessageDocument } from "../models/contactMessage.model.ts";
import type { ContactMessageItem, PaginatedResult } from "../types/index.ts";
import type {
  CreateContactMessageInput,
  ListContactMessagesQuery,
  MarkContactMessageReadInput,
} from "../validators/contact.validator.ts";

/**
 * ContactService — ALL contact-form business logic and database access
 * lives here. Controllers never touch Mongoose directly.
 */

/** Lean message shape as returned by `.lean()` reads. */
type LeanContactMessage = Omit<ContactMessageDocument, "_id"> & {
  _id: { toString(): string };
};

/** Maps a lean document to the API shape. Unlike comments, the full record
 *  is intended for the admin inbox — including the sender's contact info. */
function toItem(doc: LeanContactMessage): ContactMessageItem {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    subject: doc.subject ?? "General Enquiry",
    message: doc.message,
    isRead: doc.isRead ?? false,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  };
}

export interface CreateContactMessageServiceInput extends CreateContactMessageInput {}

export async function createContactMessage(
  input: CreateContactMessageServiceInput
): Promise<ContactMessageItem> {
  const created = await ContactMessage.create(input);
  return toItem(created.toObject() as LeanContactMessage);
}

export async function listContactMessages(
  query: ListContactMessagesQuery
): Promise<PaginatedResult<ContactMessageItem>> {
  const { unread, page, limit } = query;

  const filter = unread === true ? { isRead: false } : {};

  const [docs, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toItem(doc as unknown as LeanContactMessage)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function markContactMessageRead(
  messageId: string,
  input: MarkContactMessageReadInput
): Promise<ContactMessageItem> {
  const updated = await ContactMessage.findOneAndUpdate(
    { _id: messageId },
    { $set: { isRead: input.isRead } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new AppError("Message not found", 404);
  }

  return toItem(updated as unknown as LeanContactMessage);
}

/** Hard-deletes a handled message from the admin inbox. */
export async function deleteContactMessage(messageId: string): Promise<void> {
  const result = await ContactMessage.deleteOne({ _id: messageId });
  if (result.deletedCount === 0) {
    throw new AppError("Message not found", 404);
  }
}
