-- Dailey Check-In schema. Applied to the family's Supabase project.

create table if not exists public.checkins (
  member_id   text        not null,
  day         date        not null,           -- the check-in day (4 AM boundary, computed by the app)
  category_id text        not null,
  level_id    text        not null,
  score       smallint    not null check (score between 0 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (member_id, day)
);

create index if not exists checkins_day_idx on public.checkins (day desc);

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  member_id   text        not null,
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Where the daily reminder job should POST. Readable only by the database itself.
create table if not exists public.reminder_config (
  id          boolean     primary key default true check (id),
  url         text        not null,
  secret      text        not null
);

alter table public.checkins           enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminder_config    enable row level security;

-- The app has no logins: anyone with the family URL can read and write check-ins.
drop policy if exists "family can read checkins"   on public.checkins;
drop policy if exists "family can add checkins"    on public.checkins;
drop policy if exists "family can change checkins" on public.checkins;
create policy "family can read checkins"   on public.checkins for select to anon, authenticated using (true);
create policy "family can add checkins"    on public.checkins for insert to anon, authenticated with check (true);
create policy "family can change checkins" on public.checkins for update to anon, authenticated using (true) with check (true);

-- Devices can register or remove their own push subscription, but nobody can list them.
drop policy if exists "device can subscribe"   on public.push_subscriptions;
drop policy if exists "device can resubscribe" on public.push_subscriptions;
drop policy if exists "device can unsubscribe" on public.push_subscriptions;
create policy "device can subscribe"   on public.push_subscriptions for insert to anon, authenticated with check (true);
create policy "device can resubscribe" on public.push_subscriptions for update to anon, authenticated using (true) with check (true);
create policy "device can unsubscribe" on public.push_subscriptions for delete to anon, authenticated using (true);

-- Live updates for the TV board and phones.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'checkins'
  ) then
    alter publication supabase_realtime add table public.checkins;
  end if;
end $$;

-- Daily reminder: runs from pg_cron, finds subscribed family members who have not
-- checked in today, and hands their subscriptions to the app, which sends the pushes.
create or replace function public.send_checkin_reminders(force boolean default false)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  local_now  timestamp := (now() at time zone 'America/New_York');
  today      date;
  cfg        public.reminder_config%rowtype;
  payload    jsonb;
  n          integer;
begin
  -- Only fire during the 5 PM hour (Eastern) unless forced. Two UTC cron slots cover DST.
  if not force and extract(hour from local_now) <> 17 then
    return 0;
  end if;

  select * into cfg from public.reminder_config limit 1;
  if cfg.url is null then
    return 0;
  end if;

  -- The check-in day starts at 4 AM local.
  today := (local_now - interval '4 hours')::date;

  select jsonb_agg(jsonb_build_object(
           'member_id', s.member_id,
           'endpoint',  s.endpoint,
           'p256dh',    s.p256dh,
           'auth',      s.auth)),
         count(*)
    into payload, n
    from public.push_subscriptions s
   where not exists (
           select 1 from public.checkins c
            where c.member_id = s.member_id and c.day = today);

  if n = 0 then
    return 0;
  end if;

  perform net.http_post(
    url     := cfg.url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-reminder-secret', cfg.secret),
    body    := jsonb_build_object('day', today, 'subscriptions', payload)
  );
  return n;
end;
$$;

revoke all on function public.send_checkin_reminders(boolean) from public, anon, authenticated;

-- 5:30 PM Eastern is 21:30 UTC in summer and 22:30 UTC in winter; the function ignores the wrong one.
select cron.unschedule(jobid) from cron.job where jobname in ('checkin-reminder-edt', 'checkin-reminder-est');
select cron.schedule('checkin-reminder-edt', '30 21 * * *', $$select public.send_checkin_reminders()$$);
select cron.schedule('checkin-reminder-est', '30 22 * * *', $$select public.send_checkin_reminders()$$);
