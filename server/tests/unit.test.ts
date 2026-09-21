import { describe, it, expect } from "vitest";
import { passwordSchema } from "../src/validators/auth.validator.ts";
import { escapeHtml } from "../src/services/mail/templates.ts";
import { renderResetPasswordEmail, renderWelcomeEmail } from "../src/services/mail/templates.ts";
import { generateOpaqueToken, hashToken, digestsMatch, signAccessToken, verifyAccessToken } from "../src/utils/tokens.ts";

/**
 * Unit tests — pure functions, no database or HTTP involved.
 */

describe("password policy (passwordSchema)", () => {
  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("correct-horse-9").success).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("ab1").success).toBe(false);
  });

  it("requires at least one letter", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });

  it("requires at least one number", () => {
    expect(passwordSchema.safeParse("onlyletters").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(passwordSchema.safeParse(12345678).success).toBe(false);
  });
});

describe("token helpers (utils/tokens.ts)", () => {
  it("generates 64-hex-character opaque tokens", () => {
    const token = generateOpaqueToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    // Two draws never collide in practice — different values.
    expect(generateOpaqueToken()).not.toBe(token);
  });

  it("hashes tokens deterministically (sha256)", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
    expect(hashToken("abc")).toHaveLength(64);
  });

  it("compares digests in constant time", () => {
    const a = hashToken("first-token");
    const b = hashToken("first-token");
    const c = hashToken("second-token");

    expect(digestsMatch(a, b)).toBe(true);
    expect(digestsMatch(a, c)).toBe(false);
  });
});

describe("access-token JWTs", () => {
  it("round-trips a signed token", () => {
    const token = signAccessToken("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439022");
    const payload = verifyAccessToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("507f1f77bcf86cd799439011");
    expect(payload?.roleId).toBe("507f1f77bcf86cd799439022");
  });

  it("returns null for a tampered token", () => {
    const token = signAccessToken("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439022");
    expect(verifyAccessToken(`${token}x`)).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(verifyAccessToken("not-a-jwt")).toBeNull();
    expect(verifyAccessToken("")).toBeNull();
  });
});

describe("mail templates", () => {
  it("renders the reset URL, minutes and brand colours in the reset email", () => {
    const mail = renderResetPasswordEmail({
      name: "Ayo <Admin>",
      resetUrl: "http://localhost:3000/admin/reset-password?token=abc123",
      expiresInMinutes: 15,
    });

    expect(mail.subject).toContain("Reset your ERI admin password");
    expect(mail.html).toContain("http://localhost:3000/admin/reset-password?token=abc123");
    expect(mail.html).toContain("#e3221c"); // brand red
    expect(mail.html).not.toContain("Ayo <Admin>"); // name is escaped
    expect(mail.html).toContain("Ayo &lt;Admin&gt;");
    expect(mail.html).toContain("15 minutes");
    // Plain-text alternative carries the link too.
    expect(mail.text).toContain("http://localhost:3000/admin/reset-password?token=abc123");
  });

  it("renders the set-password URL in the welcome email", () => {
    const mail = renderWelcomeEmail({
      name: "Grace",
      setPasswordUrl: "http://localhost:3000/admin/reset-password?token=def456",
      expiresInMinutes: 15,
    });

    expect(mail.html).toContain("http://localhost:3000/admin/reset-password?token=def456");
    expect(mail.text).toContain("http://localhost:3000/admin/reset-password?token=def456");
  });
});

describe("escapeHtml", () => {
  it("neutralises HTML-significant characters", () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;"
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Grace Ojo")).toBe("Grace Ojo");
  });
});
