"use client";

import { useRef, useState, type KeyboardEvent, type ReactElement } from "react";
import type { CategoryTreeNode } from "@/domain/catalog/category";
import { useLocale } from "@/features/i18n/locale-provider";

interface CategoryNavigationProps { categories: CategoryTreeNode[]; selectedCategoryId: number | "all"; selectCategory: (id: number | "all") => void; }

export function CategoryNavigation({ categories, selectedCategoryId, selectCategory }: CategoryNavigationProps): ReactElement {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<number | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  function choose(id: number): void { selectCategory(id); setOpenId(null); }
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number, category: CategoryTreeNode): void {
    if (event.key === "Escape") { setOpenId(null); event.currentTarget.focus(); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpenId((id) => id === category.id ? null : category.id); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setOpenId(category.id); document.getElementById(`category-submenu-${category.id}`)?.querySelector<HTMLButtonElement>("button")?.focus(); return; }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); buttons.current[(index + (event.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length]?.focus(); }
  }
  return <nav aria-label="Product categories" className="relative border-t border-slate-100 bg-white/95" onMouseLeave={() => setOpenId(null)}>
    <div className="mx-auto flex max-w-[1480px] items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none]">
      {categories.map((category, index) => <div className="relative shrink-0" key={category.id} onMouseEnter={() => setOpenId(category.id)}>
        <button aria-controls={`category-submenu-${category.id}`} aria-expanded={openId === category.id} className={`min-h-11 rounded-full px-4 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${selectedCategoryId === category.id || openId === category.id ? "bg-[#0a2540] text-white shadow-md shadow-slate-900/10" : "text-slate-700 hover:bg-[#eef8fb] hover:text-[#0e7490]"}`} onClick={() => choose(category.id)} onKeyDown={(event) => onKeyDown(event, index, category)} ref={(element) => { buttons.current[index] = element; }} type="button">{t(`category.${category.slug}`) === `category.${category.slug}` ? category.name : t(`category.${category.slug}`)}</button>
        {openId === category.id && category.children.length > 0 ? <div className="absolute start-0 top-[calc(100%+0.5rem)] z-50 w-[min(28rem,calc(100vw-2rem))] origin-top rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/15 motion-safe:animate-[menu-in_200ms_ease-out]" id={`category-submenu-${category.id}`} role="menu">
          <button className="w-full rounded-xl px-4 py-3 text-start text-sm font-black text-[#0a2540] hover:bg-slate-50" onClick={() => choose(category.id)} role="menuitem" type="button">{t(`category.${category.slug}`) === `category.${category.slug}` ? category.name : t(`category.${category.slug}`)}</button>
          <div className="grid sm:grid-cols-2">{category.children.map((child) => <button className="min-h-11 rounded-xl px-4 text-start text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-[#0e7490] focus:bg-cyan-50 focus:outline-none" key={child.id} onClick={() => choose(child.id)} role="menuitem" type="button">{t(`category.${child.slug}`) === `category.${child.slug}` ? child.name : t(`category.${child.slug}`)}</button>)}</div>
        </div> : null}
      </div>)}
    </div>
  </nav>;
}
