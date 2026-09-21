import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { AdminUser } from "../src/models/adminUser.model.ts";
import { Role } from "../src/models/role.model.ts";
import { config } from "../src/config/env.ts";
import {
  cookieHeader,
  login,
  resetTokenFromMail,
  sentMail,
  setupApp,
  teardownApp,
  type SessionCookies,
  type TestContext,
} from "./helpers.ts";

// Never send real email from the test suite.
vi.mock("../src/services/mail.service.ts", () => ({
  sendMail: vi.fn(async () => true),
}));

let ctx: TestContext;
let app: Express;
let superAdminPassword = "password123"; // mutated as tests reset it

beforeAll(async () => {
  ctx = await setupApp();
  app = ctx.app;
});

afterAll(() => teardownApp(ctx));

describe("POST /api/v1/auth/login", () => {
  it("signs the super admin in and sets both session cookies", async () => {
    const { res, cookies } = await login(app, config.adminEmail, superAdminPassword);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(config.adminEmail);
    expect(res.body.data.permissions).toContain("*");
    expect(cookies.access).toContain("eri_access=");
    expect(cookies.access).toContain("HttpOnly");
    expect(cookies.refresh).toContain("eri_refresh=");
    expect(cookies.refresh).toContain("HttpOnly");
  });

  it("rejects a wrong password with a generic 401", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: config.adminEmail, password: "definitely-wrong" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns the identical error for an unknown email (no enumeration)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@example.com", password: "definitely-wrong" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects a malformed email with validation errors", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "x" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("session endpoints", () => {
  it("GET /auth/me requires authentication", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns the session for a valid cookie", async () => {
    const { cookies } = await login(app, config.adminEmail, superAdminPassword);
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookieHeader(cookies));

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(config.adminEmail);
    expect(res.body.data.role.slug).toBe("super-admin");
  });

  it("refresh rotates the refresh token and rejects the old one", async () => {
    const { cookies } = await login(app, config.adminEmail, superAdminPassword);

    const first = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies));
    expect(first.status).toBe(200);
    const newRaw = (first.headers["set-cookie"] ?? []) as string[];
    expect(newRaw.some((c) => c.startsWith("eri_refresh="))).toBe(true);

    // Replaying the retired token must fail…
    const replay = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies));
    expect(replay.status).toBe(401);

    // …and the reuse must have revoked the freshly-issued token too.
    const newCookies = {
      access: newRaw.find((c) => c.startsWith("eri_access=")) ?? "",
      refresh: newRaw.find((c) => c.startsWith("eri_refresh=")) ?? "",
    };
    const afterReuse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(newCookies));
    expect(afterReuse.status).toBe(401);
  });

  it("logout revokes the refresh token and clears cookies", async () => {
    const { cookies } = await login(app, config.adminEmail, superAdminPassword);

    const out = await request(app)
      .post("/api/v1/auth/logout")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies));
    expect(out.status).toBe(200);
    expect((out.headers["set-cookie"] ?? []).length).toBeGreaterThan(0);

    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies));
    expect(refreshed.status).toBe(401);
  });
});

describe("CSRF origin checks", () => {
  it("rejects a login from a disallowed origin", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", "https://evil.example.com")
      .send({ email: config.adminEmail, password: superAdminPassword });

    expect(res.status).toBe(403);
  });
});

describe("login lockout", () => {
  it("locks the account after 5 failed attempts", async () => {
    // Dedicated user so the super admin isn't affected.
    const role = await Role.findOne({ slug: "super-admin" });
    await AdminUser.create({
      email: "locktarget@example.com",
      name: "Lock Target",
      passwordHash: await bcrypt.hash("correct-horse-9", 4), // real hash, wrong password
      role: role!._id,
    });

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "locktarget@example.com", password: "wrong-pass-1" });
      expect(res.status).toBe(401);
    }

    // Even the CORRECT password is rejected while locked.
    const locked = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "locktarget@example.com", password: "password123" });
    expect(locked.status).toBe(429);
    expect(locked.body.message).toMatch(/locked/i);
  });
});

