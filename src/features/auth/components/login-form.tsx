"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/auth.actions";
import { initialLoginActionState, type LoginActionState } from "@/features/auth/auth.types";

export function LoginForm(): ReactElement {
  const [state, action, pending] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialLoginActionState,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] bg-white/92 p-6 shadow-lg shadow-slate-900/10"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
          Secure Demo Login
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">Sign in to unlock the catalog</h2>
        <p className="text-sm leading-6 text-slate-600">
          Use your username or email and password to access the right workspace.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Username or email</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white"
          defaultValue="admin"
          name="email"
          placeholder="admin"
          type="text"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.email[0]}</p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white"
          defaultValue="admin123"
          name="password"
          placeholder="Enter your password"
          type="password"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-rose-600">{state.fieldErrors.password[0]}</p>
        ) : null}
      </label>

      {state.message ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
