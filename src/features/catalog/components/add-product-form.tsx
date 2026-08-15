"use client";

import Image from "next/image";
import type { ChangeEvent, ReactElement } from "react";
import { useActionState, useState } from "react";
import type { Category } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { Brand } from "@/domain/demo-store/demo-store-repository";
import { createProductAction, updateProductAction } from "@/features/catalog/catalog.actions";
import {
  initialCreateProductActionState,
  type CreateProductActionState,
} from "@/features/catalog/catalog.types";

interface AddProductFormProps {
  brands: Brand[];
  categories: Category[];
  product?: Product;
}

export function AddProductForm({ brands, categories, product }: AddProductFormProps): ReactElement {
  const [state, action, pending] = useActionState<CreateProductActionState, FormData>(
    product ? updateProductAction : createProductAction,
    initialCreateProductActionState,
  );

  return (
    <form action={action} className="space-y-8">
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-[#102846]">1. Product details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Name the product, choose the category, and describe what customers are buying.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Field
            error={state.fieldErrors?.name?.[0]}
            label="Product name"
            name="name"
            placeholder="Victron Blue Smart Charger 12V 15A"
            defaultValue={product?.name}
            required
          />
          <Field
            defaultValue={product?.nameAr ?? undefined}
            error={state.fieldErrors?.nameAr?.[0]}
            label="Product name (Arabic)"
            name="nameAr"
            placeholder="اسم المنتج بالعربية"
          />
          <BrandSelect brands={brands} currentBrand={product?.brand} error={state.fieldErrors?.brand?.[0]} />
          <SelectField
            categories={categories}
            error={state.fieldErrors?.categoryId?.[0]}
            name="categoryId"
            currentCategoryId={product?.categoryId}
          />
        </div>

        <div className="mt-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e568f] focus:bg-white"
              name="description"
              defaultValue={product?.description}
              minLength={16}
              placeholder="Short, useful product summary with marine-specific details and compatibility notes."
              required
            />
            {state.fieldErrors?.description?.[0] ? (
              <p className="text-sm text-rose-600">{state.fieldErrors.description[0]}</p>
            ) : null}
          </label>
        </div>
        <div className="mt-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Description (Arabic)</span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e568f] focus:bg-white"
              defaultValue={product?.descriptionAr ?? undefined}
              dir="rtl"
              name="descriptionAr"
              placeholder="وصف مختصر ومفيد للمنتج باللغة العربية"
            />
            {state.fieldErrors?.descriptionAr?.[0] ? <p className="text-sm text-rose-600">{state.fieldErrors.descriptionAr[0]}</p> : null}
          </label>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-[#102846]">2. Pricing and presentation</h3>
          <p className="mt-1 text-sm text-slate-500">
            Set the regular price, optional sale price, and image override.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Field
            error={state.fieldErrors?.regularPriceAed?.[0]}
            inputMode="decimal"
            label="Regular price (AED)"
            name="regularPriceAed"
            placeholder="895.00"
            defaultValue={product ? (product.regularPriceAedCents / 100).toFixed(2) : undefined}
            required
          />
          <Field
            error={state.fieldErrors?.salePriceAed?.[0]}
            inputMode="decimal"
            label="Sale price (AED)"
            name="salePriceAed"
            placeholder="820.00"
            defaultValue={product?.salePriceAedCents ? (product.salePriceAedCents / 100).toFixed(2) : undefined}
          />
          <ProductImageFields product={product} state={state} />
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <h3 className="text-lg font-bold text-[#102846]">Storefront placement</h3>
        <p className="mt-1 text-sm text-slate-500">Choose where this product should be highlighted on the storefront.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[['isFeatured', 'Featured product'], ['isNewArrival', 'New arrival'], ['isTopSelling', 'Top selling'], ['isBestDeal', 'Best deal'], ['isBannerProduct', 'Banner product']].map(([name, label]) => (
            <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-slate-50 px-4 text-sm font-semibold text-slate-700" key={name}><input className="size-4 accent-[#f05a28]" defaultChecked={Boolean(product?.[name as keyof Product])} name={name} type="checkbox" />{label}</label>
          ))}
        </div>
      </section>

      {state.message ? (
        <section
          className={`rounded-2xl border px-4 py-4 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          className="min-h-12 rounded-2xl bg-[#f05a28] px-6 text-sm font-extrabold text-white transition hover:bg-[#d94d20] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving product..." : product ? "Save changes" : "Save product"}
        </button>
      </div>
    </form>
  );
}

function BrandSelect({ brands, currentBrand, error }: { brands: Brand[]; currentBrand?: string; error?: string }): ReactElement {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">Brand <span className="text-rose-600">*</span></span><select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e568f] focus:bg-white" defaultValue={currentBrand ?? ""} name="brand" required><option disabled value="">Select a managed brand</option>{brands.map((brand) => <option key={brand.id} value={brand.name}>{brand.name}</option>)}</select><p className="text-xs text-slate-500">Need another brand? Add it from the Brands page first.</p>{error ? <p className="text-sm text-rose-600">{error}</p> : null}</label>;
}

interface FieldProps {
  defaultValue?: number | string;
  error?: string;
  inputMode?: "decimal" | "numeric" | "text";
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}

function Field({
  defaultValue,
  error,
  inputMode = "text",
  label,
  name,
  placeholder,
  required = false,
}: FieldProps): ReactElement {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e568f] focus:bg-white"
        defaultValue={defaultValue}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        required={required}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

type ProductImageFieldName = "imageFile" | "secondaryImageFile" | "tertiaryImageFile";

function ProductImageFields({ product, state }: { product?: Product; state: CreateProductActionState }): ReactElement {
  const [previews, setPreviews] = useState<Record<ProductImageFieldName, string | null>>({
    imageFile: product?.imageUrl ?? null,
    secondaryImageFile: product?.secondaryImageUrl ?? null,
    tertiaryImageFile: product?.tertiaryImageUrl ?? null,
  });

  function updatePreview(name: ProductImageFieldName, event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") setPreviews((current) => ({ ...current, [name]: reader.result }));
    });
    reader.readAsDataURL(file);
  }

  const fields: Array<{ error?: string; label: string; name: ProductImageFieldName; required: boolean }> = [
    { error: state.fieldErrors?.imageFile?.[0], label: "Primary image", name: "imageFile", required: !product },
    { error: state.fieldErrors?.secondaryImageFile?.[0], label: "Image 2", name: "secondaryImageFile", required: false },
    { error: state.fieldErrors?.tertiaryImageFile?.[0], label: "Image 3", name: "tertiaryImageFile", required: false },
  ];

  return <div className="lg:col-span-2"><div className="flex flex-col gap-1"><h4 className="text-sm font-semibold text-slate-700">Product gallery</h4><p className="text-xs leading-5 text-slate-500">Add up to three JPG, PNG, or WebP images (5 MB each). The first image is the storefront cover.</p></div><div className="mt-3 grid gap-4 sm:grid-cols-3">{fields.map((field) => <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3" key={field.name}><span className="text-sm font-semibold text-slate-700">{field.label} {field.required ? <span className="text-rose-600">*</span> : null}</span><span className="mt-3 flex aspect-square overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">{previews[field.name] ? <Image alt={`${field.label} preview`} className="h-full w-full object-cover" height={320} src={previews[field.name] ?? ""} unoptimized width={320} /> : <span className="m-auto px-3 text-center text-xs leading-5 text-slate-400">Choose an image to preview it here.</span>}</span><input accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-[#e8f1fa] file:px-2.5 file:py-2 file:text-xs file:font-bold file:text-[#0e568f] hover:file:bg-[#dcecf8]" name={field.name} onChange={(event) => updatePreview(field.name, event)} required={field.required} type="file" />{product ? <span className="mt-2 block text-xs leading-5 text-slate-500">Leave empty to keep the current image.</span> : null}{field.error ? <span className="mt-2 block text-sm text-rose-600">{field.error}</span> : null}</label>)}</div></div>;
}

function SelectField({
  categories,
  currentCategoryId,
  error,
  name,
}: {
  categories: Category[];
  currentCategoryId?: number;
  error?: string;
  name: string;
}): ReactElement {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">Category <span className="text-rose-600">*</span></span>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e568f] focus:bg-white"
        defaultValue={currentCategoryId?.toString() ?? ""}
        name={name}
        required
      >
        <option disabled value="">
          Select a category
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.parentCategoryId ? `- ${category.name}` : category.name}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}
