import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './page.module.scss'
import { getWorkBySlug, WORK_ITEMS } from '../works.shared'

type WorkDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return WORK_ITEMS.map((item) => ({
    slug: item.slug,
  }))
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = getWorkBySlug(slug)

  if (!work) {
    notFound()
  }

  const [heroArtifact, ...detailArtifacts] = work.artifacts

  return (
    <main className={styles.detailPage}>
      <section className={styles.introSection} aria-labelledby='work-title'>
        <div className={styles.introHeader}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>CASE STUDY</p>
            <h1 id='work-title'>{work.title}</h1>
          </div>

          <dl className={styles.metaGrid}>
            <div>
              <dt>CLIENT</dt>
              <dd>{work.client}</dd>
            </div>
            <div>
              <dt>TIMELINE</dt>
              <dd>{work.timeline}</dd>
            </div>
            <div>
              <dt>SERVICE</dt>
              <dd>{work.service}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.overviewRow}>
          <p className={styles.overviewText}>{work.overview}</p>
        </div>
      </section>

      <section className={styles.heroMediaSection}>
        <div className={styles.heroMediaWrap}>
          <Image
            src={heroArtifact.src}
            alt={heroArtifact.alt}
            fill
            priority
            sizes='100vw'
          />
        </div>
      </section>

      <section className={styles.insightSection} aria-label='프로젝트 인사이트'>
        <article className={styles.insightCard}>
          <h2>문제</h2>
          <p>{work.challenge}</p>
        </article>
        <article className={styles.insightCard}>
          <h2>해결 방향</h2>
          <p>{work.solution}</p>
        </article>
        <article className={styles.insightCard}>
          <h2>결과</h2>
          <p>{work.result}</p>
        </article>
      </section>

      <section className={styles.artifactsSection} aria-labelledby='artifacts-title'>
        <div className={styles.artifactsHeader}>
          <p className={styles.eyebrow}>DESIGN ARTIFACTS</p>
          <h2 id='artifacts-title' className={styles.screenReaderOnly}>
            디자인 아티팩트
          </h2>
        </div>

        <div className={styles.artifactStack}>
          {detailArtifacts.map((artifact) => (
            <article
              className={
                artifact.kind === 'mobile'
                  ? styles.mobileArtifactCard
                  : artifact.kind === 'monitor'
                    ? styles.monitorArtifactCard
                    : styles.artifactCard
              }
              key={`${work.slug}-${artifact.kind}`}
            >
              <div className={styles.artifactImageWrap}>
                <Image
                  src={artifact.src}
                  alt={artifact.alt}
                  fill
                  sizes='(max-width: 900px) 100vw, 1232px'
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection} aria-labelledby='work-cta-title'>
        <div className={styles.ctaCard}>
          <h2 id='work-cta-title'>비슷한 프로젝트가 필요하신가요?</h2>
          <p>IORA Studio가 비즈니스에 어울리는 설계와 화면 경험을 함께 제안해 드립니다.</p>
          <Link className={styles.ctaButton} href='/contact'>
            상담 신청하기
          </Link>
        </div>
      </section>
    </main>
  )
}
