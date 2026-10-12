import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false },
};

// Placeholder until in-app messaging (build phase 6).
async function Messages() {
  await requireUser("/messages");
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-semibold">Messages are coming soon. · በቅርቡ</p>
      <p className="mt-1 text-sm text-muted">
        Renters and hosts will chat here privately, without sharing phone numbers.
      </p>
      <Link href="/search" className="mt-4 inline-block font-semibold text-brand hover:underline">
        Browse homes →
      </Link>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="mb-6 text-3xl font-bold">Messages · መልዕክቶች</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <Messages />
      </Suspense>
    </div>
  );
}
