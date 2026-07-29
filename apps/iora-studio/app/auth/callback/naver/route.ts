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

function extractHashedToken(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null
  }

  if ('hashed_token' in data && typeof data.hashed_token === 'string') {
    return data.hashed_token
  }

  if ('properties' in data && data.properties && typeof data.properties === 'object') {
    const properties = data.properties as { hashed_token?: unknown }
    return typeof properties.hashed_token === 'string'
      ? properties.hashed_token
      : null
  }

  return null
}

async function findSupabaseUserByEmail(email: string) {
  const supabaseAdmin = createAdminSupabaseClient()
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw new Error(error.message || 'supabase_user_lookup_failed')
    }

    const users = data.users ?? []
    const matchedUser = users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    )

    if (matchedUser) {
      return matchedUser
    }

    if (users.length < perPage) {
      return null
    }

    page += 1
  }
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
    const existingUser = await findSupabaseUserByEmail(profile.email)

    if (!existingUser) {
      const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: profile.email,
        email_confirm: true,
        user_metadata: {
          full_name: profile.name ?? profile.nickname ?? null,
          name: profile.name ?? profile.nickname ?? null,
          nickname: profile.nickname ?? null,
          phone_number: profile.mobile ?? null,
          provider: 'naver',
          naver_id: profile.id ?? null,
        },
      })

      if (createUserError) {
        return buildErrorRedirect(
          request,
          fromPath,
          createUserError.message || 'naver_user_creation_failed',
          nextPath,
        )
      }
    }

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

    const hashedToken = extractHashedToken(data)

    if (!hashedToken) {
      return buildErrorRedirect(
        request,
        fromPath,
        'naver_magiclink_generation_failed',
        nextPath,
      )
    }

    const confirmUrl = new URL('/auth/confirm', request.url)
    confirmUrl.searchParams.set('token_hash', hashedToken)
    confirmUrl.searchParams.set('type', 'email')
    confirmUrl.searchParams.set('next', nextPath)
    confirmUrl.searchParams.set('from', fromPath)

    const response = NextResponse.redirect(confirmUrl)
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
