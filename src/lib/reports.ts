// What people can report, and why (same list as the database allows).

export type ReportTarget = "listing" | "conversation";

export const reportCategories = [
  { value: "scam", label: "Scam or asking for money first", labelAm: "ማጭበርበር ወይም አስቀድሞ ገንዘብ መጠየቅ" },
  { value: "fake", label: "Fake or copied listing", labelAm: "ሐሰተኛ ወይም የተቀዳ ማስታወቂያ" },
  { value: "discrimination", label: "Discrimination (not open to everyone)", labelAm: "አድልዎ (ለሁሉም ክፍት ያልሆነ)" },
  { value: "offensive", label: "Rude, threatening or offensive", labelAm: "ስድብ፣ ዛቻ ወይም አጸያፊ" },
  { value: "wrong_info", label: "Wrong information (price, photos, already rented)", labelAm: "የተሳሳተ መረጃ (ዋጋ፣ ፎቶ፣ ተከራይቷል)" },
  { value: "other", label: "Something else", labelAm: "ሌላ ነገር" },
] as const;

export type ReportCategory = (typeof reportCategories)[number]["value"];
