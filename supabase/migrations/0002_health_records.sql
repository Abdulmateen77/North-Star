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
