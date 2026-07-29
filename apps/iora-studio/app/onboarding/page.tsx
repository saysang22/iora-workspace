import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'
import styles from './page.module.scss'
import { createServerSupabaseClient } from '../../lib/supabase-server'
import {
  fetchOnboardingProfile,
  isOnboardingComplete,
  normalizeOptionalText,
} from '../../lib/onboarding'
import { NO_INDEX_METADATA } from '../../lib/seo'

export const metadata: Metadata = NO_INDEX_METADATA

function readUserMetadataText(
  value: unknown,
) {
  return typeof value === 'string' ? value : null
}

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent('/onboarding')}`)
  }

  const profile = await fetchOnboardingProfile(supabase, user.id)

  if (isOnboardingComplete(profile)) {
    redirect('/home')
  }

  const managerName =
    normalizeOptionalText(profile?.full_name) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.full_name)) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.name)) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.user_name)) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.nickname)) ??
    ''

  const phone =
    normalizeOptionalText(profile?.phone_number) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.phone_number)) ??
    ''

  const companyName =
    normalizeOptionalText(profile?.company_name) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.company_name)) ??
    ''

  const websiteUrl =
    normalizeOptionalText(profile?.website_url) ??
    normalizeOptionalText(readUserMetadataText(user.user_metadata?.website_url)) ??
    ''

  return (
    <main className={styles.onboardingPage}>
      <section className={styles.onboardingCard} aria-labelledby='onboarding-title'>
        <p className={styles.eyebrow}>Onboarding</p>
        <h1 className={styles.title} id='onboarding-title'>
          업체 정보를 입력해 주세요
        </h1>
        <p className={styles.description}>
          서비스 이용을 위해 기본 업체 정보를 등록해 주세요.
        </p>
        <div className={styles.formWrap}>
          <OnboardingClient
            initialValues={{
              companyName,
              managerName,
              phone,
              websiteUrl,
            }}
          />
        </div>
      </section>
    </main>
  )
}
