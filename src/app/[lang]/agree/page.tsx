import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { primaryButtonClass } from "@/components/form-styles";
import { FormPending } from "@/components/Pending";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { agreeToTerms } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Terms of Service", "የአገልግሎት ውል"), robots: { index: false } };
}

type Props = PageProps<"/[lang]/agree">;

// For accounts made before the "I agree" box, or after the Terms change: agree once,
// then carry on to the page they were going to.
async function Agree({ searchParams }: { searchParams: Props["searchParams"] }) {
  const next = safeNext((await searchParams).next);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.termsAccepted) redirect(next);
  const t = await getT();

  return (
    <form action={agreeToTerms} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <input type="hidden" name="next" value={next} />
      <p>
        {t(
          "Before you continue, please read and agree to our Terms of Service and Privacy Policy.",
          "ከመቀጠልዎ በፊት እባክዎ የአገልግሎት ውላችንንና የግላዊነት ፖሊሲያችንን አንብበው ይስማሙ።",
        )}
      </p>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="agree" required className="mt-0.5 h-5 w-5 shrink-0 accent-brand" />
        <span>
          {t("I am 18 or older and I agree to the", "18 ዓመት ወይም ከዚያ በላይ ነኝ፤ በ")}{" "}
          <a href="/terms" target="_blank" className="font-semibold text-brand hover:underline">
            {t("Terms of Service", "የአገልግሎት ውል")}
          </a>{" "}
          {t("and", "እና")}{" "}
          <a href="/privacy" target="_blank" className="font-semibold text-brand hover:underline">
            {t("Privacy Policy", "የግላዊነት ፖሊሲ")}
          </a>
          {t(".", " እስማማለሁ።")}
        </span>
      </label>
      <button className={`relative ${primaryButtonClass}`}>
        <FormPending />
        {t.both("Agree and continue", "እስማማለሁ፣ ይቀጥሉ")}
      </button>
    </form>
  );
}

export default async function AgreePage({ searchParams }: Props) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 pt-10">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t.both("One quick step", "አንድ አጭር እርምጃ")}</h1>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-border/50" />}>
        <Agree searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
