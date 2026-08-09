"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/products/new", label: "Add Product" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/categories", label: "Categories" },
] as const;

export function AdminNavigation(): ReactElement {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:flex-col">
      {navigation.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active
                ? "bg-[#e8f1fa] text-[#0e568f]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
