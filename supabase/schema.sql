-- GospelLift secure backend foundation (Supabase Postgres + Storage)
-- Apply only to the dedicated GospelLift Supabase project after verifying the project ref.
-- Admin access is controlled by trusted app_metadata.role, never user-editable user_metadata.

create extension if not exists pgcrypto;

create table if not exists public.artist_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_submissions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null default '',
  song_title text not null default '',
  genre text not null default '',
  release_status text not null default 'Not sure yet'
    check (release_status in ('Not released yet','Already released','Upcoming release','Not sure yet')),
  goal text not null default '',
  song_story text not null default '',
  artist_background text not null default '',
  music_link text not null default '',
  audio_object_path text,
  rights_confirmed boolean not null default false,
  consent_to_process boolean not null default false,
  status text not null default 'submitted'
    check (status in ('draft','submitted','in_review','needs_changes','approved','completed','rejected')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artist_submissions_artist_created_idx
  on public.artist_submissions (artist_id, created_at desc);
create index if not exists artist_submissions_status_created_idx
  on public.artist_submissions (status, created_at desc);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.artist_submissions(id) on delete cascade,
  artist_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  objective text not null default '',
  status text not null default 'planned'
    check (status in ('planned','in_progress','paused','completed','cancelled')),
  start_date date,
  end_date date,
  budget_amount numeric(12,2),
  budget_currency text not null default 'NGN',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_artist_created_idx
  on public.campaigns (artist_id, created_at desc);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type text not null,
  description text not null default '',
  event_date timestamptz not null default now(),
  metric_name text,
  metric_value numeric(14,2),
  metric_unit text,
  external_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists campaign_events_campaign_date_idx
  on public.campaign_events (campaign_id, event_date desc);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Generic timestamp trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists artist_profiles_set_updated_at on public.artist_profiles;
create trigger artist_profiles_set_updated_at before update on public.artist_profiles
for each row execute function public.set_updated_at();
drop trigger if exists artist_submissions_set_updated_at on public.artist_submissions;
create trigger artist_submissions_set_updated_at before update on public.artist_submissions
for each row execute function public.set_updated_at();
drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns
for each row execute function public.set_updated_at();

-- Create an artist profile on sign-up. No client-supplied role is accepted.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.artist_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_gospellift on auth.users;
create trigger on_auth_user_created_gospellift
after insert on auth.users for each row execute function public.handle_new_user();

alter table public.artist_profiles enable row level security;
alter table public.artist_submissions enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_events enable row level security;
alter table public.audit_events enable row level security;

-- Profiles: artists can read/update their own non-role profile; admins can read all.
drop policy if exists "profile_select_own_or_admin" on public.artist_profiles;
create policy "profile_select_own_or_admin" on public.artist_profiles
for select to authenticated
using (id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "profile_update_own" on public.artist_profiles;
create policy "profile_update_own" on public.artist_profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Artists can create and read only their own submissions. They cannot set status
-- or rewrite submitted records via direct table updates; status transitions are admin-only.
drop policy if exists "submission_select_own_or_admin" on public.artist_submissions;
create policy "submission_select_own_or_admin" on public.artist_submissions
for select to authenticated
using (artist_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "submission_insert_own" on public.artist_submissions;
create policy "submission_insert_own" on public.artist_submissions
for insert to authenticated
with check (artist_id = (select auth.uid()) and status in ('draft','submitted'));

drop policy if exists "submission_admin_update" on public.artist_submissions;
create policy "submission_admin_update" on public.artist_submissions
for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "submission_admin_delete" on public.artist_submissions;
create policy "submission_admin_delete" on public.artist_submissions
for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Artists can see campaigns linked to their own artist_id; only admins manage them.
drop policy if exists "campaign_select_own_or_admin" on public.campaigns;
create policy "campaign_select_own_or_admin" on public.campaigns
for select to authenticated
using (artist_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "campaign_admin_insert" on public.campaigns;
create policy "campaign_admin_insert" on public.campaigns
for insert to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "campaign_admin_update" on public.campaigns;
create policy "campaign_admin_update" on public.campaigns
for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "campaign_admin_delete" on public.campaigns;
create policy "campaign_admin_delete" on public.campaigns
for delete to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Campaign reporting events are admin-managed, readable only by admins for now.
drop policy if exists "campaign_event_admin_all" on public.campaign_events;
create policy "campaign_event_admin_all" on public.campaign_events
for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "audit_admin_select" on public.audit_events;
create policy "audit_admin_select" on public.audit_events
for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "audit_admin_insert" on public.audit_events;
create policy "audit_admin_insert" on public.audit_events
for insert to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Private audio bucket. Objects must be stored under <auth.uid()>/<submission-id>/<filename>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artist-audio',
  'artist-audio',
  false,
  52428800,
  array['audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/flac','audio/ogg','audio/webm']
)
on conflict (id) do update
set public = false, file_size_limit = 52428800,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "audio_artist_upload_own_folder" on storage.objects;
create policy "audio_artist_upload_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'artist-audio'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "audio_artist_read_own_or_admin" on storage.objects;
create policy "audio_artist_read_own_or_admin" on storage.objects
for select to authenticated
using (
  bucket_id = 'artist-audio'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
);

drop policy if exists "audio_artist_delete_own_unsubmitted_or_admin" on storage.objects;
create policy "audio_artist_delete_own_unsubmitted_or_admin" on storage.objects
for delete to authenticated
using (
  bucket_id = 'artist-audio'
  and (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (
      (storage.foldername(name))[1] = (select auth.uid())::text
      and not exists (
        select 1 from public.artist_submissions s
        where s.audio_object_path = name and s.status not in ('draft','submitted')
      )
    )
  )
);

-- No public bucket, no anonymous access, and no client-side service-role key.
