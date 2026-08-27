import "server-only";
import nodemailer from "nodemailer";
import { getServerEnvironment } from "@/config/env";

export async function sendEmailOtp(input: {
  email: string;
  name?: string;
  code: string;
}): Promise<void> {
  const configuration = getSmtpConfiguration();
  if (!configuration) {
    throw new Error("Email OTP is not configured.");
  }

  const greeting = input.name?.trim() ? `Hello ${escapeHtml(input.name.trim())},` : "Hello,";
  const transporter = nodemailer.createTransport({
    auth: { pass: configuration.password, user: configuration.user },
    host: configuration.host,
    port: configuration.port,
    secure: configuration.port === 465,
  });

  await transporter.sendMail({
    from: configuration.from,
    html: `<p>${greeting}</p><p>Your Marsa Edge Marine verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${input.code}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p>`,
    subject: `${input.code} is your Marsa Edge Marine verification code`,
    text: `${input.name?.trim() ? `Hello ${input.name.trim()},\n\n` : ""}Your Marsa Edge Marine verification code is ${input.code}. It expires in 10 minutes. Do not share it with anyone.`,
    to: input.email,
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
    throw new Error(
      "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM together.",
    );
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
  return value.replace(/[&<>\"']/g, (character) => {
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
