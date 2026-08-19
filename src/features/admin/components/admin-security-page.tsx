"use client";

import { useActionState, type ReactElement } from "react";
import { changeAdminPasswordAction } from "@/features/auth/auth.actions";
import {
  initialChangeAdminPasswordActionState,
  type ChangeAdminPasswordActionState,
} from "@/features/auth/auth.types";

export function AdminSecurityPage(): ReactElement {
  const [state, action, pending] = useActionState<ChangeAdminPasswordActionState, FormData>(
    changeAdminPasswordAction,
    initialChangeAdminPasswordActionState,
  );

  return (
    <section className="max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-bold text-[#102846]">Change administrator password</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Confirm your current password before setting a new one. The previous password stops
          working immediately after a successful change.
        </p>
      </div>

      <form action={action} className="mt-6 space-y-5">
        <PasswordField
          autoComplete="current-password"
          error={state.fieldErrors?.currentPassword?.[0]}
          label="Current password"
          name="currentPassword"
        />
        <PasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.newPassword?.[0]}
          label="New password"
          name="newPassword"
        />
        <PasswordField
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword?.[0]}
          label="Confirm new password"
          name="confirmPassword"
        />

        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.status === "success"
                ? "text-sm font-semibold text-emerald-700"
                : "text-sm font-semibold text-rose-700"
            }
          >
            {state.message}
          </p>
        ) : null}

        <button
          className="min-h-11 rounded-xl bg-[#0e568f] px-4 text-sm font-bold text-white transition hover:bg-[#0b4573] disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Updating password..." : "Update password"}
        </button>
      </form>
    </section>
  );
}

function PasswordField({
  autoComplete,
  error,
  label,
  name,
}: {
  autoComplete: string;
  error?: string;
  label: string;
  name: "confirmPassword" | "currentPassword" | "newPassword";
}): ReactElement {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        autoComplete={autoComplete}
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-[#0e568f]"
        name={name}
        required
        type="password"
      />
      {error ? <span className="mt-1 block text-sm text-rose-700">{error}</span> : null}
    </label>
  );
}
