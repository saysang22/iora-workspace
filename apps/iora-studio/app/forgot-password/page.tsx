import Link from 'next/link'
import styles from '../auth-page.module.scss'

export default function ForgotPasswordPage() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby='forgot-password-title'>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title} id='forgot-password-title'>
          비밀번호 찾기
        </h1>
        <p className={styles.description}>
          현재 비밀번호 재설정 메일 발송 기능은 준비 중입니다. 빠른 도움이 필요하시면 문의 페이지를 통해
          요청해 주세요.
        </p>
        <div className={styles.formWrap}>
          <Link href='/contact'>문의하기로 이동</Link>
        </div>
      </section>
    </main>
  )
}
