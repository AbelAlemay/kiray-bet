"use server";

import { after } from "next/server";
import { notifyAdmin } from "@/lib/notify";
import { passedBotCheck } from "@/lib/turnstile";

export type ContactState = { sent?: boolean; error?: string };

const topics = ["General question", "Problem with the site", "Report a listing or user", "Partnership"];

// Sends the message to the site admin (email and Telegram). Nothing is stored.
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  const topic = topics.find((t) => t === formData.get("topic")) ?? topics[0];
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email so we can reply." };
  if (message.length < 10 || message.length > 3000) return { error: "Please write a message (10 to 3,000 characters)." };
  if (!(await passedBotCheck(formData))) return { error: "We couldn't confirm you're not a bot. Please try again." };

  after(() =>
    notifyAdmin({
      subject: `Contact form: ${topic}`,
      lines: [`From: ${name} <${email}>`, "", message],
      link: "",
    }),
  );
  return { sent: true };
}
