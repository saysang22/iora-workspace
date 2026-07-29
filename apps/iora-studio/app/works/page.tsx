import type { Metadata } from 'next'
import { createPageMetadata } from '../../lib/seo'
import WorksFilterClient from './WorksFilterClient'
import styles from './page.module.scss'
import { CLIENT_VOICES, WORK_ITEMS } from './works.shared'

export const metadata: Metadata = createPageMetadata({
  title: '작업물',
  description:
    '이오라 스튜디오가 제작한 기업 홈페이지, 랜딩페이지, 쇼핑몰, 유지보수 사례를 한눈에 살펴볼 수 있는 포트폴리오 페이지입니다.',
  path: '/works',
})

export default function WorksPage() {
  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '이오라 스튜디오 포트폴리오',
    url: 'https://www.iora-studio.com/works',
    description:
      '기업 홈페이지, 랜딩페이지, 쇼핑몰, 유지보수 사례를 모아둔 이오라 스튜디오 작업물 페이지',
  }

  return (
    <main className={styles.worksPage}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
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
