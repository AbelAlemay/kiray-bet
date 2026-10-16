// Safety notes shown in chat. Messages are never blocked (people may want to share a
// phone number once they trust each other), but both sides see a warning.

const moneyPattern =
  /\b(zelle|cash\s*app|cashapp|venmo|paypal|western\s+union|moneygram|wire\s+transfer|gift\s*cards?|bitcoin|crypto|deposit|application\s+fee|holding\s+fee|send\s+(?:the\s+)?money|pay\s+(?:first|now|before))\b|ገንዘብ|ብር\s*ላክ|ቅድመ\s*ክፍያ/i;
const contactPattern =
  /\(?\b\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}\b|[^\s@]+@[^\s@]+\.[a-z]{2,}|https?:\/\/|www\.|\b(whats\s*app|telegram|t\.me|wa\.me)\b/i;

export type MessageWarning = "money" | "contact";

export function messageWarning(text: string): MessageWarning | null {
  if (moneyPattern.test(text)) return "money";
  if (contactPattern.test(text)) return "contact";
  return null;
}

export const warningText: Record<MessageWarning, { en: string; am: string }> = {
  money: {
    en: "Never send a deposit or any payment before you have seen the home in person and signed a lease. Anyone who asks you to pay first is likely a scammer. · ቤቱን ሳያዩና ውል ሳይፈርሙ ገንዘብ አይላኩ።",
    am: "ቤቱን በአካል ሳያዩና የኪራይ ውል ሳይፈርሙ ቅድመ ክፍያም ሆነ ሌላ ምንም ክፍያ በፍጹም አይላኩ። አስቀድመው እንዲከፍሉ የሚጠይቅዎ ሰው አጭበርባሪ ሊሆን ይችላል።",
  },
  contact: {
    en: "Be careful sharing phone numbers, emails or links with someone you haven't met. You can keep talking here.",
    am: "ላላገኙት ሰው ስልክ ቁጥር፣ ኢሜይል ወይም ሊንክ ሲያጋሩ ይጠንቀቁ። እዚሁ መነጋገር መቀጠል ይችላሉ።",
  },
};
