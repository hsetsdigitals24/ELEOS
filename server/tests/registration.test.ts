import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { Event } from "../src/models/event.model.ts";
import { AppError } from "../src/utils/AppError.ts";
import { submitRegistration } from "../src/services/registration.service.ts";
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
 * Event registration — per-event forms the admin builds, and the public
 * submissions they collect. The HTTP layer is exercised end to end; the
 * field-level validation issues are asserted against the service directly,
 * since the global error handler only serializes `details` in development.
 */

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
});

afterAll(() => teardownApp(ctx));

/** Authenticated admin request. */
function adminReq(method: string, path: string) {
  return request(app)[method](path).set("Origin", origin).set("Cookie", cookieHeader(admin));
}

/** Anonymous public request. */
function publicReq(method: string, path: string) {
  return request(app)[method](path).set("Origin", origin);
}

/** Creates an event through the admin API and returns its id and slug. */
async function makeEvent(title: string): Promise<{ id: string; slug: string }> {
  const res = await adminReq("post", "/api/v1/admin/events").send({
    title,
    date: "2026-11-18",
    description: "<p>An afternoon of talks.</p>",
    time: "10:00am – 2:00pm (GMT)",
    venue: "Online",
    city: "Ilorin",
    category: "Roundtable",
  });
  expect(res.status).toBe(201);
  return { id: res.body.data.id as string, slug: res.body.data.slug as string };
}

describe("registration forms are created with the event", () => {
  it("gives a brand new event the three default fields", async () => {
    const { id } = await makeEvent("Nutrition Security Webinar");

    const res = await adminReq("get", `/api/v1/admin/events/${id}/registration-form`);

    expect(res.status).toBe(200);
    expect(res.body.data.eventId).toBe(id);
    expect(res.body.data.isOpen).toBe(true);
    expect(res.body.data.fields.map((f: { type: string }) => f.type)).toEqual([
      "text",
      "email",
      "tel",
    ]);
    expect(res.body.data.fields[0].required).toBe(true);
  });

  it("creates a form lazily for an event that predates the feature", async () => {
    // Written straight to the collection, so no service ran on it — exactly
    // the state every event in the database is in today.
    const legacy = await Event.create({
      title: "Legacy Event",
      slug: "legacy-event",
      date: new Date("2026-12-01T10:00:00.000Z"),
      description: "<p>Predates registration forms.</p>",
      isPublished: true,
    });

    const res = await publicReq("get", "/api/v1/events/legacy-event/registration-form");

    expect(res.status).toBe(200);
    expect(res.body.data.event.title).toBe("Legacy Event");
    expect(res.body.data.form.fields).toHaveLength(3);

    // Second read reuses the form rather than minting another.
    const again = await adminReq("get", `/api/v1/admin/events/${legacy._id}/registration-form`);
    expect(again.body.data.id).toBe(res.body.data.form.id);
  });

  it("404s the registration page for an unknown slug", async () => {
    const res = await publicReq("get", "/api/v1/events/no-such-event/registration-form");
    expect(res.status).toBe(404);
  });
});

describe("the admin controls the form", () => {
  it("saves a reordered, retyped field list and reads it back", async () => {
    const { id } = await makeEvent("Field Builder Event");

    const res = await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [
        {
          key: "dietary_needs",
          label: "Dietary needs",
          type: "select",
          required: true,
          options: ["None", "Vegetarian", "Vegan"],
        },
        { key: "full_name", label: "Your name", type: "text", required: true },
        { key: "email", label: "Email address", type: "email", required: true },
      ],
      isOpen: true,
      intro: "Tell us who is coming.",
      successMessage: "See you there.",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.fields.map((f: { key: string }) => f.key)).toEqual([
      "dietary_needs",
      "full_name",
      "email",
    ]);
    expect(res.body.data.intro).toBe("Tell us who is coming.");
    expect(res.body.data.fields[0].options).toEqual(["None", "Vegetarian", "Vegan"]);

    const readBack = await adminReq("get", `/api/v1/admin/events/${id}/registration-form`);
    expect(readBack.body.data.fields[1].label).toBe("Your name");
  });

  it("rejects two fields sharing a key", async () => {
    const { id } = await makeEvent("Duplicate Key Event");

    const res = await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [
        { key: "email", label: "Email", type: "email" },
        { key: "email", label: "Email again", type: "email" },
      ],
    });

    expect(res.status).toBe(400);
  });

  it("rejects a dropdown with no choices", async () => {
    const { id } = await makeEvent("Empty Options Event");

    const res = await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [{ key: "diet", label: "Diet", type: "select", options: [] }],
    });

    expect(res.status).toBe(400);
  });
});

