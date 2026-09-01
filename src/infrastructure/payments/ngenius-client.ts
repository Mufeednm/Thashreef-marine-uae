import "server-only";

import { z } from "zod";
import { getServerEnvironment } from "@/config/env";

const paymentStateSchema = z.object({
  amount: z.object({ currencyCode: z.string(), value: z.number().int().nonnegative() }),
  state: z.string(),
});

const orderSchema = z.object({
  _embedded: z.object({ payment: z.array(paymentStateSchema).min(1) }).optional(),
  _links: z.object({ payment: z.object({ href: z.string().url() }) }).optional(),
  action: z.string(),
  amount: z.object({ currencyCode: z.string(), value: z.number().int().nonnegative() }),
  outletId: z.string(),
  reference: z.string().min(1),
});

export type NgeniusOrder = z.infer<typeof orderSchema>;

interface NgeniusConfiguration {
  apiKey: string;
  baseUrl: string;
  outletReference: string;
  realm: "networkinternational" | "ni";
}

export function getNgeniusConfiguration(): NgeniusConfiguration {
  const environment = getServerEnvironment();
  if (!environment.NGENIUS_API_KEY || !environment.NGENIUS_OUTLET_REFERENCE) {
    throw new Error("N-Genius is not configured.");
  }
  const isProduction = environment.NGENIUS_ENVIRONMENT === "production";
  return {
    apiKey: environment.NGENIUS_API_KEY,
    baseUrl: isProduction
      ? "https://api-gateway.ngenius-payments.com"
      : "https://api-gateway.sandbox.ngenius-payments.com",
    outletReference: environment.NGENIUS_OUTLET_REFERENCE,
    realm: isProduction ? "networkinternational" : "ni",
  };
}

export async function createNgeniusHostedOrder(input: {
  cancelUrl: string;
  emailAddress: string;
  redirectUrl: string;
  totalAedCents: number;
}): Promise<{ paymentUrl: string; reference: string }> {
  const configuration = getNgeniusConfiguration();
  const token = await getAccessToken(configuration);
  const response = await fetch(
    `${configuration.baseUrl}/transactions/outlets/${encodeURIComponent(configuration.outletReference)}/orders`,
    {
      body: JSON.stringify({
        action: "PURCHASE",
        amount: { currencyCode: "AED", value: input.totalAedCents },
        emailAddress: input.emailAddress,
        merchantAttributes: { cancelUrl: input.cancelUrl, redirectUrl: input.redirectUrl },
      }),
      cache: "no-store",
      headers: {
        Accept: "application/vnd.ni-payment.v2+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
      },
      method: "POST",
    },
  );
  const order = orderSchema.safeParse(await response.json().catch(() => null));
  if (!response.ok || !order.success || !order.data._links?.payment.href) {
    throw new Error("N-Genius did not create a hosted payment order.");
  }
  if (order.data.outletId !== configuration.outletReference) {
    throw new Error("N-Genius returned an unexpected outlet.");
  }
  return { paymentUrl: order.data._links.payment.href, reference: order.data.reference };
}

export async function retrieveNgeniusOrder(reference: string): Promise<NgeniusOrder> {
  const configuration = getNgeniusConfiguration();
  const token = await getAccessToken(configuration);
  const response = await fetch(
    `${configuration.baseUrl}/transactions/outlets/${encodeURIComponent(configuration.outletReference)}/orders/${encodeURIComponent(reference)}`,
    {
      cache: "no-store",
      headers: { Accept: "application/vnd.ni-payment.v2+json", Authorization: `Bearer ${token}` },
    },
  );
  const order = orderSchema.safeParse(await response.json().catch(() => null));
  if (!response.ok || !order.success) throw new Error("N-Genius payment status could not be verified.");
  if (order.data.reference !== reference || order.data.outletId !== configuration.outletReference) {
    throw new Error("N-Genius returned an unexpected payment order.");
  }
  return order.data;
}

async function getAccessToken(configuration: NgeniusConfiguration): Promise<string> {
  const response = await fetch(`${configuration.baseUrl}/identity/auth/access-token`, {
    body: JSON.stringify({ grant_type: "client_credentials", realm: configuration.realm }),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${configuration.apiKey}`,
      "Content-Type": "application/vnd.ni-identity.v1+json",
    },
    method: "POST",
  });
  const payload = z.object({ access_token: z.string().min(1) }).safeParse(await response.json().catch(() => null));
  if (!response.ok || !payload.success) throw new Error("N-Genius authentication failed.");
  return payload.data.access_token;
}
