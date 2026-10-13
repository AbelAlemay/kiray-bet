import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getInbox } from "@/lib/conversations";
import { formatMessageTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
};

async function Inbox() {
  const user = await requireUser("/messages");
  const conversations = await getInbox(user.id);

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="font-semibold">No messages yet. · መልዕክት የለም</p>
        <p className="mt-1 text-sm text-muted">
          Tap &ldquo;Contact host&rdquo; on a home you like to start a private conversation.
        </p>
        <Link href="/search" className="mt-4 inline-block font-semibold text-brand hover:underline">
          Browse homes →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link href={`/messages/${c.id}`} className="flex gap-3 p-4 hover:bg-brand-soft">
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand"
            >
              {c.otherName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={`truncate ${c.unread ? "font-bold" : "font-semibold"}`}>
                  {c.otherName}
                  <span className="ml-2 text-xs font-normal text-muted">{c.role === "renter" ? "Host" : "Renter"}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{formatMessageTime(c.lastActivity)}</span>
              </span>
              <span className="block truncate text-xs text-muted">{c.listingTitle ?? "Listing no longer available"}</span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className={`truncate text-sm ${c.unread ? "text-foreground" : "text-muted"}`}>
                  {c.lastMessage ? `${c.lastMessage.mine ? "You: " : ""}${c.lastMessage.body}` : "No messages yet"}
                </span>
                {c.unread > 0 && (
                  <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                    {c.unread} new
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Messages · መልዕክቶች</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <Inbox />
      </Suspense>
    </div>
  );
}
