import "server-only";
import nodemailer from "nodemailer";
import { getServerEnvironment } from "@/config/env";

export async function sendContactEmail(input: {
  email: string;
  message: string;
  name: string;
  phone: string;
}): Promise<void> {
  const configuration = getSmtpConfiguration();
  if (!configuration) throw new Error("Contact email is not configured.");

  const transporter = nodemailer.createTransport({
    auth: { pass: configuration.password, user: configuration.user },
    host: configuration.host,
    port: configuration.port,
    secure: configuration.port === 465,
  });
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const phone = escapeHtml(input.phone);
  const message = escapeHtml(input.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: configuration.from,
    html: `<main style="max-width:640px;margin:24px auto;font-family:Arial,sans-serif;color:#0a2540"><header style="padding:28px 32px;background:#071827;color:#fff"><p style="margin:0;color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Marsa Edge Marine LLC</p><h1 style="margin:12px 0 0;font-size:26px">New website enquiry</h1></header><section style="padding:28px 32px;background:#fff;border:1px solid #e2e8f0"><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong></p><p style="line-height:1.6">${message}</p></section></main>`,
    replyTo: input.email,
    subject: `Website enquiry from ${input.name.replace(/[\r\n]+/g, " ")}`,
    text: `New website enquiry\n\nName: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\n\nMessage:\n${input.message}`,
    to: configuration.from,
  });
}

function getSmtpConfiguration(): {
  from: string;
  host: string;
  password: string;
  port: number;
  user: string;
} | null {
  const { SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } = getServerEnvironment();
  if (!SMTP_HOST && !SMTP_USER && !SMTP_PASSWORD && !SMTP_FROM) return null;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error("SMTP configuration is incomplete.");
  }
  return {
    from: SMTP_FROM,
    host: SMTP_HOST,
    password: SMTP_PASSWORD,
    port: SMTP_PORT,
    user: SMTP_USER,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}
