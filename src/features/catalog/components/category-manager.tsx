"use client";

import { useActionState, useState, type ReactElement, type ReactNode } from "react";
import type { Category } from "@/domain/catalog/category";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/features/catalog/catalog.actions";
import {
  initialCreateCategoryActionState,
  type CreateCategoryActionState,
} from "@/features/catalog/catalog.types";

export function CategoryManager({ categories }: { categories: Category[] }): ReactElement {
  const [createMainOpen, setCreateMainOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const mainCategories = categories.filter((category) => category.parentCategoryId === null);
  const subcategoriesByParent = new Map<number, Category[]>();

  for (const category of categories) {
    if (category.parentCategoryId !== null) {
      subcategoriesByParent.set(category.parentCategoryId, [
        ...(subcategoriesByParent.get(category.parentCategoryId) ?? []),
        category,
      ]);
    }
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#102846]">Main categories</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a category to view or create its subcategories. Products belong only to a
            subcategory.
          </p>
        </div>
        <button
          className="min-h-11 rounded-xl bg-[#f05a28] px-4 text-sm font-bold text-white transition hover:bg-[#d94d20]"
          onClick={() => setCreateMainOpen(true)}
          type="button"
        >
          Create main category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Subcategories</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mainCategories.map((mainCategory) => (
              <MainCategoryRow
                editCategory={() => setEditingCategory(mainCategory)}
                key={mainCategory.id}
                mainCategory={mainCategory}
                openSubcategories={() => setSelectedMainCategory(mainCategory)}
                subcategories={subcategoriesByParent.get(mainCategory.id) ?? []}
              />
            ))}
          </tbody>
        </table>
      </div>

      {mainCategories.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">
          No main categories yet. Create one, then add its subcategories.
        </p>
      ) : null}
      {createMainOpen ? (
        <Modal close={() => setCreateMainOpen(false)} title="Create main category">
          <CategoryForm />
        </Modal>
      ) : null}
      {selectedMainCategory ? (
        <SubcategoryModal
          close={() => setSelectedMainCategory(null)}
          editCategory={setEditingCategory}
          mainCategory={selectedMainCategory}
          subcategories={subcategoriesByParent.get(selectedMainCategory.id) ?? []}
        />
      ) : null}
      {editingCategory ? (
        <Modal close={() => setEditingCategory(null)} title={`Edit ${editingCategory.name}`}>
          <CategoryForm
            category={editingCategory}
            parentCategory={
              editingCategory.parentCategoryId === null
                ? undefined
                : mainCategories.find(
                    (category) => category.id === editingCategory.parentCategoryId,
                  )
            }
          />
        </Modal>
      ) : null}
    </section>
  );
}

