'use client'

import { useState, useTransition } from 'react'
import { FiBarChart2, FiGlobe, FiLayers } from 'react-icons/fi'
import type { AnalyticsPeriod, Ga4PeriodData } from '../../../lib/ga4'
import TrendBarChart from './TrendBarChart'
import styles from './page.module.scss'

type AdminAnalyticsSectionProps = {
  initialData: Ga4PeriodData
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
}

function AnalyticsLoadingGrid() {
  return (
    <div className={styles.analyticsGrid}>
      <article className={`${styles.analyticsCard} ${styles.analyticsCardSkeleton}`.trim()}>
        <div className={styles.analyticsSkeletonTitle} />
        <div className={styles.analyticsSkeletonValue} />
        <div className={styles.analyticsChartSkeleton}>
          {Array.from({ length: 12 }).map((_, index) => (
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
  )
}

export default function AdminAnalyticsSection({ initialData }: AdminAnalyticsSectionProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialData.period)
  const [reports, setReports] = useState<Record<AnalyticsPeriod, Ga4PeriodData | null>>({
    daily: initialData.period === 'daily' ? initialData : null,
    weekly: initialData.period === 'weekly' ? initialData : null,
    monthly: initialData.period === 'monthly' ? initialData : null,
  })
  const [loadingPeriod, setLoadingPeriod] = useState<AnalyticsPeriod | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeData = reports[period]
  const activeReport = activeData?.status === 'ready' ? activeData.report : null

  const handlePeriodChange = (nextPeriod: AnalyticsPeriod) => {
    if (nextPeriod === period) {
      return
    }

    setPeriod(nextPeriod)

    if (reports[nextPeriod]) {
      return
    }

    setLoadingPeriod(nextPeriod)

    startTransition(async () => {
      try {
        const response = await fetch(`/admin/dashboard/analytics?period=${nextPeriod}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('GA4 analytics request failed')
        }

        const nextData = (await response.json()) as Ga4PeriodData

        setReports((current) => ({
          ...current,
          [nextPeriod]: nextData,
        }))
      } catch {
        setReports((current) => ({
          ...current,
          [nextPeriod]: {
            period: nextPeriod,
            status: 'unavailable',
            message: 'GA4 연동이 아직 설정되지 않았습니다.',
          },
        }))
      } finally {
        setLoadingPeriod((current) => (current === nextPeriod ? null : current))
      }
    })
  }

  const isLoadingActivePanel = loadingPeriod === period && !reports[period]

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
              disabled={isPending && loadingPeriod === item}
              onClick={() => handlePeriodChange(item)}
            >
              {PERIOD_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {isLoadingActivePanel ? (
        <AnalyticsLoadingGrid />
      ) : activeData?.status === 'unavailable' ? (
        <div className={styles.analyticsNotice}>
          <strong>GA4 안내</strong>
          <p>{activeData.message}</p>
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

            {activeReport?.trend.length ? (
              <TrendBarChart ariaLabel='방문자 추이 차트' points={activeReport.trend} />
            ) : (
              <div className={styles.analyticsEmpty}>해당 기간의 방문자 데이터가 없습니다.</div>
            )}
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
