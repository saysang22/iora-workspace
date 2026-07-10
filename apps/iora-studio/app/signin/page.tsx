import SignInClient from '../_components/SignInClient'
import styles from '../auth-page.module.scss'

export default function SignInPage() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby='signin-title'>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title} id='signin-title'>
          Sign in
        </h1>
        <p className={styles.description}>
          IORA STUDIO 계정으로 로그인하고 프로젝트와 문의 내역을 이어서 관리하세요.
        </p>
        <div className={styles.formWrap}>
          <SignInClient />
        </div>
      </section>
    </main>
  )
}
