do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'contact_request_status'
  ) then
    create type public.contact_request_status as enum (
      'pending',
      'confirmed',
      'rejected'
    );
  end if;
end
$$;

create table if not exists public.capacity_settings (
  id uuid primary key default gen_random_uuid(),
  work_date date not null unique,
  max_capacity int not null default 1 check (max_capacity >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  service_type text not null,
  budget_range text,
  desired_deadline date not null,
  zoom_meeting_at timestamptz not null,
  reference_site text,
  background_tone text,
  point_color text,
  request_details text not null,
  status public.contact_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists contact_requests_desired_deadline_status_idx
on public.contact_requests (desired_deadline, status);

grant select on table public.capacity_settings to anon, authenticated;
grant insert, update, delete on table public.capacity_settings to authenticated;

grant insert on table public.contact_requests to anon, authenticated;
grant select, update, delete on table public.contact_requests to authenticated;

alter table public.capacity_settings enable row level security;
alter table public.contact_requests enable row level security;

create or replace function public.set_capacity_settings_updated_at()
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

drop trigger if exists capacity_settings_set_updated_at on public.capacity_settings;
create trigger capacity_settings_set_updated_at
before update on public.capacity_settings
for each row
execute function public.set_capacity_settings_updated_at();

create or replace function public.set_contact_requests_updated_at()
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

drop trigger if exists contact_requests_set_updated_at on public.contact_requests;
create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row
execute function public.set_contact_requests_updated_at();

drop policy if exists "Anyone can view capacity settings." on public.capacity_settings;
create policy "Anyone can view capacity settings."
on public.capacity_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert capacity settings." on public.capacity_settings;
create policy "Admins can insert capacity settings."
on public.capacity_settings
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update capacity settings." on public.capacity_settings;
create policy "Admins can update capacity settings."
on public.capacity_settings
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete capacity settings." on public.capacity_settings;
create policy "Admins can delete capacity settings."
on public.capacity_settings
for delete
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Anyone can create contact requests." on public.contact_requests;
create policy "Anyone can create contact requests."
on public.contact_requests
for insert
to anon, authenticated
with check (
  (
    (select auth.uid()) is null
    and user_id is null
  )
  or (
    (select auth.uid()) is not null
    and (user_id is null or user_id = (select auth.uid()))
  )
);

drop policy if exists "Users can view own contact requests." on public.contact_requests;
create policy "Users can view own contact requests."
on public.contact_requests
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Admins can view all contact requests." on public.contact_requests;
create policy "Admins can view all contact requests."
on public.contact_requests
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert contact requests." on public.contact_requests;
create policy "Admins can insert contact requests."
on public.contact_requests
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update contact requests." on public.contact_requests;
create policy "Admins can update contact requests."
on public.contact_requests
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete contact requests." on public.contact_requests;
create policy "Admins can delete contact requests."
on public.contact_requests
for delete
to authenticated
using (public.is_admin((select auth.uid())));
