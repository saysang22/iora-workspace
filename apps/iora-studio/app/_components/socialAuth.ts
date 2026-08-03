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

type SocialAuthResult = {
  error?: string
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
}: Omit<StartSocialAuthOptions, 'provider'>): Promise<SocialAuthResult> {
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
    window.location.assign(data.url)
  }

  return {}
}

function startNaverAuth({
  nextPath,
  returnPath,
}: Omit<StartSocialAuthOptions, 'provider'>): SocialAuthResult {
  const safeNextPath = sanitizeRelativePath(nextPath)

  setOAuthNavigationCookies(returnPath, safeNextPath)

  const authUrl = new URL('/auth/naver', window.location.origin)
  authUrl.searchParams.set('from', returnPath)

  if (safeNextPath) {
    authUrl.searchParams.set('next', safeNextPath)
  }

  window.location.assign(authUrl.toString())

  return {}
}

export async function startSocialAuth({
  nextPath,
  provider,
  returnPath,
}: StartSocialAuthOptions): Promise<SocialAuthResult> {
  if (typeof window === 'undefined') {
    return {
      error: '브라우저 환경에서만 소셜 로그인을 시작할 수 있습니다.',
    }
  }

  if (provider === 'naver') {
    return startNaverAuth({
      nextPath,
      returnPath,
    })
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
