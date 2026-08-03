create or replace function public.recalculate_project_progress_percent(target_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects
  set progress_percent = (
    select
      case
        when count(*) = 0 then 0
        else round(
          (
            count(*) filter (where status = 'completed')::numeric
            / count(*)::numeric
          ) * 100
        )::int
      end
    from public.project_pages
    where project_id = target_project_id
  )
  where id = target_project_id;
end;
$$;

create or replace function public.sync_project_progress_from_pages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_project_progress_percent(old.project_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.project_id is distinct from new.project_id then
    perform public.recalculate_project_progress_percent(old.project_id);
  end if;

  perform public.recalculate_project_progress_percent(new.project_id);
  return new;
end;
$$;

drop trigger if exists project_pages_sync_progress_percent on public.project_pages;
create trigger project_pages_sync_progress_percent
after insert or update or delete on public.project_pages
for each row
execute function public.sync_project_progress_from_pages();
