import mongoose from "mongoose";

/**
 * connectDatabase — establishes the MongoDB connection. Called once from
 * server.ts before the app starts listening.
 */
export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

/** disconnectDatabase — used by graceful shutdown. */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
