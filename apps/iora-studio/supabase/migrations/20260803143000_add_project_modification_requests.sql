do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'project_modification_request_status'
  ) then
    create type public.project_modification_request_status as enum (
      'pending',
      'review',
      'in_progress',
      'completed'
    );
  end if;
end
$$;

create table if not exists public.project_modification_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  status public.project_modification_request_status not null default 'pending',
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  requested_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists project_modification_requests_project_id_idx
  on public.project_modification_requests(project_id, requested_at desc);

create index if not exists project_modification_requests_requester_id_idx
  on public.project_modification_requests(requester_id, requested_at desc);

create index if not exists project_modification_requests_status_idx
  on public.project_modification_requests(status);

create or replace function public.set_project_modification_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists project_modification_requests_set_updated_at on public.project_modification_requests;
create trigger project_modification_requests_set_updated_at
before update on public.project_modification_requests
for each row
execute function public.set_project_modification_request_updated_at();

alter table public.project_modification_requests enable row level security;

drop policy if exists "Users can view own project modification requests." on public.project_modification_requests;
create policy "Users can view own project modification requests."
on public.project_modification_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_modification_requests.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert own project modification requests." on public.project_modification_requests;
create policy "Users can insert own project modification requests."
on public.project_modification_requests
for insert
to authenticated
with check (
  requester_id = (select auth.uid())
  and exists (
    select 1
    from public.projects
    where projects.id = project_modification_requests.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can manage project modification requests." on public.project_modification_requests;
create policy "Admins can manage project modification requests."
on public.project_modification_requests
for all
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

insert into storage.buckets (id, name, public)
values ('modification-request-attachments', 'modification-request-attachments', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Owners and admins can view modification request attachments." on storage.objects;
create policy "Owners and admins can view modification request attachments."
on storage.objects
for select
to authenticated
using (
  bucket_id = 'modification-request-attachments'
  and (
    public.is_admin((select auth.uid()))
    or (storage.foldername(name))[1] = (select auth.uid()::text)
  )
);

drop policy if exists "Owners and admins can upload modification request attachments." on storage.objects;
create policy "Owners and admins can upload modification request attachments."
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'modification-request-attachments'
  and (
    public.is_admin((select auth.uid()))
    or (storage.foldername(name))[1] = (select auth.uid()::text)
  )
);

drop policy if exists "Owners and admins can update modification request attachments." on storage.objects;
create policy "Owners and admins can update modification request attachments."
on storage.objects
for update
to authenticated
using (
  bucket_id = 'modification-request-attachments'
  and (
    public.is_admin((select auth.uid()))
    or (storage.foldername(name))[1] = (select auth.uid()::text)
  )
)
with check (
  bucket_id = 'modification-request-attachments'
  and (
    public.is_admin((select auth.uid()))
    or (storage.foldername(name))[1] = (select auth.uid()::text)
  )
);

drop policy if exists "Owners and admins can delete modification request attachments." on storage.objects;
create policy "Owners and admins can delete modification request attachments."
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'modification-request-attachments'
  and (
    public.is_admin((select auth.uid()))
    or (storage.foldername(name))[1] = (select auth.uid()::text)
  )
);
