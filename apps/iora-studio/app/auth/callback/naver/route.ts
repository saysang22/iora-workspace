import { NextResponse, type NextRequest } from 'next/server'
import { createAdminSupabaseClient } from '../../../../lib/supabase-admin'
import {
  exchangeNaverCodeForToken,
  fetchNaverUserProfile,
} from '../../../../lib/naverOAuth'

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

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(NAVER_STATE_COOKIE, '', {
    maxAge: 0,
    path: '/',
  })

  return response
}

function extractActionLink(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null
  }

  if ('action_link' in data && typeof data.action_link === 'string') {
    return data.action_link
  }

  if ('properties' in data && data.properties && typeof data.properties === 'object') {
    const properties = data.properties as { action_link?: unknown }
    return typeof properties.action_link === 'string'
      ? properties.action_link
      : null
  }

  return null
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const cookieState = request.cookies.get(NAVER_STATE_COOKIE)?.value ?? null
  const cookieNextPath = request.cookies.get(OAUTH_NEXT_COOKIE)?.value ?? null
  const cookieFromPath = request.cookies.get(OAUTH_FROM_COOKIE)?.value ?? null
  const nextPath = sanitizeRelativePath(cookieNextPath, '/home')
  const fromPath = sanitizeRelativePath(cookieFromPath, '/signin')
  const authError =
    request.nextUrl.searchParams.get('error_description') ??
    request.nextUrl.searchParams.get('error')

  if (authError) {
    return buildErrorRedirect(request, fromPath, authError, nextPath)
  }

  if (!code || !state) {
    return buildErrorRedirect(
      request,
      fromPath,
      'naver_oauth_missing_code',
      nextPath,
    )
  }

  if (!cookieState || cookieState !== state) {
    return buildErrorRedirect(
      request,
      fromPath,
      'naver_oauth_state_mismatch',
      nextPath,
    )
  }

  try {
    const accessToken = await exchangeNaverCodeForToken(code, state)
    const profile = await fetchNaverUserProfile(accessToken)

    if (!profile.email) {
      return buildErrorRedirect(request, fromPath, 'naver_email_required', nextPath)
    }

    const supabaseAdmin = createAdminSupabaseClient()
    const confirmRedirectUrl = new URL('/auth/confirm', request.url)

    confirmRedirectUrl.searchParams.set('next', nextPath)
    confirmRedirectUrl.searchParams.set('from', fromPath)

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
      options: {
        redirectTo: confirmRedirectUrl.toString(),
      },
    })

    if (error) {
      return buildErrorRedirect(
        request,
        fromPath,
        error.message || 'naver_magiclink_generation_failed',
        nextPath,
      )
    }

    const actionLink = extractActionLink(data)

    if (!actionLink) {
      return buildErrorRedirect(
        request,
        fromPath,
        'naver_magiclink_generation_failed',
        nextPath,
      )
    }

    const response = NextResponse.redirect(actionLink)
    response.cookies.set(NAVER_STATE_COOKIE, '', {
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'naver_oauth_callback_failed'

    return buildErrorRedirect(request, fromPath, message, nextPath)
  }
}
