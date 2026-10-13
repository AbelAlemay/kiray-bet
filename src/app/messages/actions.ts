"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { ChatMessage } from "@/lib/conversations";
import { createServerSupabase } from "@/lib/supabase/server";

// Messaging actions. All run as the signed-in user; the database's rules decide who
// may start a conversation, post into it, read it, and see the address.

const maxLength = 4000;

function cleanBody(raw: unknown) {
  return String(raw ?? "").replace(/\r\n/g, "\n").trim().slice(0, maxLength);
}

function friendlyError(message: string) {
  if (message.includes("too quickly")) return "You're sending messages too quickly. Please wait a minute.";
  if (message.includes("Too many new conversations")) return "You've started a lot of conversations today. Please try again tomorrow.";
  return "Your message couldn't be sent. Please try again.";
}

export type StartState = { error?: string };

// First message to a host about a listing. Reuses the conversation if one exists.
export async function startConversation(_prev: StartState, formData: FormData): Promise<StartState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };
  const listingId = String(formData.get("listingId") ?? "");
  const body = cleanBody(formData.get("body"));
  if (!body) return { error: "Please write a message." };

  const supabase = await createServerSupabase();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, host_id")
    .eq("id", listingId)
    .eq("status", "active")
    .maybeSingle();
  if (!listing) return { error: "This listing is no longer available." };
  if (listing.host_id === user.id) return { error: "This is your own listing." };

  const find = () =>
    supabase.from("conversations").select("id").eq("listing_id", listingId).eq("renter_id", user.id).maybeSingle();
  let { data: conversation } = await find();
  if (!conversation) {
    const { error } = await supabase
      .from("conversations")
      .insert({ listing_id: listingId, renter_id: user.id, host_id: listing.host_id });
    // A duplicate means it was just created (e.g. a double tap); use that one.
    if (error && error.code !== "23505") return { error: friendlyError(error.message) };
    ({ data: conversation } = await find());
  }
  if (!conversation) return { error: friendlyError("") };

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversation.id, sender_id: user.id, body });
  if (error) return { error: friendlyError(error.message) };
  redirect(`/messages/${conversation.id}`);
}

// Returns the saved message so the sender sees it at once (others get it live).
export async function sendMessage(
  conversationId: string,
  rawBody: string,
): Promise<{ message?: ChatMessage; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };
  const body = cleanBody(rawBody);
  if (!body) return { error: "Please write a message." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body })
    .select("id, sender_id, body, created_at, read_at")
    .single();
  if (error) return { error: friendlyError(error.message) };
  return { message: data };
}

// Marks the other person's messages in this conversation as read.
export async function markRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createServerSupabase();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

// Renter asks the host for the exact address.
export async function requestAddress(formData: FormData) {
  const user = await getCurrentUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  if (!user) redirect("/login");
  const supabase = await createServerSupabase();
  await supabase.from("address_requests").insert({ listing_id: listingId, renter_id: user.id });
  redirect(`/messages/${conversationId}`);
}

// Host shares, declines, or stops sharing the address.
export async function decideAddress(formData: FormData) {
  const user = await getCurrentUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!user) redirect("/login");
  if (!["approved", "declined", "revoked"].includes(decision)) redirect(`/messages/${conversationId}`);
  const supabase = await createServerSupabase();
  await supabase.from("address_requests").update({ status: decision }).eq("id", requestId);
  redirect(`/messages/${conversationId}`);
}
