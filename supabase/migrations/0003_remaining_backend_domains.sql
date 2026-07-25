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
