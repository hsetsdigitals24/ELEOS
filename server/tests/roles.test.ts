import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
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
let admin: SessionCookies;
let superAdminId: string;
let superAdminRoleId: string;

beforeAll(async () => {
  ctx = await setupApp();
  app = ctx.app;

  const { res, cookies } = await login(app, config.adminEmail, "password123");
  expect(res.status).toBe(200); // fail fast if seeding is broken
  admin = cookies;
  superAdminId = res.body.data.user.id as string;

  superAdminRoleId = (await Role.findOne({ slug: "super-admin" }))!._id.toString();
});

afterAll(() => teardownApp(ctx));

/** Authenticated admin request with the right Origin header. */
function adminReq(method: string, path: string) {
  return request(app)[method](path)
    .set("Origin", config.corsOrigins[0])
    .set("Cookie", cookieHeader(admin));
}

describe("role management (POST/PATCH/DELETE /api/v1/admin/roles)", () => {
  it("creates a role with permissions", async () => {
    const res = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Content Editors",
      permissions: ["products:manage", "broadcasts:manage"],
    });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe("content-editors");
    expect(res.body.data.permissions).toEqual(["products:manage", "broadcasts:manage"]);
    expect(res.body.data.isSystem).toBe(false);
  });

  it("rejects a duplicate role name", async () => {
    const res = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Content Editors",
      permissions: [],
    });
    expect(res.status).toBe(409);
  });

  it("rejects the reserved super-admin name", async () => {
    const res = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Super Admin",
      permissions: [],
    });
    expect(res.status).toBe(409);
  });

  it("rejects an unknown permission", async () => {
    const res = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Bad Role",
      permissions: ["galaxy:manage"],
    });
    expect(res.status).toBe(400);
  });

  it("updates a role's name and permissions", async () => {
    const created = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Editors Temp",
      permissions: ["products:manage"],
    });
    const id = created.body.data.id as string;

    const res = await adminReq("patch", `/api/v1/admin/roles/${id}`).send({
      name: "Renamed Editors",
      permissions: ["messages:manage"],
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Renamed Editors");
    expect(res.body.data.permissions).toEqual(["messages:manage"]);
  });

  it("refuses to edit or delete the system super-admin role", async () => {
    const patch = await adminReq("patch", `/api/v1/admin/roles/${superAdminRoleId}`).send({
      name: "Hijacked",
    });
    expect(patch.status).toBe(403);

    const del = await adminReq("delete", `/api/v1/admin/roles/${superAdminRoleId}`);
    expect(del.status).toBe(403);
  });

  it("refuses to delete a role that is still assigned", async () => {
    const created = await adminReq("post", "/api/v1/admin/roles").send({
      name: "In Use Role",
      permissions: [],
    });
    const roleId = created.body.data.id as string;

    const user = await adminReq("post", "/api/v1/admin/users").send({
      name: "Assigned User",
      email: "assigned@example.com",
      password: "assigned-pass-1",
      roleId,
    });
    expect(user.status).toBe(201);

    const del = await adminReq("delete", `/api/v1/admin/roles/${roleId}`);
    expect(del.status).toBe(409);
  });

  it("deletes an unused role", async () => {
    const created = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Disposable Role",
      permissions: [],
    });
    const id = created.body.data.id as string;

    const del = await adminReq("delete", `/api/v1/admin/roles/${id}`);
    expect(del.status).toBe(200);
  });
});

