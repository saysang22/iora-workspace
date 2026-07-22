insert into storage.buckets (id, name, public)
values ('portfolio-thumbnails', 'portfolio-thumbnails', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view portfolio thumbnails." on storage.objects;
create policy "Public can view portfolio thumbnails."
on storage.objects
for select
to public
using (bucket_id = 'portfolio-thumbnails');

drop policy if exists "Admins can upload portfolio thumbnails." on storage.objects;
create policy "Admins can upload portfolio thumbnails."
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-thumbnails'
  and public.is_admin((select auth.uid()))
);

drop policy if exists "Admins can update portfolio thumbnails." on storage.objects;
create policy "Admins can update portfolio thumbnails."
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-thumbnails'
  and public.is_admin((select auth.uid()))
)
with check (
  bucket_id = 'portfolio-thumbnails'
  and public.is_admin((select auth.uid()))
);

drop policy if exists "Admins can delete portfolio thumbnails." on storage.objects;
create policy "Admins can delete portfolio thumbnails."
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-thumbnails'
  and public.is_admin((select auth.uid()))
);
