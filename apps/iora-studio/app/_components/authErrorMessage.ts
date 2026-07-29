export function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid_credentials')
  ) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }

  if (
    normalized.includes('email rate limit exceeded') ||
    normalized.includes('too many requests')
  ) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (normalized.includes('user not found')) {
    return '등록되지 않은 계정입니다.'
  }

  if (normalized.includes('network')) {
    return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (
    normalized.includes('koe205') ||
    normalized.includes('invalid_scope') ||
    normalized.includes('redirect uri') ||
    normalized.includes('redirect_uri')
  ) {
    return '카카오 로그인 설정을 다시 확인해 주세요.'
  }

  if (
    normalized.includes('provider is not enabled') ||
    normalized.includes('unsupported provider')
  ) {
    return '현재 이 로그인 방식은 아직 사용할 수 없습니다.'
  }

  if (
    normalized.includes('naver_oauth_not_configured') ||
    normalized.includes('supabase_admin_not_configured')
  ) {
    return '네이버 로그인 설정이 아직 완료되지 않았습니다. 환경변수를 확인해 주세요.'
  }

  if (
    normalized.includes('naver_oauth_state_mismatch') ||
    normalized.includes('csrf')
  ) {
    return '네이버 로그인 검증에 실패했습니다. 다시 시도해 주세요.'
  }

  if (
    normalized.includes('naver_email_required') ||
    normalized.includes('email information is required')
  ) {
    return '네이버 계정에서 이메일 정보를 확인할 수 없습니다. 네이버 동의 항목 설정을 확인해 주세요.'
  }

  if (
    normalized.includes('naver_oauth_token_exchange_failed') ||
    normalized.includes('naver_oauth_profile_fetch_failed') ||
    normalized.includes('naver_magiclink_generation_failed') ||
    normalized.includes('naver_oauth_missing_code')
  ) {
    return '네이버 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (
    normalized.includes('auth_confirm_invalid') ||
    normalized.includes('auth_confirm_user_not_found')
  ) {
    return '로그인 확인 링크를 처리하지 못했습니다. 다시 시도해 주세요.'
  }

  return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}
