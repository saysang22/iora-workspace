import Link from 'next/link'
import { FiAlertCircle, FiCalendar, FiTrendingUp, FiZap } from 'react-icons/fi'
import type { Tables } from '../../../lib/database.types'
import { getGa4DashboardData } from '../../../lib/ga4'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { getAdminDisplayName } from '../_components/admin-shell'
import AdminAnalyticsSection from './AdminAnalyticsSection'
import styles from './page.module.scss'

type ProjectRow = Tables<'projects'>
type ContactRequestRow = Tables<'contact_requests'>
type PaymentRow = Tables<'payments'>

type DashboardMetric = {
  id: 'active-projects' | 'pending-requests' | 'monthly-revenue'
  title: string
  value: string
  trend: string
  icon: 'project' | 'request' | 'revenue'
}

type DeadlineProject = {
  dueLabel: string
  id: string
  progress: number
  title: string
  tone: 'default' | 'hot'
}

type RecentRequestItem = {
  actionHref: string
  actionLabel: string
  customer: string
  customerInitial: string
  detail: string
  id: string
  status: ContactRequestRow['status']
  statusLabel: string
  timeAgo: string
}

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

  if (metric.icon === 'revenue') {
    return <FiTrendingUp size={18} />
  }

  return <FiCalendar size={18} />
}

function formatMetricValue(value: number) {
  return String(value).padStart(2, '0')
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function getCustomerInitial(name: string) {
  const normalized = name.trim()

  if (!normalized) {
    return '?'
  }

  return normalized.slice(0, 1).toUpperCase()
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

function formatRelativeTime(value: string) {
  const now = new Date()
  const target = new Date(value)
  const diffMs = target.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)

  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day')
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(target)
}

function createProjectMapByUserId(projects: ProjectRow[]) {
  const map = new Map<string, ProjectRow>()

  for (const project of projects) {
    if (!project.user_id) {
      continue
    }

    const existing = map.get(project.user_id)

    if (!existing) {
      map.set(project.user_id, project)
      continue
    }

    if (new Date(project.updated_at).getTime() > new Date(existing.updated_at).getTime()) {
      map.set(project.user_id, project)
    }
  }

  return map
}

function getDeadlineDiffDays(deadline: string) {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [year, month, day] = deadline.split('-').map(Number)
  const deadlineDate = new Date(year, month - 1, day)
  const diffMs = deadlineDate.getTime() - todayStart.getTime()

  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

function formatDeadlineLabel(diffDays: number) {
  if (diffDays === 0) {
    return 'D-DAY'
  }

  if (diffDays > 0) {
    return `D-${diffDays}`
  }

  return `D+${Math.abs(diffDays)}`
}

function buildDeadlineProjects(projects: ProjectRow[]) {
  return projects
    .filter((project) => project.deadline && project.current_stage !== 'completed')
    .map((project) => {
      const diffDays = getDeadlineDiffDays(project.deadline!)

      return {
        id: project.id,
        title: project.project_name,
        dueLabel: formatDeadlineLabel(diffDays),
        progress: Math.max(0, Math.min(100, project.progress_percent)),
        tone: diffDays <= 3 ? 'hot' : 'default',
        diffDays,
      }
    })
    .sort((left, right) => left.diffDays - right.diffDays)
    .slice(0, 3)
    .map(({ diffDays: _diffDays, ...item }) => item)
}

function getRequestStatusLabel(status: ContactRequestRow['status']) {
  if (status === 'confirmed') {
    return '확인 완료'
  }

  if (status === 'rejected') {
    return '보류'
  }

  return '대기 중'
}

function buildRecentRequests(
  requests: ContactRequestRow[],
  projectsByUserId: Map<string, ProjectRow>,
) {
  return requests.slice(0, 8).map((request) => {
    const linkedProject = request.user_id ? projectsByUserId.get(request.user_id) : null
    const customer = request.name.trim() || request.email
    const isLinkedProjectRequest = Boolean(linkedProject)

    return {
      id: request.id,
      customer,
      customerInitial: getCustomerInitial(customer),
      detail: truncateText(request.request_details, 52),
      status: request.status,
      statusLabel: getRequestStatusLabel(request.status),
      timeAgo: formatRelativeTime(request.created_at),
      actionLabel: isLinkedProjectRequest ? '수정 요청 보기' : '프로젝트 등록',
      actionHref: isLinkedProjectRequest
        ? `/admin/projects/${linkedProject!.id}?tab=requests`
        : '/admin/projects',
    } satisfies RecentRequestItem
  })
}

function getMonthRange(baseDate = new Date()) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  }
}

