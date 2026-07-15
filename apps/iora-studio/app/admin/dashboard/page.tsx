import Link from 'next/link'
import { FiAlertCircle, FiBell, FiCalendar, FiFilter, FiMessageSquare, FiMoreVertical, FiPlus, FiTrendingUp, FiZap } from 'react-icons/fi'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { getAdminDisplayName } from '../_components/admin-shell'
import {
  DASHBOARD_DEADLINES,
  DASHBOARD_METRICS,
  DASHBOARD_REQUESTS,
  DASHBOARD_SCHEDULE,
  type DashboardMetric,
} from './dashboard.mock'
import styles from './page.module.scss'

function formatTodayLabel() {
  const now = new Date()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()]
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')

  return `${year}. ${month}. ${date} (${weekday})`
}

function MetricIcon({ metric }: { metric: DashboardMetric }) {
  if (metric.icon === 'project') {
    return <FiZap size={18} />
  }

  if (metric.icon === 'reservation') {
    return <FiCalendar size={18} />
  }

  if (metric.icon === 'message') {
    return <FiMessageSquare size={18} />
  }

  return <FiTrendingUp size={18} />
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('email, full_name, company_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const displayName = profile ? getAdminDisplayName(profile) : '김프로'
  const todayLabel = formatTodayLabel()

  return (
    <div className={styles.content}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>안녕하세요, {displayName}님.</h1>
            <p className={styles.heroDescription}>오늘의 업무 현황과 프로젝트 요약입니다.</p>
          </div>

          <div className={styles.todayBlock}>
            <strong className={styles.todayLabel}>TODAY</strong>
            <span className={styles.todayValue}>{todayLabel}</span>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.metricsRow}>
            {DASHBOARD_METRICS.map((metric) => (
              <article key={metric.id} className={`${styles.card} ${styles.metricCard}`.trim()}>
                <div className={styles.metricHead}>
                  <span
                    className={[
                      styles.metricIcon,
                      metric.icon === 'reservation' ? styles.metricIconReservation : '',
                      metric.icon === 'message' ? styles.metricIconMessage : '',
                    ].join(' ')}
                  >
                    <MetricIcon metric={metric} />
                  </span>
                  <span
                    className={[
                      styles.metricTrend,
                      metric.accent === 'pink' && metric.id === 'pending' ? styles.metricTrendHot : '',
                      metric.accent === 'green' ? styles.metricTrendGood : '',
                    ].join(' ')}
                  >
                    {metric.trend}
                  </span>
                </div>
                <span className={styles.metricTitle}>{metric.title}</span>
                <strong className={styles.metricValue}>{metric.value}</strong>
              </article>
            ))}
          </div>

          <article className={`${styles.panel} ${styles.schedulePanel}`.trim()}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <FiCalendar size={18} />
                <span>오늘 일정</span>
              </h2>
              <Link className={styles.panelLink} href='/admin/reservations'>
                전체 일정 보기
              </Link>
            </div>

            <div className={styles.scheduleList}>
              {DASHBOARD_SCHEDULE.map((item) => (
                <article
                  key={item.id}
                  className={[
                    styles.scheduleItem,
                    item.tone === 'critical' ? styles.scheduleCritical : '',
                    item.tone === 'muted' ? styles.scheduleMuted : '',
                  ].join(' ')}
                >
                  <div className={styles.scheduleTime}>
                    <span>{item.time}</span>
                    <span>{item.meridiem}</span>
                  </div>
                  <div className={styles.scheduleContent}>
                    <strong
                      className={[
                        styles.scheduleTitle,
                        item.tone === 'muted' ? styles.scheduleTitleDone : '',
                      ].join(' ')}
                    >
                      {item.title}
                    </strong>
                    <span className={styles.scheduleMeta}>{item.location}</span>
                  </div>
                  {item.badge ? <span className={styles.scheduleBadge}>{item.badge}</span> : null}
                </article>
              ))}
            </div>
          </article>

          <aside className={`${styles.panel} ${styles.deadlinePanel}`.trim()}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <FiAlertCircle size={18} />
                <span>곧 마감</span>
              </h2>
            </div>

            <div className={styles.deadlineList}>
              {DASHBOARD_DEADLINES.map((item) => (
                <div key={item.id} className={styles.deadlineItem}>
                  <div className={styles.deadlineHead}>
                    <span className={styles.deadlineTitle}>{item.title}</span>
                    <strong className={`${styles.deadlineDue} ${item.tone === 'hot' ? styles.deadlineDueHot : ''}`.trim()}>
                      {item.dueLabel}
                    </strong>
                  </div>
                  <div className={styles.deadlineTrack}>
                    <span
                      className={`${styles.deadlineFill} ${item.tone === 'hot' ? styles.deadlineFillHot : ''}`.trim()}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.deadlineNotice}>
              <FiBell size={15} />
              <div>
                <p>마감 임박 프로젝트가 3개 있습니다.</p>
                <p>오늘은 집중 근무 시간을 활용해 작업을 마무리하는 것을 추천합니다.</p>
              </div>
            </div>
          </aside>

          <section className={styles.tablePanel}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>최근 요청사항</h2>
              <div className={styles.tableActions}>
                <button className={styles.tableIconButton} type='button' aria-label='필터'>
                  <FiFilter size={18} />
                </button>
                <button className={styles.tableIconButton} type='button' aria-label='더보기'>
                  <FiMoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>요청 고객</th>
                    <th>요청 내용</th>
                    <th>상태</th>
                    <th>시간</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {DASHBOARD_REQUESTS.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.customerCell}>
                          <span
                            className={[
                              styles.customerBadge,
                              item.status === 'pending' ? styles.customerBadgePending : styles.customerBadgeDone,
                            ].join(' ')}
                          >
                            {item.customerInitial}
                          </span>
                          <strong>{item.customer}</strong>
                        </div>
                      </td>
                      <td>{item.detail}</td>
                      <td>
                        <span className={`${styles.statusPill} ${item.status === 'pending' ? styles.statusPending : styles.statusDone}`.trim()}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className={styles.timeAgo}>{item.timeAgo}</td>
                      <td>
                        <button className={styles.rowAction} type='button'>
                          {item.actionLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>모든 요청 확인 (12건)</div>
          </section>
        </section>
      </div>

      <button className={styles.fab} type='button' aria-label='빠른 일정 추가'>
        <FiPlus size={16} />
      </button>
    </div>
  )
}
