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

  if local_zoom_slot not in (
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00'
  ) then
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