function MainCategoryRow({
  editCategory,
  mainCategory,
  openSubcategories,
  subcategories,
}: {
  editCategory: () => void;
  mainCategory: Category;
  openSubcategories: () => void;
  subcategories: Category[];
}): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    deleteCategoryAction,
    initialCreateCategoryActionState,
  );

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <button
          className="text-left font-bold text-slate-800 underline-offset-4 hover:text-[#0e7490] hover:underline"
          onClick={openSubcategories}
          type="button"
        >
          {mainCategory.name}
        </button>
        {mainCategory.nameAr ? (
          <p className="mt-1 text-xs text-slate-500" dir="rtl">
            {mainCategory.nameAr}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4">
        <button
          className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-[#0e568f] hover:bg-cyan-100"
          onClick={openSubcategories}
          type="button"
        >
          {subcategories.length} subcategor{subcategories.length === 1 ? "y" : "ies"}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-cyan-200 px-2.5 text-xs font-bold text-[#0e568f] hover:bg-cyan-50"
            onClick={openSubcategories}
            type="button"
          >
            Manage subcategories
          </button>
          <button
            aria-label={`Edit ${mainCategory.name}`}
            className="icon-button"
            onClick={editCategory}
            type="button"
          >
            <EditIcon />
          </button>
          <form
            action={action}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Delete ${mainCategory.name}? It must have no products or subcategories.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input name="id" type="hidden" value={mainCategory.id} />
            <button
              aria-label={`Delete ${mainCategory.name}`}
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
  );
}

function SubcategoryModal({
  close,
  editCategory,
  mainCategory,
  subcategories,
}: {
  close: () => void;
  editCategory: (category: Category) => void;
  mainCategory: Category;
  subcategories: Category[];
}): ReactElement {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Modal close={close} title={`${mainCategory.name} subcategories`}>
      {createOpen ? (
        <>
          <button
            className="mb-4 text-sm font-bold text-[#0e568f] hover:underline"
            onClick={() => setCreateOpen(false)}
            type="button"
          >
            Back to subcategories
          </button>
          <CategoryForm parentCategory={mainCategory} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Create as many subcategories as needed under this main category.
            </p>
            <button
              className="min-h-11 rounded-xl bg-[#f05a28] px-4 text-sm font-bold text-white hover:bg-[#d94d20]"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              Add subcategory
            </button>
          </div>
          {subcategories.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {subcategories.map((subcategory) => (
                <SubcategoryRow
                  editCategory={editCategory}
                  key={subcategory.id}
                  subcategory={subcategory}
                />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              No subcategories yet. Select Add subcategory to create the first one.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

function SubcategoryRow({
  editCategory,
  subcategory,
}: {
  editCategory: (category: Category) => void;
  subcategory: Category;
}): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    deleteCategoryAction,
    initialCreateCategoryActionState,
  );

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold text-slate-800">{subcategory.name}</p>
        {subcategory.nameAr ? (
          <p className="mt-1 text-xs text-slate-500" dir="rtl">
            {subcategory.nameAr}
          </p>
        ) : null}
        {state.message ? (
          <p aria-live="polite" className="mt-2 text-xs text-rose-700">
            {state.message}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          aria-label={`Edit ${subcategory.name}`}
          className="icon-button"
          onClick={() => editCategory(subcategory)}
          type="button"
        >
          <EditIcon />
        </button>
        <form
          action={action}
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${subcategory.name}? It must have no products.`)) {
              event.preventDefault();
            }
          }}
        >
          <input name="id" type="hidden" value={subcategory.id} />
          <button
            aria-label={`Delete ${subcategory.name}`}
            className="icon-button border-rose-100 text-rose-700 hover:bg-rose-50"
            disabled={pending}
            type="submit"
          >
            <DeleteIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  parentCategory,
}: {
  category?: Category;
  parentCategory?: Category;
}): ReactElement {
  const [state, action, pending] = useActionState<CreateCategoryActionState, FormData>(
    category ? updateCategoryAction : createCategoryAction,
    initialCreateCategoryActionState,
  );
  const parentCategoryId = category?.parentCategoryId ?? parentCategory?.id ?? null;
  const isSubcategory = parentCategoryId !== null;

  return (
    <form action={action} className="grid gap-5">
      {category ? <input name="id" type="hidden" value={category.id} /> : null}
      <input name="parentCategoryId" type="hidden" value={parentCategoryId ?? ""} />
      <input name="bannerImageUrl" type="hidden" value={category?.bannerImageUrl ?? ""} />

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {isSubcategory
          ? `This is a subcategory under ${parentCategory?.name ?? "its selected main category"}.`
          : "This is a main category. Select it after saving to manage its subcategories."}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input defaultValue={category?.name} label="Category name (English)" name="name" required />
        <Input defaultValue={category?.nameAr ?? ""} label="Category name (Arabic)" name="nameAr" />
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Category image {category ? "(replace optional)" : "*"}
        <input
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          name="imageFile"
          required={!category}
          type="file"
        />
      </label>
      {!isSubcategory ? (
        <div>
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-4 text-sm font-semibold">
            <input
              defaultChecked={category?.showOnHomepage}
              name="showOnHomepage"
              type="checkbox"
            />
            Show in Shop by category
          </label>
          <p className="mt-2 text-xs text-slate-500">
            This does not affect the navbar. Every category is always shown in navigation.
          </p>
        </div>
      ) : null}
      <Message state={state} />
      <button
        className="min-h-12 rounded-xl bg-[#f05a28] px-5 text-sm font-bold text-white disabled:bg-slate-300"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : category ? "Save changes" : "Create category"}
      </button>
    </form>
  );
}

function Input({
  defaultValue,
  label,
  name,
  required,
}: {
  defaultValue?: number | string;
  label: string;
  name: string;
  required?: boolean;
}): ReactElement {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-[#0e568f]"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type="text"
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
      <section className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
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
