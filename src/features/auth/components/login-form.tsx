"use client";

import type { ReactElement } from "react";
import { useActionState, useState } from "react";
import {
  loginAction,
  requestCustomerEmailOtpAction,
  verifyCustomerEmailOtpAction,
} from "@/features/auth/auth.actions";
import { initialLoginActionState, type LoginActionState } from "@/features/auth/auth.types";

export function LoginForm({
  redirectTo,
  variant = "storefront",
}: { redirectTo?: string; variant?: "admin" | "storefront" } = {}): ReactElement {
  return variant === "admin" ? (
    <AdminLoginForm redirectTo={redirectTo} />
  ) : (
    <CustomerLoginForm key={redirectTo} redirectTo={redirectTo} />
  );
}

function AdminLoginForm({ redirectTo }: { redirectTo?: string }): ReactElement {
  const [state, action, pending] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialLoginActionState,
  );
  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] bg-white/92 p-6 shadow-lg shadow-slate-900/10"
      noValidate
    >
      <HiddenRedirect redirectTo={redirectTo} />
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
          Admin sign in
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">Sign in to your workspace</h2>
        <p className="text-sm leading-6 text-slate-600">
          Use your admin username and password to access the workspace.
        </p>
      </div>
      <Field
        error={state.fieldErrors?.identifier?.[0]}
        label="Username"
        name="identifier"
        placeholder="Enter your username"
        type="text"
        autoComplete="username"
      />
      <Field
        error={state.fieldErrors?.password?.[0]}
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
        autoComplete="current-password"
      />
      <Message state={state} />
      <button className={buttonClass} disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

function CustomerLoginForm({ redirectTo }: { redirectTo?: string }): ReactElement {
  const [mode, setMode] = useState<"login" | "registration">("login");
  return <CustomerOtpForm key={mode} mode={mode} redirectTo={redirectTo} onModeChange={setMode} />;
}

function CustomerOtpForm({
  mode,
  onModeChange,
  redirectTo,
}: {
  mode: "login" | "registration";
  onModeChange: (mode: "login" | "registration") => void;
  redirectTo?: string;
}): ReactElement {
  const [requestState, requestAction, requestPending] = useActionState<LoginActionState, FormData>(
    requestCustomerEmailOtpAction,
    initialLoginActionState,
  );
  const [verificationState, verificationAction, verificationPending] = useActionState<
    LoginActionState,
    FormData
  >(verifyCustomerEmailOtpAction, initialLoginActionState);
  const isVerifying = requestState.otpRequested === true;
  const state = isVerifying ? verificationState : requestState;
  const values = requestState.values;
  return (
    <form
      action={isVerifying ? verificationAction : requestAction}
      className="space-y-4 rounded-[28px] bg-white/92 p-6 shadow-lg shadow-slate-900/10"
      noValidate
    >
      <HiddenRedirect redirectTo={redirectTo} />
      <input name="purpose" type="hidden" value={mode} />
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
          Secure customer access
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          {isVerifying
            ? "Verify your email"
            : mode === "registration"
              ? "Create your account"
              : "Sign in to continue"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          {isVerifying
            ? `Enter the code we sent to ${values?.email ?? "your email address"}.`
            : "We will email you a one-time code. No customer password is required."}
        </p>
      </div>
      {isVerifying ? (
        <>
          <input name="email" type="hidden" value={values?.email ?? ""} />
          <input name="name" type="hidden" value={values?.name ?? ""} />
          <Field
            error={state.fieldErrors?.code?.[0]}
            label="Verification code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
          />
        </>
      ) : (
        <>
          {mode === "registration" ? (
            <Field
              error={state.fieldErrors?.name?.[0]}
              label="Full name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state.values?.name}
              placeholder="Your full name"
            />
          ) : (
            <input name="name" type="hidden" value="" />
          )}
          <Field
            error={state.fieldErrors?.email?.[0]}
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            placeholder="name@example.com"
          />
        </>
      )}
      <Message state={state} />
      <button
        className={buttonClass}
        disabled={isVerifying ? verificationPending : requestPending}
        type="submit"
      >
        {isVerifying
          ? verificationPending
            ? "Verifying..."
            : "Verify and sign in"
          : requestPending
            ? "Sending code..."
            : "Send verification code"}
      </button>
      {isVerifying ? (
        <button
          className="w-full text-sm font-semibold text-teal-700 underline underline-offset-4"
          formAction={requestAction}
          formNoValidate
          type="submit"
        >
          Send a new code
        </button>
      ) : null}
      <button
        className="w-full text-sm font-semibold text-teal-700 underline underline-offset-4"
        onClick={() => onModeChange(mode === "login" ? "registration" : "login")}
        type="button"
      >
        {mode === "registration"
          ? "Already registered? Sign in"
          : "New customer? Create an account"}
      </button>
    </form>
  );
}

function HiddenRedirect({ redirectTo }: { redirectTo?: string }): ReactElement | null {
  return redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null;
}
function Field({
  autoComplete,
  defaultValue,
  error,
  inputMode,
  label,
  maxLength,
  name,
  placeholder,
  type,
}: {
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  inputMode?: "numeric";
  label: string;
  maxLength?: number;
  name: string;
  placeholder?: string;
  type: "email" | "password" | "text";
}): ReactElement {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        autoComplete={autoComplete}
        className={inputClass(Boolean(error))}
        defaultValue={defaultValue}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
      {error ? (
        <p className="text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}
function Message({ state }: { state: LoginActionState }): ReactElement | null {
  if (!state.message) return null;
  const color =
    state.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";
  return <p className={`rounded-2xl border px-4 py-3 text-sm ${color}`}>{state.message}</p>;
}
const buttonClass =
  "w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400";
function inputClass(hasError: boolean): string {
  return `min-h-12 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:bg-white ${hasError ? "border-rose-500 ring-2 ring-rose-100 focus:border-rose-600" : "border-slate-200 focus:border-teal-500"}`;
}
