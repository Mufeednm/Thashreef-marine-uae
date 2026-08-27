"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import { submitContactAction } from "@/features/contact/contact.actions";
import {
  initialContactActionState,
  type ContactActionState,
} from "@/features/contact/contact.types";

export function ContactForm(): ReactElement {
  const [state, action, pending] = useActionState<ContactActionState, FormData>(
    submitContactAction,
    initialContactActionState,
  );

  return (
    <form
      action={action}
      className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-950/10 sm:p-9"
      noValidate
    >
      <p className="text-xs font-black tracking-[0.2em] text-[#f97316] uppercase">
        Send an enquiry
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-[#0a2540] sm:text-3xl">
        Tell us what you need.
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Send your part number, product name, quantity, or order number. We will reply by email or
        WhatsApp.
      </p>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="website"
        tabIndex={-1}
        type="text"
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <ContactField
          error={state.fieldErrors?.name?.[0]}
          label="Full name"
          name="name"
          type="text"
        />
        <ContactField
          error={state.fieldErrors?.email?.[0]}
          label="Email address"
          name="email"
          type="email"
        />
        <ContactField
          error={state.fieldErrors?.phone?.[0]}
          label="Phone / WhatsApp"
          name="phone"
          type="tel"
        />
      </div>
      <label className="mt-4 block space-y-2">
        <span className="text-sm font-bold text-slate-700">How can we help?</span>
        <textarea
          aria-invalid={Boolean(state.fieldErrors?.message?.[0])}
          className={fieldClass(Boolean(state.fieldErrors?.message?.[0]))}
          name="message"
          placeholder="Example: I need a quote for 10 life jackets..."
          required
          rows={5}
        />
        {state.fieldErrors?.message?.[0] ? (
          <p className="text-sm font-semibold text-rose-700">{state.fieldErrors.message[0]}</p>
        ) : null}
      </label>
      {state.message ? (
        <p
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-5 min-h-12 w-full rounded-full bg-[#f97316] px-5 text-sm font-black text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending message..." : "Send message"}
      </button>
    </form>
  );
}

function ContactField({
  error,
  label,
  name,
  type,
}: {
  error?: string;
  label: string;
  name: string;
  type: "email" | "tel" | "text";
}): ReactElement {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        aria-invalid={Boolean(error)}
        className={fieldClass(Boolean(error))}
        name={name}
        required
        type={type}
      />
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </label>
  );
}

function fieldClass(hasError: boolean): string {
  return `min-h-12 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:bg-white ${
    hasError ? "border-rose-500 ring-2 ring-rose-100" : "border-slate-200 focus:border-[#0e7490]"
  }`;
}
