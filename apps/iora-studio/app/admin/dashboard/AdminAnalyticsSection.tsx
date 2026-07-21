'use client'

import { useMemo, useState } from 'react'
import { FiBarChart2, FiGlobe, FiLayers } from 'react-icons/fi'
import type { AnalyticsPeriod, Ga4DashboardData } from '../../../lib/ga4'
import styles from './page.module.scss'

type AdminAnalyticsSectionProps = {
  data: Ga4DashboardData
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
}

export default function AdminAnalyticsSection({ data }: AdminAnalyticsSectionProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('weekly')

  const activeReport =
    data.status === 'ready'
      ? data.periods[period]
      : null

  const maxTrendValue = useMemo(() => {
    if (!activeReport?.trend.length) {
      return 1
    }

    return Math.max(...activeReport.trend.map((item) => item.value), 1)
  }, [activeReport])

  return (
    <section className={styles.analyticsPanel}>
      <div className={styles.analyticsHeader}>
        <div>
          <h2 className={styles.tableTitle}>방문자 통계</h2>
          <p className={styles.analyticsDescription}>
            GA4 Data API 기준으로 활성 사용자, 페이지 방문, 유입 경로를 집계합니다.
          </p>
        </div>

        <div className={styles.analyticsPeriodTabs} role='tablist' aria-label='방문자 통계 기간 선택'>
          {(['daily', 'weekly', 'monthly'] as AnalyticsPeriod[]).map((item) => (
            <button
              key={item}
              type='button'
              role='tab'
              aria-selected={period === item}
              className={`${styles.analyticsPeriodButton} ${
                period === item ? styles.analyticsPeriodButtonActive : ''
              }`.trim()}
              onClick={() => setPeriod(item)}
            >
              {PERIOD_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {data.status === 'unavailable' ? (
        <div className={styles.analyticsNotice}>
          <strong>GA4 안내</strong>
          <p>{data.message}</p>
        </div>
      ) : (
        <div className={styles.analyticsGrid}>
          <article className={styles.analyticsCard}>
            <div className={styles.analyticsCardHeader}>
              <span className={styles.analyticsIcon}>
                <FiBarChart2 size={18} />
              </span>
              <strong>{PERIOD_LABELS[period]} 방문자 추이</strong>
            </div>

            <div className={styles.analyticsSummary}>
              <span>활성 사용자 수</span>
              <strong>{activeReport?.totalVisitors.toLocaleString('ko-KR') ?? '0'}</strong>
            </div>

            <div className={styles.chartShell} aria-label='방문자 추이 차트'>
              {activeReport?.trend.length ? (
                activeReport.trend.map((item) => (
                  <div key={`${period}-${item.label}`} className={styles.chartColumn}>
                    <div className={styles.chartBarTrack}>
                      <span
                        className={styles.chartBarFill}
                        style={{ height: `${(item.value / maxTrendValue) * 100}%` }}
                      />
                    </div>
                    <span className={styles.chartLabel}>{item.label}</span>
                    <strong className={styles.chartValue}>{item.value.toLocaleString('ko-KR')}</strong>
                  </div>
                ))
              ) : (
                <div className={styles.analyticsEmpty}>해당 기간의 방문 데이터가 없습니다.</div>
              )}
            </div>
          </article>

          <article className={styles.analyticsCard}>
            <div className={styles.analyticsCardHeader}>
              <span className={styles.analyticsIcon}>
                <FiLayers size={18} />
              </span>
              <strong>페이지별 방문 수</strong>
            </div>

            <div className={styles.analyticsList}>
              {activeReport?.pageViews.length ? (
                activeReport.pageViews.slice(0, 8).map((item, index) => (
                  <div key={`${period}-page-${item.label}`} className={styles.analyticsListItem}>
                    <span className={styles.analyticsRank}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.analyticsListLabel}>{item.label}</span>
                    <strong>{item.value.toLocaleString('ko-KR')}</strong>
                  </div>
                ))
              ) : (
                <div className={styles.analyticsEmpty}>집계된 페이지 방문 데이터가 없습니다.</div>
              )}
            </div>
          </article>

          <article className={styles.analyticsCard}>
            <div className={styles.analyticsCardHeader}>
              <span className={styles.analyticsIcon}>
                <FiGlobe size={18} />
              </span>
              <strong>유입 경로</strong>
            </div>

            <div className={styles.analyticsList}>
              {activeReport?.sources.length ? (
                activeReport.sources.slice(0, 8).map((item, index) => (
                  <div key={`${period}-source-${item.label}`} className={styles.analyticsListItem}>
                    <span className={styles.analyticsRank}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.analyticsListLabel}>{item.label}</span>
                    <strong>{item.value.toLocaleString('ko-KR')}</strong>
                  </div>
                ))
              ) : (
                <div className={styles.analyticsEmpty}>집계된 유입 경로 데이터가 없습니다.</div>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  )
}
