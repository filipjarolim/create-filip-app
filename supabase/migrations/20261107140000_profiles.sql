create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.reports
  drop constraint if exists reports_reporter_id_fkey;
alter table public.reports
  add constraint reports_reporter_id_fkey
  foreign key (reporter_id) references auth.users (id) on delete cascade;

alter table public.blocks
  drop constraint if exists blocks_blocker_id_fkey;
alter table public.blocks
  add constraint blocks_blocker_id_fkey
  foreign key (blocker_id) references auth.users (id) on delete cascade;

alter table public.blocks
  drop constraint if exists blocks_blocked_id_fkey;
alter table public.blocks
  add constraint blocks_blocked_id_fkey
  foreign key (blocked_id) references auth.users (id) on delete cascade;

create policy "insert own block"
  on public.blocks
  for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create or replace function private.confirm_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.confirm_email() from public, anon, authenticated;

drop trigger if exists confirm_email on auth.users;
create trigger confirm_email
  before insert on auth.users
  for each row execute function private.confirm_email();