function isWithinRange(dateValue: string, start: Date, end: Date) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const target = new Date(year, month - 1, day)

  return target >= start && target <= end
}

function sumPaymentsByRange(payments: PaymentRow[], start: Date, end: Date) {
  return payments.reduce((sum, payment) => {
    if (!isWithinRange(payment.paid_at, start, end)) {
      return sum
    }

    return sum + payment.amount
  }, 0)
}

function formatRevenueTrend(currentAmount: number, previousAmount: number) {
  if (previousAmount === 0) {
    if (currentAmount === 0) {
      return '전월 대비 0%'
    }

    return '전월 대비 +100%'
  }

  const diffRate = ((currentAmount - previousAmount) / previousAmount) * 100
  const rounded = Math.round(diffRate)

  return `전월 대비 ${rounded > 0 ? '+' : ''}${rounded}%`
}

function isMissingRelationError(error: { code?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
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

  const [
    { data: projects, error: projectsError },
    { data: requests, error: requestsError },
    { data: payments, error: paymentsError },
    ga4Data,
  ] =
    await Promise.all([
      supabase
        .from('projects')
        .select(
          'id, user_id, project_name, current_stage, progress_percent, deadline, updated_at, created_at',
        )
        .order('updated_at', { ascending: false }),
      supabase
        .from('contact_requests')
        .select('id, user_id, name, email, request_details, status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('id, project_id, amount, payment_type, paid_at, memo, created_at, updated_at')
        .order('paid_at', { ascending: false }),
      getGa4DashboardData(),
    ])

  if (projectsError) {
    throw projectsError
  }

  if (requestsError) {
    throw requestsError
  }

  if (paymentsError && !isMissingRelationError(paymentsError)) {
    throw paymentsError
  }

  const projectRows = (projects ?? []) as ProjectRow[]
  const requestRows = (requests ?? []) as ContactRequestRow[]
  const paymentRows = ((paymentsError && isMissingRelationError(paymentsError) ? [] : payments) ?? []) as PaymentRow[]
  const projectsByUserId = createProjectMapByUserId(projectRows)
  const activeProjectCount = projectRows.filter((project) => project.current_stage !== 'completed').length
  const pendingProjectCount = requestRows.filter((request) => {
    if (request.status !== 'pending') {
      return false
    }

    if (!request.user_id) {
      return true
    }

    return !projectsByUserId.has(request.user_id)
  }).length
  const currentMonthRange = getMonthRange()
  const previousMonthRange = getMonthRange(
    new Date(currentMonthRange.start.getFullYear(), currentMonthRange.start.getMonth() - 1, 1),
  )
  const currentMonthRevenue = sumPaymentsByRange(
    paymentRows,
    currentMonthRange.start,
    currentMonthRange.end,
  )
  const previousMonthRevenue = sumPaymentsByRange(
    paymentRows,
    previousMonthRange.start,
    previousMonthRange.end,
  )

  const metrics: DashboardMetric[] = [
    {
      id: 'active-projects',
      title: '진행 중 프로젝트',
      value: formatMetricValue(activeProjectCount),
      trend: '실시간 집계',
      icon: 'project',
    },
    {
      id: 'pending-requests',
      title: '대기중인 프로젝트 수',
      value: formatMetricValue(pendingProjectCount),
      trend: '신규 문의 기준',
      icon: 'request',
    },
    {
      id: 'monthly-revenue',
      title: '이번 달 수익화',
      value: formatCurrency(currentMonthRevenue),
      trend: formatRevenueTrend(currentMonthRevenue, previousMonthRevenue),
      icon: 'revenue',
    },
  ]

  const deadlineProjects = buildDeadlineProjects(projectRows)
  const recentRequests = buildRecentRequests(requestRows, projectsByUserId)
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
            {metrics.map((metric) => (
              <article key={metric.id} className={`${styles.card} ${styles.metricCard}`.trim()}>
                <div className={styles.metricHead}>
                  <span className={styles.metricIcon}>
                    <MetricIcon metric={metric} />
                  </span>
                  <span
                    className={`${styles.metricTrend} ${
                      metric.id === 'pending-requests'
                        ? styles.metricTrendHot
                        : metric.id === 'monthly-revenue'
                          ? styles.metricTrendGood
                          : ''
                    }`.trim()}
                  >
                    {metric.trend}
                  </span>
                </div>
                <span className={styles.metricTitle}>{metric.title}</span>
                <strong className={styles.metricValue}>{metric.value}</strong>
              </article>
            ))}
          </div>

          <aside className={`${styles.panel} ${styles.deadlinePanel}`.trim()}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <FiAlertCircle size={18} />
                <span>곧 마감</span>
              </h2>
            </div>

            <div className={styles.deadlineList}>
              {deadlineProjects.length ? (
                deadlineProjects.map((item) => (
                  <Link key={item.id} className={styles.deadlineLink} href={`/admin/projects/${item.id}`}>
                    <div className={styles.deadlineItem}>
                      <div className={styles.deadlineHead}>
                        <span className={styles.deadlineTitle}>{item.title}</span>
                        <strong
                          className={`${styles.deadlineDue} ${
                            item.tone === 'hot' ? styles.deadlineDueHot : ''
                          }`.trim()}
                        >
                          {item.dueLabel}
                        </strong>
                      </div>
                      <div className={styles.deadlineTrack}>
                        <span
                          className={`${styles.deadlineFill} ${
                            item.tone === 'hot' ? styles.deadlineFillHot : ''
                          }`.trim()}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyPanelMessage}>등록된 마감일이 있는 진행 프로젝트가 없습니다.</div>
              )}
            </div>

            <div className={styles.deadlineNotice}>
              <FiAlertCircle size={15} />
              <div>
                <p>실제 프로젝트 마감일과 진행률을 기준으로 자동 집계됩니다.</p>
                <p>마감일이 가까운 프로젝트부터 우선순위로 표시합니다.</p>
              </div>
            </div>
          </aside>

          <section className={styles.tablePanel}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>최근 요청사항</h2>
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
                  {recentRequests.length ? (
                    recentRequests.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link className={styles.tableRowLink} href={item.actionHref}>
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
                          </Link>
                        </td>
                        <td>
                          <Link className={styles.tableRowLink} href={item.actionHref}>
                            {item.detail}
                          </Link>
                        </td>
                        <td>
                          <Link className={styles.tableRowLink} href={item.actionHref}>
                            <span
                              className={`${styles.statusPill} ${
                                item.status === 'pending'
                                  ? styles.statusPending
                                  : item.status === 'confirmed'
                                    ? styles.statusDone
                                    : styles.statusMuted
                              }`.trim()}
                            >
                              {item.statusLabel}
                            </span>
                          </Link>
                        </td>
                        <td className={styles.timeAgo}>
                          <Link className={styles.tableRowLink} href={item.actionHref}>
                            {item.timeAgo}
                          </Link>
                        </td>
                        <td>
                          <Link className={styles.rowAction} href={item.actionHref}>
                            {item.actionLabel}
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={styles.emptyTableRow} colSpan={5}>
                        최근 요청사항이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>총 {requestRows.length}건의 요청이 집계되었습니다.</div>
          </section>

          <AdminAnalyticsSection data={ga4Data} />
        </section>
      </div>
    </div>
  )
}
