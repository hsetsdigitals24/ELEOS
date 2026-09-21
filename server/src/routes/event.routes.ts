import { Router } from "express";
import { listEvents } from "../controllers/event.controller.ts";
import {
  getRegistrationPage,
  submitRegistration,
} from "../controllers/registration.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { registrationWriteLimiter } from "../middlewares/rateLimiter.ts";
import { listEventsQuerySchema } from "../validators/event.validator.ts";
import {
  eventSlugParamsSchema,
  submitRegistrationSchema,
} from "../validators/registration.validator.ts";

/**
 * Event routes — the public upcoming-events page and the per-event
 * registration form each event carries. Everything is validated with Zod
 * before reaching a controller.
 *
 *   GET  /api/v1/events                            → paginated listing (soonest first)
 *   GET  /api/v1/events/:slug/registration-form    → one event's registration form
 *   POST /api/v1/events/:slug/registrations        → submit a registration
 */
const eventRouter = Router();

eventRouter.get("/events", validate(listEventsQuerySchema, "query"), listEvents);

eventRouter.get(
  "/events/:slug/registration-form",
  validate(eventSlugParamsSchema, "params"),
  getRegistrationPage
);

eventRouter.post(
  "/events/:slug/registrations",
  registrationWriteLimiter,
  validate(eventSlugParamsSchema, "params"),
  validate(submitRegistrationSchema, "body"),
  submitRegistration
);

export { eventRouter };
