import { NextResponse, type NextRequest } from 'next/server'
import { buildNaverAuthorizationUrl } from '../../../lib/naverOAuth'

const OAUTH_FROM_COOKIE = 'iora_oauth_from'
const OAUTH_NEXT_COOKIE = 'iora_oauth_next'
const NAVER_STATE_COOKIE = 'iora_naver_oauth_state'

function sanitizeRelativePath(path: string | null, fallback: string) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return fallback
  }

  return path
}

function buildErrorRedirect(
  request: NextRequest,
  fromPath: string,
  errorMessage: string,
  nextPath: string | null,
) {
  const redirectUrl = new URL(fromPath, request.url)
  redirectUrl.searchParams.set('error', errorMessage)

  if (nextPath) {
    redirectUrl.searchParams.set('next', nextPath)
  }

  return NextResponse.redirect(redirectUrl)
}

export async function GET(request: NextRequest) {
  const nextPath = sanitizeRelativePath(
    request.nextUrl.searchParams.get('next'),
    '/home',
  )
  const fromPath = sanitizeRelativePath(
    request.nextUrl.searchParams.get('from'),
    '/signin',
  )

  try {
    const state = crypto.randomUUID()
    const authorizationUrl = buildNaverAuthorizationUrl(state)
    const response = NextResponse.redirect(authorizationUrl)
    const secure = request.nextUrl.protocol === 'https:'

    response.cookies.set(OAUTH_FROM_COOKIE, fromPath, {
      maxAge: 600,
      path: '/',
      sameSite: 'lax',
      secure,
    })
    response.cookies.set(OAUTH_NEXT_COOKIE, nextPath, {
      maxAge: 600,
      path: '/',
      sameSite: 'lax',
      secure,
    })
    response.cookies.set(NAVER_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 600,
      path: '/',
      sameSite: 'lax',
      secure,
    })

    return response
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'naver_oauth_start_failed'

    return buildErrorRedirect(request, fromPath, message, nextPath)
  }
}
