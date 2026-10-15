-- Run in Supabase SQL Editor. Replace every admin email placeholder first.
create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  thumbnail_url text not null,
  video_url text not null,
  screenshots text[] not null default '{}',
  description text not null check (char_length(description) <= 5000),
  category text not null check (category in ('Gameplay','Trailer','News','Rumor','Community','Screenshots')),
  status text not null default 'draft' check (status in ('draft','published')),
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migration for an existing table from the previous starter version.
alter table public.videos add column if not exists screenshots text[] not null default '{}';
alter table public.videos drop constraint if exists videos_category_check;
alter table public.videos add constraint videos_category_check check (category in ('Gameplay','Trailer','News','Rumor','Community','Screenshots'));
alter table public.videos enable row level security;

drop policy if exists "Public can read published videos" on public.videos;
create policy "Public can read published videos" on public.videos for select
using (status = 'published' or auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');

drop policy if exists "Admin can insert videos" on public.videos;
create policy "Admin can insert videos" on public.videos for insert to authenticated
with check (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');

drop policy if exists "Admin can update videos" on public.videos;
create policy "Admin can update videos" on public.videos for update
using (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL')
with check (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');

drop policy if exists "Admin can delete videos" on public.videos;
create policy "Admin can delete videos" on public.videos for delete to authenticated
using (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');

create index if not exists videos_published_created_idx on public.videos (status, created_at desc);
