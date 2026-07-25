-- North Star backend foundation: auth profiles, care spaces, and care members.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0 and length(name) <= 120),
  description text check (description is null or length(description) <= 2000),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_members (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'caregiver', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (care_space_id, user_id)
);

create index if not exists care_members_care_space_id_idx on public.care_members(care_space_id);
create index if not exists care_members_user_id_idx on public.care_members(user_id);
create index if not exists care_spaces_owner_id_idx on public.care_spaces(owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists care_spaces_set_updated_at on public.care_spaces;
create trigger care_spaces_set_updated_at
before update on public.care_spaces
for each row execute function public.set_updated_at();

drop trigger if exists care_members_set_updated_at on public.care_members;
create trigger care_members_set_updated_at
before update on public.care_members
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.care_spaces enable row level security;
alter table public.care_members enable row level security;

create or replace function public.is_care_space_member(
  target_care_space_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.care_members cm
    where cm.care_space_id = target_care_space_id
      and cm.user_id = target_user_id
  );
$$;

create or replace function public.is_care_space_owner(
  target_care_space_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.care_members cm
    where cm.care_space_id = target_care_space_id
      and cm.user_id = target_user_id
      and cm.role = 'owner'
  );
$$;

grant execute on function public.is_care_space_member(uuid, uuid) to authenticated;
grant execute on function public.is_care_space_owner(uuid, uuid) to authenticated;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_self" on public.profiles;
create policy "profiles_delete_self" on public.profiles
for delete using (auth.uid() = id);

drop policy if exists "care_spaces_select_members" on public.care_spaces;
create policy "care_spaces_select_members" on public.care_spaces
for select using (public.is_care_space_member(id, auth.uid()));

drop policy if exists "care_spaces_insert_owner" on public.care_spaces;
create policy "care_spaces_insert_owner" on public.care_spaces
for insert with check (owner_id = auth.uid());

drop policy if exists "care_spaces_update_owners" on public.care_spaces;
create policy "care_spaces_update_owners" on public.care_spaces
for update using (public.is_care_space_owner(id, auth.uid()))
with check (public.is_care_space_owner(id, auth.uid()));

drop policy if exists "care_spaces_delete_owners" on public.care_spaces;
create policy "care_spaces_delete_owners" on public.care_spaces
for delete using (public.is_care_space_owner(id, auth.uid()));

drop policy if exists "care_members_select_members" on public.care_members;
create policy "care_members_select_members" on public.care_members
for select using (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "care_members_insert_owners" on public.care_members;
create policy "care_members_insert_owners" on public.care_members
for insert with check (
  public.is_care_space_owner(care_space_id, auth.uid())
  or (
    role = 'owner'
    and user_id = auth.uid()
    and exists (
      select 1
      from public.care_spaces cs
      where cs.id = care_space_id and cs.owner_id = auth.uid()
    )
  )
);

drop policy if exists "care_members_update_owners" on public.care_members;
create policy "care_members_update_owners" on public.care_members
for update using (public.is_care_space_owner(care_space_id, auth.uid()))
with check (public.is_care_space_owner(care_space_id, auth.uid()));

drop policy if exists "care_members_delete_owners" on public.care_members;
create policy "care_members_delete_owners" on public.care_members
for delete using (public.is_care_space_owner(care_space_id, auth.uid()));
