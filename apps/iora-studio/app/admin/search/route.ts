import { NextResponse } from 'next/server'
import { fetchAdminAuthStateWithClient } from '../../../lib/admin-auth'
import { searchAdminRecords } from '../../../lib/adminSearch'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  if (query.length < 2) {
    return NextResponse.json({
      projects: [],
      contacts: [],
    })
  }

  const supabase = await createServerSupabaseClient()
  const { user, profile } = await fetchAdminAuthStateWithClient(supabase)

  if (!user || !profile?.is_admin) {
    return NextResponse.json(
      {
        message: '관리자만 접근할 수 있습니다.',
      },
      { status: 403 },
    )
  }

  try {
    const result = await searchAdminRecords(supabase, query)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'

    return NextResponse.json(
      {
        message,
      },
      { status: 500 },
    )
  }
}