describe("public submission", () => {
  it("stores the answers under the labels as they were at the time", async () => {
    const { id, slug } = await makeEvent("Submission Event");

    // Rename a field before anyone registers…
    await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [
        { key: "full_name", label: "Full name", type: "text", required: true },
        { key: "email", label: "Email address", type: "email", required: true },
        { key: "org", label: "Organisation", type: "text" },
      ],
    });

    const res = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Ada Nwosu", email: "ADA@Example.com", org: "ERI" },
    });
    expect(res.status).toBe(201);

    // …then rename it again, after the fact.
    await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [
        { key: "full_name", label: "What should we call you?", type: "text", required: true },
        { key: "email", label: "Email address", type: "email", required: true },
      ],
    });

    const list = await adminReq("get", `/api/v1/admin/registrations?event=${id}`);
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);

    const stored = list.body.data.items[0];
    expect(stored.name).toBe("Ada Nwosu");
    // Lower-cased on write so the uniqueness index is case-insensitive.
    expect(stored.email).toBe("ada@example.com");
    expect(stored.eventId).toBe(id);
    expect(stored.isReviewed).toBe(false);

    // The snapshot keeps the label from submission time, and keeps the answer
    // to a field the admin has since deleted.
    const answers = Object.fromEntries(
      stored.answers.map((a: { key: string; label: string; value: string }) => [
        a.key,
        { label: a.label, value: a.value },
      ])
    );
    expect(answers.full_name.label).toBe("Full name");
    expect(answers.org).toEqual({ label: "Organisation", value: "ERI" });
  });

  it("refuses a second registration under the same email", async () => {
    const { slug } = await makeEvent("Duplicate Email Event");

    const first = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Bola Ade", email: "bola@example.com" },
    });
    expect(first.status).toBe(201);

    const second = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Bola Again", email: "BOLA@example.com" },
    });
    expect(second.status).toBe(409);
  });

  it("scopes duplicates to one event — the same email may register for another", async () => {
    const a = await makeEvent("Concurrent Event A");
    const b = await makeEvent("Concurrent Event B");

    const first = await publicReq("post", `/api/v1/events/${a.slug}/registrations`).send({
      answers: { full_name: "Chidi Ok", email: "chidi@example.com" },
    });
    const second = await publicReq("post", `/api/v1/events/${b.slug}/registrations`).send({
      answers: { full_name: "Chidi Ok", email: "chidi@example.com" },
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
  });

  it("allows repeat submissions when the form has no email field", async () => {
    const { id, slug } = await makeEvent("Anonymous Signup Event");

    await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [{ key: "full_name", label: "Full name", type: "text", required: true }],
    });

    const first = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Same Person" },
    });
    const second = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Same Person" },
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
  });

  it("rejects submissions once registration is closed", async () => {
    const { id, slug } = await makeEvent("Closed Registration Event");

    await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [{ key: "full_name", label: "Full name", type: "text", required: true }],
      isOpen: false,
    });

    const res = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Latecomer" },
    });

    expect(res.status).toBe(403);

    // The closed form still resolves, so an old link lands on a message
    // rather than a 404.
    const page = await publicReq("get", `/api/v1/events/${slug}/registration-form`);
    expect(page.status).toBe(200);
    expect(page.body.data.form.isOpen).toBe(false);
  });

  it("refuses a submission to an unknown or unpublished event", async () => {
    const missing = await publicReq("post", "/api/v1/events/nope/registrations").send({
      answers: { full_name: "Nobody" },
    });
    expect(missing.status).toBe(404);

    const { id, slug } = await makeEvent("Unpublished Event");
    await adminReq("put", `/api/v1/admin/events/${id}`).send({ isPublished: false });

    const hidden = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Nobody" },
    });
    expect(hidden.status).toBe(404);
  });

  it("reports every unanswered required field as a field-level issue", async () => {
    const { id, slug } = await makeEvent("Required Fields Event");

    await adminReq("put", `/api/v1/admin/events/${id}/registration-form`).send({
      fields: [
        { key: "full_name", label: "Full name", type: "text", required: true },
        { key: "email", label: "Email address", type: "email", required: true },
        { key: "diet", label: "Dietary needs", type: "select", required: true, options: ["None"] },
      ],
    });

    // The HTTP layer reports the 400 (its `details` are development-only)…
    const res = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { email: "not-an-email", diet: "Something else" },
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");

    // …so the issues themselves are asserted against the service.
    const error = await submitRegistration(slug, {
      answers: { email: "not-an-email", diet: "Something else" },
    }).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(AppError);
    const issues = (error as AppError).details as {
      issues: Array<{ field: string; message: string }>;
    };
    const byField = Object.fromEntries(issues.issues.map((i) => [i.field, i.message]));

    expect(byField.full_name).toBe("Full name is required");
    expect(byField.email).toBe("Email address must be a valid email address");
    expect(byField.diet).toBe("Dietary needs has an unrecognised choice");
  });

  it("ignores answers to keys the form doesn't have", async () => {
    const { slug } = await makeEvent("Unknown Key Event");

    const res = await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Grace E", email: "grace@example.com", nonsense: "ignored" },
    });
    expect(res.status).toBe(201);

    const list = await adminReq("get", `/api/v1/admin/registrations?event=`);
    expect(list.status).toBe(400); // listing without an event is refused

    const scoped = await adminReq(
      "get",
      `/api/v1/admin/registrations?event=${(await Event.findOne({ slug }))!._id}`
    );
    const keys = scoped.body.data.items[0].answers.map((a: { key: string }) => a.key);
    expect(keys).not.toContain("nonsense");
  });
});

