do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'payment_type'
  ) then
    create type public.payment_type as enum (
      'deposit',
      'interim',
      'final',
      'other'
    );
  end if;
end
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  amount bigint not null check (amount >= 0),
  payment_type public.payment_type not null default 'other',
  paid_at date not null,
  memo text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

grant select, insert, update, delete on table public.payments to authenticated;

alter table public.payments enable row level security;

create or replace function public.set_payments_updated_at()
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

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_payments_updated_at();

drop policy if exists "Admins can view all payments." on public.payments;
create policy "Admins can view all payments."
on public.payments
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert payments." on public.payments;
create policy "Admins can insert payments."
on public.payments
for insert
to authenticated
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update payments." on public.payments;
create policy "Admins can update payments."
on public.payments
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete payments." on public.payments;
create policy "Admins can delete payments."
on public.payments
for delete
to authenticated
using (public.is_admin((select auth.uid())));
