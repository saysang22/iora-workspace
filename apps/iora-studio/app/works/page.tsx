import WorksFilterClient from './WorksFilterClient'
import styles from './page.module.scss'
import { CLIENT_VOICES, WORK_ITEMS } from './works.shared'

export default function WorksPage() {
  return (
    <main className={styles.worksPage}>
      <section className={styles.heroSection} aria-labelledby='works-title'>
        <h1 id='works-title'>포트폴리오</h1>
        <p>
          AI 기반의 정밀한 설계와 React의 유연함을 결합하여 비즈니스의 가치를 높이는 독창적인 웹 경험을
          만듭니다.
        </p>
      </section>

      <WorksFilterClient items={WORK_ITEMS} />

      <section className={styles.voicesSection} aria-labelledby='voices-title'>
        <p className={styles.eyebrow}>CLIENT VOICES</p>
        <h2 id='voices-title' className={styles.screenReaderOnly}>
          고객 후기
        </h2>

        <div className={styles.voiceGrid}>
          {CLIENT_VOICES.map((voice) => (
            <article className={styles.voiceCard} key={`${voice.name}-${voice.role}`}>
              <blockquote>{voice.quote}</blockquote>
              <div className={styles.voiceMeta}>
                <strong>{voice.name}</strong>
                <span>{voice.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
