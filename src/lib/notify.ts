import "server-only";
import { siteUrl } from "./auth";

// Alerts to the site admin by email (Resend) and Telegram. Each channel is skipped
// when its settings are missing, and failures are logged, never shown to users.
// Alerts go to third-party services, so listing alerts carry no private details (no
// address, no email): just enough to know something needs review, plus a link.

type Alert = { subject: string; lines: string[]; link?: string };

async function sendEmail({ subject, lines }: Alert, link: string | null) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!key || !to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL ?? "KirayBet <onboarding@resend.dev>",
      to,
      subject,
      text: [...lines, ...(link ? ["", `Review it: ${link}`] : [])].join("\n"),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendTelegram({ subject, lines }: Alert, link: string | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: [`🏠 ${subject}`, ...lines, ...(link ? ["", link] : [])].join("\n"),
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}

// `link` defaults to the admin page; pass "" for none.
export async function notifyAdmin(alert: Alert) {
  const link = alert.link === "" ? null : `${siteUrl()}${alert.link ?? "/admin"}`;
  const results = await Promise.allSettled([sendEmail(alert, link), sendTelegram(alert, link)]);
  for (const r of results) {
    if (r.status === "rejected") console.error("Admin alert failed:", r.reason);
  }
}

export function listingAlert(
  kind: "new" | "edited",
  listing: { title: string; neighborhood: string; city: string; price: number },
  hostName: string | null,
): Alert {
  return {
    subject: kind === "new" ? "New listing to review" : "Edited listing to review",
    lines: [
      listing.title,
      `${listing.neighborhood}, ${listing.city} · $${listing.price.toLocaleString("en-US")}/mo`,
      `Host: ${hostName ?? "(no name yet)"}`,
    ],
  };
}
