import { Router } from "express";
import { authenticate, requirePermission } from "../middlewares/auth.ts";
import { originCheck } from "../middlewares/originCheck.ts";
import { adminLimiter } from "../middlewares/rateLimiter.ts";
import { validate } from "../middlewares/validate.ts";
import {
  deleteContactMessage,
  listContactMessages,
  markContactMessageRead,
} from "../controllers/contact.controller.ts";
import {
  contactMessageParamsSchema,
  listContactMessagesQuerySchema,
  markContactMessageReadSchema,
} from "../validators/contact.validator.ts";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.ts";
import {
  createProductSchema,
  productParamsSchema,
  updateProductSchema,
} from "../validators/product.validator.ts";
import { updateBroadcastSettings } from "../controllers/broadcast.controller.ts";
import { updateBroadcastSchema } from "../validators/broadcast.validator.ts";
import {
  createPost,
  deletePost,
  listAllPosts,
  updatePost,
} from "../controllers/post.controller.ts";
import {
  createPostSchema,
  postParamsSchema,
  updatePostSchema,
} from "../validators/post.validator.ts";
import {
  createVideo,
  deleteVideo,
  listAllVideos,
  updateVideo,
} from "../controllers/video.controller.ts";
import {
  createVideoSchema,
  videoParamsSchema,
  updateVideoSchema,
} from "../validators/video.validator.ts";
import {
  createEvent,
  deleteEvent,
  listAllEvents,
  updateEvent,
} from "../controllers/event.controller.ts";
import {
  createEventSchema,
  eventParamsSchema,
  updateEventSchema,
} from "../validators/event.validator.ts";
import {
  deleteRegistration,
  getEventForm,
  listRegistrations,
  markRegistrationReviewed,
  updateEventForm,
} from "../controllers/registration.controller.ts";
import {
  eventIdParamsSchema,
  listRegistrationsQuerySchema,
  markRegistrationReviewedSchema,
  registrationParamsSchema,
  updateEventFormSchema,
} from "../validators/registration.validator.ts";
import {
  createUser,
  deleteUser,
  listUsers,
  sendUserPasswordReset,
  updateUser,
} from "../controllers/adminUser.controller.ts";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "../validators/adminUser.validator.ts";
import { createRole, deleteRole, listRoles, updateRole } from "../controllers/role.controller.ts";
import {
  createRoleSchema,
  roleIdParamsSchema,
  updateRoleSchema,
} from "../validators/role.validator.ts";

/**
 * Admin routes — everything under /api/v1/admin/*. Guarded by the JWT
 * session (`authenticate`), per-route permissions (`requirePermission`) and
 * a tight rate limit; every body and id-bearing route is validated with
 * Zod before reaching a controller.
 *
 *   PUT    /api/v1/admin/broadcasts                    → update broadcast settings
 *   POST   /api/v1/admin/products                      → add a product
 *   PUT    /api/v1/admin/products/:id                  → update a product
 *   DELETE /api/v1/admin/products/:id                  → remove a product
 *   GET    /api/v1/admin/posts                         → every post incl. unpublished
 *   POST   /api/v1/admin/posts                         → publish a blog post
 *   PUT    /api/v1/admin/posts/:id                     → update a blog post
 *   DELETE /api/v1/admin/posts/:id                     → remove a blog post
 *   GET    /api/v1/admin/videos                        → every video incl. unpublished
 *   POST   /api/v1/admin/videos                        → add a video
 *   PUT    /api/v1/admin/videos/:id                    → update a video
 *   DELETE /api/v1/admin/videos/:id                    → remove a video
 *   GET    /api/v1/admin/events                        → every event incl. unpublished
 *   POST   /api/v1/admin/events                        → add an upcoming event
 *   PUT    /api/v1/admin/events/:id                    → update an upcoming event
 *   DELETE /api/v1/admin/events/:id                    → remove an upcoming event
 *   GET    /api/v1/admin/events/:id/registration-form  → the event's registration form
 *   PUT    /api/v1/admin/events/:id/registration-form  → save its fields / open state
 *   GET    /api/v1/admin/registrations                 → one event's responses (paginated)
 *   PATCH  /api/v1/admin/registrations/:id             → mark reviewed/unreviewed
 *   DELETE /api/v1/admin/registrations/:id             → delete a response
 *   GET    /api/v1/admin/contact-messages              → inbox (paginated)
 *   PATCH  /api/v1/admin/contact-messages/:id          → mark read/unread
 *   DELETE /api/v1/admin/contact-messages/:id          → delete a message
 *
 *   GET    /api/v1/admin/users                         → list admin users
 *   POST   /api/v1/admin/users                         → create an admin user
 *   PATCH  /api/v1/admin/users/:id                     → rename / re-role / toggle
 *   DELETE /api/v1/admin/users/:id                     → remove an admin user
 *   POST   /api/v1/admin/users/:id/send-reset          → email a reset link
 *
 *   GET    /api/v1/admin/roles                         → list roles (any admin)
 *   POST   /api/v1/admin/roles                         → create a role
 *   PATCH  /api/v1/admin/roles/:id                     → edit a role
 *   DELETE /api/v1/admin/roles/:id                     → remove a role
 */
const adminRouter = Router();

adminRouter.use(adminLimiter, originCheck);

// Broadcasts
adminRouter.put(
  "/broadcasts",
  authenticate,
  requirePermission("broadcasts:manage"),
  validate(updateBroadcastSchema, "body"),
  updateBroadcastSettings
);

