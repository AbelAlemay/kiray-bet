import Link from "next/link";
import { formatMessageTime } from "@/lib/format";
import { reportCategories } from "@/lib/reports";
import { createServerSupabase } from "@/lib/supabase/server";
import { rejectListing, setBanned, setReportStatus } from "./actions";
import { ConfirmButton } from "./ConfirmButton";

type Report = {
  id: string;
  target_type: "listing" | "conversation" | "user";
  target_id: string;
  category: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reporter: { display_name: string | null } | null;
};
type Person = { id: string; display_name: string | null };

const categoryLabel = (value: string) => reportCategories.find((c) => c.value === value)?.label ?? value;

// Reports from users, open ones first. Reported conversations become readable here.
export async function ReportsTab({ showClosed }: { showClosed: boolean }) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("reports")
    .select("id, target_type, target_id, category, reason, status, created_at, reporter:profiles!reports_reporter_id_fkey(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!showClosed) query = query.eq("status", "open");
  const { data, error } = await query.overrideTypes<Report[], { merge: false }>();
  if (error) return <p className="text-sm text-danger">Couldn&apos;t load reports: {error.message}</p>;
  const reports = data ?? [];

  const listingIds = reports.filter((r) => r.target_type === "listing").map((r) => r.target_id);
  const conversationIds = reports.filter((r) => r.target_type === "conversation").map((r) => r.target_id);
  const [{ data: listings }, { data: conversations }] = await Promise.all([
    listingIds.length
      ? supabase
          .from("listings")
          .select("id, title, status, host:profiles!listings_host_id_fkey(id, display_name)")
          .in("id", listingIds)
          .overrideTypes<{ id: string; title: string; status: string; host: Person | null }[], { merge: false }>()
      : Promise.resolve({ data: [] }),
    conversationIds.length
      ? supabase
          .from("conversations")
          .select(
            "id, listing:listings(title), renter:profiles!conversations_renter_id_fkey(id, display_name), host:profiles!conversations_host_id_fkey(id, display_name)",
          )
          .in("id", conversationIds)
          .overrideTypes<{ id: string; listing: { title: string } | null; renter: Person | null; host: Person | null }[], { merge: false }>()
      : Promise.resolve({ data: [] }),
  ]);
  const listingById = new Map((listings ?? []).map((l) => [l.id, l]));
  const conversationById = new Map((conversations ?? []).map((c) => [c.id, c]));

  const banButton = (person: Person | null, role: string) =>
    person && (
      <ConfirmButton
        key={person.id}
        label={`Ban ${role} (${person.display_name ?? "no name"})`}
        question={`Ban ${person.display_name ?? "this user"}? They can't post or message, and their listings are taken down.`}
        confirmLabel="Ban"
        action={setBanned}
        fields={{ userId: person.id, banned: "true", tab: "reports" }}
        notePlaceholder="Reason (shown on their listings)"
        danger
      />
    );

  return (
    <div className="space-y-3">
      <p className="text-sm">
        {showClosed ? (
          <Link href="/admin?tab=reports" className="font-semibold text-brand hover:underline">Show open reports only</Link>
        ) : (
          <Link href="/admin?tab=reports&closed=1" className="font-semibold text-brand hover:underline">Also show closed reports</Link>
        )}
      </p>
      {reports.length === 0 && <p className="text-muted">{showClosed ? "No reports yet." : "No open reports. 🎉"}</p>}
      {reports.map((r) => {
        const listing = r.target_type === "listing" ? listingById.get(r.target_id) : undefined;
        const conversation = r.target_type === "conversation" ? conversationById.get(r.target_id) : undefined;
        return (
          <article key={r.id} className="space-y-3 rounded-2xl border border-border bg-surface p-4 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                <span className="mr-2 rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">{categoryLabel(r.category)}</span>
                {r.target_type === "listing" ? "Listing" : "Conversation"}
                {r.status !== "open" && <span className="ml-2 text-xs font-normal text-muted">({r.status})</span>}
              </p>
              <p className="text-xs text-muted">
                by {r.reporter?.display_name ?? "a user"} · {formatMessageTime(r.created_at)}
              </p>
            </div>
            <p className="whitespace-pre-line break-words rounded-xl bg-background p-3">{r.reason}</p>

            {r.target_type === "listing" &&
              (listing ? (
                <p>
                  <Link href={`/listings/${listing.id}`} className="font-semibold text-brand hover:underline">
                    {listing.title}
                  </Link>{" "}
                  · host {listing.host?.display_name ?? "—"} · {listing.status}
                </p>
              ) : (
                <p className="text-muted">The listing has been deleted.</p>
              ))}
            {r.target_type === "conversation" &&
              (conversation ? (
                <p>
                  <Link href={`/admin/conversations/${conversation.id}`} className="font-semibold text-brand hover:underline">
                    Read the conversation →
                  </Link>{" "}
                  · {conversation.renter?.display_name ?? "renter"} (renter) and {conversation.host?.display_name ?? "host"} (host)
                  {conversation.listing && <> · about “{conversation.listing.title}”</>}
                </p>
              ) : (
                <p className="text-muted">The conversation has been deleted.</p>
              ))}

            <div className="flex flex-wrap gap-2">
              {listing && listing.status !== "rejected" && (
                <ConfirmButton
                  label="Take listing down"
                  question="Take this listing down? The host sees your note and can fix and resubmit."
                  confirmLabel="Take down"
                  action={rejectListing}
                  fields={{ listingId: listing.id, tab: "reports" }}
                  notePlaceholder="Note to the host"
                  noteRequired
                  danger
                />
              )}
              {listing && banButton(listing.host, "host")}
              {conversation && banButton(conversation.renter, "renter")}
              {conversation && banButton(conversation.host, "host")}
              {r.status === "open" && (
                <>
                  <ConfirmButton
                    label="Mark handled"
                    question="Mark this report as handled?"
                    confirmLabel="Mark handled"
                    action={setReportStatus}
                    fields={{ reportId: r.id, status: "resolved", tab: "reports" }}
                  />
                  <ConfirmButton
                    label="Dismiss"
                    question="Dismiss this report (nothing wrong)?"
                    confirmLabel="Dismiss"
                    action={setReportStatus}
                    fields={{ reportId: r.id, status: "dismissed", tab: "reports" }}
                  />
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
