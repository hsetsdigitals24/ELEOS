import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../config/env.ts";

/**
 * MailService — the single outgoing-mail gateway. In production it talks to
 * the configured SMTP server; in development without SMTP settings it logs
 * the full email (including any reset links) to the console so flows can be
 * tested end-to-end without a mailbox.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.smtp.host) {
    return null; // dev without SMTP — log instead of send
  }
  if (transporter === null) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth:
        config.smtp.user !== undefined
          ? { user: config.smtp.user, pass: config.smtp.pass ?? "" }
          : undefined,
    });
  }
  return transporter;
}

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Sends (or, in dev, logs) an email. Never throws — mail failures are
 *  logged so a broken SMTP server can't take down an API request. */
export async function sendMail(mail: OutgoingMail): Promise<boolean> {
  const transport = getTransporter();

  if (transport === null) {
    const divider = "─".repeat(64);
    console.log(
      [
        "",
        divider,
        `[mail] SMTP not configured — email logged instead of sent (development)`,
        `  To:      ${mail.to}`,
        `  Subject: ${mail.subject}`,
        divider,
        mail.text,
        divider,
        "",
      ].join("\n")
    );
    return true;
  }

  try {
    await transport.sendMail({
      from: config.mailFrom,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return true;
  } catch (err) {
    console.error(`[mail] Failed to send "${mail.subject}" to ${mail.to}:`, err);
    return false;
  }
}
