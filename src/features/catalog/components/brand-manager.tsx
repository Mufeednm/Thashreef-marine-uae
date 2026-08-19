"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, type ReactElement, type ReactNode } from "react";
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
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#102846]">All brands</h2>
          <p className="mt-1 text-sm text-slate-500">
            {brands.length} supplier brands in the catalogue. Each brand uses an uploaded image.
          </p>
        </div>
        <button
          className="min-h-11 rounded-xl bg-[#f05a28] px-4 text-sm font-bold text-white transition hover:bg-[#d94d20]"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          Create brand
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Brand</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map((brand) => (
              <BrandRow brand={brand} key={brand.id} />
            ))}
          </tbody>
        </table>
      </div>
      {createOpen ? (
        <Modal close={() => setCreateOpen(false)} title="Create brand">
          <BrandForm onSuccess={() => setCreateOpen(false)} />
        </Modal>
      ) : null}
    </section>
  );
}

function BrandRow({ brand }: { brand: Brand }): ReactElement {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    deleteBrandAction,
    initialCreateCategoryActionState,
  );
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {brand.imageUrl ? (
                <Image
                  alt={`${brand.name} brand image`}
                  className="h-full w-full object-contain"
                  height={40}
                  src={brand.imageUrl}
                  unoptimized={brand.imageUrl.startsWith("/")}
                  width={40}
                />
              ) : (
                <span className="text-xs font-bold text-slate-400">No image</span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-800">{brand.name}</p>
              {brand.nameAr ? (
                <p className="mt-1 text-xs text-slate-500" dir="rtl">
                  {brand.nameAr}
                </p>
              ) : null}
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex gap-2">
            <button
              aria-label={`View ${brand.name}`}
              className="icon-button"
              onClick={() => setViewOpen(true)}
              type="button"
            >
              <ViewIcon />
            </button>
            <button
              aria-label={`Edit ${brand.name}`}
              className="icon-button"
              onClick={() => setEditOpen(true)}
              type="button"
            >
              <EditIcon />
            </button>
            <form
              action={action}
              onSubmit={(event) => {
                if (
                  !window.confirm(`Delete ${brand.name}? This only works when no product uses it.`)
                )
                  event.preventDefault();
              }}
            >
              <input name="id" type="hidden" value={brand.id} />
              <button
                aria-label={`Delete ${brand.name}`}
                className="icon-button border-rose-100 text-rose-700 hover:bg-rose-50"
                disabled={pending}
                type="submit"
              >
                <DeleteIcon />
              </button>
            </form>
          </div>
          {state.message ? (
            <p aria-live="polite" className="mt-2 text-xs text-rose-700">
              {state.message}
            </p>
          ) : null}
        </td>
      </tr>
      {viewOpen ? (
        <tr>
          <td colSpan={2}>
            <Modal close={() => setViewOpen(false)} title="Brand details">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {brand.imageUrl ? (
                    <Image
                      alt={`${brand.name} brand image`}
                      className="h-full w-full object-contain"
                      height={112}
                      src={brand.imageUrl}
                      unoptimized={brand.imageUrl.startsWith("/")}
                      width={112}
                    />
                  ) : (
                    <span className="text-center text-sm font-bold text-slate-400">
                      Image required
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#f05a28] uppercase">
                    Brand profile
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold text-[#102846]">{brand.name}</h3>
                  {brand.nameAr ? (
                    <p className="mt-2 text-slate-600" dir="rtl">
                      {brand.nameAr}
                    </p>
                  ) : null}
                </div>
              </div>
            </Modal>
          </td>
        </tr>
      ) : null}
      {editOpen ? (
        <tr>
          <td colSpan={2}>
            <Modal close={() => setEditOpen(false)} title="Edit brand">
              <BrandForm brand={brand} />
            </Modal>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function BrandForm({ brand, onSuccess }: { brand?: Brand; onSuccess?: () => void }): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    brand ? updateBrandAction : createBrandAction,
    initialCreateCategoryActionState,
  );
  const imageRequired = !brand || !brand.imageUrl;

  useEffect(() => {
    if (!brand && state.status === "success") onSuccess?.();
  }, [brand, onSuccess, state.status]);

  return (
    <form action={action} className="grid gap-5">
      {brand ? <input name="id" type="hidden" value={brand.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input defaultValue={brand?.name} label="Brand name" name="name" required />
        <Input defaultValue={brand?.nameAr ?? ""} label="Brand name (Arabic)" name="nameAr" />
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Brand image{imageRequired ? " *" : " (replace optional)"}
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={
            state.fieldErrors?.imageFile?.[0] ? "brand-image-error" : "brand-image-help"
          }
          aria-invalid={Boolean(state.fieldErrors?.imageFile?.[0])}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          name="imageFile"
          required={imageRequired}
          type="file"
        />
        <span className="mt-1 block text-xs font-normal text-slate-500" id="brand-image-help">
          JPG, PNG, or WebP · max 5 MB.
        </span>
        {state.fieldErrors?.imageFile?.[0] ? (
          <span
            className="mt-1 block text-sm font-medium text-rose-700"
            id="brand-image-error"
            role="alert"
          >
            {state.fieldErrors.imageFile[0]}
          </span>
        ) : null}
      </label>
      <Message state={state} />
      <button
        className="min-h-12 rounded-xl bg-[#f05a28] px-5 text-sm font-bold text-white disabled:bg-slate-300"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : brand ? "Save changes" : "Create brand"}
      </button>
    </form>
  );
}
function Input({
  defaultValue,
  label,
  name,
  required,
  type = "text",
}: {
  defaultValue?: number | string;
  label: string;
  name: string;
  required?: boolean;
  type?: "number" | "text";
}): ReactElement {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-[#0e568f]"
        defaultValue={defaultValue}
        min={type === "number" ? 0 : undefined}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
function Modal({
  children,
  close,
  title,
}: {
  children: ReactNode;
  close: () => void;
  title: string;
}): ReactElement {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-slate-950/55 sm:items-center sm:justify-center sm:p-6"
      role="dialog"
    >
      <section className="w-full max-w-2xl rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#102846]">{title}</h2>
          <button aria-label="Close modal" className="icon-button" onClick={close} type="button">
            <CloseIcon />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Message({ state }: { state: CreateCategoryActionState }): ReactElement | null {
  return state.message ? (
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
  ) : null;
}
function ViewIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
function EditIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m4 16.5-.5 4 4-.5L19 8.5 15.5 5 4 16.5Z" />
      <path d="m14.5 6 3.5 3.5" />
    </svg>
  );
}
function DeleteIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" />
    </svg>
  );
}
function CloseIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
