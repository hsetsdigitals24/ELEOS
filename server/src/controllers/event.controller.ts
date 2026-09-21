import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as eventService from "../services/event.service.ts";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "../validators/event.validator.ts";

/**
 * EventController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/events — the public upcoming-events listing (soonest first). */
export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListEventsQuery.
  const query = req.query as unknown as ListEventsQuery;
  const result = await eventService.listEvents(query);
  return ApiResponse.success(res, 200, "Events fetched successfully", result);
});

/** GET /api/v1/admin/events — every event incl. unpublished (admin console). */
export const listAllEvents = asyncHandler(async (_req: Request, res: Response) => {
  const result = await eventService.listAllEvents();
  return ApiResponse.success(res, 200, "Events fetched successfully", result);
});

/** POST /api/v1/admin/events — add an upcoming event. */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed CreateEventInput.
  const input = req.body as CreateEventInput;
  const event = await eventService.createEvent(input);
  return ApiResponse.success(res, 201, "Event created successfully", event);
});

/** PUT /api/v1/admin/events/:id — update an upcoming event. */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateEventInput;
  const event = await eventService.updateEvent(id, input);
  return ApiResponse.success(res, 200, "Event updated successfully", event);
});

/** DELETE /api/v1/admin/events/:id — remove an upcoming event. */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await eventService.deleteEvent(id);
  return ApiResponse.success(res, 200, "Event deleted successfully");
});
