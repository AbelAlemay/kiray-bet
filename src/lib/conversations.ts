import "server-only";
import { createServerSupabase } from "./supabase/server";

// Conversation data for the signed-in user. Every query runs as that user, so the
// database only returns conversations they're part of.

export type InboxItem = {
  id: string;
  otherName: string;
  role: "renter" | "host";
  listingTitle: string | null;
  lastMessage: { body: string; mine: boolean; at: string } | null;
  lastActivity: string;
  unread: number;
};

type InboxRow = {
  id: string;
  renter_id: string;
  host_id: string;
  last_message_at: string;
  listing: { title: string } | null;
  renter: { display_name: string | null } | null;
  host: { display_name: string | null } | null;
  messages: { body: string; sender_id: string; created_at: string }[];
};

const people =
  "renter:profiles!conversations_renter_id_fkey(display_name), host:profiles!conversations_host_id_fkey(display_name)";

export async function getInbox(userId: string): Promise<InboxItem[]> {
  const supabase = await createServerSupabase();
  const [{ data, error }, unread] = await Promise.all([
    supabase
      .from("conversations")
      .select(`id, renter_id, host_id, last_message_at, listing:listings(title), ${people}, messages(body, sender_id, created_at)`)
      .order("last_message_at", { ascending: false })
      .order("created_at", { referencedTable: "messages", ascending: false })
      .limit(1, { referencedTable: "messages" })
      .limit(200)
      .overrideTypes<InboxRow[], { merge: false }>(),
    unreadByConversation(userId),
  ]);
  if (error) throw new Error(`Couldn't load messages: ${error.message}`);

  return (data ?? []).map((c) => {
    const role = c.renter_id === userId ? "renter" : "host";
    const other = role === "renter" ? c.host : c.renter;
    const last = c.messages[0];
    return {
      id: c.id,
      role,
      otherName: other?.display_name ?? (role === "renter" ? "Host" : "Renter"),
      listingTitle: c.listing?.title ?? null,
      lastMessage: last ? { body: last.body, mine: last.sender_id === userId, at: last.created_at } : null,
      lastActivity: c.last_message_at,
      unread: unread.get(c.id) ?? 0,
    };
  });
}

async function unreadByConversation(userId: string) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("messages")
    .select("conversation_id")
    .is("read_at", null)
    .neq("sender_id", userId)
    .limit(1000);
  const counts = new Map<string, number>();
  for (const m of data ?? []) counts.set(m.conversation_id, (counts.get(m.conversation_id) ?? 0) + 1);
  return counts;
}

// Total unread messages, for the header.
export async function getUnreadCount(userId: string) {
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", userId);
  return count ?? 0;
}

export type ChatMessage = { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };

export type Conversation = {
  id: string;
  role: "renter" | "host";
  otherName: string;
  myName: string;
  listing: {
    id: string;
    title: string;
    price: number;
    city: string;
    neighborhood: string;
    cross_streets: string | null;
    status: string;
  } | null;
  listingId: string;
  messages: ChatMessage[];
  addressRequest: { id: string; status: "pending" | "approved" | "declined" | "revoked" } | null;
  // Only for the renter, once the host has shared it.
  address: { street_address: string; unit: string | null; zip: string } | null;
};

type ConversationRow = {
  id: string;
  listing_id: string;
  renter_id: string;
  host_id: string;
  listing: Conversation["listing"];
  renter: { display_name: string | null } | null;
  host: { display_name: string | null } | null;
};

export async function getConversation(id: string, userId: string): Promise<Conversation | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createServerSupabase();
  const { data: c } = await supabase
    .from("conversations")
    .select(`id, listing_id, renter_id, host_id, listing:listings(id, title, price, city, neighborhood, cross_streets, status), ${people}`)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<ConversationRow, { merge: false }>();
  if (!c || (c.renter_id !== userId && c.host_id !== userId)) return null;

  const role = c.renter_id === userId ? "renter" : "host";
  const [{ data: messages }, { data: request }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(500),
    supabase
      .from("address_requests")
      .select("id, status")
      .eq("listing_id", c.listing_id)
      .eq("renter_id", c.renter_id)
      .maybeSingle(),
  ]);

  // The database only returns the address to the renter once it's been shared.
  let address: Conversation["address"] = null;
  if (role === "renter" && request?.status === "approved") {
    const { data } = await supabase
      .from("listing_addresses")
      .select("street_address, unit, zip")
      .eq("listing_id", c.listing_id)
      .maybeSingle();
    address = data;
  }

  const renterName = c.renter?.display_name ?? "Renter";
  const hostName = c.host?.display_name ?? "Host";
  return {
    id: c.id,
    role,
    otherName: role === "renter" ? hostName : renterName,
    myName: role === "renter" ? renterName : hostName,
    listing: c.listing,
    listingId: c.listing_id,
    messages: (messages ?? []) as ChatMessage[],
    addressRequest: (request as Conversation["addressRequest"]) ?? null,
    address,
  };
}
