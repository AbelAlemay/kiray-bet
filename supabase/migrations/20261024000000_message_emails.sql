-- Email alerts for new messages, sent by the database itself (no server secret needed).
--
-- Every 5 minutes: for each conversation where someone has messages that have been
-- unread for 5+ minutes (and less than 2 days), send them one short email with a link,
-- in their language. At most one email per conversation per hour, and only for messages
-- newer than the last email. The email never includes the message text.
-- Needs the Resend API key in Supabase Vault (name: resend_api_key); without it nothing
-- is sent. People can turn the emails off on their account page.

alter table public.private_profiles add column message_emails boolean not null default true;
grant update (message_emails) on public.private_profiles to authenticated;

create table private.message_alerts (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_at timestamptz not null,
  primary key (conversation_id, user_id)
);

create function private.send_message_alerts() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  resend_key text;
  r record;
  sent integer := 0;
  am boolean;
  about text;
  link text;
  subject text;
  body text;
begin
  select decrypted_secret into resend_key from vault.decrypted_secrets where name = 'resend_api_key';
  if resend_key is null then
    return 0;
  end if;

  for r in
    with unread as (
      select m.conversation_id, m.sender_id, m.created_at,
             case when m.sender_id = c.renter_id then c.host_id else c.renter_id end as recipient
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.read_at is null
        and m.created_at < now() - interval '5 minutes'
        and m.created_at > now() - interval '2 days'
    ), pending as (
      select conversation_id, recipient, (array_agg(sender_id))[1] as sender_id, max(created_at) as latest
      from unread
      group by conversation_id, recipient
    )
    select p.conversation_id, p.recipient, pp.email, pp.language,
           rp.display_name as recipient_name, sp.display_name as sender_name, l.title
    from pending p
    join public.private_profiles pp on pp.user_id = p.recipient
    join public.conversations c on c.id = p.conversation_id
    left join public.profiles rp on rp.id = p.recipient
    left join public.profiles sp on sp.id = p.sender_id
    left join public.listings l on l.id = c.listing_id
    left join private.message_alerts a on a.conversation_id = p.conversation_id and a.user_id = p.recipient
    where pp.message_emails
      and not pp.banned
      and pp.email not like '%@example.com'
      and (a.sent_at is null or (a.sent_at < p.latest and a.sent_at < now() - interval '1 hour'))
    limit 50
  loop
    am := r.language = 'am';
    link := 'https://kiraybet.org/messages/' || r.conversation_id;
    about := coalesce(r.title, '');
    if am then
      subject := coalesce(r.sender_name, 'አንድ ሰው') || ' በኪራይ ቤት መልዕክት ልከውልዎታል';
      body := concat_ws(E'\n',
        'ሰላም ' || coalesce(r.recipient_name, '') || '፣',
        '',
        coalesce(r.sender_name, 'አንድ ሰው') || case when about <> '' then ' ስለ “' || about || '” ' else ' ' end || 'መልዕክት ልከውልዎታል።',
        '',
        'ለማንበብና ለመመለስ፦ ' || link,
        '',
        'ለደህንነትዎ ሲባል መልዕክቶችን በኢሜይል አንልክም። ኪራይ ቤት ገንዘብ ወይም የይለፍ ቃል በፍጹም አይጠይቅዎትም።',
        'እነዚህን ኢሜይሎች ማቆም ከፈለጉ በመለያ ገጽዎ ያጥፏቸው፦ https://kiraybet.org/account');
    else
      subject := 'New message from ' || coalesce(r.sender_name, 'someone') || ' on KirayBet';
      body := concat_ws(E'\n',
        'Hi ' || coalesce(r.recipient_name, 'there') || ',',
        '',
        coalesce(r.sender_name, 'Someone') || ' sent you a message' || case when about <> '' then ' about “' || about || '”' else '' end || '.',
        '',
        'Read and reply: ' || link,
        '',
        'For your safety we never put messages in emails, and KirayBet will never ask you for money or passwords.',
        'Don''t want these emails? Turn them off on your account page: https://kiraybet.org/account');
    end if;

    perform net.http_post(
      url := 'https://api.resend.com/emails',
      body := jsonb_build_object(
        'from', 'KirayBet <hello@kiraybet.org>',
        'to', jsonb_build_array(r.email),
        'subject', subject,
        'text', body
      ),
      headers := jsonb_build_object('Authorization', 'Bearer ' || resend_key, 'Content-Type', 'application/json'),
      timeout_milliseconds := 10000
    );
    insert into private.message_alerts (conversation_id, user_id, sent_at)
    values (r.conversation_id, r.recipient, now())
    on conflict (conversation_id, user_id) do update set sent_at = excluded.sent_at;
    sent := sent + 1;
  end loop;
  return sent;
end;
$$;

revoke execute on function private.send_message_alerts() from public;

-- Turn on the HTTP and scheduler extensions and the 5-minute job where available
-- (the local test database has neither, so it skips this).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net')
     and exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_net with schema extensions;
    create extension if not exists pg_cron;
    perform cron.schedule('message-alerts', '*/5 * * * *', 'select private.send_message_alerts()');
  end if;
end;
$$;
