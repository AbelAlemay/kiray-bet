"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultLang, translator, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>(defaultLang);

// Gives Client Components the page's language: const t = useT(); t("Save", "አስቀምጥ").
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useT() {
  const lang = useContext(LangContext);
  return useMemo(() => translator(lang), [lang]);
}
