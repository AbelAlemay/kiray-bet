import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getConversation, type Conversation } from "@/lib/conversations";
import { formatPrice, nearLabel } from "@/lib/format";
import { decideAddress, requestAddress } from "../actions";
import { Chat } from "./Chat";
import { FormPending } from "@/components/Pending";

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false },
};

type Props = PageProps<"/messages/[id]">;

const smallButton = "relative min-h-10 rounded-lg px-3 text-sm font-semibold";

// The exact-address flow: the renter asks, the host decides (and can take it back).
function AddressPanel({ c }: { c: Conversation }) {
  const request = c.addressRequest;
  const hidden = (decision?: string) => (
    <>
      <input type="hidden" name="conversationId" value={c.id} />
      <input type="hidden" name="listingId" value={c.listingId} />
      {request && <input type="hidden" name="requestId" value={request.id} />}
      {decision && <input type="hidden" name="decision" value={decision} />}
    </>
  );
  const box = "rounded-2xl border border-border bg-surface p-4 text-sm";

  // The host made the address public: no request needed.
  if (c.listing?.show_exact_address && c.address) {
    const full = `${c.address.street_address}${c.address.unit ? `, ${c.address.unit}` : ""}, ${c.listing.city}, ${c.listing.state} ${c.address.zip}`;
    return (
      <p className={box}>
        📍 {full} ·{" "}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-brand hover:underline"
        >
          Open in Maps
        </a>
      </p>
    );
  }

  if (c.role === "renter") {
    if (request?.status === "approved" && c.address) {
      const full = `${c.address.street_address}${c.address.unit ? `, ${c.address.unit}` : ""}, ${c.listing?.city ?? ""}, ${c.listing?.state ?? ""} ${c.address.zip}`;
      return (
        <div className={`${box} border-brand/50 bg-brand-soft`}>
          <p className="font-semibold">📍 {c.otherName} shared the exact address</p>
          <p className="mt-1 text-base">{full}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-semibold text-brand hover:underline"
          >
            Open in Maps →
          </a>
          <p className="mt-2 text-xs text-muted">Please keep it private. Visit with someone you trust.</p>
        </div>
      );
    }
    if (request?.status === "pending") {
      return <p className={box}>⏳ You asked for the exact address. {c.otherName} will decide.</p>;
    }
    if (request?.status === "declined" || request?.status === "revoked") {
      return (
        <p className={box}>
          {c.otherName} isn&apos;t sharing the exact address right now. You can keep talking here.
        </p>
      );
    }
    if (!c.listing || c.listing.status !== "active") return null;
    return (
      <form action={requestAddress} className={`${box} flex flex-wrap items-center justify-between gap-3`}>
        {hidden()}
        <span>🔒 The exact address is private until {c.otherName} shares it.</span>
        <button className={`${smallButton} bg-brand text-white hover:bg-brand-strong`}>
            <FormPending />Ask for the address</button>
      </form>
    );
  }

  // Host view
  if (!request) return null;
  if (request.status === "pending") {
    return (
      <div className={`${box} border-accent/60 bg-accent/10`}>
        <p className="font-semibold">{c.otherName} asked for the exact address.</p>
        <p className="mt-1 text-muted">Share it when you&apos;re comfortable, for example once you&apos;ve agreed on a viewing.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={decideAddress}>
            {hidden("approved")}
            <button className={`${smallButton} bg-brand text-white hover:bg-brand-strong`}>
            <FormPending />Share address</button>
          </form>
          <form action={decideAddress}>
            {hidden("declined")}
            <button className={`${smallButton} border border-border hover:bg-brand-soft`}>
            <FormPending />Not now</button>
          </form>
        </div>
      </div>
    );
  }
  if (request.status === "approved") {
    return (
      <form action={decideAddress} className={`${box} flex flex-wrap items-center justify-between gap-3`}>
        {hidden("revoked")}
        <span>📍 You shared the exact address with {c.otherName}.</span>
        <button className={`${smallButton} border border-border hover:bg-brand-soft`}>
            <FormPending />Stop sharing</button>
      </form>
    );
  }
  return (
    <form action={decideAddress} className={`${box} flex flex-wrap items-center justify-between gap-3`}>
      {hidden("approved")}
      <span>You haven&apos;t shared the exact address with {c.otherName}.</span>
      <button className={`${smallButton} border border-border hover:bg-brand-soft`}>
            <FormPending />Share address</button>
    </form>
  );
}

async function ConversationView({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/messages/${id}`);
  const c = await getConversation(id, user.id);
  if (!c) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand"
        >
          {c.otherName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{c.otherName}</h1>
          {c.listing ? (
            <Link href={`/listings/${c.listing.id}`} className="block truncate text-sm text-muted hover:text-foreground">
              {c.listing.title} · {formatPrice(c.listing.price)}/mo · {nearLabel({ ...c.listing, crossStreets: c.listing.cross_streets })}
            </Link>
          ) : (
            <p className="text-sm text-muted">This listing is no longer available.</p>
          )}
        </div>
      </div>

      <AddressPanel c={c} />

      <p className="rounded-xl border border-accent/40 bg-accent/5 px-3 py-2 text-xs text-muted">
        ⚠ KirayBet never handles money. Don&apos;t pay anything before you&apos;ve seen the home and signed a
        lease.
      </p>

      <Chat
        conversationId={c.id}
        listingId={c.listingId}
        myId={user.id}
        otherName={c.otherName}
        initialMessages={c.messages}
      />
    </div>
  );
}

export default function ConversationPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 sm:pt-6">
      <Link href="/messages" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← All messages
      </Link>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/50" />}>
        <ConversationView params={params} />
      </Suspense>
    </div>
  );
}
