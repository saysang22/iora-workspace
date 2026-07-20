create or replace function public.create_project_with_pages(
  input_user_id uuid,
  input_project_name text,
  input_current_stage public.project_stage default 'analysis',
  input_progress_percent int default 0,
  input_started_at date default current_date,
  input_care_ended_at date default null,
  input_pages jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_project_id uuid;
  page_item jsonb;
  page_name_value text;
  page_status_value public.page_status;
  page_sort_order int;
begin
  if not public.is_admin((select auth.uid())) then
    raise exception 'Only admins can create projects.'
      using errcode = '42501';
  end if;

  if input_user_id is null then
    raise exception 'A customer must be selected.';
  end if;

  if nullif(trim(input_project_name), '') is null then
    raise exception 'Project name is required.';
  end if;

  if input_progress_percent < 0 or input_progress_percent > 100 then
    raise exception 'Progress percent must be between 0 and 100.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = input_user_id
  ) then
    raise exception 'The selected customer does not exist.';
  end if;

  insert into public.projects (
    user_id,
    project_name,
    current_stage,
    progress_percent,
    started_at,
    care_ended_at
  )
  values (
    input_user_id,
    trim(input_project_name),
    input_current_stage,
    input_progress_percent,
    coalesce(input_started_at, current_date),
    input_care_ended_at
  )
  returning id into new_project_id;

  for page_item in
    select value
    from jsonb_array_elements(coalesce(input_pages, '[]'::jsonb))
  loop
    page_name_value := nullif(trim(page_item ->> 'page_name'), '');

    if page_name_value is null then
      raise exception 'Each project page must include a page name.';
    end if;

    page_status_value := coalesce((page_item ->> 'status')::public.page_status, 'pending'::public.page_status);
    page_sort_order := coalesce((page_item ->> 'sort_order')::int, 0);

    insert into public.project_pages (
      project_id,
      page_name,
      status,
      sort_order
    )
    values (
      new_project_id,
      page_name_value,
      page_status_value,
      page_sort_order
    );
  end loop;

  return new_project_id;
end;
$$;

grant execute on function public.create_project_with_pages(
  uuid,
  text,
  public.project_stage,
  int,
  date,
  date,
  jsonb
) to authenticated;
