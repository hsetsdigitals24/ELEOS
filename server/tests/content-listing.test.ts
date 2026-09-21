import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { Post } from "../src/models/post.model.ts";
import { Video } from "../src/models/video.model.ts";
import { config } from "../src/config/env.ts";
import {
  cookieHeader,
  login,
  setupApp,
  teardownApp,
  type SessionCookies,
  type TestContext,
} from "./helpers.ts";

// Never send real email from the test suite.
vi.mock("../src/services/mail.service.ts", () => ({
  sendMail: vi.fn(async () => true),
}));

/**
 * The public content listings' `since` window and `brand` cut — what the
 * homepage relies on to show only recent, ELEOS-published content.
 *
 * The fixtures are arranged directly on the models because the tests are about
 * dates and brands, and the admin API would make both awkward to pin down. Two
 * of them are inserted through `collection.insertOne` on purpose: that bypasses
 * Mongoose entirely, which is the only faithful way to reproduce a document
 * written *before* the brand field existed.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Fixture dates, relative to now so the suite never goes stale. */
const RECENT = new Date(Date.now() - 20 * DAY);
const FRESH = new Date(Date.now() - 5 * DAY);
const STALE = new Date(Date.now() - 400 * DAY); // ~13 months — well outside the window
/** The six-month boundary the homepage sends. */
const SINCE = new Date(Date.now() - 180 * DAY).toISOString();

let ctx: TestContext;
let app: Express;
let admin: SessionCookies;

const origin = config.corsOrigins[0] ?? "http://localhost:3000";

beforeAll(async () => {
  ctx = await setupApp();
  app = ctx.app;

  const { res, cookies } = await login(app, config.adminEmail, "password123");
  expect(res.status).toBe(200); // fail fast if seeding is broken
  admin = cookies;

  // ── Posts ──────────────────────────────────────────────────────────
  await Post.create({
    slug: "fresh-eleos",
    title: "A recent ELEOS post",
    brand: "eleos",
    contentHtml: "<p>Body</p>",
    publishedAt: RECENT,
    isPublished: true,
  });
  await Post.create({
    slug: "fresh-subsidiary",
    title: "A recent subsidiary post",
    brand: "his-story-tellers",
    contentHtml: "<p>Body</p>",
    publishedAt: FRESH,
    isPublished: true,
  });
  await Post.create({
    slug: "stale-eleos",
    title: "An old ELEOS post",
    brand: "eleos",
    contentHtml: "<p>Body</p>",
    publishedAt: STALE,
    isPublished: true,
  });
  // Written before the brand field existed — no `brand` key at all.
  await Post.collection.insertOne({
    slug: "legacy-eleos",
    title: "A pre-brand ELEOS post",
    contentHtml: "<p>Body</p>",
    publishedAt: RECENT,
    isPublished: true,
    createdAt: RECENT,
    updatedAt: RECENT,
  });

  // ── Videos ─────────────────────────────────────────────────────────
  await Video.create({
    slug: "fresh-video",
    title: "A recent ELEOS video",
    brand: "eleos",
    youtubeUrl: "https://www.youtube.com/watch?v=aaaaaaaaaaa",
    publishedAt: RECENT,
    isPublished: true,
  });
  await Video.create({
    slug: "fresh-subsidiary-video",
    title: "A recent subsidiary video",
    brand: "his-story-tellers",
    youtubeUrl: "https://www.youtube.com/watch?v=bbbbbbbbbbb",
    publishedAt: FRESH,
    isPublished: true,
  });
  await Video.create({
    slug: "stale-video",
    title: "An old ELEOS video",
    brand: "eleos",
    youtubeUrl: "https://www.youtube.com/watch?v=ccccccccccc",
    publishedAt: STALE,
    isPublished: true,
  });
  // Written before the brand field existed — no `brand` key at all.
  await Video.collection.insertOne({
    slug: "legacy-video",
    title: "A pre-brand ELEOS video",
    youtubeUrl: "https://www.youtube.com/watch?v=ddddddddddd",
    publishedAt: RECENT,
    isPublished: true,
    createdAt: RECENT,
    updatedAt: RECENT,
  });
});

afterAll(() => teardownApp(ctx));

/** Anonymous public GET. */
function publicGet(path: string, query: Record<string, string> = {}) {
  return request(app).get(path).set("Origin", origin).query(query);
}

/** Authenticated admin GET. */
function adminGet(path: string) {
  return request(app)
    .get(path)
    .set("Origin", origin)
    .set("Cookie", cookieHeader(admin));
}

const slugs = (body: { data: { items: { slug: string }[] } }) =>
  body.data.items.map((item) => item.slug);

