import { supabase } from '../../lib/supabase'

type SupportedSocialProvider = 'google' | 'kakao'
export type SocialProvider = SupportedSocialProvider | 'naver'

const OAUTH_FROM_COOKIE = 'iora_oauth_from'
const OAUTH_NEXT_COOKIE = 'iora_oauth_next'

type StartSocialAuthOptions = {
  nextPath?: string | null
  provider: SocialProvider
  returnPath: '/signin' | '/signup'
}

function sanitizeRelativePath(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return null
  }

  return path
}

function setOAuthNavigationCookies(
  returnPath: '/signin' | '/signup',
  nextPath: string | null,
) {
  document.cookie = `${OAUTH_FROM_COOKIE}=${encodeURIComponent(returnPath)}; Path=/; Max-Age=600; SameSite=Lax`

  if (nextPath) {
    document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(nextPath)}; Path=/; Max-Age=600; SameSite=Lax`
    return
  }

  document.cookie = `${OAUTH_NEXT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

async function startKakaoAuth({
  nextPath,
  returnPath,
}: Omit<StartSocialAuthOptions, 'provider'>) {
  const safeNextPath = sanitizeRelativePath(nextPath)

  setOAuthNavigationCookies(returnPath, safeNextPath)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Kakao OAuth URL]', data.url)
    }

    window.location.assign(data.url)
  }

  return {}
}

export async function startSocialAuth({
  nextPath,
  provider,
  returnPath,
}: StartSocialAuthOptions) {
  if (provider === 'naver') {
    return {
      error: '네이버 로그인은 현재 준비 중입니다. 추후 Custom OAuth 연동으로 연결할 예정입니다.',
    }
  }

  if (typeof window === 'undefined') {
    return {
      error: '브라우저 환경에서만 소셜 로그인을 시작할 수 있습니다.',
    }
  }

  if (provider === 'kakao') {
    return startKakaoAuth({
      nextPath,
      returnPath,
    })
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    window.location.assign(data.url)
  }

  return {}
}
