import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatMessageTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reported conversation", robots: { index: false } };

type Props = PageProps<"/[lang]/admin/conversations/[id]">;
type Person = { id: string; display_name: string | null };

// Read-only view of a conversation for the admin. The database allows it only for
// conversations someone has reported, and only after two-step login.
async function ReportedConversation({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/admin/conversations/${id}`);
  if (user.role !== "admin" || !user.twoStepVerified) notFound();

  const supabase = await createServerSupabase();
  const [{ data: c }, { data: messages }] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        "id, listing:listings(id, title), renter:profiles!conversations_renter_id_fkey(id, display_name), host:profiles!conversations_host_id_fkey(id, display_name)",
      )
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<{ id: string; listing: { id: string; title: string } | null; renter: Person | null; host: Person | null }, { merge: false }>(),
    supabase.from("messages").select("id, sender_id, body, created_at").eq("conversation_id", id).order("created_at"),
  ]);
  if (!c) notFound();
  const name = (senderId: string) =>
    senderId === c.renter?.id ? `${c.renter.display_name ?? "Renter"} (renter)` : `${c.host?.display_name ?? "Host"} (host)`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {c.renter?.display_name ?? "Renter"} and {c.host?.display_name ?? "Host"}
        {c.listing && (
          <>
            {" "}
            about{" "}
            <Link href={`/listings/${c.listing.id}`} className="font-semibold text-brand hover:underline">
              {c.listing.title}
            </Link>
          </>
        )}
      </p>
      <ol className="space-y-3">
        {(messages ?? []).map((m) => (
          <li key={m.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
            <p className="text-xs text-muted">
              {name(m.sender_id)} · {formatMessageTime(m.created_at)}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words">{m.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ReportedConversationPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8" lang="en">
      <Link href="/admin?tab=reports" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← Reports
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Reported conversation</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/50" />}>
        <ReportedConversation params={params} />
      </Suspense>
    </div>
  );
}
