import type { Express } from "express";
import { commentRouter } from "./comment.routes.ts";
import { contactRouter } from "./contact.routes.ts";
import { productRouter } from "./product.routes.ts";
import { broadcastRouter } from "./broadcast.routes.ts";
import { postRouter } from "./post.routes.ts";
import { videoRouter } from "./video.routes.ts";
import { eventRouter } from "./event.routes.ts";
import { adminRouter } from "./admin.routes.ts";
import { authRouter } from "./auth.routes.ts";

/**
 * Route registry — mounts every domain router under the API version
 * prefix. Adding a domain later means adding one router file and one
 * line here.
 */
export function registerRoutes(app: Express): void {
  app.use("/api/v1", commentRouter);
  app.use("/api/v1", contactRouter);
  app.use("/api/v1", productRouter);
  app.use("/api/v1", broadcastRouter);
  app.use("/api/v1", postRouter);
  app.use("/api/v1", videoRouter);
  app.use("/api/v1", eventRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/admin", adminRouter);
}
