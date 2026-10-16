"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ChatMessage } from "@/lib/conversations";
import { formatMessageTime } from "@/lib/format";
import { messageWarning, warningText } from "@/lib/message-safety";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { markRead, sendMessage } from "../actions";
import { PendingCorner } from "@/components/Pending";
import { useT } from "@/components/LangProvider";

// The message thread. New messages and read receipts arrive live (Supabase Realtime,
// which applies the same security rules as everything else); address decisions
// refresh the page.
export function Chat({
  conversationId,
  listingId,
  myId,
  otherName,
  initialMessages,
}: {
  conversationId: string;
  listingId: string;
  myId: string;
  otherName: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const t = useT();
  const end = useRef<HTMLDivElement>(null);

  const upsert = (incoming: ChatMessage) =>
    setMessages((current) => {
      const others = current.filter((m) => m.id !== incoming.id);
      return [...others, incoming].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });

  // Opening the conversation marks the other person's messages as read.
  useEffect(() => {
    markRead(conversationId).then(() => router.refresh());
  }, [conversationId, router]);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const message = payload.new as ChatMessage;
            upsert(message);
            if (message.sender_id !== myId) markRead(conversationId);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => upsert(payload.new as ChatMessage),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "address_requests", filter: `listing_id=eq.${listingId}` },
          () => router.refresh(),
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, listingId, myId, router]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setError(null);
    startSending(async () => {
      const result = await sendMessage(conversationId, body);
      if (result.message) {
        upsert(result.message);
        setDraft("");
      } else {
        setError(result.error ?? t("Your message couldn't be sent.", "መልዕክትዎ መላክ አልቻለም።"));
      }
    });
  }

  const lastMine = [...messages].reverse().find((m) => m.sender_id === myId);
  const draftWarning = messageWarning(draft);

  return (
    <div className="flex flex-col">
      <ol className="space-y-3 pb-4" aria-label={t(`Conversation with ${otherName}`, `ከ${otherName} ጋር ያለ ውይይት`)}>
        {messages.map((m) => {
          const mine = m.sender_id === myId;
          const warning = messageWarning(m.body);
          return (
            <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 ${
                  mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-border bg-surface"
                }`}
              >
                {m.body}
              </div>
              <span className="mt-1 px-1 text-xs text-muted">
                {formatMessageTime(m.created_at, t.lang)}
                {m.id === lastMine?.id && m.read_at && ` · ${t("Seen", "ታይቷል")}`}
              </span>
              {warning && (
                <p className="mt-1 max-w-[85%] rounded-xl border border-accent/60 bg-accent/10 px-3 py-2 text-xs">
                  ⚠ {t(warningText[warning].en, warningText[warning].am)}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div ref={end} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="sticky bottom-0 -mx-4 space-y-2 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {draftWarning && <p className="rounded-xl border border-accent/60 bg-accent/10 p-2 text-xs">⚠ {t(warningText[draftWarning].en, warningText[draftWarning].am)}</p>}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={Math.min(5, Math.max(1, draft.split("\n").length))}
            maxLength={4000}
            placeholder={t(`Message ${otherName}…`, `ለ${otherName} መልዕክት ይጻፉ…`)}
            aria-label={t(`Message ${otherName}`, `ለ${otherName} መልዕክት`)}
            className="min-h-11 flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
          <button
            disabled={sending || !draft.trim()}
            className="relative min-h-11 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
          >
            <PendingCorner pending={sending} />
            {t("Send", "ላክ")}
          </button>
        </div>
      </form>
    </div>
  );
}
