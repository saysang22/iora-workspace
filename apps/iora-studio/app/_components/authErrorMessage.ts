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
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  }

  if (normalized.includes('user not found')) {
    return '등록되지 않은 계정입니다.'
  }

  if (normalized.includes('network')) {
    return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  if (
    normalized.includes('koe205') ||
    normalized.includes('invalid_scope') ||
    normalized.includes('redirect uri') ||
    normalized.includes('redirect_uri')
  ) {
    return '카카오 로그인 설정을 다시 확인해주세요.'
  }

  if (
    normalized.includes('provider is not enabled') ||
    normalized.includes('unsupported provider')
  ) {
    return '현재 이 로그인 방식은 아직 사용할 수 없습니다.'
  }

  return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
}
