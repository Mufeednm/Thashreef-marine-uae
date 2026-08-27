"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { z } from "zod";
import { formatAedFromCents } from "@/shared/utils/currency";

interface StoredLine {
  id: string;
  name: string;
  priceAedCents: number;
  quantity: number;
}
interface DeliveryAddress {
  apartment: string;
  area: string;
  building: string;
  city: string;
  country: string;
  street: string;
  zip: string;
}
const savedCheckoutDetailsSchema = z.object({
  address: z.object({
    apartment: z.string().max(120),
    area: z.string().max(120),
    building: z.string().max(120),
    city: z.string().max(120),
    country: z.string().max(120),
    street: z.string().max(180),
    zip: z.string().max(40),
  }),
  emirate: z.enum([
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
  ]),
  phone: z.string().max(32),
  version: z.literal(1),
});
const steps = ["Customer", "Delivery", "Review", "Payment"] as const;

export function CheckoutExperience({
  customer,
}: {
  customer: { name: string; email: string; phone: string };
}): ReactElement {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [complete, setComplete] = useState(false);
  const [emailDelivery, setEmailDelivery] = useState<"failed" | "not-configured" | "sent" | null>(
    null,
  );
  const [payment, setPayment] = useState<"cod" | "stripe">("stripe");
  const [phone, setPhone] = useState(customer.phone);
  const [emirate, setEmirate] = useState("Dubai");
  const [address, setAddress] = useState<DeliveryAddress>({
    apartment: "",
    area: "",
    building: "",
    city: "",
    country: "United Arab Emirates",
    street: "",
    zip: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setLines(
          JSON.parse(window.sessionStorage.getItem("thashreef-cart") ?? "[]") as StoredLine[],
        );
      } catch {
        setLines([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const rawDetails = window.localStorage.getItem(checkoutDetailsStorageKey(customer.email));
        if (!rawDetails) return;
        const savedDetails = savedCheckoutDetailsSchema.safeParse(JSON.parse(rawDetails));
        if (!savedDetails.success) return;
        setAddress(savedDetails.data.address);
        setEmirate(savedDetails.data.emirate);
        setPhone(savedDetails.data.phone);
        setDetailsSaved(true);
      } catch {
        window.localStorage.removeItem(checkoutDetailsStorageKey(customer.email));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [customer.email]);
  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.priceAedCents * line.quantity, 0),
    [lines],
  );
  const shipping = subtotal === 0 ? 0 : subtotal >= 70000 ? 0 : 2000;
  const total = subtotal + shipping;
  if (complete)
    return (
      <Success customer={customer} emailDelivery={emailDelivery} orderId={orderId} total={total} />
    );

  function validationMessage(currentStep: number): string | null {
    if (currentStep === 0 && phone.trim().length < 7) {
      return "Enter a valid mobile number before continuing.";
    }
    if (currentStep === 1) {
      const missingAddressDetail = [
        address.country,
        address.city,
        address.area,
        address.building,
        address.street,
      ].some((value) => !value.trim());
      if (missingAddressDetail || !emirate.trim()) {
        return "Complete your country, emirate, city, area, building, and street before continuing.";
      }
    }
    if (currentStep === 2 && lines.length === 0) return "Your basket is empty.";
    return null;
  }

  function saveCheckoutDetails(): void {
    window.localStorage.setItem(
      checkoutDetailsStorageKey(customer.email),
      JSON.stringify({ address, emirate, phone, version: 1 }),
    );
    setDetailsSaved(true);
  }

  async function placeOrder(): Promise<void> {
    const invalidStep = [0, 1, 2].find((currentStep) => validationMessage(currentStep));
    if (invalidStep !== undefined) {
      setStep(invalidStep);
      setError(validationMessage(invalidStep));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const deliveryAddress = [
        address.building,
        address.street,
        address.apartment,
        address.area,
        address.city,
        emirate,
        address.zip,
        address.country,
      ]
        .filter(Boolean)
        .join(", ");
      const response = await fetch(
        payment === "stripe" ? "/api/payments/stripe/checkout" : "/api/orders",
        {
          body: JSON.stringify({
            deliveryAddress,
            emirate,
            lines: lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
            ...(payment === "cod" ? { paymentMethod: payment } : {}),
            phone,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        emailDelivery?: "failed" | "not-configured" | "sent";
        message?: string;
        orderId?: number;
      };
      if (!response.ok) {
        setError(body.message ?? "Your order could not be saved. Please try again.");
        return;
      }
      if (payment === "stripe") {
        if (!body.checkoutUrl) {
          setError("We could not open secure card payment. Please try again.");
          return;
        }
        window.location.assign(body.checkoutUrl);
        return;
      }
      setEmailDelivery(body.emailDelivery ?? "not-configured");
      setOrderId(body.orderId ?? null);
      window.sessionStorage.removeItem("thashreef-cart");
      setComplete(true);
    } catch {
      setError("We could not connect to the order service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">
          ← Continue shopping
        </Link>
        <header className="mt-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black tracking-[.24em] text-[#f97316] uppercase">
              Secure UAE checkout
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Complete your order</h1>
          </div>
          <p className="text-sm text-slate-600">All prices are shown in AED</p>
        </header>
        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Checkout progress">
          {steps.map((label, index) => (
            <li
              className={`rounded-xl px-2 py-3 text-center text-xs font-black sm:text-sm ${index === step ? "bg-[#071827] text-white" : index < step ? "bg-cyan-100 text-cyan-900" : "bg-white text-slate-400"}`}
              key={label}
            >
              {index + 1}. <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            {step === 0 ? (
              <CustomerForm
                customer={customer}
                detailsSaved={detailsSaved}
                phone={phone}
                setPhone={setPhone}
              />
            ) : null}
            {step === 1 ? (
              <AddressForm
                address={address}
                emirate={emirate}
                setAddress={setAddress}
                setEmirate={setEmirate}
              />
            ) : null}
            {step === 2 ? <Review lines={lines} /> : null}
            {step === 3 ? <Payment payment={payment} setPayment={setPayment} /> : null}
            {error ? (
              <p
                aria-live="polite"
                className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                {error}
              </p>
            ) : null}
            <div className="mt-8 flex justify-between gap-3 border-t border-slate-100 pt-6">
              <button
                className="min-h-11 rounded-full px-5 text-sm font-bold text-slate-600 disabled:opacity-40"
                disabled={step === 0 || submitting}
                onClick={() => setStep((value) => value - 1)}
                type="button"
              >
                Back
              </button>
              <button
                className="min-h-11 rounded-full bg-[#f97316] px-6 text-sm font-black text-white transition hover:bg-[#c2410c] disabled:bg-slate-300"
                disabled={lines.length === 0 || submitting}
                onClick={() => {
                  if (step === 3) void placeOrder();
                  else {
                    const message = validationMessage(step);
                    if (message) {
                      setError(message);
                      return;
                    }
                    setError(null);
                    saveCheckoutDetails();
                    setStep((value) => value + 1);
                  }
                }}
                type="button"
              >
                {step === 3
                  ? submitting
                    ? payment === "stripe"
                      ? "Opening secure payment..."
                      : "Placing order..."
                    : payment === "stripe"
                      ? "Pay securely"
                      : "Place order"
                  : "Continue"}
              </button>
            </div>
          </section>
          <OrderSummary lines={lines} shipping={shipping} subtotal={subtotal} total={total} />
        </div>
      </div>
    </main>
  );
}
function CustomerForm({
  customer,
  detailsSaved,
  phone,
  setPhone,
}: {
  customer: { name: string; email: string; phone: string };
  detailsSaved: boolean;
  phone: string;
  setPhone: (value: string) => void;
}): ReactElement {
  return (
    <fieldset>
      <legend className="text-2xl font-black">Customer details</legend>
      <p className="mt-2 text-sm text-slate-500">
        We’ll use these details for order updates and delivery coordination.
      </p>
      {detailsSaved ? (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          Your phone and delivery details are saved on this device for your next checkout.
        </p>
      ) : null}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field defaultValue={customer.name} label="Full name" name="name" />
        <Field defaultValue={customer.email} label="Email" name="email" type="email" />
        <label className="block text-sm font-bold text-slate-700">
          Mobile number
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+971 50 000 0000"
            type="tel"
            value={phone}
          />
        </label>
      </div>
    </fieldset>
  );
}
function checkoutDetailsStorageKey(email: string): string {
  return `marsa-checkout-details:${email.trim().toLowerCase()}`;
}
function AddressForm({
  address,
  emirate,
  setAddress,
  setEmirate,
}: {
  address: DeliveryAddress;
  emirate: string;
  setAddress: (value: DeliveryAddress) => void;
  setEmirate: (value: string) => void;
}): ReactElement {
  const update = (name: keyof DeliveryAddress, value: string) =>
    setAddress({ ...address, [name]: value });
  return (
    <fieldset>
      <legend className="text-2xl font-black">Shipping address</legend>
      <p className="mt-2 text-sm text-slate-500">
        Your delivery address is saved with the order so the marine delivery team can fulfil it
        accurately.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <AddressField label="Country" name="country" update={update} value={address.country} />
        <label className="block text-sm font-bold text-slate-700">
          Emirate
          <select
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-[#0e7490]"
            onChange={(event) => setEmirate(event.target.value)}
            value={emirate}
          >
            {[
              "Dubai",
              "Abu Dhabi",
              "Sharjah",
              "Ajman",
              "Ras Al Khaimah",
              "Fujairah",
              "Umm Al Quwain",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <AddressField label="City" name="city" update={update} value={address.city} />
        <AddressField label="Area" name="area" update={update} value={address.area} />
        <AddressField
          label="Building / villa"
          name="building"
          update={update}
          value={address.building}
        />
        <AddressField label="Street" name="street" update={update} value={address.street} />
        <AddressField
          label="Apartment (optional)"
          name="apartment"
          required={false}
          update={update}
          value={address.apartment}
        />
        <AddressField
          label="ZIP (optional)"
          name="zip"
          required={false}
          update={update}
          value={address.zip}
        />
      </div>
    </fieldset>
  );
}
function AddressField({
  label,
  name,
  required = true,
  update,
  value,
}: {
  label: string;
  name: keyof DeliveryAddress;
  required?: boolean;
  update: (name: keyof DeliveryAddress, value: string) => void;
  value: string;
}): ReactElement {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
        onChange={(event) => update(name, event.target.value)}
        required={required}
        value={value}
      />
    </label>
  );
}
function Review({ lines }: { lines: StoredLine[] }): ReactElement {
  return (
    <fieldset>
      <legend className="text-2xl font-black">Review your order</legend>
      {lines.length ? (
        <div className="mt-6 space-y-3">
          {lines.map((line) => (
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4" key={line.id}>
              <div>
                <p className="font-bold">{line.name}</p>
                <p className="mt-1 text-xs text-slate-500">Qty {line.quantity}</p>
              </div>
              <strong>{formatAedFromCents(line.priceAedCents * line.quantity)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Your cart is empty. Return to the catalog to add products.
        </p>
      )}
    </fieldset>
  );
}
function Payment({
  payment,
  setPayment,
}: {
  payment: "cod" | "stripe";
  setPayment: (value: "cod" | "stripe") => void;
}): ReactElement {
  return (
    <fieldset>
      <legend className="text-2xl font-black">Payment method</legend>
      <p className="mt-2 text-sm text-slate-500">
        Pay securely by card through Stripe, or choose Cash on Delivery for UAE orders.
      </p>
      <label className="mt-6 flex gap-3 rounded-2xl border border-[#0e7490] bg-cyan-50 p-4">
        <input
          checked={payment === "stripe"}
          name="payment"
          onChange={() => setPayment("stripe")}
          type="radio"
          value="stripe"
        />
        <span>
          <b>Card payment</b>
          <small className="mt-1 block text-slate-500">
            Secure Stripe checkout. Test mode is active; no real payment is taken.
          </small>
        </span>
      </label>
      <label className="mt-3 flex gap-3 rounded-2xl border border-slate-200 p-4">
        <input
          checked={payment === "cod"}
          name="payment"
          onChange={() => setPayment("cod")}
          type="radio"
          value="cod"
        />
        <span>
          <b>Cash on Delivery</b>
          <small className="mt-1 block text-slate-500">Pay when your UAE order arrives.</small>
        </span>
      </label>
    </fieldset>
  );
}
function OrderSummary({
  lines,
  shipping,
  subtotal,
  total,
}: {
  lines: StoredLine[];
  shipping: number;
  subtotal: number;
  total: number;
}): ReactElement {
  return (
    <aside className="h-fit rounded-[2rem] bg-[#071827] p-6 text-white">
      <h2 className="text-xl font-black">Order summary</h2>
      <p className="mt-1 text-sm text-slate-300">
        {lines.reduce((sum, line) => sum + line.quantity, 0)} item(s) in your basket
      </p>
      <dl className="mt-6 space-y-3 border-y border-white/15 py-5 text-sm">
        <Row label="Subtotal" value={formatAedFromCents(subtotal)} />
        <Row
          label="UAE delivery"
          value={shipping === 0 && subtotal > 0 ? "Free" : formatAedFromCents(shipping)}
        />
      </dl>
      <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs leading-5 text-slate-200">
        Free UAE delivery on orders of AED 700 or more. AED 20 delivery applies below AED 700.
      </p>
      <div className="mt-5 flex justify-between text-lg font-black">
        <span>Total</span>
        <span>{formatAedFromCents(total)}</span>
      </div>
    </aside>
  );
}
function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex justify-between gap-3 text-slate-200">
      <dt>{label}</dt>
      <dd className="font-bold text-white">{value}</dd>
    </div>
  );
}
function Field({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  type?: string;
}): ReactElement {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
        defaultValue={defaultValue}
        name={name}
        required={!label.includes("optional")}
        type={type}
      />
    </label>
  );
}
function Success({
  customer,
  emailDelivery,
  orderId,
  total,
}: {
  customer: { email: string; name: string };
  emailDelivery: "failed" | "not-configured" | "sent" | null;
  orderId: number | null;
  total: number;
}): ReactElement {
  const emailMessage =
    emailDelivery === "sent" ? (
      <>
        A confirmation email has been sent to{" "}
        <strong className="font-semibold text-[#0a2540]">{customer.email}</strong>.
      </>
    ) : (
      <>
        Our marine team will contact{" "}
        <strong className="font-semibold text-[#0a2540]">{customer.email}</strong> with
        availability, payment, and dispatch details.
      </>
    );
  return (
    <main className="grid min-h-dvh place-items-center bg-[#eef5fa] p-5">
      <section
        aria-labelledby="order-confirmation-title"
        className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/10 sm:p-10"
      >
        <div
          aria-hidden="true"
          className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800"
        >
          <svg
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-black tracking-[.2em] text-[#f97316] uppercase">
          Order request received
        </p>
        <h1
          className="mt-3 text-3xl font-black tracking-tight text-[#0a2540] sm:text-4xl"
          id="order-confirmation-title"
        >
          Thank you, {customer.name}.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
          Your order request for{" "}
          <strong className="font-extrabold text-[#0a2540]">{formatAedFromCents(total)}</strong> has
          been recorded. Our marine team will check availability and contact you with payment and
          dispatch details.
        </p>
        <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-left">
          <p className="text-sm font-extrabold text-[#0a2540]">Confirmation by email</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{emailMessage}</p>
        </div>
        <Link
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071827] px-6 text-sm font-black text-white transition hover:bg-[#0e7490] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
          href="/account"
        >
          View my orders{orderId ? ` · #${orderId}` : ""}
        </Link>
      </section>
    </main>
  );
}
