import type { ReactElement, ReactNode } from "react";
import { logoutAction } from "@/features/auth/auth.actions";
import { AdminNavigation } from "@/features/admin/components/admin-navigation";

interface AdminShellProps {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function AdminShell({
  actions,
  children,
  description,
  eyebrow = "Admin Console",
  title,
}: AdminShellProps): ReactElement {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="border-b border-slate-200 bg-[#102846] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-8">
          <p className="text-sm font-medium">Marsa Edge Marine LLC merchant workspace</p>
          <div className="hidden items-center gap-5 text-xs text-slate-300 sm:flex">
            <span>UAE / AED</span>
            <span>Catalog + orders</span>
            <span>Local SQLite mode</span>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#f05a28] text-lg font-black tracking-tight text-white">
              ME
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#102846]">
                MARSA EDGE MARINE LLC
              </p>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase">
                Admin workspace
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[248px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-6">
          <p className="px-3 text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Browse pages
          </p>
          <div className="mt-3">
            <AdminNavigation />
          </div>
        </aside>

        <main className="min-w-0 p-5 lg:p-8">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[#f05a28]">{eyebrow}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#102846]">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          <div className="pt-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
