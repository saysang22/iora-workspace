begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmed_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin-local@example.com',
    'x',
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"관리자 테스트","company_name":"이오라스튜디오"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'client-local@example.com',
    'x',
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"고객 테스트","company_name":"테스트컴퍼니"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do nothing;

update public.profiles
set is_admin = true
where id = '11111111-1111-1111-1111-111111111111';

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select public.create_project_with_pages(
  '22222222-2222-2222-2222-222222222222',
  '로컬 등록 테스트 프로젝트',
  'development',
  45,
  '2026-07-20',
  '2026-08-31',
  jsonb_build_array(
    jsonb_build_object('page_name', '메인 페이지', 'status', 'pending', 'sort_order', 0),
    jsonb_build_object('page_name', '문의 페이지', 'status', 'in_progress', 'sort_order', 1)
  )
) as project_id;

select p.project_name, p.current_stage, p.progress_percent, p.started_at, p.care_ended_at, pr.company_name
from public.projects p
join public.profiles pr on pr.id = p.user_id
where p.project_name = '로컬 등록 테스트 프로젝트';

select page_name, status, sort_order
from public.project_pages
where project_id = (
  select id
  from public.projects
  where project_name = '로컬 등록 테스트 프로젝트'
  order by created_at desc
  limit 1
)
order by sort_order;

commit;
