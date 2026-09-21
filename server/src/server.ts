import { config } from "./config/env.ts";
import { connectDatabase, disconnectDatabase } from "./config/db.ts";
import { createApp } from "./app.ts";
import { ensureSuperAdmin } from "./services/seed.service.ts";
import { seedContent } from "./services/seedContent.ts";

/**
 * Entry point — connect to MongoDB, seed the super admin and the migrated
 * content, then start listening. Shuts down gracefully so in-flight
 * requests and the DB connection are closed.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase(config.mongodbUri);
  console.log(`[db] MongoDB connected`);

  await ensureSuperAdmin();
  await seedContent();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] ERI API listening on port ${config.port} (${config.env})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] ${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      console.log("[db] MongoDB disconnected");
      process.exit(0);
    });
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("[server] Unhandled rejection:", reason);
    void shutdown("unhandledRejection");
  });
}

bootstrap().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
