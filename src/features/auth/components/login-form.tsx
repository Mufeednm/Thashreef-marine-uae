"use client";

import type { ReactElement } from "react";
import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/features/auth/auth.actions";
import { initialLoginActionState, type LoginActionState } from "@/features/auth/auth.types";

export function LoginForm({ redirectTo, variant = "storefront" }: { redirectTo?: string; variant?: "admin" | "storefront" } = {}): ReactElement {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, action, pending] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialLoginActionState,
  );
  const [registrationState, registrationAction, registrationPending] = useActionState<LoginActionState, FormData>(registerAction, initialLoginActionState);
  const isRegistering = mode === "register";
  const activeState = isRegistering ? registrationState : state;

  return (
    <form
      action={isRegistering ? registrationAction : action}
      className="space-y-4 rounded-[28px] bg-white/92 p-6 shadow-lg shadow-slate-900/10"
    >
      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
          {variant === "admin" ? "Admin sign in" : isRegistering ? "Create your account" : "Secure customer login"}
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">{variant === "admin" ? "Sign in to your workspace" : isRegistering ? "Create an account for checkout" : "Sign in to continue"}</h2>
        <p className="text-sm leading-6 text-slate-600">
          {variant === "admin" ? "Use your admin credentials to access the workspace." : isRegistering ? "Your details are saved securely for order updates and future checkout." : "Sign in to place an order, or create a customer account."}
        </p>
      </div>

      {isRegistering ? <>
        <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Full name</span><input autoComplete="name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white" name="name" type="text" />{activeState.fieldErrors?.name?.[0] ? <p className="text-sm text-rose-600">{activeState.fieldErrors.name[0]}</p> : null}</label>
        <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">Mobile number</span><input autoComplete="tel" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white" name="phone" type="tel" />{activeState.fieldErrors?.phone?.[0] ? <p className="text-sm text-rose-600">{activeState.fieldErrors.phone[0]}</p> : null}</label>
      </> : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">{isRegistering ? "Email address" : "Username or email"}</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white"
          autoComplete="username"
          name="email"
          placeholder={isRegistering ? "name@example.com" : "admin"}
          type={isRegistering ? "email" : "text"}
        />
        {activeState.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-rose-600">{activeState.fieldErrors.email[0]}</p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white"
          autoComplete={isRegistering ? "new-password" : "current-password"}
          name="password"
          placeholder="Enter your password"
          type="password"
        />
        {activeState.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-rose-600">{activeState.fieldErrors.password[0]}</p>
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
        {isRegistering ? registrationPending ? "Creating account..." : "Create account" : pending ? "Signing in..." : "Sign in"}
      </button>
      {variant === "storefront" ? <button className="w-full text-sm font-semibold text-teal-700 underline underline-offset-4" onClick={() => setMode(isRegistering ? "login" : "register")} type="button">{isRegistering ? "Already registered? Sign in" : "Not registered? Create an account"}</button> : null}
    </form>
  );
}