describe("response management is scoped per event", () => {
  it("counts each event's registrations separately", async () => {
    const a = await makeEvent("Counted Event A");
    const b = await makeEvent("Counted Event B");

    await publicReq("post", `/api/v1/events/${a.slug}/registrations`).send({
      answers: { full_name: "One", email: "one@example.com" },
    });
    await publicReq("post", `/api/v1/events/${a.slug}/registrations`).send({
      answers: { full_name: "Two", email: "two@example.com" },
    });
    await publicReq("post", `/api/v1/events/${b.slug}/registrations`).send({
      answers: { full_name: "Three", email: "three@example.com" },
    });

    const list = await adminReq("get", "/api/v1/admin/events?limit=50");
    const counts = Object.fromEntries(
      list.body.data.items.map((e: { id: string; registrationCount: number }) => [
        e.id,
        e.registrationCount,
      ])
    );

    expect(counts[a.id]).toBe(2);
    expect(counts[b.id]).toBe(1);
  });

  it("marks a response reviewed and deletes one", async () => {
    const { id, slug } = await makeEvent("Reviewable Event");
    await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Triage Me", email: "triage@example.com" },
    });

    const list = await adminReq("get", `/api/v1/admin/registrations?event=${id}`);
    const registrationId = list.body.data.items[0].id as string;

    const reviewed = await adminReq("patch", `/api/v1/admin/registrations/${registrationId}`).send({
      isReviewed: true,
    });
    expect(reviewed.status).toBe(200);

    const onlyNew = await adminReq(
      "get",
      `/api/v1/admin/registrations?event=${id}&unreviewed=true`
    );
    expect(onlyNew.body.data.items).toHaveLength(0);

    const removed = await adminReq("delete", `/api/v1/admin/registrations/${registrationId}`);
    expect(removed.status).toBe(200);

    const after = await adminReq("get", `/api/v1/admin/registrations?event=${id}`);
    expect(after.body.data.items).toHaveLength(0);
  });

  it("deletes an event's responses along with the event", async () => {
    const { id, slug } = await makeEvent("Doomed Event");
    await publicReq("post", `/api/v1/events/${slug}/registrations`).send({
      answers: { full_name: "Goes Away", email: "goes@example.com" },
    });

    const removed = await adminReq("delete", `/api/v1/admin/events/${id}`);
    expect(removed.status).toBe(200);

    // The list would 200 with zero items either way; asserting on the
    // collection itself is what proves the cascade ran.
    const { EventRegistration } = await import("../src/models/eventRegistration.model.ts");
    expect(await EventRegistration.countDocuments({ event: id })).toBe(0);
  });
});

describe("registration admin routes are guarded", () => {
  it("refuses every admin registration route without a session", async () => {
    const { id } = await makeEvent("Guarded Event");

    const responses = await Promise.all([
      publicReq("get", `/api/v1/admin/events/${id}/registration-form`),
      publicReq("put", `/api/v1/admin/events/${id}/registration-form`).send({ fields: [] }),
      publicReq("get", `/api/v1/admin/registrations?event=${id}`),
      publicReq("patch", `/api/v1/admin/registrations/${id}`).send({ isReviewed: true }),
      publicReq("delete", `/api/v1/admin/registrations/${id}`),
    ]);

    for (const res of responses) {
      expect(res.status).toBe(401);
    }
  });
});
