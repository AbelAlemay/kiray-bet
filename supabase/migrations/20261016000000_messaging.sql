-- Messaging: sort the inbox by latest activity, and stream new messages and address
-- decisions to the people in the conversation (Supabase Realtime still applies the
-- tables' security rules, so nobody receives other people's messages).

alter table public.conversations
  add column last_message_at timestamptz not null default now();

create index conversations_last_message_idx on public.conversations (last_message_at desc);

create function private.touch_conversation() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function private.touch_conversation();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.address_requests;
  end if;
end;
$$;