// Products
adminRouter.post(
  "/products",
  authenticate,
  requirePermission("products:manage"),
  validate(createProductSchema, "body"),
  createProduct
);
adminRouter.put(
  "/products/:id",
  authenticate,
  requirePermission("products:manage"),
  validate(productParamsSchema, "params"),
  validate(updateProductSchema, "body"),
  updateProduct
);
adminRouter.delete(
  "/products/:id",
  authenticate,
  requirePermission("products:manage"),
  validate(productParamsSchema, "params"),
  deleteProduct
);

// Blog posts (ELEOS + His Story Tellers Media)
adminRouter.get(
  "/posts",
  authenticate,
  requirePermission("content:manage"),
  listAllPosts
);
adminRouter.post(
  "/posts",
  authenticate,
  requirePermission("content:manage"),
  validate(createPostSchema, "body"),
  createPost
);
adminRouter.put(
  "/posts/:id",
  authenticate,
  requirePermission("content:manage"),
  validate(postParamsSchema, "params"),
  validate(updatePostSchema, "body"),
  updatePost
);
adminRouter.delete(
  "/posts/:id",
  authenticate,
  requirePermission("content:manage"),
  validate(postParamsSchema, "params"),
  deletePost
);

// Videos
adminRouter.get(
  "/videos",
  authenticate,
  requirePermission("content:manage"),
  listAllVideos
);
adminRouter.post(
  "/videos",
  authenticate,
  requirePermission("content:manage"),
  validate(createVideoSchema, "body"),
  createVideo
);
adminRouter.put(
  "/videos/:id",
  authenticate,
  requirePermission("content:manage"),
  validate(videoParamsSchema, "params"),
  validate(updateVideoSchema, "body"),
  updateVideo
);
adminRouter.delete(
  "/videos/:id",
  authenticate,
  requirePermission("content:manage"),
  validate(videoParamsSchema, "params"),
  deleteVideo
);

// Upcoming events
adminRouter.get(
  "/events",
  authenticate,
  requirePermission("events:manage"),
  listAllEvents
);
adminRouter.post(
  "/events",
  authenticate,
  requirePermission("events:manage"),
  validate(createEventSchema, "body"),
  createEvent
);
adminRouter.put(
  "/events/:id",
  authenticate,
  requirePermission("events:manage"),
  validate(eventParamsSchema, "params"),
  validate(updateEventSchema, "body"),
  updateEvent
);
adminRouter.delete(
  "/events/:id",
  authenticate,
  requirePermission("events:manage"),
  validate(eventParamsSchema, "params"),
  deleteEvent
);

// Event registration forms — the builder lives beside the events it serves,
// so it rides the same `events:manage` permission rather than minting one.
adminRouter.get(
  "/events/:id/registration-form",
  authenticate,
  requirePermission("events:manage"),
  validate(eventIdParamsSchema, "params"),
  getEventForm
);
adminRouter.put(
  "/events/:id/registration-form",
  authenticate,
  requirePermission("events:manage"),
  validate(eventIdParamsSchema, "params"),
  validate(updateEventFormSchema, "body"),
  updateEventForm
);

// Registration responses — grouped one event at a time on purpose, so two
// concurrent events can never be confused for one another.
adminRouter.get(
  "/registrations",
  authenticate,
  requirePermission("events:manage"),
  validate(listRegistrationsQuerySchema, "query"),
  listRegistrations
);
adminRouter.patch(
  "/registrations/:id",
  authenticate,
  requirePermission("events:manage"),
  validate(registrationParamsSchema, "params"),
  validate(markRegistrationReviewedSchema, "body"),
  markRegistrationReviewed
);
adminRouter.delete(
  "/registrations/:id",
  authenticate,
  requirePermission("events:manage"),
  validate(registrationParamsSchema, "params"),
  deleteRegistration
);

// Contact message inbox
adminRouter.get(
  "/contact-messages",
  authenticate,
  requirePermission("messages:manage"),
  validate(listContactMessagesQuerySchema, "query"),
  listContactMessages
);
adminRouter.patch(
  "/contact-messages/:id",
  authenticate,
  requirePermission("messages:manage"),
  validate(contactMessageParamsSchema, "params"),
  validate(markContactMessageReadSchema, "body"),
  markContactMessageRead
);
adminRouter.delete(
  "/contact-messages/:id",
  authenticate,
  requirePermission("messages:manage"),
  validate(contactMessageParamsSchema, "params"),
  deleteContactMessage
);

// Admin users
adminRouter.get(
  "/users",
  authenticate,
  requirePermission("users:manage"),
  listUsers
);
adminRouter.post(
  "/users",
  authenticate,
  requirePermission("users:manage"),
  validate(createUserSchema, "body"),
  createUser
);
adminRouter.patch(
  "/users/:id",
  authenticate,
  requirePermission("users:manage"),
  validate(userIdParamsSchema, "params"),
  validate(updateUserSchema, "body"),
  updateUser
);
adminRouter.delete(
  "/users/:id",
  authenticate,
  requirePermission("users:manage"),
  validate(userIdParamsSchema, "params"),
  deleteUser
);
adminRouter.post(
  "/users/:id/send-reset",
  authenticate,
  requirePermission("users:manage"),
  validate(userIdParamsSchema, "params"),
  sendUserPasswordReset
);

// Roles
adminRouter.get("/roles", authenticate, listRoles);
adminRouter.post(
  "/roles",
  authenticate,
  requirePermission("roles:manage"),
  validate(createRoleSchema, "body"),
  createRole
);
adminRouter.patch(
  "/roles/:id",
  authenticate,
  requirePermission("roles:manage"),
  validate(roleIdParamsSchema, "params"),
  validate(updateRoleSchema, "body"),
  updateRole
);
adminRouter.delete(
  "/roles/:id",
  authenticate,
  requirePermission("roles:manage"),
  validate(roleIdParamsSchema, "params"),
  deleteRole
);

export { adminRouter };
