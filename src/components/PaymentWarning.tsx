import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";

// No money changes hands on the site, and we warn against paying before signing a lease.
export async function PaymentWarning({ compact = false }: { compact?: boolean }) {
  const t = await getT();
  return (
    <div
      role="note"
      className={`rounded-xl border border-accent/60 bg-accent/10 text-foreground ${compact ? "p-3 text-xs" : "p-4 text-sm sm:p-5"}`}
    >
      <p className={`font-semibold ${compact ? "" : "text-base"}`}>
        ⚠ {t(`${site.nameLatin} never handles money`, `${site.name} ገንዘብ በፍጹም አይቀበልም`)}
      </p>
      {t.lang === "am" ? (
        <p className="mt-1">
          ቤቱን <strong>በአካል ሳያዩ</strong> እና <strong>ከባለቤቱ ጋር የኪራይ ውል ሳይፈርሙ</strong> ቅድመ
          ክፍያም ሆነ ኪራይ በZelle፣ በCash App፣ በVenmo ወይም በሌላ በማንኛውም መንገድ አይላኩ። አስቀድመው
          እንዲከፍሉ የሚጠይቅዎ ሰው አጭበርባሪ ሊሆን ይችላል። እባክዎ ሪፖርት ያድርጉት።
        </p>
      ) : (
        <>
          <p className="mt-1">
            Don&apos;t send a deposit or rent by Zelle, Cash App, Venmo or any other way until you have{" "}
            <strong>seen the home in person</strong> and <strong>signed a lease with the host</strong>.
            Anyone who asks you to pay first is likely a scammer. Please report them.
          </p>
          <p className="mt-1 text-muted">ቤቱን በአካል ሳያዩና የኪራይ ውል ሳይፈርሙ ምንም ገንዘብ አይላኩ።</p>
        </>
      )}
    </div>
  );
}
