do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'project_stage'
  ) then
    create type public.project_stage as enum (
      'analysis',
      'planning',
      'development',
      'qa',
      'launch',
      'care',
      'completed'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'page_status'
  ) then
    create type public.page_status as enum (
      'pending',
      'in_progress',
      'completed'
    );
  end if;
end
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_name text not null,
  current_stage public.project_stage not null default 'analysis',
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  started_at date not null default current_date,
  care_ended_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  page_name text not null,
  status public.page_status not null default 'pending',
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.project_pages to authenticated;

alter table public.projects enable row level security;
alter table public.project_pages enable row level security;

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();

create or replace function public.set_project_pages_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists project_pages_set_updated_at on public.project_pages;
create trigger project_pages_set_updated_at
before update on public.project_pages
for each row
execute function public.set_project_pages_updated_at();

drop policy if exists "Users can view own projects." on public.projects;
create policy "Users can view own projects."
on public.projects
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Admins can view all projects." on public.projects;
create policy "Admins can view all projects."
on public.projects
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert projects." on public.projects;
create policy "Admins can insert projects."
on public.projects
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update projects." on public.projects;
create policy "Admins can update projects."
on public.projects
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete projects." on public.projects;
create policy "Admins can delete projects."
on public.projects
for delete
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Users can view own project pages." on public.project_pages;
create policy "Users can view own project pages."
on public.project_pages
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_pages.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can view all project pages." on public.project_pages;
create policy "Admins can view all project pages."
on public.project_pages
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert project pages." on public.project_pages;
create policy "Admins can insert project pages."
on public.project_pages
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update project pages." on public.project_pages;
create policy "Admins can update project pages."
on public.project_pages
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete project pages." on public.project_pages;
create policy "Admins can delete project pages."
on public.project_pages
for delete
to authenticated
using (public.is_admin((select auth.uid())));
