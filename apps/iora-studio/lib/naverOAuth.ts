import 'server-only'

const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize'
const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token'
const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me'

type NaverTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type NaverProfileApiResponse = {
  message?: string
  response?: {
    email?: string
    id?: string
    mobile?: string
    mobile_e164?: string
    name?: string
    nickname?: string
  }
  resultcode?: string
}

export type NaverUserProfile = {
  email: string | null
  id: string | null
  mobile: string | null
  name: string | null
  nickname: string | null
}

function getRequiredNaverEnv() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  const redirectUri = process.env.NAVER_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('naver_oauth_not_configured')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

export function buildNaverAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = getRequiredNaverEnv()
  const url = new URL(NAVER_AUTHORIZE_URL)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  return url.toString()
}

export async function exchangeNaverCodeForToken(code: string, state: string) {
  const { clientId, clientSecret } = getRequiredNaverEnv()
  const url = new URL(NAVER_TOKEN_URL)

  url.searchParams.set('grant_type', 'authorization_code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('client_secret', clientSecret)
  url.searchParams.set('code', code)
  url.searchParams.set('state', state)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  const data = (await response.json()) as NaverTokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error || data.error_description || 'naver_oauth_token_exchange_failed',
    )
  }

  return data.access_token
}

export async function fetchNaverUserProfile(
  accessToken: string,
): Promise<NaverUserProfile> {
  const response = await fetch(NAVER_PROFILE_URL, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = (await response.json()) as NaverProfileApiResponse

  if (!response.ok || data.resultcode !== '00') {
    throw new Error(data.message || 'naver_oauth_profile_fetch_failed')
  }

  return {
    email: data.response?.email?.trim() || null,
    id: data.response?.id?.trim() || null,
    mobile: data.response?.mobile_e164?.trim() || data.response?.mobile?.trim() || null,
    name: data.response?.name?.trim() || null,
    nickname: data.response?.nickname?.trim() || null,
  }
}
