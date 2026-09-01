"use client";

import Link from "next/link";
import { useEffect, type ReactElement } from "react";
import { formatAedFromCents } from "@/shared/utils/currency";

export function NgeniusCheckoutSuccess({ customerName, orderId, totalAedCents }: { customerName: string; orderId: number; totalAedCents: number }): ReactElement {
  useEffect(() => { window.sessionStorage.removeItem("thashreef-cart"); }, []);
  return <main className="grid min-h-dvh place-items-center bg-[#eef5fa] p-5"><section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/10 sm:p-10"><p className="text-xs font-black tracking-[.2em] text-[#f97316] uppercase">Payment received</p><h1 className="mt-3 text-3xl font-black tracking-tight text-[#0a2540] sm:text-4xl">Thank you, {customerName}.</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">Your secure N-Genius payment of <strong className="text-[#0a2540]">{formatAedFromCents(totalAedCents)}</strong> was completed for order #{orderId}. We will send your order confirmation shortly.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-black text-white" href="/account">View my order</Link><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-black text-slate-700" href="/">Continue shopping</Link></div></section></main>;
}
