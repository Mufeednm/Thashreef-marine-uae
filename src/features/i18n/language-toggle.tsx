"use client";

import { useLocale } from "@/features/i18n/locale-provider";
import type { ReactElement } from "react";

export function LanguageToggle(): ReactElement {
  const { locale, setLocale, t } = useLocale();
  return <div aria-label="Language" className="hidden min-h-11 rounded-full border border-slate-200 bg-slate-50 p-1 sm:flex">
    {(["en", "ar"] as const).map((item) => <button aria-pressed={locale === item} className={`min-w-9 rounded-full px-2 text-xs font-black transition ${locale === item ? "bg-[#0a2540] text-white shadow-sm" : "text-slate-500 hover:text-[#0a2540]"}`} key={item} onClick={() => setLocale(item)} type="button">{item === "en" ? t("language.english") : t("language.arabic")}</button>)}
  </div>;
}
