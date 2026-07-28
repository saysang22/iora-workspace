create or replace function public.block_social_auto_link_for_password_accounts(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  provider_name text := lower(coalesce(event -> 'user' -> 'app_metadata' ->> 'provider', ''));
  normalized_email text := lower(nullif(trim(event -> 'user' ->> 'email'), ''));
  has_password_identity boolean := false;
begin
  if provider_name not in ('kakao', 'google', 'naver') then
    return event;
  end if;

  if normalized_email is null then
    return event;
  end if;

  select exists (
    select 1
    from auth.identities as identities
    where lower(coalesce(identities.email, '')) = normalized_email
      and identities.provider = 'email'
  )
  into has_password_identity;

  raise log
    'before_user_created social auto-link check provider=% email=% has_password_identity=%',
    provider_name,
    normalized_email,
    has_password_identity;

  if has_password_identity then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code',
        400,
        'message',
        'SOCIAL_LOGIN_BLOCKED_EXISTING_PASSWORD_ACCOUNT'
      )
    );
  end if;

  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.block_social_auto_link_for_password_accounts(jsonb)
  to supabase_auth_admin;

revoke execute
  on function public.block_social_auto_link_for_password_accounts(jsonb)
  from anon, authenticated, public;
