import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import * as registrationService from "../services/registration.service.ts";
import type {
  ListRegistrationsQuery,
  MarkRegistrationReviewedInput,
  SubmitRegistrationInput,
  UpdateEventFormInput,
} from "../validators/registration.validator.ts";

/**
 * RegistrationController — thin HTTP layer. Reads the (already-validated)
 * request, delegates to the service, and sends the standardized response.
 * No business logic or DB queries here.
 */

/** GET /api/v1/events/:slug/registration-form — the public form page. */
export const getRegistrationPage = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const result = await registrationService.getRegistrationPage(slug);
  return ApiResponse.success(res, 200, "Registration form fetched successfully", result);
});

/** POST /api/v1/events/:slug/registrations — submit a registration. */
export const submitRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  // Replaced by the `validate` middleware with the parsed SubmitRegistrationInput.
  const input = req.body as SubmitRegistrationInput;
  const registration = await registrationService.submitRegistration(slug, input);
  return ApiResponse.success(res, 201, "Registration submitted successfully", registration);
});

/** GET /api/v1/admin/events/:id/registration-form — the builder's load. */
export const getEventForm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const form = await registrationService.getFormForEvent(id);
  return ApiResponse.success(res, 200, "Registration form fetched successfully", form);
});

/** PUT /api/v1/admin/events/:id/registration-form — save the whole form. */
export const updateEventForm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateEventFormInput;
  const form = await registrationService.updateFormForEvent(id, input);
  return ApiResponse.success(res, 200, "Registration form updated successfully", form);
});

/** GET /api/v1/admin/registrations — one event's responses, newest first. */
export const listRegistrations = asyncHandler(async (req: Request, res: Response) => {
  // Replaced by the `validate` middleware with the parsed ListRegistrationsQuery.
  const query = req.query as unknown as ListRegistrationsQuery;
  const result = await registrationService.listRegistrations(query);
  return ApiResponse.success(res, 200, "Registrations fetched successfully", result);
});

/** PATCH /api/v1/admin/registrations/:id — mark reviewed / unreviewed. */
export const markRegistrationReviewed = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input = req.body as MarkRegistrationReviewedInput;
  const registration = await registrationService.markRegistrationReviewed(id, input);
  return ApiResponse.success(res, 200, "Registration updated successfully", registration);
});

/** DELETE /api/v1/admin/registrations/:id — remove a response. */
export const deleteRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await registrationService.deleteRegistration(id);
  return ApiResponse.success(res, 200, "Registration deleted successfully");
});
