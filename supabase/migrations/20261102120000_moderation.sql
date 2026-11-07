create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_user_id uuid,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create policy "users read their blocks" on public.blocks
  for select using (auth.uid() = blocker_id);
