create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  phone_number text,
  company_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create or replace function public.set_profiles_updated_at()
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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone_number, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    company_name = excluded.company_name,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists sync_profile_from_auth_user on auth.users;
create trigger sync_profile_from_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_profile_from_auth_user();

insert into public.profiles (id, email, full_name, phone_number, company_name)
select
  users.id,
  users.email,
  users.raw_user_meta_data ->> 'full_name',
  users.raw_user_meta_data ->> 'phone_number',
  users.raw_user_meta_data ->> 'company_name'
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  phone_number = excluded.phone_number,
  company_name = excluded.company_name,
  updated_at = timezone('utc', now());

update public.profiles
set is_admin = true
where email = 'saysang2212@gmail.com';

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and is_admin = true
  );
$$;

drop policy if exists "Users can view own profile." on public.profiles;
create policy "Users can view own profile."
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Admins can view all profiles." on public.profiles;
create policy "Admins can view all profiles."
on public.profiles
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert profiles." on public.profiles;
create policy "Admins can insert profiles."
on public.profiles
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update profiles." on public.profiles;
create policy "Admins can update profiles."
on public.profiles
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete profiles." on public.profiles;
create policy "Admins can delete profiles."
on public.profiles
for delete
to authenticated
using (public.is_admin((select auth.uid())));
