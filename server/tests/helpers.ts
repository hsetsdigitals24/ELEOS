import mongoose from "mongoose";
import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../src/app.ts";
import { ensureSuperAdmin } from "../src/services/seed.service.ts";
import { config } from "../src/config/env.ts";
import { sendMail, type OutgoingMail } from "../src/services/mail.service.ts";

/**
 * Shared test plumbing — boots an in-memory MongoDB, seeds the super admin
 * and builds the app. The mail service is mocked by each test file (vi.mock
 * is hoisted per file); captured mails are inspectable through `sentMail`.
 */

export const sentMail = sendMail as unknown as ReturnType<typeof import("vitest").vi.fn> &
  ((mail: OutgoingMail) => Promise<boolean>);

export interface TestContext {
  app: Express;
  mongod: MongoMemoryServer;
}

export async function setupApp(): Promise<TestContext> {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("eleos-test"));
  await ensureSuperAdmin();
  return { app: createApp(), mongod };
}

export async function teardownApp(ctx: TestContext): Promise<void> {
  await mongoose.disconnect();
  await ctx.mongod.stop();
}

export interface SessionCookies {
  access: string;
  refresh: string;
}

/** Signs in and returns the raw Set-Cookie values for both session cookies. */
export async function login(
  app: Express,
  email: string,
  password: string
): Promise<{ res: request.Response; cookies: SessionCookies }> {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .set("Origin", config.corsOrigins[0] ?? "http://localhost:3000")
    .send({ email, password });
  const raw = (res.headers["set-cookie"] ?? []) as string[];
  const access = raw.find((c) => c.startsWith("eri_access=")) ?? "";
  const refresh = raw.find((c) => c.startsWith("eri_refresh=")) ?? "";
  return { res, cookies: { access, refresh } };
}

/** Cookie header value for authenticated requests. */
export function cookieHeader(cookies: SessionCookies): string {
  return [cookies.access, cookies.refresh]
    .map((c) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

/** Extracts the raw reset token from the URL inside the last captured email. */
export function resetTokenFromMail(): string | null {
  const last = sentMail.mock.calls.at(-1)?.[0] as OutgoingMail | undefined;
  if (!last) return null;
  const match = last.text.match(/token=([0-9a-f]{64})/);
  return match?.[1] ?? null;
}
