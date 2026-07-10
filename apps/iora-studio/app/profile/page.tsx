import ProfileEditClient from '../_components/ProfileEditClient'
import styles from './page.module.scss'

export default function ProfilePage() {
  return (
    <main className={styles.profilePage}>
      <section className={styles.profileCard} aria-labelledby='profile-title'>
        <p className={styles.eyebrow}>My Profile</p>
        <h1 className={styles.title} id='profile-title'>
          회원 정보 수정
        </h1>
        <p className={styles.description}>
          저장된 계정 정보를 확인하고 필요한 항목만 안전하게 수정해 보세요.
        </p>
        <div className={styles.formWrap}>
          <ProfileEditClient />
        </div>
      </section>
    </main>
  )
}
