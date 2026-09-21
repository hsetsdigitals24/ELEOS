import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as contactService from "../services/contact.service.ts";
import type {
  CreateContactMessageInput,
  ListContactMessagesQuery,
  MarkContactMessageReadInput,
} from "../validators/contact.validator.ts";

/**
 * ContactController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** POST /api/v1/contact — submit the contact form. */
export const createContactMessage = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreateContactMessageInput.
  const input = req.body as CreateContactMessageInput;
  const message = await contactService.createContactMessage(input);
  return ApiResponse.success(res, 201, "Message sent successfully", message);
});

/** GET /api/v1/admin/contact-messages?unread=&page=&limit= */
export const listContactMessages = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListContactMessagesQuery.
  const query = req.query as unknown as ListContactMessagesQuery;
  const result = await contactService.listContactMessages(query);
  return ApiResponse.success(res, 200, "Messages fetched successfully", result);
});

/** PATCH /api/v1/admin/contact-messages/:id — mark read / unread. */
export const markContactMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as MarkContactMessageReadInput;
  const message = await contactService.markContactMessageRead(id, input);
  return ApiResponse.success(res, 200, "Message updated", message);
});

/** DELETE /api/v1/admin/contact-messages/:id — remove a handled message. */
export const deleteContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await contactService.deleteContactMessage(id);
  return ApiResponse.success(res, 200, "Message deleted");
});
