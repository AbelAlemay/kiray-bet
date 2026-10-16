import { cookies } from "next/headers";
import { lang } from "next/root-params";
import { defaultLang, isLang, langCookie, translator } from "./i18n";

// The page's language, in any Server Component (also inside "use cache").
export async function getT() {
  const value = await lang();
  return translator(isLang(value) ? value : defaultLang);
}

// Server Actions and Route Handlers can't read the page's language, so they use the
// visitor's saved choice.
export async function getActionT() {
  const value = (await cookies()).get(langCookie)?.value;
  return translator(isLang(value) ? value : defaultLang);
}
