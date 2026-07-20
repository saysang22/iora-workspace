create unique index if not exists contact_requests_active_zoom_meeting_at_idx
on public.contact_requests (zoom_meeting_at)
where status in ('pending', 'confirmed');

create or replace function public.validate_contact_request_zoom_meeting()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  local_zoom_time timestamp;
  local_zoom_date date;
  local_zoom_slot text;
  active_date_count int;
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  local_zoom_time := timezone('Asia/Seoul', new.zoom_meeting_at);
  local_zoom_date := local_zoom_time::date;
  local_zoom_slot := to_char(local_zoom_time, 'HH24:MI');

  if local_zoom_slot not in ('10:30', '11:30', '12:30', '13:30', '14:30', '15:30') then
    raise exception 'Zoom meeting time must be one of the allowed slots.';
  end if;

  if exists (
    select 1
    from public.contact_requests
    where id is distinct from new.id
      and status in ('pending', 'confirmed')
      and zoom_meeting_at = new.zoom_meeting_at
  ) then
    raise exception 'The selected Zoom meeting slot is already reserved.';
  end if;

  select count(*)::int
  into active_date_count
  from public.contact_requests
  where id is distinct from new.id
    and status in ('pending', 'confirmed')
    and timezone('Asia/Seoul', zoom_meeting_at)::date = local_zoom_date;

  if active_date_count >= 3 then
    raise exception 'The selected Zoom meeting date is fully booked.';
  end if;

  return new;
end;
$$;

drop trigger if exists contact_requests_validate_zoom_meeting on public.contact_requests;
create trigger contact_requests_validate_zoom_meeting
before insert or update of zoom_meeting_at, status
on public.contact_requests
for each row
execute function public.validate_contact_request_zoom_meeting();

create or replace function public.get_zoom_meeting_availability(start_date date, end_date date)
returns table (
  work_date date,
  reserved_count int,
  is_unavailable boolean,
  reserved_times text[]
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
      timezone('Asia/Seoul', zoom_meeting_at)::date as work_date,
      count(*)::int as reserved_count,
      array_agg(
        to_char(timezone('Asia/Seoul', zoom_meeting_at), 'HH24:MI')
        order by timezone('Asia/Seoul', zoom_meeting_at)
      ) as reserved_times
    from public.contact_requests
    where status in ('pending', 'confirmed')
      and timezone('Asia/Seoul', zoom_meeting_at)::date between start_date and end_date
    group by timezone('Asia/Seoul', zoom_meeting_at)::date
  )
  select
    date_range.work_date,
    coalesce(reservation_counts.reserved_count, 0) as reserved_count,
    coalesce(reservation_counts.reserved_count, 0) >= 3 as is_unavailable,
    coalesce(reservation_counts.reserved_times, array[]::text[]) as reserved_times
  from date_range
  left join reservation_counts
    on reservation_counts.work_date = date_range.work_date
  order by date_range.work_date;
$$;

grant execute on function public.get_zoom_meeting_availability(date, date) to anon, authenticated;
