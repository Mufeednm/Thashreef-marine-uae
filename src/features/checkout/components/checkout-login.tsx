"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export function CheckoutLogin(): ReactElement {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#eef5fa] p-5">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-[2rem] bg-[#071827] p-8 text-white">
          <p className="text-xs font-black tracking-[.24em] text-cyan-200 uppercase">Secure checkout</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Sign in to continue your order.</h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">Your basket stays in this browser while we securely collect delivery and payment preferences.</p>
          <Link className="mt-8 inline-flex min-h-11 items-center font-bold text-white underline underline-offset-4" href="/">Return to shopping</Link>
        </section>
        <LoginForm redirectTo="/checkout" />
      </div>
    </main>
  );
}
