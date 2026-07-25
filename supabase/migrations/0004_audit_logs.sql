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
