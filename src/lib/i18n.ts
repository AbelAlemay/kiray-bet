// English and Amharic. Each page exists in both (src/app/[lang]); the proxy serves the
// visitor's choice (cookie kb_lang) at the same address, so links never change.
// Translations sit next to the code as t("English", "አማርኛ") pairs.

export const langs = ["en", "am"] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = "en";
export const langCookie = "kb_lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (langs as readonly string[]).includes(value);
}

export type T = ((en: string, am: string) => string) & {
  lang: Lang;
  // A short label in both languages, the visitor's language first: "Bedrooms · መኝታ".
  both: (en: string, am: string) => string;
};

export function translator(lang: Lang): T {
  const t = ((en: string, am: string) => (lang === "am" ? am : en)) as T;
  t.lang = lang;
  t.both = (en, am) => (lang === "am" ? `${am} · ${en}` : `${en} · ${am}`);
  return t;
}
