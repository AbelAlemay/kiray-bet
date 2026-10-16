"use server";

import { after } from "next/server";
import { notifyAdmin } from "@/lib/notify";
import { passedBotCheck } from "@/lib/turnstile";
import { getActionT } from "@/lib/i18n-server";

export type ContactState = { sent?: boolean; error?: string };

const topics = ["General question", "Problem with the site", "Report a listing or user", "Partnership"];

// Sends the message to the site admin (email and Telegram). Nothing is stored.
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  const topic = topics.find((t) => t === formData.get("topic")) ?? topics[0];
  const message = String(formData.get("message") ?? "").trim();
  const t = await getActionT();

  if (!name) return { error: t("Please enter your name.", "እባክዎ ስምዎን ያስገቡ።") };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: t("Please enter a valid email so we can reply.", "መልስ እንድንሰጥዎ እባክዎ ትክክለኛ ኢሜይል ያስገቡ።") };
  }
  if (message.length < 10 || message.length > 3000) {
    return { error: t("Please write a message (10 to 3,000 characters).", "እባክዎ መልዕክት ይጻፉ (ከ10 እስከ 3,000 ፊደላት)።") };
  }
  if (!(await passedBotCheck(formData))) {
    return { error: t("We couldn't confirm you're not a bot. Please try again.", "ሮቦት አለመሆንዎን ማረጋገጥ አልቻልንም። እባክዎ እንደገና ይሞክሩ።") };
  }

  after(() =>
    notifyAdmin({
      subject: `Contact form: ${topic}`,
      lines: [`From: ${name} <${email}>`, "", message],
      link: "",
    }),
  );
  return { sent: true };
}
