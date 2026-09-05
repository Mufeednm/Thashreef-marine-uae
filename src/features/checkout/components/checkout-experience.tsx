"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { z } from "zod";
import { formatAedFromCents } from "@/shared/utils/currency";
import { digitsOnly, isValidNationalPhone } from "@/shared/utils/phone";

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
interface CheckoutPhoneDetails {
  countryCode: string;
  phone: string;
}

type CheckoutPaymentMethod = "cod" | "ngenius";

const countryDialingCodes = [
  { code: "+971", country: "United Arab Emirates" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+974", country: "Qatar" },
  { code: "+965", country: "Kuwait" },
  { code: "+973", country: "Bahrain" },
  { code: "+968", country: "Oman" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+63", country: "Philippines" },
  { code: "+44", country: "United Kingdom" },
  { code: "+1", country: "United States & Canada" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+27", country: "South Africa" },
] as const;
const deliveryCountries = countryDialingCodes
  .map((option) => option.country)
  .filter((country, index, countries) => countries.indexOf(country) === index);
const uaeEmirates = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
] as const;
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
  emirate: z.string().trim().min(2).max(120),
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  phone: z.string().max(32),
  version: z.literal(3),
});
const steps = ["Customer", "Delivery", "Review", "Payment"] as const;

export function CheckoutExperience({
  customer,
  paymentNotice,
}: {
  customer: { name: string; email: string; phone: string };
  paymentNotice?: "cancelled" | "verification";
}): ReactElement {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [complete, setComplete] = useState(false);
  const [emailDelivery, setEmailDelivery] = useState<"failed" | "not-configured" | "sent" | null>(
    null,
  );
  const initialPhone = parseCheckoutPhone(customer.phone);
  const [countryCode, setCountryCode] = useState(initialPhone.countryCode);
  const [phone, setPhone] = useState(initialPhone.phone);
  const [phoneTouched, setPhoneTouched] = useState(false);
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
  const [error, setError] = useState<string | null>(
    paymentNotice === "cancelled"
      ? "Card payment was not completed. Your basket is still here—review the details and try again when ready."
      : paymentNotice === "verification"
        ? "We could not verify the card payment yet. Please do not pay again until you check your order status or try again."
        : null,
  );
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cod");
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
        setCountryCode(savedDetails.data.countryCode);
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
    if (currentStep === 0 && !isValidNationalPhone(countryCode, phone)) {
      return "Enter 7 to 15 digits in your mobile number, including the country code.";
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
        return `Complete your country, ${regionLabel(address.country).toLowerCase()}, city, area, building, and street before continuing.`;
      }
    }
    if (currentStep === 2 && lines.length === 0) return "Your basket is empty.";
    return null;
  }

  function saveCheckoutDetails(): void {
    window.localStorage.setItem(
      checkoutDetailsStorageKey(customer.email),
      JSON.stringify({ address, countryCode, emirate, phone, version: 3 }),
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
      const checkoutEndpoint =
        paymentMethod === "ngenius" ? "/api/payments/ngenius/checkout" : "/api/orders";
      const response = await fetch(checkoutEndpoint, {
          body: JSON.stringify({
            deliveryAddress,
            emirate,
            lines: lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
            ...(paymentMethod === "cod" ? { paymentMethod } : {}),
            phone: formatCheckoutPhone(countryCode, phone),
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
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
      if (paymentMethod === "ngenius") {
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
                countryCode={countryCode}
                detailsSaved={detailsSaved}
                phone={phone}
                phoneTouched={phoneTouched}
                setCountryCode={setCountryCode}
                setPhone={setPhone}
                setPhoneTouched={setPhoneTouched}
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
            {step === 3 ? (
              <Payment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
            ) : null}
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
                    ? paymentMethod === "ngenius"
                      ? "Opening secure payment..."
                      : "Placing order..."
                    : paymentMethod === "ngenius"
                      ? "Pay securely by card"
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
  countryCode,
  detailsSaved,
  phone,
  phoneTouched,
  setCountryCode,
  setPhone,
  setPhoneTouched,
}: {
  customer: { name: string; email: string; phone: string };
  countryCode: string;
  detailsSaved: boolean;
  phone: string;
  phoneTouched: boolean;
  setCountryCode: (value: string) => void;
  setPhone: (value: string) => void;
  setPhoneTouched: (value: boolean) => void;
}): ReactElement {
  const isPhoneValid = isValidNationalPhone(countryCode, phone);
  const maxPhoneDigits = 15 - digitsOnly(countryCode).length;
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
        <Field
          defaultValue={customer.name}
          label="Full name"
          name="name"
          placeholder="Your full name"
        />
        <Field
          defaultValue={customer.email}
          label="Email"
          name="email"
          placeholder="name@example.com"
          type="email"
        />
        <div className="sm:col-span-2">
          <span className="block text-sm font-bold text-slate-700">Mobile number</span>
          <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(210px,0.8fr)_minmax(0,1.2fr)]">
            <label className="sr-only" htmlFor="checkout-country-code">
              Country calling code
            </label>
            <select
              aria-label="Country calling code"
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
              id="checkout-country-code"
              onChange={(event) => setCountryCode(event.target.value)}
              value={countryCode}
            >
              {countryDialingCodes.map((option) => (
                <option key={`${option.code}-${option.country}`} value={option.code}>
                  {option.country} ({option.code})
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="checkout-mobile-number">
              Mobile number without country code
            </label>
            <input
              autoComplete="tel-national"
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
              id="checkout-mobile-number"
              inputMode="tel"
              maxLength={maxPhoneDigits}
              onBlur={() => setPhoneTouched(true)}
              onChange={(event) =>
                setPhone(digitsOnly(event.target.value).slice(0, maxPhoneDigits))
              }
              placeholder="500000000"
              type="tel"
              value={phone}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Select your country code, then enter 7–{maxPhoneDigits} digits without the leading +
            code.
          </p>
          {phoneTouched && !isPhoneValid ? (
            <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
              Enter a valid mobile number with 7 to {maxPhoneDigits} digits.
            </p>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}
function checkoutDetailsStorageKey(email: string): string {
  return `marsa-checkout-details:${email.trim().toLowerCase()}`;
}

function formatCheckoutPhone(countryCode: string, phone: string): string {
  return `${countryCode} ${phone.trim()}`.trim();
}

function parseCheckoutPhone(phone: string): CheckoutPhoneDetails {
  const trimmedPhone = phone.trim();
  const matchingCode = countryDialingCodes.find((option) => trimmedPhone.startsWith(option.code));
  if (!matchingCode) return { countryCode: "+971", phone: trimmedPhone };
  return {
    countryCode: matchingCode.code,
    phone: trimmedPhone.slice(matchingCode.code.length).trim(),
  };
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
  const isUae = isUnitedArabEmirates(address.country);

  function updateCountry(country: string): void {
    setAddress({ ...address, country });
    if (isUnitedArabEmirates(country)) {
      setEmirate(uaeEmirates.includes(emirate as (typeof uaeEmirates)[number]) ? emirate : "Dubai");
    } else {
      setEmirate("");
    }
  }

  return (
    <fieldset>
      <legend className="text-2xl font-black">Shipping address</legend>
      <p className="mt-2 text-sm text-slate-500">
        Your delivery address is saved with the order so the marine delivery team can fulfil it
        accurately.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <CountryField onCountryChange={updateCountry} value={address.country} />
        <RegionField isUae={isUae} region={emirate} setRegion={setEmirate} />
        <AddressField label="City" name="city" update={update} value={address.city} />
        <AddressField label="Area / locality" name="area" update={update} value={address.area} />
        <AddressField
          label="Building / house number"
          name="building"
          update={update}
          value={address.building}
        />
        <AddressField
          label="Street / address line 1"
          name="street"
          update={update}
          value={address.street}
        />
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

function CountryField({
  onCountryChange,
  value,
}: {
  onCountryChange: (value: string) => void;
  value: string;
}): ReactElement {
  return (
    <label className="block text-sm font-bold text-slate-700">
      Country
      <input
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
        list="checkout-delivery-countries"
        onChange={(event) => onCountryChange(event.target.value)}
        placeholder="Type or select a country"
        required
        value={value}
      />
      <datalist id="checkout-delivery-countries">
        {deliveryCountries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
    </label>
  );
}

function RegionField({
  isUae,
  region,
  setRegion,
}: {
  isUae: boolean;
  region: string;
  setRegion: (value: string) => void;
}): ReactElement {
  const label = isUae ? "Emirate" : "State / province";
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      {isUae ? (
        <select
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-[#0e7490]"
          onChange={(event) => setRegion(event.target.value)}
          value={region || "Dubai"}
        >
          {uaeEmirates.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
          onChange={(event) => setRegion(event.target.value)}
          placeholder="e.g. Maharashtra"
          required
          value={region}
        />
      )}
    </label>
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
        placeholder={addressPlaceholder(name)}
        required={required}
        value={value}
      />
    </label>
  );
}

function addressPlaceholder(name: keyof DeliveryAddress): string {
  const placeholders: Record<keyof DeliveryAddress, string> = {
    apartment: "Apartment or unit number",
    area: "e.g. Al Jaddaf",
    building: "Building or villa name/number",
    city: "e.g. Dubai",
    country: "e.g. United Arab Emirates",
    street: "Street name and number",
    zip: "Postal or ZIP code",
  };
  return placeholders[name];
}

function isUnitedArabEmirates(country: string): boolean {
  return ["uae", "united arab emirates"].includes(country.trim().toLowerCase());
}

function regionLabel(country: string): "Emirate" | "State / province" {
  return isUnitedArabEmirates(country) ? "Emirate" : "State / province";
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
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: CheckoutPaymentMethod;
  setPaymentMethod: (value: CheckoutPaymentMethod) => void;
}): ReactElement {
  return (
    <fieldset>
      <legend className="text-2xl font-black">Payment method</legend>
      <p className="mt-2 text-sm text-slate-500">
        Choose Cash on Delivery for UAE orders or pay securely by card through N-Genius.
      </p>
      <div className="mt-6 grid gap-3">
        <label
          className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${paymentMethod === "cod" ? "border-[#0e7490] bg-cyan-50" : "border-slate-200 bg-white hover:border-cyan-300"}`}
        >
          <input
            checked={paymentMethod === "cod"}
            name="payment-method"
            onChange={() => setPaymentMethod("cod")}
            type="radio"
            value="cod"
          />
          <span>
            <b>Cash on Delivery</b>
            <small className="mt-1 block text-slate-500">Pay when your UAE order arrives.</small>
          </span>
        </label>
        <label
          className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${paymentMethod === "ngenius" ? "border-[#0e7490] bg-cyan-50" : "border-slate-200 bg-white hover:border-cyan-300"}`}
        >
          <input
            checked={paymentMethod === "ngenius"}
            name="payment-method"
            onChange={() => setPaymentMethod("ngenius")}
            type="radio"
            value="ngenius"
          />
          <span>
            <b>Card payment</b>
            <small className="mt-1 block text-slate-500">
              Continue to the secure N-Genius hosted payment page.
            </small>
          </span>
        </label>
      </div>
      {paymentMethod === "ngenius" ? (
        <p
          className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-950"
          role="status"
        >
          Your card details are entered securely on N-Genius and are not stored by Marsa Edge Marine.
        </p>
      ) : (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          Cash on Delivery is available for UAE orders.
        </p>
      )}
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
  placeholder,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}): ReactElement {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
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
