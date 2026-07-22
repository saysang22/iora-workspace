create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text,
  thumbnail_url text,
  category text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

grant select, insert, update, delete on table public.portfolios to authenticated;
grant select on table public.portfolios to anon;

alter table public.portfolios enable row level security;

create or replace function public.set_portfolios_updated_at()
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

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
before update on public.portfolios
for each row
execute function public.set_portfolios_updated_at();

drop policy if exists "Anyone can view published portfolios." on public.portfolios;
create policy "Anyone can view published portfolios."
on public.portfolios
for select
to public
using (is_published = true);

drop policy if exists "Admins can view all portfolios." on public.portfolios;
create policy "Admins can view all portfolios."
on public.portfolios
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert portfolios." on public.portfolios;
create policy "Admins can insert portfolios."
on public.portfolios
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update portfolios." on public.portfolios;
create policy "Admins can update portfolios."
on public.portfolios
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete portfolios." on public.portfolios;
create policy "Admins can delete portfolios."
on public.portfolios
for delete
to authenticated
using (public.is_admin((select auth.uid())));
