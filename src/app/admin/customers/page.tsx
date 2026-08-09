import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminCustomersPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || (user.role !== "admin" && user.role !== "staff")) redirect("/admin/login");
  const customers = await repository.listCustomers(100);
  return <AdminShell description="Customer accounts are created from storefront registration and are available here for follow-up." eyebrow="Customers" title="Customer records"><section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-[#102846]">Registered customers</h2><p className="mt-1 text-sm text-slate-500">{customers.length} customer records</p></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{customers.map((customer) => <tr key={customer.id}><td className="px-5 py-4 font-bold text-slate-800">{customer.name}</td><td className="px-5 py-4 text-slate-600">{customer.email}</td><td className="px-5 py-4 text-slate-600">{customer.phone ?? "—"}</td><td className="px-5 py-4 text-slate-600">{customer.dateJoined ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(customer.dateJoined)) : "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{customer.status}</span></td></tr>)}{customers.length === 0 ? <tr><td className="px-5 py-10 text-center text-slate-500" colSpan={5}>Customer accounts will appear here after registration.</td></tr> : null}</tbody></table></div></section></AdminShell>;
}
