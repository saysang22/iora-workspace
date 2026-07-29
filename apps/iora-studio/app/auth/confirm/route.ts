import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePostAuthPath } from '../../../lib/onboarding'

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
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  const cookieNextPath = request.cookies.get(OAUTH_NEXT_COOKIE)?.value ?? null
  const cookieFromPath = request.cookies.get(OAUTH_FROM_COOKIE)?.value ?? null
  const nextPath = sanitizeRelativePath(
    request.nextUrl.searchParams.get('next') ?? cookieNextPath,
    '/home',
  )
  const fromPath = sanitizeRelativePath(
    request.nextUrl.searchParams.get('from') ?? cookieFromPath,
    '/signin',
  )
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  if (!tokenHash || !type) {
    return buildErrorRedirect(request, fromPath, 'auth_confirm_invalid', nextPath)
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    return buildErrorRedirect(request, fromPath, error.message, nextPath)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return buildErrorRedirect(
      request,
      fromPath,
      'auth_confirm_user_not_found',
      nextPath,
    )
  }

  const destinationPath = await resolvePostAuthPath(supabase, user.id, nextPath)
  const redirectUrl = new URL(destinationPath, request.url)
  const redirectResponse = NextResponse.redirect(redirectUrl)

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  redirectResponse.cookies.set(OAUTH_FROM_COOKIE, '', {
    maxAge: 0,
    path: '/',
  })
  redirectResponse.cookies.set(OAUTH_NEXT_COOKIE, '', {
    maxAge: 0,
    path: '/',
  })
  redirectResponse.cookies.set(NAVER_STATE_COOKIE, '', {
    maxAge: 0,
    path: '/',
  })

  return redirectResponse
}