describe("forgot / reset password", () => {
  it("responds identically whether or not the email exists", async () => {
    const known = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("Origin", config.corsOrigins[0])
      .send({ email: config.adminEmail });
    const unknown = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("Origin", config.corsOrigins[0])
      .send({ email: "stranger@example.com" });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(unknown.body.message).toBe(known.body.message);
  });

  it("emails a reset link, resets the password, and burns the token", async () => {
    sentMail.mockClear();
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("Origin", config.corsOrigins[0])
      .send({ email: config.adminEmail });

    expect(sentMail).toHaveBeenCalledTimes(1);
    const token = resetTokenFromMail();
    expect(token).toBeTruthy();

    const reset = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("Origin", config.corsOrigins[0])
      .send({ token, password: "new-secret-123" });
    expect(reset.status).toBe(200);

    // Old password no longer works; the new one does.
    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: config.adminEmail, password: "password123" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: config.adminEmail, password: "new-secret-123" });
    expect(newLogin.status).toBe(200);

    superAdminPassword = "new-secret-123";

    // The token is single-use.
    const reuse = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("Origin", config.corsOrigins[0])
      .send({ token, password: "another-secret-123" });
    expect(reuse.status).toBe(400);
  });

  it("rejects a reset with a weak password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("Origin", config.corsOrigins[0])
      .send({ token: "a".repeat(64), password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("change password (authenticated)", () => {
  it("changes the password and invalidates refresh tokens", async () => {
    const { cookies } = await login(app, config.adminEmail, superAdminPassword);

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies))
      .send({ currentPassword: superAdminPassword, newPassword: "rotated-secret-9" });
    expect(res.status).toBe(200);

    // The refresh cookie is dead after the change.
    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies));
    expect(refreshed.status).toBe(401);

    superAdminPassword = "rotated-secret-9";
    const reLogin = await login(app, config.adminEmail, superAdminPassword);
    expect(reLogin.res.status).toBe(200);
  });

  it("rejects a wrong current password", async () => {
    const { cookies } = await login(app, config.adminEmail, superAdminPassword);
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader(cookies))
      .send({ currentPassword: "not-the-password", newPassword: "another-secret-9" });
    expect(res.status).toBe(400);
  });
});

describe("role-based access control", () => {
  let limitedCookies: SessionCookies;

  beforeAll(async () => {
    // A role with no content permissions, and a user holding it.
    const roleRes = await request(app)
      .post("/api/v1/admin/roles")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader((await login(app, config.adminEmail, superAdminPassword)).cookies))
      .send({ name: "No Permissions", permissions: [] });
    expect(roleRes.status).toBe(201);

    const userRes = await request(app)
      .post("/api/v1/admin/users")
      .set("Origin", config.corsOrigins[0])
      .set("Cookie", cookieHeader((await login(app, config.adminEmail, superAdminPassword)).cookies))
      .send({
        name: "Limited Admin",
        email: "limited@example.com",
        password: "limited-pass-1",
        roleId: roleRes.body.data.id,
      });
    expect(userRes.status).toBe(201);

    limitedCookies = (await login(app, "limited@example.com", "limited-pass-1")).cookies;
  });

  it("blocks admin content endpoints the role doesn't permit", async () => {
    const res = await request(app)
      .get("/api/v1/admin/contact-messages")
      .set("Cookie", cookieHeader(limitedCookies));
    expect(res.status).toBe(403);
  });

  it("blocks admin endpoints entirely without a session", async () => {
    const res = await request(app).get("/api/v1/admin/users");
    expect(res.status).toBe(401);
  });

  it("still serves endpoints that need no special permission", async () => {
    const res = await request(app)
      .get("/api/v1/admin/roles")
      .set("Cookie", cookieHeader(limitedCookies));
    expect(res.status).toBe(200);
  });
});
