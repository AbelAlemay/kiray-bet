import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, isLang, langCookie } from "@/lib/i18n";

// Paths that aren't pages: served as they are, in no particular language.
const notPages = /^\/(?:en|am)(?:\/|$)|^\/(?:auth|app-icons|apple-icon|manifest\.webmanifest|icon\.svg|robots\.txt|sitemap\.xml)/;

// Serves each page in the visitor's language (src/app/[lang]) at the same address.
// A link with ?lang=am (or en) switches language and is remembered.
function routeLanguage(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const asked = searchParams.get("lang");
  if (isLang(asked)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(langCookie, asked, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return response;
  }
  if (notPages.test(pathname)) return null;
  const saved = request.cookies.get(langCookie)?.value;
  const url = request.nextUrl.clone();
  url.pathname = `/${isLang(saved) ? saved : defaultLang}${pathname === "/" ? "" : pathname}`;
  return url;
}

// Refreshes the Supabase session cookie on each request so Server Components see a
// valid session. Access checks happen in the pages themselves (src/lib/auth.ts).
export async function proxy(request: NextRequest) {
  const routed = routeLanguage(request);
  if (routed instanceof NextResponse) return routed;
  const next = () => (routed ? NextResponse.rewrite(routed, { request }) : NextResponse.next({ request }));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return next();

  let response = next();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = next();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // Skip static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
