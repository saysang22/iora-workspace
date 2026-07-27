import type { ReactNode } from 'react'
import styles from './AdminPageHeader.module.scss'

type AdminPageHeaderSummary = {
  label: string
  meta?: string
  tone?: 'lime' | 'pink' | 'slate'
  value: string
  valueSize?: 'default' | 'compact'
}

type AdminPageHeaderProps = {
  actions?: ReactNode
  description: string
  eyebrow: string
  leading?: ReactNode
  summary?: AdminPageHeaderSummary
  summaryContent?: ReactNode
  title: string
  titleSuffix?: ReactNode
}

export default function AdminPageHeader({
  actions,
  description,
  eyebrow,
  leading,
  summary,
  summaryContent,
  title,
  titleSuffix,
}: AdminPageHeaderProps) {
  const summaryToneClassName =
    summary?.tone === 'pink'
      ? styles.summaryValuePink
      : summary?.tone === 'slate'
        ? styles.summaryValueSlate
        : styles.summaryValueLime

  return (
    <section className={styles.header}>
      <div className={styles.copyBlock}>
        <div className={styles.titleRow}>
          {leading ? <div className={styles.leading}>{leading}</div> : null}
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <div className={styles.headingRow}>
              <h1 className={styles.title}>{title}</h1>
              {titleSuffix}
            </div>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
      </div>

      {summary || summaryContent || actions ? (
        <div className={styles.sideGroup}>
          {summary || summaryContent ? (
            <div className={styles.summaryCard}>
              {summary ? (
                <>
                  <span className={styles.summaryLabel}>{summary.label}</span>
                  <strong
                    className={[
                      styles.summaryValue,
                      summaryToneClassName,
                      summary.valueSize === 'compact' ? styles.summaryValueCompact : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {summary.value}
                  </strong>
                  {summary.meta ? <span className={styles.summaryMeta}>{summary.meta}</span> : null}
                </>
              ) : (
                summaryContent
              )}
            </div>
          ) : null}

          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
    </section>
  )
}
