import type { Metadata } from 'next'
import SignUpClient from '../_components/SignUpClient'
import styles from './SignUpPageLayout.module.scss'
import { NO_INDEX_METADATA } from '../../lib/seo'

export const metadata: Metadata = NO_INDEX_METADATA

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const initialError = resolvedSearchParams?.error ?? null

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby='signup-title'>
        <p className={styles.eyebrow}>Create Account</p>
        <h1 className={styles.title} id='signup-title'>
          Sign up
        </h1>
        <p className={styles.description}>
          이메일로 간단히 가입하고 IORA STUDIO와 함께 작업 흐름을 시작해 보세요.
        </p>
        <div className={styles.formWrap}>
          <SignUpClient initialError={initialError} />
        </div>
      </section>
    </main>
  )
}
