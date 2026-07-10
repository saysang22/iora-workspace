import SignUpClient from '../_components/SignUpClient'
import styles from './SignUpPageLayout.module.scss'

export default function SignUpPage() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby='signup-title'>
        <p className={styles.eyebrow}>Create Account</p>
        <h1 className={styles.title} id='signup-title'>
          Sign up
        </h1>
        <p className={styles.description}>
          이메일로 간단히 가입하고 IORA STUDIO와의 작업 흐름을 시작해 보세요.
        </p>
        <div className={styles.formWrap}>
          <SignUpClient />
        </div>
      </section>
    </main>
  )
}
