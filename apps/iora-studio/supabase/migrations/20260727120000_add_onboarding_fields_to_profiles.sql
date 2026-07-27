alter table public.profiles
  alter column email drop not null,
  add column if not exists website_url text,
  add column if not exists onboarding_completed boolean not null default false;

update public.profiles
set onboarding_completed = true
where nullif(btrim(company_name), '') is not null
  and onboarding_completed = false;

drop policy if exists "Users can insert own profile." on public.profiles;
create policy "Users can insert own profile."
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
