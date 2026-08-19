"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import type { CategoryTreeNode } from "@/domain/catalog/category";
import { useLocale } from "@/features/i18n/locale-provider";

interface CategoryNavigationProps {
  categories: CategoryTreeNode[];
  selectedCategoryId: number | "all";
  selectCategory: (id: number | "all") => void;
}

interface MenuPosition {
  left: number;
  top: number;
  width: number;
}

const MENU_GUTTER = 16;
const MENU_MAX_WIDTH = 448;

export function CategoryNavigation({
  categories,
  selectedCategoryId,
  selectCategory,
}: CategoryNavigationProps): ReactElement {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ left: 0, top: 0, width: 0 });
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const activeCategory =
    categories.find((category) => category.id === hoveredId) ??
    categories.find((category) => category.id === openId) ??
    (openId === null && typeof selectedCategoryId === "number"
      ? categories.find((category) => category.id === selectedCategoryId)
      : undefined);
  const submenuCategory = activeCategory?.children.length ? activeCategory : null;

  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current !== null) {
        window.clearTimeout(hoverCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    function closeWhenClickedOutside(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (navRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpenId(null);
      setHoveredId(null);
    }

    document.addEventListener("mousedown", closeWhenClickedOutside);
    return () => document.removeEventListener("mousedown", closeWhenClickedOutside);
  }, []);

  useLayoutEffect(() => {
    if (!submenuCategory) {
      return;
    }
    const submenuCategoryId = submenuCategory.id;

    function placeMenu(): void {
      const categoryIndex = categories.findIndex((category) => category.id === submenuCategoryId);
      const button = buttons.current[categoryIndex];
      if (!button) {
        return;
      }

      const anchor = button.getBoundingClientRect();
      const width = Math.min(MENU_MAX_WIDTH, window.innerWidth - MENU_GUTTER * 2);
      setMenuPosition({
        left: Math.min(Math.max(MENU_GUTTER, anchor.left), window.innerWidth - width - MENU_GUTTER),
        top: anchor.bottom + 8,
        width: Math.max(anchor.width, width),
      });
    }

    placeMenu();
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [categories, submenuCategory]);

  function labelFor(category: CategoryTreeNode): string {
    const translationKey = `category.${category.slug}`;
    const translation = t(translationKey);
    return translation === translationKey ? category.name : translation;
  }

  function cancelHoverClose(): void {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }

  function scheduleHoverClose(): void {
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => {
      setHoveredId(null);
      hoverCloseTimer.current = null;
    }, 160);
  }

  function choose(id: number): void {
    selectCategory(id);
    setOpenId(null);
    setHoveredId(null);
  }

  function toggleCategory(category: CategoryTreeNode): void {
    if (category.children.length === 0) {
      choose(category.id);
      return;
    }
    cancelHoverClose();
    setHoveredId(null);
    setOpenId((id) => (id === category.id ? null : category.id));
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    category: CategoryTreeNode,
  ): void {
    if (event.key === "Escape") {
      setOpenId(null);
      setHoveredId(null);
      event.currentTarget.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCategory(category);
      return;
    }
    if (event.key === "ArrowDown" && category.children.length > 0) {
      event.preventDefault();
      setHoveredId(null);
      setOpenId(category.id);
      window.setTimeout(() => {
        menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }, 0);
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      buttons.current[
        (index + (event.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length
      ]?.focus();
    }
  }

  const submenu = submenuCategory ? (
    <div
      aria-label={`${labelFor(submenuCategory)} subcategories`}
      className="fixed z-[9999] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/20 motion-safe:animate-[menu-in_200ms_ease-out]"
      id={`category-submenu-${submenuCategory.id}`}
      onMouseEnter={cancelHoverClose}
      onMouseLeave={scheduleHoverClose}
      ref={menuRef}
      role="menu"
      style={{
        left: menuPosition.left,
        top: menuPosition.top,
        width: menuPosition.width,
      }}
    >
      <div className="grid gap-1 sm:grid-cols-2">
        {submenuCategory.children.map((child) => (
          <button
            className="min-h-11 rounded-xl px-4 text-start text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-[#0e7490] focus:bg-cyan-50 focus:outline-none"
            key={child.id}
            onClick={() => choose(child.id)}
            role="menuitem"
            type="button"
          >
            {labelFor(child)}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <nav
      aria-label="Product categories"
      className="border-t border-slate-100 bg-white/95"
      onMouseLeave={scheduleHoverClose}
      ref={navRef}
    >
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-1 px-4 py-2 sm:px-6">
        {categories.map((category, index) => {
          const isOpen = submenuCategory?.id === category.id;
          return (
            <div
              key={category.id}
              onMouseEnter={() => {
                cancelHoverClose();
                setHoveredId(category.id);
              }}
            >
              <button
                aria-controls={
                  category.children.length ? `category-submenu-${category.id}` : undefined
                }
                aria-expanded={category.children.length ? isOpen : undefined}
                className={`min-h-11 rounded-full px-4 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${selectedCategoryId === category.id || isOpen ? "bg-[#0a2540] text-white shadow-md shadow-slate-900/10" : "text-slate-700 hover:bg-[#eef8fb] hover:text-[#0e7490]"}`}
                onClick={() => toggleCategory(category)}
                onKeyDown={(event) => onKeyDown(event, index, category)}
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                type="button"
              >
                {labelFor(category)}
              </button>
            </div>
          );
        })}
      </div>
      {typeof document !== "undefined" && submenu ? createPortal(submenu, document.body) : null}
    </nav>
  );
}