describe("public post listing — the since window", () => {
  it("keeps posts inside the window and drops older ones", async () => {
    const res = await publicGet("/api/v1/posts", { brand: "eleos", since: SINCE });

    expect(res.status).toBe(200);
    expect(slugs(res.body)).toContain("fresh-eleos");
    expect(slugs(res.body)).toContain("legacy-eleos");
    expect(slugs(res.body)).not.toContain("stale-eleos");
  });

  it("reports a total that reflects the window, not the whole collection", async () => {
    const res = await publicGet("/api/v1/posts", { brand: "eleos", since: SINCE });

    // fresh-eleos + legacy-eleos; stale-eleos is out, fresh-subsidiary is off-brand.
    expect(res.body.data.pagination.total).toBe(2);
  });

  it("returns every post when no boundary is given — the archives are untouched", async () => {
    const res = await publicGet("/api/v1/posts");

    expect(res.body.data.pagination.total).toBe(4);
    expect(slugs(res.body)).toContain("stale-eleos");
  });
});

describe("public post listing — the brand cut", () => {
  it("excludes subsidiary posts when asked for ELEOS", async () => {
    const res = await publicGet("/api/v1/posts", { brand: "eleos", since: SINCE });

    expect(slugs(res.body)).not.toContain("fresh-subsidiary");
  });

  it("still returns subsidiary posts when asked for them by name", async () => {
    const res = await publicGet("/api/v1/posts", { brand: "his-story-tellers" });

    expect(slugs(res.body)).toEqual(["fresh-subsidiary"]);
  });

  it("reads a post written before the brand field as ELEOS", async () => {
    const res = await publicGet("/api/v1/posts", { brand: "eleos", since: SINCE });
    const legacy = res.body.data.items.find(
      (item: { slug: string }) => item.slug === "legacy-eleos"
    );

    expect(legacy).toBeDefined();
    expect(legacy.brand).toBe("eleos");
  });
});

describe("public video listing — the since window", () => {
  it("keeps videos inside the window and drops older ones", async () => {
    const res = await publicGet("/api/v1/videos", { brand: "eleos", since: SINCE });

    expect(res.status).toBe(200);
    expect(slugs(res.body)).toContain("fresh-video");
    expect(slugs(res.body)).not.toContain("stale-video");
    expect(res.body.data.pagination.total).toBe(2);
  });

  it("returns every video when no boundary is given", async () => {
    const res = await publicGet("/api/v1/videos");

    expect(res.body.data.pagination.total).toBe(4);
    expect(slugs(res.body)).toContain("stale-video");
  });

  it("returns a pre-brand video when asked for ELEOS", async () => {
    // The regression this guards: an equality filter (`brand: "eleos"`) does
    // not match a document with no `brand` key, which would silently empty the
    // homepage for every video written before the field existed.
    const res = await publicGet("/api/v1/videos", { brand: "eleos", since: SINCE });

    expect(slugs(res.body)).toContain("legacy-video");
  });

  it("excludes subsidiary videos when asked for ELEOS", async () => {
    const res = await publicGet("/api/v1/videos", { brand: "eleos", since: SINCE });

    expect(slugs(res.body)).not.toContain("fresh-subsidiary-video");
  });

  it("still returns subsidiary videos when asked for them by name", async () => {
    const res = await publicGet("/api/v1/videos", { brand: "his-story-tellers" });

    expect(slugs(res.body)).toEqual(["fresh-subsidiary-video"]);
  });
});

describe("admin listings are not windowed", () => {
  it("shows every post, stale and subsidiary alike", async () => {
    const res = await adminGet("/api/v1/admin/posts");

    expect(res.status).toBe(200);
    expect(slugs(res.body)).toContain("stale-eleos");
    expect(slugs(res.body)).toContain("fresh-subsidiary");
  });

  it("shows every video, stale and subsidiary alike", async () => {
    const res = await adminGet("/api/v1/admin/videos");

    expect(res.status).toBe(200);
    expect(slugs(res.body)).toContain("stale-video");
    expect(slugs(res.body)).toContain("fresh-subsidiary-video");
  });
});

describe("query validation", () => {
  it("rejects an unparseable since boundary rather than ignoring it", async () => {
    const posts = await publicGet("/api/v1/posts", { since: "not-a-date" });
    const videos = await publicGet("/api/v1/videos", { since: "not-a-date" });

    expect(posts.status).toBe(400);
    expect(videos.status).toBe(400);
  });

  it("rejects an unknown brand", async () => {
    const res = await publicGet("/api/v1/videos", { brand: "some-other-subsidiary" });

    expect(res.status).toBe(400);
  });
});
