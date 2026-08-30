-- Waitlist for the scenes.chat landing page.
-- Anonymous visitors may insert their own email and nothing else.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Insert-only for anon. No select policy, so the list is not publicly readable.
drop policy if exists "anon can join the waitlist" on public.waitlist;
create policy "anon can join the waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);
