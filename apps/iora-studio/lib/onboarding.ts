import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from './database.types'

export type OnboardingProfile = Pick<
  Tables<'profiles'>,
  | 'id'
  | 'company_name'
  | 'full_name'
  | 'phone_number'
  | 'website_url'
  | 'onboarding_completed'
>

export const ONBOARDING_PROFILE_COLUMNS =
  'id, company_name, full_name, phone_number, website_url, onboarding_completed'

export function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function isOnboardingComplete(profile: OnboardingProfile | null | undefined) {
  if (!profile) {
    return false
  }

  return Boolean(
    normalizeOptionalText(profile.company_name) && profile.onboarding_completed,
  )
}

export async function fetchOnboardingProfile(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await client
    .from('profiles')
    .select(ONBOARDING_PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<OnboardingProfile>()

  if (error) {
    throw new Error(error.message)
  }

  return data ?? null
}

export async function resolvePostAuthPath(
  client: SupabaseClient<Database>,
  userId: string,
  nextPath?: string | null,
) {
  const profile = await fetchOnboardingProfile(client, userId)

  if (isOnboardingComplete(profile)) {
    return nextPath || '/home'
  }

  return '/onboarding'
}
