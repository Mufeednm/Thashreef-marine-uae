"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/features/auth/auth.actions";
import { initialLoginActionState, type LoginActionState } from "@/features/auth/auth.types";

const countryCodes = [
  { label: "UAE", value: "+971" },
  { label: "Saudi Arabia", value: "+966" },
  { label: "Oman", value: "+968" },
  { label: "Qatar", value: "+974" },
  { label: "Kuwait", value: "+965" },
  { label: "Bahrain", value: "+973" },
  { label: "India", value: "+91" },
  { label: "Pakistan", value: "+92" },
] as const;

interface RegistrationValues {
  countryCode: string;
  email: string;
  name: string;
  password: string;
  phone: string;
}

const emptyRegistrationValues: RegistrationValues = {
  countryCode: "+971",
  email: "",
  name: "",
  password: "",
  phone: "",
};

export function LoginForm({
  redirectTo,
  variant = "storefront",
}: { redirectTo?: string; variant?: "admin" | "storefront" } = {}): ReactElement {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, action, pending] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialLoginActionState,
  );
  const [registrationState, registrationAction, registrationPending] = useActionState<
    LoginActionState,
    FormData
  >(registerAction, initialLoginActionState);
  const [registrationValues, setRegistrationValues] =
    useState<RegistrationValues>(emptyRegistrationValues);
  const isRegistering = mode === "register";
  const activeState = isRegistering ? registrationState : state;

  function updateRegistrationValue(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = event.currentTarget;
    setRegistrationValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      action={isRegistering ? registrationAction : action}
      className="space-y-4 rounded-[28px] bg-white/92 p-6 shadow-lg shadow-slate-900/10"
      noValidate
    >
      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
          {variant === "admin"
            ? "Admin sign in"
            : isRegistering
              ? "Create your account"
              : "Secure customer login"}
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          {variant === "admin"
            ? "Sign in to your workspace"
            : isRegistering
              ? "Create an account for checkout"
              : "Sign in to continue"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          {variant === "admin"
            ? "Use your admin credentials to access the workspace."
            : isRegistering
              ? "Your details are saved securely for order updates and future checkout."
              : "Sign in to place an order, or create a customer account."}
        </p>
      </div>

      {isRegistering ? (
        <>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              aria-describedby={
                activeState.fieldErrors?.name?.[0] ? "registration-name-error" : undefined
              }
              aria-invalid={Boolean(activeState.fieldErrors?.name?.[0])}
              autoComplete="name"
              className={inputClass(Boolean(activeState.fieldErrors?.name?.[0]))}
              name="name"
              onChange={updateRegistrationValue}
              required
              type="text"
              value={registrationValues.name}
            />
            {activeState.fieldErrors?.name?.[0] ? (
              <p
                className="text-sm font-medium text-rose-700"
                id="registration-name-error"
                role="alert"
              >
                {activeState.fieldErrors.name[0]}
              </p>
            ) : null}
          </label>
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Mobile number</span>
            <div className="grid grid-cols-[minmax(9rem,0.9fr)_minmax(0,1.1fr)] gap-2">
              <label className="sr-only" htmlFor="registration-country-code">
                Country code
              </label>
              <select
                aria-describedby={
                  activeState.fieldErrors?.countryCode?.[0]
                    ? "registration-country-error"
                    : undefined
                }
                aria-invalid={Boolean(activeState.fieldErrors?.countryCode?.[0])}
                className={inputClass(Boolean(activeState.fieldErrors?.countryCode?.[0]))}
                id="registration-country-code"
                name="countryCode"
                onChange={updateRegistrationValue}
                value={registrationValues.countryCode}
              >
                {countryCodes.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.value} {country.label.replace(/ \(\+\d+\)/, "")}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="registration-phone">
                Mobile number
              </label>
              <input
                aria-describedby={
                  activeState.fieldErrors?.phone?.[0]
                    ? "registration-phone-error"
                    : "registration-phone-help"
                }
                aria-invalid={Boolean(activeState.fieldErrors?.phone?.[0])}
                autoComplete="tel-national"
                className={inputClass(Boolean(activeState.fieldErrors?.phone?.[0]))}
                id="registration-phone"
                inputMode="tel"
                name="phone"
                onChange={updateRegistrationValue}
                placeholder="50 123 4567"
                required
                type="tel"
                value={registrationValues.phone}
              />
            </div>
            <p className="text-xs leading-5 text-slate-500" id="registration-phone-help">
              Select your country code, then enter your mobile number without the country code.
            </p>
            {activeState.fieldErrors?.countryCode?.[0] ? (
              <p
                className="text-sm font-medium text-rose-700"
                id="registration-country-error"
                role="alert"
              >
                {activeState.fieldErrors.countryCode[0]}
              </p>
            ) : null}
            {activeState.fieldErrors?.phone?.[0] ? (
              <p
                className="text-sm font-medium text-rose-700"
                id="registration-phone-error"
                role="alert"
              >
                {activeState.fieldErrors.phone[0]}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email address</span>
        <input
          key={isRegistering ? "register-email" : "login-email"}
          aria-describedby={
            activeState.fieldErrors?.email?.[0]
              ? isRegistering
                ? "registration-email-error"
                : "login-email-error"
              : undefined
          }
          aria-invalid={Boolean(activeState.fieldErrors?.email?.[0])}
          className={inputClass(Boolean(activeState.fieldErrors?.email?.[0]))}
          autoComplete="email"
          name="email"
          onChange={isRegistering ? updateRegistrationValue : undefined}
          placeholder="name@example.com"
          type="email"
          value={isRegistering ? registrationValues.email : undefined}
        />
        {isRegistering && activeState.fieldErrors?.email?.[0] ? (
          <p
            className="text-sm font-medium text-rose-700"
            id="registration-email-error"
            role="alert"
          >
            {activeState.fieldErrors.email[0]}
          </p>
        ) : null}
        {!isRegistering && activeState.fieldErrors?.email?.[0] ? (
          <p className="text-sm font-medium text-rose-700" id="login-email-error" role="alert">
            {activeState.fieldErrors.email[0]}
          </p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          key={isRegistering ? "register-password" : "login-password"}
          aria-describedby={
            activeState.fieldErrors?.password?.[0] ? "registration-password-error" : undefined
          }
          aria-invalid={Boolean(activeState.fieldErrors?.password?.[0])}
          className={
            isRegistering
              ? inputClass(Boolean(activeState.fieldErrors?.password?.[0]))
              : "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white"
          }
          autoComplete={isRegistering ? "new-password" : "current-password"}
          name="password"
          onChange={isRegistering ? updateRegistrationValue : undefined}
          placeholder="Enter your password"
          type="password"
          value={isRegistering ? registrationValues.password : undefined}
        />
        {activeState.fieldErrors?.password?.[0] ? (
          <p
            className="text-sm font-medium text-rose-700"
            id="registration-password-error"
            role="alert"
          >
            {activeState.fieldErrors.password[0]}
          </p>
        ) : null}
      </label>

      {activeState.message ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {activeState.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isRegistering ? registrationPending : pending}
        type="submit"
      >
        {isRegistering
          ? registrationPending
            ? "Creating account..."
            : "Create account"
          : pending
            ? "Signing in..."
            : "Sign in"}
      </button>
      {variant === "storefront" ? (
        <button
          className="w-full text-sm font-semibold text-teal-700 underline underline-offset-4"
          onClick={() => setMode(isRegistering ? "login" : "register")}
          type="button"
        >
          {isRegistering ? "Already registered? Sign in" : "Not registered? Create an account"}
        </button>
      ) : null}
    </form>
  );
}

function inputClass(hasError: boolean): string {
  return `min-h-12 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:bg-white ${hasError ? "border-rose-500 ring-2 ring-rose-100 focus:border-rose-600" : "border-slate-200 focus:border-teal-500"}`;
}