describe("user management (/api/v1/admin/users)", () => {
  let editorRoleId: string;

  beforeAll(async () => {
    const created = await adminReq("post", "/api/v1/admin/roles").send({
      name: "Editors",
      permissions: ["products:manage"],
    });
    editorRoleId = created.body.data.id as string;
  });

  it("creates a user with an explicit password (no email)", async () => {
    sentMail.mockClear();
    const res = await adminReq("post", "/api/v1/admin/users").send({
      name: "Plain Editor",
      email: "plain@example.com",
      password: "editor-pass-1",
      roleId: editorRoleId,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("plain@example.com");
    expect(res.body.data.role.slug).toBe("editors");
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(sentMail).not.toHaveBeenCalled();

    // The user can sign in with that password straight away.
    const signIn = await login(app, "plain@example.com", "editor-pass-1");
    expect(signIn.res.status).toBe(200);
  });

  it("creates a user without a password and emails a set-password link", async () => {
    sentMail.mockClear();
    const res = await adminReq("post", "/api/v1/admin/users").send({
      name: "Invited Editor",
      email: "invited@example.com",
      roleId: editorRoleId,
    });

    expect(res.status).toBe(201);
    expect(sentMail).toHaveBeenCalledTimes(1);
    const mail = sentMail.mock.calls[0]?.[0] as { to: string } | undefined;
    expect(mail?.to).toBe("invited@example.com");

    // No password yet — sign-in is refused with the generic error.
    const early = await login(app, "invited@example.com", "anything-1");
    expect(early.res.status).toBe(401);

    // The invited user sets a password through the emailed link.
    const token = resetTokenFromMail();
    expect(token).toBeTruthy();
    const reset = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("Origin", config.corsOrigins[0])
      .send({ token, password: "invited-pass-1" });
    expect(reset.status).toBe(200);

    const signIn = await login(app, "invited@example.com", "invited-pass-1");
    expect(signIn.res.status).toBe(200);
  });

  it("rejects a duplicate email", async () => {
    const res = await adminReq("post", "/api/v1/admin/users").send({
      name: "Duplicate Editor",
      email: "plain@example.com",
      password: "another-pass-1",
      roleId: editorRoleId,
    });
    expect(res.status).toBe(409);
  });

  it("rejects an unknown role", async () => {
    const res = await adminReq("post", "/api/v1/admin/users").send({
      name: "Ghost Editor",
      email: "ghost@example.com",
      password: "ghost-pass-12",
      roleId: "000000000000000000000000",
    });
    expect(res.status).toBe(404);
  });

  it("lists users with their roles", async () => {
    const res = await adminReq("get", "/api/v1/admin/users");
    expect(res.status).toBe(200);
    const emails = (res.body.data as { email: string }[]).map((u) => u.email);
    expect(emails).toContain(config.adminEmail);
    expect(emails).toContain("plain@example.com");
  });

  it("renames a user", async () => {
    const created = await adminReq("post", "/api/v1/admin/users").send({
      name: "Rename Me",
      email: "rename@example.com",
      password: "rename-pass-1",
      roleId: editorRoleId,
    });
    const id = created.body.data.id as string;

    const res = await adminReq("patch", `/api/v1/admin/users/${id}`).send({
      name: "Renamed User",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Renamed User");
  });

  it("emails a password reset link on demand", async () => {
    sentMail.mockClear();
    const res = await adminReq("post", `/api/v1/admin/users/${superAdminId}/send-reset`);
    expect(res.status).toBe(200);
    expect(sentMail).toHaveBeenCalledTimes(1);
  });

  describe("self-protection guards", () => {
    it("refuses self-deactivation, self-role-change and self-delete", async () => {
      const deactivate = await adminReq("patch", `/api/v1/admin/users/${superAdminId}`).send({
        isActive: false,
      });
      expect(deactivate.status).toBe(400);
      expect(deactivate.body.message).toMatch(/own account/i);

      const reRole = await adminReq("patch", `/api/v1/admin/users/${superAdminId}`).send({
        roleId: editorRoleId,
      });
      expect(reRole.status).toBe(400);

      const del = await adminReq("delete", `/api/v1/admin/users/${superAdminId}`);
      expect(del.status).toBe(400);
    });
  });

  describe("last-super-admin protection", () => {
    let managerCookies: SessionCookies;
    let secondSuperAdminId: string;

    beforeAll(async () => {
      // A non-super admin with users:manage, to act against the super admin.
      const managerRole = await adminReq("post", "/api/v1/admin/roles").send({
        name: "User Managers",
        permissions: ["users:manage"],
      });
      const manager = await adminReq("post", "/api/v1/admin/users").send({
        name: "User Manager",
        email: "manager@example.com",
        password: "manager-pass-1",
        roleId: managerRole.body.data.id,
      });
      expect(manager.status).toBe(201);
      managerCookies = (await login(app, "manager@example.com", "manager-pass-1")).cookies;

      // A second super admin, so the "last one" test is deterministic.
      const second = await adminReq("post", "/api/v1/admin/users").send({
        name: "Second Super",
        email: "second-super@example.com",
        password: "second-pass-12",
        roleId: superAdminRoleId,
      });
      secondSuperAdminId = second.body.data.id as string;
    });

    function managerReq(method: string, path: string) {
      return request(app)[method](path)
        .set("Origin", config.corsOrigins[0])
        .set("Cookie", cookieHeader(managerCookies));
    }

    it("blocks deactivating the last active super admin", async () => {
      // Deactivate the second super admin first (allowed — one remains).
      const ok = await managerReq("patch", `/api/v1/admin/users/${secondSuperAdminId}`).send({
        isActive: false,
      });
      expect(ok.status).toBe(200);

      // Now the seeded super admin is the last one — deactivation is refused.
      const res = await managerReq("patch", `/api/v1/admin/users/${superAdminId}`).send({
        isActive: false,
      });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/super admin/i);
    });

    it("blocks deleting the last active super admin", async () => {
      const res = await managerReq("delete", `/api/v1/admin/users/${superAdminId}`);
      expect(res.status).toBe(403);
    });

    it("re-roleing the last active super admin is refused", async () => {
      const editors = await Role.findOne({ slug: "editors" });
      const res = await managerReq("patch", `/api/v1/admin/users/${superAdminId}`).send({
        roleId: editors!._id.toString(),
      });
      expect(res.status).toBe(403);
    });

    it("deletes a regular user cleanly", async () => {
      const created = await adminReq("post", "/api/v1/admin/users").send({
        name: "Doomed User",
        email: "doomed@example.com",
        password: "doomed-pass-12",
        roleId: editorRoleId,
      });
      const id = created.body.data.id as string;

      const res = await managerReq("delete", `/api/v1/admin/users/${id}`);
      expect(res.status).toBe(200);
    });
  });
});
