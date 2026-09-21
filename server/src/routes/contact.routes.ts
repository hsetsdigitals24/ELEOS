import { Router } from "express";
import { createContactMessage } from "../controllers/contact.controller.ts";
import { validate } from "../middlewares/validate.ts";
import { contactWriteLimiter } from "../middlewares/rateLimiter.ts";
import { createContactMessageSchema } from "../validators/contact.validator.ts";

/**
 * Contact routes — the public face of the contact form. Submissions are
 * rate-limited and validated with Zod before reaching a controller.
 *
 *   POST /api/v1/contact → submit the contact form
 */
const contactRouter = Router();

contactRouter.post(
  "/contact",
  contactWriteLimiter,
  validate(createContactMessageSchema, "body"),
  createContactMessage
);

export { contactRouter };
