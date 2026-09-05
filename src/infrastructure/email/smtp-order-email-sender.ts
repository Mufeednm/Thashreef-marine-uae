import "server-only";
import nodemailer from "nodemailer";
import type { AdminOrderDetail } from "@/domain/demo-store/demo-store-repository";
import { getServerEnvironment } from "@/config/env";
import { formatAedFromCents } from "@/shared/utils/currency";

export type OrderEmailDelivery = "sent" | "not-configured";
export type OrderStatus = "accepted" | "rejected";

export async function sendOrderConfirmationEmail(
  order: AdminOrderDetail,
): Promise<OrderEmailDelivery> {
  const environment = getServerEnvironment();
  const smtpConfiguration = getSmtpConfiguration(environment);

  if (!smtpConfiguration) return "not-configured";

  const transporter = nodemailer.createTransport({
    auth: { pass: smtpConfiguration.password, user: smtpConfiguration.user },
    host: smtpConfiguration.host,
    port: smtpConfiguration.port,
    secure: smtpConfiguration.port === 465,
  });

  await transporter.sendMail({
    from: smtpConfiguration.from,
    html: buildOrderEmailHtml(order),
    subject: `We received your Marsa Edge Marine order request #${order.id}`,
    text: buildOrderEmailText(order),
    to: order.customerEmail,
  });

  return "sent";
}

export async function sendOrderStatusEmail(
  order: AdminOrderDetail,
  status: OrderStatus,
): Promise<OrderEmailDelivery> {
  const environment = getServerEnvironment();
  const smtpConfiguration = getSmtpConfiguration(environment);

  if (!smtpConfiguration) return "not-configured";

  const isAccepted = status === "accepted";
  const heading = isAccepted ? "Order accepted" : "Order update";
  const message = isAccepted
    ? "Your order has been accepted. Our marine team will now prepare the next delivery or collection update."
    : "We are sorry, but we cannot accept this order at the moment. Please contact us if you would like help finding an alternative.";
  const actionLine = isAccepted
    ? "We will email or contact you with the next delivery update."
    : "Our team can help with alternatives, availability, or a new order request.";
  const transporter = nodemailer.createTransport({
    auth: { pass: smtpConfiguration.password, user: smtpConfiguration.user },
    host: smtpConfiguration.host,
    port: smtpConfiguration.port,
    secure: smtpConfiguration.port === 465,
  });

  await transporter.sendMail({
    from: smtpConfiguration.from,
    html: `<!doctype html><html><body style="margin:0;background:#f4f8fa;font-family:Arial,sans-serif;color:#0a2540"><main style="max-width:620px;margin:24px auto;background:#ffffff;border-radius:20px;overflow:hidden"><header style="padding:28px 32px;background:#071827;color:#ffffff"><p style="margin:0;color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Marsa Edge Marine LLC</p><h1 style="margin:12px 0 0;font-size:28px">${heading}</h1></header><section style="padding:30px 32px"><p>Hello ${escapeHtml(order.customerName)},</p><p>${escapeHtml(message)}</p><p>Order <strong>#${order.id}</strong> · <strong>${escapeHtml(formatAedFromCents(order.totalAedCents))}</strong></p><p>${escapeHtml(actionLine)}</p></section><footer style="padding:20px 32px;background:#f8fafc;color:#475569;font-size:14px">Marsa Edge Marine LLC<br />Dubai · Al Jaddaf · Drydocks</footer></main></body></html>`,
    subject: `${isAccepted ? "Order accepted" : "Order update"} — Marsa Edge Marine order #${order.id}`,
    text: [
      `Hello ${order.customerName},`,
      "",
      message,
      `Order #${order.id}: ${formatAedFromCents(order.totalAedCents)}`,
      actionLine,
      "",
      "Marsa Edge Marine LLC",
    ].join("\n"),
    to: order.customerEmail,
  });

  return "sent";
}

function getSmtpConfiguration(environment: ReturnType<typeof getServerEnvironment>): {
  from: string;
  host: string;
  password: string;
  port: number;
  user: string;
} | null {
  const { SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } = environment;
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

function buildOrderEmailText(order: AdminOrderDetail): string {
  const itemLines = order.items
    .map(
      (item) => `- ${item.name} × ${item.quantity}: ${formatAedFromCents(item.lineTotalAedCents)}`,
    )
    .join("\n");
  return [
    `Hello ${order.customerName},`,
    "",
    `We received your order request #${order.id} for ${formatAedFromCents(order.totalAedCents)}.`,
    "Your order request is received. Further updates will be sent soon after our marine team checks availability and delivery details.",
    "",
    "Order summary:",
    itemLines,
    "",
    `Delivery address: ${order.deliveryAddress ?? "To be confirmed"}`,
    `Order date: ${formatOrderDate(order.orderDate)}`,
    "",
    "Marsa Edge Marine LLC",
    "Dubai, Al Jaddaf, Drydocks",
  ].join("\n");
}

function buildOrderEmailHtml(order: AdminOrderDetail): string {
  const items = order.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${escapeHtml(item.name)} <span style="color:#64748b">× ${item.quantity}</span></td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700">${escapeHtml(formatAedFromCents(item.lineTotalAedCents))}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f8fa;font-family:Arial,sans-serif;color:#0a2540"><main style="max-width:620px;margin:24px auto;background:#ffffff;border-radius:20px;overflow:hidden"><header style="padding:28px 32px;background:#071827;color:#ffffff"><p style="margin:0;color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Marsa Edge Marine LLC</p><h1 style="margin:12px 0 0;font-size:28px">Order request received</h1></header><section style="padding:30px 32px"><p>Hello ${escapeHtml(order.customerName)},</p><p>Thank you for your order request. We have recorded order <strong>#${order.id}</strong> for <strong>${escapeHtml(formatAedFromCents(order.totalAedCents))}</strong>.</p><p>Your order request is received. Our marine team will check availability and delivery details, and further updates will be sent soon by email or WhatsApp.</p><h2 style="font-size:17px;margin:28px 0 8px">Order summary</h2><table style="width:100%;border-collapse:collapse">${items}</table><p style="margin:24px 0 4px"><strong>Delivery address</strong></p><p style="margin:0;color:#475569">${escapeHtml(order.deliveryAddress ?? "To be confirmed")}</p><p style="margin:20px 0 0;color:#64748b;font-size:14px">Order date: ${escapeHtml(formatOrderDate(order.orderDate))}</p></section><footer style="padding:20px 32px;background:#f8fafc;color:#475569;font-size:14px">Marsa Edge Marine LLC<br />Dubai · Al Jaddaf · Drydocks</footer></main></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ??
      character,
  );
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(date);
}
