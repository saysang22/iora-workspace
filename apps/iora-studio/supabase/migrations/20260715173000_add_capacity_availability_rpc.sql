create or replace function public.get_capacity_availability(start_date date, end_date date)
returns table (
  work_date date,
  reserved_count int,
  max_capacity int,
  is_unavailable boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with date_range as (
    select generate_series(start_date, end_date, interval '1 day')::date as work_date
  ),
  reservation_counts as (
    select
      desired_deadline as work_date,
      count(*)::int as reserved_count
    from public.contact_requests
    where status in ('pending', 'confirmed')
      and desired_deadline between start_date and end_date
    group by desired_deadline
  )
  select
    date_range.work_date,
    coalesce(reservation_counts.reserved_count, 0) as reserved_count,
    capacity_settings.max_capacity,
    case
      when capacity_settings.work_date is null then false
      else coalesce(reservation_counts.reserved_count, 0) >= capacity_settings.max_capacity
    end as is_unavailable
  from date_range
  left join public.capacity_settings
    on capacity_settings.work_date = date_range.work_date
  left join reservation_counts
    on reservation_counts.work_date = date_range.work_date
  order by date_range.work_date;
$$;

grant execute on function public.get_capacity_availability(date, date) to anon, authenticated;
