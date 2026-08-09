"use client";

import { useActionState, type ReactElement } from "react";
import type { Brand } from "@/domain/demo-store/demo-store-repository";
import {
  createBrandAction,
  deleteBrandAction,
  updateBrandAction,
} from "@/features/catalog/catalog.actions";
import {
  initialCreateCategoryActionState,
  type CreateCategoryActionState,
} from "@/features/catalog/catalog.types";

export function BrandManager({ brands }: { brands: Brand[] }): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    createBrandAction,
    initialCreateCategoryActionState,
  );
  return (
    <div className="grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
      <form action={action} className="h-fit space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-[#f05a28] uppercase">Brand catalog</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#102846]">Create brand</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Brands added here become selectable when an admin creates a product.</p>
        </div>
        <BrandFields errors={state.fieldErrors} />
        <ActionMessage state={state} />
        <button className="min-h-12 w-full rounded-2xl bg-[#f05a28] px-6 text-sm font-extrabold text-white transition hover:bg-[#d94d20] disabled:cursor-not-allowed disabled:bg-slate-300" disabled={pending} type="submit">
          {pending ? "Saving brand..." : "Save brand"}
        </button>
      </form>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#102846]">Managed brands</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Edit display names and logo labels without breaking existing product assignments. A brand cannot be removed while products use it.</p>
        <div className="mt-6 space-y-3">
          {brands.map((brand) => <BrandRow brand={brand} key={brand.id} />)}
        </div>
      </section>
    </div>
  );
}

function BrandRow({ brand }: { brand: Brand }): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(updateBrandAction, initialCreateCategoryActionState);
  const [deleteState, deleteAction, deleting] = useActionState<CreateCategoryActionState, FormData>(deleteBrandAction, initialCreateCategoryActionState);
  return (
    <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span><span className="font-bold text-slate-900">{brand.name}</span><span className="ml-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">{brand.logoText}</span></span>
        <span className="text-xs font-semibold text-slate-500">Edit</span>
      </summary>
      <form action={action} className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
        <input name="id" type="hidden" value={brand.id} />
        <BrandFields brand={brand} errors={state.fieldErrors} compact />
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <button className="min-h-11 rounded-xl bg-[#102846] px-4 text-sm font-bold text-white disabled:bg-slate-300" disabled={pending} type="submit">{pending ? "Saving..." : "Save changes"}</button>
          <ActionMessage state={state} />
        </div>
      </form>
      <form action={deleteAction} className="mt-3" onSubmit={(event) => { if (!window.confirm(`Delete ${brand.name}? This only works when no product uses the brand.`)) event.preventDefault(); }}>
        <input name="id" type="hidden" value={brand.id} />
        <button className="min-h-10 text-sm font-bold text-rose-700 underline underline-offset-4 disabled:text-slate-400" disabled={deleting} type="submit">{deleting ? "Deleting..." : "Delete brand"}</button>
        <ActionMessage state={deleteState} />
      </form>
    </details>
  );
}

function BrandFields({ brand, compact = false, errors }: { brand?: Brand; compact?: boolean; errors?: CreateCategoryActionState["fieldErrors"] }): ReactElement {
  const layout = compact ? "contents" : "grid gap-5";
  return <div className={layout}>
    <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">Brand name</span><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0e568f] focus:bg-white" defaultValue={brand?.name} name="name" placeholder="Victron Energy" required /><Error message={errors?.name?.[0]} /></label>
    <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">Logo label</span><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0e568f] focus:bg-white" defaultValue={brand?.logoText} name="logoText" placeholder="VICTRON" required /><Error message={errors?.logoText?.[0]} /></label>
    <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">Display order</span><input className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0e568f] focus:bg-white" defaultValue={brand?.displayOrder ?? 0} inputMode="numeric" min="0" name="displayOrder" type="number" required /><Error message={errors?.displayOrder?.[0]} /></label>
  </div>;
}

function Error({ message }: { message?: string }): ReactElement | null { return message ? <p className="text-sm text-rose-600">{message}</p> : null; }
function ActionMessage({ state }: { state: CreateCategoryActionState }): ReactElement | null { return state.message ? <p aria-live="polite" className={state.status === "success" ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-rose-700"}>{state.message}</p> : null; }
