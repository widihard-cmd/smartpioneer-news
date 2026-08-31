alter table public.guestbook_messages
  alter column is_approved set default true;

drop policy if exists "Public can submit guestbook messages" on public.guestbook_messages;
create policy "Public can submit guestbook messages" on public.guestbook_messages
  for insert to anon, authenticated with check (
    is_approved = true
    and char_length(trim(display_name)) between 2 and 40
    and char_length(trim(message)) between 4 and 300
  );
