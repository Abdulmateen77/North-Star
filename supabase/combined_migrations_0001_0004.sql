-- North Star: combined migrations 0001-0004
-- Generated for manual run in Supabase SQL Editor


-- ===== 0001_backend_foundation.sql =====

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


-- ===== 0002_health_records.sql =====

-- Health Records bounded context: documents, OCR/AI analysis, and normalized medical records.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'health-records',
  'health-records',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  document_type text,
  title text not null check (length(trim(title)) > 0 and length(title) <= 255),
  storage_url text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  status text not null default 'uploaded' check (status in ('uploaded', 'analyzing', 'analyzed', 'failed', 'deleted')),
  version integer not null default 1 check (version > 0),
  original_document_id uuid references public.documents(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.document_analysis (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  extracted_text text not null,
  structured_json jsonb not null,
  summary text,
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  date date,
  time text,
  location text,
  department text,
  clinician text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  dosage text,
  frequency text,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  severity text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_instructions (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  instruction text not null check (length(trim(instruction)) > 0),
  category text,
  priority text,
  created_at timestamptz not null default now()
);

create index if not exists documents_care_space_id_idx on public.documents(care_space_id);
create index if not exists documents_uploaded_by_idx on public.documents(uploaded_by);
create index if not exists documents_status_idx on public.documents(status);
create index if not exists documents_deleted_at_idx on public.documents(deleted_at);
create index if not exists document_analysis_care_space_id_idx on public.document_analysis(care_space_id);
create index if not exists document_analysis_document_id_idx on public.document_analysis(document_id);
create index if not exists appointments_care_space_id_idx on public.appointments(care_space_id);
create index if not exists appointments_document_id_idx on public.appointments(document_id);
create index if not exists medications_care_space_id_idx on public.medications(care_space_id);
create index if not exists medications_document_id_idx on public.medications(document_id);
create index if not exists conditions_care_space_id_idx on public.conditions(care_space_id);
create index if not exists conditions_document_id_idx on public.conditions(document_id);
create index if not exists medical_instructions_care_space_id_idx on public.medical_instructions(care_space_id);
create index if not exists medical_instructions_document_id_idx on public.medical_instructions(document_id);

alter table public.documents enable row level security;
alter table public.document_analysis enable row level security;
alter table public.appointments enable row level security;
alter table public.medications enable row level security;
alter table public.conditions enable row level security;
alter table public.medical_instructions enable row level security;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- Documents are scoped to the care space. The API uses the service role after explicit auth checks,
-- but these policies keep direct authenticated access constrained as well.
drop policy if exists "documents_select_members" on public.documents;
create policy "documents_select_members" on public.documents
for select using (public.is_care_space_member(care_space_id, auth.uid()) and deleted_at is null);

drop policy if exists "documents_insert_members" on public.documents;
create policy "documents_insert_members" on public.documents
for insert with check (
  public.is_care_space_member(care_space_id, auth.uid())
  and uploaded_by = auth.uid()
);

drop policy if exists "documents_update_members" on public.documents;
create policy "documents_update_members" on public.documents
for update using (public.is_care_space_member(care_space_id, auth.uid()))
with check (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "document_analysis_select_members" on public.document_analysis;
create policy "document_analysis_select_members" on public.document_analysis
for select using (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "appointments_select_members" on public.appointments;
create policy "appointments_select_members" on public.appointments
for select using (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "medications_select_members" on public.medications;
create policy "medications_select_members" on public.medications
for select using (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "conditions_select_members" on public.conditions;
create policy "conditions_select_members" on public.conditions
for select using (public.is_care_space_member(care_space_id, auth.uid()));

drop policy if exists "medical_instructions_select_members" on public.medical_instructions;
create policy "medical_instructions_select_members" on public.medical_instructions
for select using (public.is_care_space_member(care_space_id, auth.uid()));

-- Private storage object access is also scoped to care-space folder prefixes.
drop policy if exists "health_records_storage_select_members" on storage.objects;
create policy "health_records_storage_select_members" on storage.objects
for select using (
  bucket_id = 'health-records'
  and public.is_care_space_member((storage.foldername(name))[1]::uuid, auth.uid())
);

drop policy if exists "health_records_storage_insert_members" on storage.objects;
create policy "health_records_storage_insert_members" on storage.objects
for insert with check (
  bucket_id = 'health-records'
  and public.is_care_space_member((storage.foldername(name))[1]::uuid, auth.uid())
);


-- ===== 0003_remaining_backend_domains.sql =====

-- Remaining backend domains: Care Management, Timeline, Collaboration, Notifications, Dashboard/Analytics read models.

create extension if not exists pgcrypto;

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  summary text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  title text not null check (length(trim(title)) > 0 and length(title) <= 200),
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_reminders (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  title text not null check (length(trim(title)) > 0 and length(title) <= 200),
  description text,
  status text not null default 'scheduled' check (status in ('scheduled', 'triggered', 'dismissed', 'missed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  scheduled_for timestamptz not null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  source_domain text not null,
  source_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'caregiver', 'viewer')),
  invited_by uuid not null references auth.users(id) on delete restrict,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  target_type text not null,
  target_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'push')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'push')),
  endpoint text not null,
  created_at timestamptz not null default now(),
  unique (care_space_id, user_id, channel, endpoint)
);

create index if not exists care_tasks_care_space_id_idx on public.care_tasks(care_space_id);
create index if not exists care_tasks_assigned_to_idx on public.care_tasks(assigned_to);
create index if not exists care_tasks_status_idx on public.care_tasks(status);
create index if not exists care_reminders_care_space_id_idx on public.care_reminders(care_space_id);
create index if not exists care_reminders_scheduled_for_idx on public.care_reminders(scheduled_for);
create index if not exists timeline_events_care_space_created_idx on public.timeline_events(care_space_id, created_at desc);
create index if not exists invitations_care_space_id_idx on public.invitations(care_space_id);
create index if not exists comments_care_space_id_idx on public.comments(care_space_id);
create index if not exists activity_feed_care_space_created_idx on public.activity_feed(care_space_id, created_at desc);
create index if not exists notifications_recipient_idx on public.notifications(care_space_id, recipient_id, created_at desc);

alter table public.care_plans enable row level security;
alter table public.care_tasks enable row level security;
alter table public.care_reminders enable row level security;
alter table public.timeline_events enable row level security;
alter table public.invitations enable row level security;
alter table public.comments enable row level security;
alter table public.activity_feed enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_subscriptions enable row level security;

drop trigger if exists care_plans_set_updated_at on public.care_plans;
create trigger care_plans_set_updated_at before update on public.care_plans for each row execute function public.set_updated_at();
drop trigger if exists care_tasks_set_updated_at on public.care_tasks;
create trigger care_tasks_set_updated_at before update on public.care_tasks for each row execute function public.set_updated_at();
drop trigger if exists care_reminders_set_updated_at on public.care_reminders;
create trigger care_reminders_set_updated_at before update on public.care_reminders for each row execute function public.set_updated_at();

-- Membership-scoped policies. API writes use the service role after explicit authorization; policies protect direct authenticated access.
do $$
begin
  execute 'drop policy if exists care_plans_members_all on public.care_plans';
  execute 'create policy care_plans_members_all on public.care_plans for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists care_tasks_members_all on public.care_tasks';
  execute 'create policy care_tasks_members_all on public.care_tasks for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists care_reminders_members_all on public.care_reminders';
  execute 'create policy care_reminders_members_all on public.care_reminders for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists timeline_events_members_all on public.timeline_events';
  execute 'create policy timeline_events_members_all on public.timeline_events for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists invitations_members_all on public.invitations';
  execute 'create policy invitations_members_all on public.invitations for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists comments_members_all on public.comments';
  execute 'create policy comments_members_all on public.comments for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists activity_feed_members_all on public.activity_feed';
  execute 'create policy activity_feed_members_all on public.activity_feed for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists notifications_members_all on public.notifications';
  execute 'create policy notifications_members_all on public.notifications for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
  execute 'drop policy if exists notification_subscriptions_members_all on public.notification_subscriptions';
  execute 'create policy notification_subscriptions_members_all on public.notification_subscriptions for all using (public.is_care_space_member(care_space_id, auth.uid())) with check (public.is_care_space_member(care_space_id, auth.uid()))';
end $$;


-- ===== 0004_audit_logs.sql =====

-- Durable audit logs for production-readiness and compliance evidence.

create extension if not exists pgcrypto;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  care_space_id uuid not null references public.care_spaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) > 0),
  source_domain text not null check (length(trim(source_domain)) > 0),
  source_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_care_space_created_idx on public.audit_logs(care_space_id, created_at desc);
create index if not exists audit_logs_actor_created_idx on public.audit_logs(actor_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_source_idx on public.audit_logs(source_domain, source_id);

alter table public.audit_logs enable row level security;

-- Audit logs are written by server-side service-role repositories after explicit authorization.
-- Direct authenticated reads are owner-only because audit logs can contain sensitive operational metadata.
drop policy if exists "audit_logs_select_owners" on public.audit_logs;
create policy "audit_logs_select_owners" on public.audit_logs
for select using (public.is_care_space_owner(care_space_id, auth.uid()));

