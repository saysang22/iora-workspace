import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_PATHNAME_HEADER,
  ADMIN_PROFILE_HEADER,
  ADMIN_USER_ID_HEADER,
  fetchAdminAuthStateWithClient,
  serializeAdminProfileHeader,
} from './lib/admin-auth'

const ADMIN_PATH_PREFIX = '/admin'

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(ADMIN_PATHNAME_HEADER, request.nextUrl.pathname)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const isAdminRoute =
    request.nextUrl.pathname === ADMIN_PATH_PREFIX || request.nextUrl.pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)

  if (!isAdminRoute) {
    await supabase.auth.getUser()
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const { user, profile } = await fetchAdminAuthStateWithClient(supabase)

  if (!user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    redirectUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(redirectUrl)
  }

  if (!profile?.is_admin) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/home'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  requestHeaders.set(ADMIN_USER_ID_HEADER, user.id)
  requestHeaders.set(ADMIN_PROFILE_HEADER, serializeAdminProfileHeader(profile))

  const nextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.cookies.getAll().forEach((cookie) => {
    nextResponse.cookies.set(cookie)
  })

  response = nextResponse

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
