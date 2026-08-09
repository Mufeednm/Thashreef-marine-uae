import Link from "next/link";
import type { ReactElement } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function AdminLoginPage(): ReactElement {
  return <main className="grid min-h-screen place-items-center bg-[#eef5fa] px-4 py-10"><section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]"><div className="bg-[#102846] p-8 text-white sm:p-12"><Link className="text-sm font-black tracking-[0.16em] text-cyan-100 uppercase" href="/">Marsa Edge Marine LLC</Link><p className="mt-16 text-xs font-bold tracking-[0.24em] text-cyan-200 uppercase">Merchant workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight">Manage your catalog with confidence.</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Create and edit products, brands, categories, and storefront placements from the protected admin workspace.</p><Link className="mt-10 inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 text-sm font-bold transition hover:bg-white/10" href="/">Return to storefront</Link></div><div className="p-5 sm:p-10"><LoginForm redirectTo="/admin" variant="admin" /></div></section></main>;
}
