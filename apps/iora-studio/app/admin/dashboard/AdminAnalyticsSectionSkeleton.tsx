import styles from './page.module.scss'

export default function AdminAnalyticsSectionSkeleton() {
  return (
    <section className={styles.analyticsPanel} aria-busy='true' aria-live='polite'>
      <div className={styles.analyticsHeader}>
        <div>
          <h2 className={styles.tableTitle}>방문자 통계</h2>
          <p className={styles.analyticsDescription}>방문자 통계를 불러오는 중입니다.</p>
        </div>

        <div className={styles.analyticsPeriodTabs}>
          <span className={styles.analyticsPeriodSkeleton} />
          <span className={styles.analyticsPeriodSkeleton} />
          <span className={styles.analyticsPeriodSkeleton} />
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <article className={`${styles.analyticsCard} ${styles.analyticsCardSkeleton}`.trim()}>
          <div className={styles.analyticsSkeletonTitle} />
          <div className={styles.analyticsSkeletonValue} />
          <div className={styles.analyticsChartSkeleton}>
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className={styles.analyticsChartSkeletonBar} />
            ))}
          </div>
        </article>

        <article className={`${styles.analyticsCard} ${styles.analyticsCardSkeleton}`.trim()}>
          <div className={styles.analyticsSkeletonTitle} />
          <div className={styles.analyticsListSkeleton}>
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className={styles.analyticsListSkeletonItem} />
            ))}
          </div>
        </article>

        <article className={`${styles.analyticsCard} ${styles.analyticsCardSkeleton}`.trim()}>
          <div className={styles.analyticsSkeletonTitle} />
          <div className={styles.analyticsListSkeleton}>
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className={styles.analyticsListSkeletonItem} />
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
