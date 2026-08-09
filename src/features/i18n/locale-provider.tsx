"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import arabic from "@/locales/ar.json";
import english from "@/locales/en.json";

export type Locale = "en" | "ar";
type Dictionary = Record<string, string>;
const dictionaries: Record<Locale, Dictionary> = { ar: arabic, en: english };
interface LocaleContextValue { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string, values?: Record<string, string | number>) => string; }
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }): ReactNode {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("thashreef-locale");
      const detected = navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
      setLocale(stored === "ar" || stored === "en" ? stored : detected);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.locale = locale;
    window.localStorage.setItem("thashreef-locale", locale);
  }, [locale]);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => Object.entries(values ?? {}).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), dictionaries[locale][key] ?? dictionaries.en[key] ?? key),
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
