'use client'

import { Spinner } from '@iora/ui'
import styles from './page.module.scss'

const LOADING_LABEL = '\uB370\uC774\uD130\uB97C \uC9D1\uACC4\uD558\uACE0 \uC788\uC5B4\uC694'

export default function AdminAnalyticsSectionSkeleton() {
  return (
    <section className={styles.analyticsPanel} aria-busy='true' aria-live='polite'>
      <div className={styles.analyticsLoadingPanel}>
        <Spinner centered size={34} label={LOADING_LABEL} />
      </div>
    </section>
  )
}
