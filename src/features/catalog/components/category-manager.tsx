"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { Category } from "@/domain/catalog/category";
import type { CategoryField } from "@/domain/catalog/category-field";
import { createCategoryAction } from "@/features/catalog/catalog.actions";
import {
  initialCreateCategoryActionState,
  type CreateCategoryActionState,
} from "@/features/catalog/catalog.types";

interface CategoryManagerProps {
  categories: Category[];
  fields: CategoryField[];
}

export function CategoryManager({ categories, fields }: CategoryManagerProps): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    createCategoryAction,
    initialCreateCategoryActionState,
  );
  const fieldsByCategory = new Map<number, CategoryField[]>();

  for (const field of fields) {
    const existing = fieldsByCategory.get(field.categoryId) ?? [];
    fieldsByCategory.set(field.categoryId, [...existing, field]);
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        action={action}
        className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-[#f05a28] uppercase">
            Category setup
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#102846]">
            Create category
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add a parent category and define the fields products in that category should carry.
            Enter one field per line.
          </p>
        </div>

        <Field
          error={state.fieldErrors?.name?.[0]}
          label="Category name"
          name="name"
          placeholder="Shipping accessories"
        />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Parent category</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e568f] focus:bg-white"
            defaultValue=""
            name="parentCategoryId"
          >
            <option value="">No parent category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentCategoryId ? `- ${category.name}` : category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.parentCategoryId?.[0] ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.parentCategoryId[0]}</p>
          ) : null}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            error={state.fieldErrors?.displayOrder?.[0]}
            inputMode="numeric"
            label="Display order"
            name="displayOrder"
            placeholder="50"
          />
          <Field
            error={state.fieldErrors?.bannerImageUrl?.[0]}
            label="Banner image URL"
            name="bannerImageUrl"
            placeholder="/product-images/marine-essential.svg"
          />
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Custom fields</span>
          <textarea
            className="min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e568f] focus:bg-white"
            name="customFields"
            placeholder={"Material\nVoltage\nCable length\nCompatibility"}
          />
          <p className="text-xs leading-5 text-slate-500">
            These fields are saved for the category, so products can later collect category-specific
            specs.
          </p>
          {state.fieldErrors?.customFields?.[0] ? (
            <p className="text-sm text-rose-600">{state.fieldErrors.customFields[0]}</p>
          ) : null}
        </label>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <input className="size-4 accent-[#f05a28]" name="isFeatured" type="checkbox" />
          <span className="text-sm font-semibold text-slate-700">Feature this category</span>
        </label>

        {state.message ? (
          <div
            className={`rounded-2xl border px-4 py-4 text-sm ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <button
          className="min-h-12 w-full rounded-2xl bg-[#f05a28] px-6 text-sm font-extrabold text-white transition hover:bg-[#d94d20] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving category..." : "Save category"}
        </button>
      </form>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#102846]">
            Category structure
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Each category can have many custom fields. Existing workbook categories remain available
            for product creation.
          </p>
        </div>
        <div className="mt-6 space-y-3">
          {categories.map((category) => {
            const categoryFields = fieldsByCategory.get(category.id) ?? [];

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={category.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{category.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {category.parentCategoryId
                        ? `Child of #${category.parentCategoryId}`
                        : "Top-level category"}
                    </p>
                  </div>
                  {category.isFeatured ? (
                    <span className="w-fit rounded-full bg-[#fff1ea] px-2.5 py-1 text-xs font-bold text-[#d94d20]">
                      Featured
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryFields.length > 0 ? (
                    categoryFields.map((field) => (
                      <span
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
                        key={field.id}
                      >
                        {field.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      No custom fields yet
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Field({
  error,
  inputMode = "text",
  label,
  name,
  placeholder,
}: {
  error?: string;
  inputMode?: "numeric" | "text";
  label: string;
  name: string;
  placeholder: string;
}): ReactElement {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e568f] focus:bg-white"
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}
