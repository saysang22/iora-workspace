import { cache } from 'react'
import { headers } from 'next/headers'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { createServerSupabaseClient } from './supabase-server'

export const ADMIN_PATHNAME_HEADER = 'x-iora-pathname'
export const ADMIN_PROFILE_HEADER = 'x-iora-admin-profile'
export const ADMIN_USER_ID_HEADER = 'x-iora-admin-user-id'

export type AdminProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'email' | 'full_name' | 'company_name' | 'is_admin'
>

export type AdminAuthState = {
  profile: AdminProfile | null
  user: User | null
}

export function serializeAdminProfileHeader(profile: AdminProfile) {
  return encodeURIComponent(JSON.stringify(profile))
}

export function deserializeAdminProfileHeader(value: string | null) {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as AdminProfile

    if (!parsed?.email || typeof parsed.is_admin !== 'boolean') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export async function fetchAdminAuthState() {
  const supabase = await createServerSupabaseClient()

  return fetchAdminAuthStateWithClient(supabase)
}

export async function fetchAdminAuthStateWithClient(
  client: SupabaseClient<Database>,
): Promise<AdminAuthState> {
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return {
      user: null,
      profile: null,
    }
  }

  const { data: profile } = await client
    .from('profiles')
    .select('email, full_name, company_name, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    profile,
  }
}

export const getCachedAdminRequestState = cache(async (): Promise<AdminAuthState> => {
  const headerStore = await headers()
  const serializedProfile = headerStore.get(ADMIN_PROFILE_HEADER)
  const serializedUserId = headerStore.get(ADMIN_USER_ID_HEADER)
  const profile = deserializeAdminProfileHeader(serializedProfile)

  if (profile && serializedUserId) {
    return {
      user: { id: serializedUserId } as User,
      profile,
    }
  }

  return fetchAdminAuthState()
})
