import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePostAuthPath } from '../../../lib/onboarding'

const OAUTH_FROM_COOKIE = 'iora_oauth_from'
const OAUTH_NEXT_COOKIE = 'iora_oauth_next'

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
  const code = request.nextUrl.searchParams.get('code')
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
  const authError =
    request.nextUrl.searchParams.get('error_description') ??
    request.nextUrl.searchParams.get('error')

  if (authError) {
    return buildErrorRedirect(request, fromPath, authError, nextPath)
  }

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

  if (!code) {
    return buildErrorRedirect(
      request,
      fromPath,
      '인증 코드를 찾지 못했습니다. 다시 시도해 주세요.',
      nextPath,
    )
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

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
      '로그인 세션을 확인하지 못했습니다. 다시 시도해 주세요.',
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

  return redirectResponse
}
