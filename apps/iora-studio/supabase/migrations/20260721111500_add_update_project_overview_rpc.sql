create or replace function public.update_project_overview(
  input_project_id uuid,
  input_project_name text,
  input_started_at date default current_date,
  input_deadline date default null,
  input_care_ended_at date default null,
  input_total_amount bigint default null,
  input_deposit_amount bigint default null
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_project_name text;
  updated_project public.projects;
begin
  if not public.is_admin((select auth.uid())) then
    raise exception 'Only admins can update projects.'
      using errcode = '42501';
  end if;

  normalized_project_name := nullif(trim(input_project_name), '');

  if normalized_project_name is null then
    raise exception 'Project name is required.';
  end if;

  if input_total_amount is not null and input_total_amount < 0 then
    raise exception 'Total amount must be zero or greater.';
  end if;

  if input_deposit_amount is not null and input_deposit_amount < 0 then
    raise exception 'Deposit amount must be zero or greater.';
  end if;

  if input_total_amount is not null
     and input_deposit_amount is not null
     and input_deposit_amount > input_total_amount then
    raise exception 'Deposit amount cannot exceed the total amount.';
  end if;

  update public.projects
  set
    project_name = normalized_project_name,
    started_at = coalesce(input_started_at, current_date),
    deadline = input_deadline,
    care_ended_at = input_care_ended_at,
    total_amount = input_total_amount,
    deposit_amount = input_deposit_amount
  where id = input_project_id
  returning * into updated_project;

  if updated_project.id is null then
    raise exception 'Project not found.';
  end if;

  return updated_project;
end;
$$;

grant execute on function public.update_project_overview(
  uuid,
  text,
  date,
  date,
  date,
  bigint,
  bigint
) to authenticated;
