/**
 * Branded, email-client-safe HTML templates. Everything is inline-styled
 * and table-based (no <style> blocks, no flex/grid) so it renders in Gmail,
 * Outlook and friends. Palette mirrors the site: crimson #e3221c, warm
 * cream #F7F4EF, near-black #141414; Georgia carries the display-serif
 * headings, Arial/Helvetica the body copy.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const RED = "#e3221c";
const DARK_RED = "#8f1712";
const INK = "#141414";
const CREAM = "#F7F4EF";
const GREY = "#5c5c5c";

/** Escapes HTML-significant characters — used for user-provided names/URLs. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Page shell — cream canvas, red masthead, white card. */
function layout(options: { heading: string; bodyHtml: string; footerHtml?: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:${CREAM};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5ddd0;border-radius:4px;overflow:hidden;">
            <!-- Masthead -->
            <tr>
              <td style="background-color:${RED};padding:28px 32px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:0.04em;">
                  ELEOS RESEARCH INNOVATIONS
                </p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#ffffff;letter-spacing:0.18em;text-transform:uppercase;">
                  Health &middot; Dignity &middot; Community
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${INK};">
                  ${escapeHtml(options.heading)}
                </h1>
                ${options.bodyHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:28px 32px 32px;">
                <div style="width:32px;height:2px;background-color:${RED};margin-bottom:14px;"></div>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${GREY};">
                  ${options.footerHtml ?? "ELEOS Research Innovations (ERI) — food security, nutrition security, human security."}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GREY};">
            &copy; ${new Date().getFullYear()} ELEOS Research Innovations. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${INK};">${escapeHtml(text)}</p>`;
}

/** Red CTA button — table-based, clickable everywhere. */
function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;">
    <tr>
      <td style="background-color:${RED};border-radius:4px;">
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${GREY};word-break:break-all;">
    Or copy this link into your browser:<br>${escapeHtml(url)}
  </p>`;
}

/** Password-reset email — the link is single-use and short-lived. */
export function renderResetPasswordEmail(options: {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}): RenderedEmail {
  const { name, resetUrl, expiresInMinutes } = options;
  return {
    subject: "Reset your ERI admin password",
    html: layout({
      heading: "Reset your password",
      bodyHtml: [
        paragraph(`Hello ${name},`),
        paragraph(
          "We received a request to reset the password for your ELEOS Research Innovations admin account. The button below opens a page where you can choose a new password."
        ),
        button("Choose a new password", resetUrl),
        paragraph(
          `This link can be used once and expires in ${expiresInMinutes} minutes. If you didn't request a reset, you can safely ignore this email — your current password stays active.`
        ),
      ].join(""),
      footerHtml:
        "You received this email because a password reset was requested for an ERI admin account.",
    }),
    text: [
      `Hello ${name},`,
      "",
      "We received a request to reset the password for your ELEOS Research Innovations admin account.",
      "",
      `Open this link to choose a new password (single use, expires in ${expiresInMinutes} minutes):`,
      resetUrl,
      "",
      "If you didn't request a reset, you can safely ignore this email.",
    ].join("\n"),
  };
}

/** Welcome email — sent when an admin account is created for someone. */
export function renderWelcomeEmail(options: {
  name: string;
  setPasswordUrl: string | null;
  expiresInMinutes: number;
}): RenderedEmail {
  const { name, setPasswordUrl, expiresInMinutes } = options;
  const bodyParts = [
    paragraph(`Hello ${name},`),
    paragraph(
      "An admin account has been created for you on the ELEOS Research Innovations console. Use it to manage the content you've been entrusted with."
    ),
  ];
  if (setPasswordUrl) {
    bodyParts.push(
      paragraph("Follow the link below to choose your password and activate the account:"),
      button("Choose your password", setPasswordUrl),
      paragraph(
        `The link can be used once and expires in ${expiresInMinutes} minutes. Ask a super admin to send a new one if it lapses.`
      )
    );
  }
  return {
    subject: "Your ERI admin account",
    html: layout({
      heading: "Welcome to the ERI console",
      bodyHtml: bodyParts.join(""),
    }),
    text: [
      `Hello ${name},`,
      "",
      "An admin account has been created for you on the ELEOS Research Innovations console.",
      setPasswordUrl
        ? `\nChoose your password via this single-use link (expires in ${expiresInMinutes} minutes):\n${setPasswordUrl}`
        : "",
    ].join("\n"),
  };
}
