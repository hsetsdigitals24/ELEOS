// types/contact.ts — shared shapes for the contact form, used by the API
// clients (lib/api/contact.ts, lib/api/admin.ts) and the contact page.

/** Payload for submitting the public contact form. */
export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Full message shape — admin inbox reads, never exposed publicly. */
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

export interface ContactMessagePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactMessagesPage {
  items: ContactMessageItem[];
  pagination: ContactMessagePagination;
}
