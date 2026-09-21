// lib/api/contact.ts — typed client for the public contact form API.

import { request } from "./client";
import type { ContactMessageInput } from "@/types/contact";

/** Submits the contact form. Returns the stored message on success. */
export async function sendContactMessage(
  input: ContactMessageInput
): Promise<{ id: string }> {
  return request<{ id: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(input),
    serviceName: "contact service",
  });
}
