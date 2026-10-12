import { NextResponse, type NextRequest } from "next/server";
import { pathAfterSignIn, safeNext, siteUrl } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

// Finishes a sign-in and sends the user back to where they were.
//   ?code=...        Google sign-in (and Supabase's default email link)
//   ?token_hash=...  the button in our sign-in email (works on any device)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const code = params.get("code");
  const tokenHash = params.get("token_hash");

  const supabase = await createServerSupabase();
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : null;
  const user = result && !result.error ? result.data.user : null;

  if (!user) {
    const login = new URL("/login", siteUrl());
    login.searchParams.set("error", "link");
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(new URL(await pathAfterSignIn(supabase, user.id, next), siteUrl()));
}
