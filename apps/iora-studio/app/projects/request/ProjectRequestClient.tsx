'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FiChevronDown, FiPlus, FiSearch, FiSliders } from 'react-icons/fi'
import ProjectStatusFlow, {
  buildProjectFlowSteps,
  type ProjectFlowStageKey,
} from '../../_components/project-status-flow/ProjectStatusFlow'
import {
  PROJECT_MODIFICATION_STATUS_LABELS,
  type ProjectModificationRequestListItem,
  type ProjectModificationRequestStatus,
} from '../../../lib/projectModificationRequests'
import ProjectRequestEditModal from './ProjectRequestEditModal'
import styles from './page.module.scss'

type ProjectRequestClientProps = {
  clientName: string
  currentStage: ProjectFlowStageKey | null
  history: ProjectModificationRequestListItem[]
  projectDeadline: string
  projectId: string | null
  projectName: string
  servicePeriod: string
}

const STATUS_META: Record<
  ProjectModificationRequestStatus,
  {
    className: string
    label: string
  }
> = {
  completed: { label: PROJECT_MODIFICATION_STATUS_LABELS.completed, className: styles.statusCompleted },
  in_progress: { label: PROJECT_MODIFICATION_STATUS_LABELS.in_progress, className: styles.statusProcessing },
  pending: { label: PROJECT_MODIFICATION_STATUS_LABELS.pending, className: styles.statusReceived },
  review: { label: PROJECT_MODIFICATION_STATUS_LABELS.review, className: styles.statusReview },
}

function getStageStatusText(stage: ProjectFlowStageKey | null) {
  if (stage === 'analysis') return '상담 및 분석'
  if (stage === 'planning') return '기획'
  if (stage === 'development') return '개발'
  if (stage === 'qa') return '검수'
  if (stage === 'launch') return '배포'
  if (stage === 'care') return '유지보수'
  if (stage === 'completed') return '계약 완료'
  return '미정'
}

function getProjectBadgeText(stage: ProjectFlowStageKey | null) {
  if (stage === 'completed') {
    return '계약 완료'
  }

  if (stage) {
    return '진행 중 계약'
  }

  return '프로젝트 미연결'
}

function getRemainingDays(deadline: string) {
  if (!deadline || deadline === '미정') {
    return '미정'
  }

  const targetDate = new Date(`${deadline.replaceAll('.', '-')}T00:00:00`)
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.ceil((targetDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

  if (Number.isNaN(diff)) {
    return '미정'
  }

  if (diff < 0) {
    return `D+${Math.abs(diff)}`
  }

  return `D-${diff}`
}

export default function ProjectRequestClient({
  clientName,
  currentStage,
  history,
  projectDeadline,
  projectId,
  projectName,
  servicePeriod,
}: ProjectRequestClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectModificationRequestStatus>('all')
  const [sortDescending, setSortDescending] = useState(true)
  const [visibleCount, setVisibleCount] = useState(4)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestItems, setRequestItems] = useState(history)
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false)

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return [...requestItems]
      .filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!normalizedSearch) {
          return true
        }

        return [item.title, item.description, item.requesterName, item.date].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        )
      })
      .sort((left, right) =>
        sortDescending
          ? right.requestedAtValue.localeCompare(left.requestedAtValue)
          : left.requestedAtValue.localeCompare(right.requestedAtValue),
      )
  }, [requestItems, searchTerm, sortDescending, statusFilter])

  const visibleHistory = filteredHistory.slice(0, visibleCount)
  const hasMore = visibleCount < filteredHistory.length
  const normalizedDeadline = projectDeadline === '미정' ? '' : projectDeadline
  const flowSteps = currentStage ? buildProjectFlowSteps(currentStage) : []
  const statusText = getStageStatusText(currentStage)
  const remainingDays = getRemainingDays(projectDeadline)
  const hasProject = Boolean(projectId && currentStage)

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>프로젝트 수정 요청</h1>
          <p className={styles.pageDescription}>
            유지보수 진행 현황을 확인하고, 필요한 수정 요청을 빠르게 남길 수 있습니다.
          </p>
          <p className={styles.clientCaption}>CLIENT : {clientName}</p>
        </div>
      </section>

      {hasProject ? (
        <ProjectStatusFlow steps={flowSteps} title='프로젝트 진행 단계' deadlineValue={normalizedDeadline} />
      ) : (
        <section className={styles.emptyProjectNotice}>
          <strong>아직 연결된 프로젝트가 없습니다.</strong>
          <p>프로젝트가 등록되면 이곳에서 진행 단계와 수정 요청 이력을 함께 확인할 수 있습니다.</p>
        </section>
      )}

      <section className={styles.summaryGrid}>
        <article className={styles.remainingCard}>
          <span className={styles.cardEyebrow}>REMAINING DAYS</span>
          <strong className={styles.remainingValue}>{remainingDays}</strong>
          <span className={styles.contractBadge}>{getProjectBadgeText(currentStage)}</span>
        </article>

        <article className={styles.infoCard}>
          <div className={styles.infoMain}>
            <span className={styles.cardEyebrow}>PROJECT NAME</span>
            <h2 className={styles.infoTitle}>{projectName}</h2>

            <div className={styles.infoMetaGrid}>
              <div>
                <span className={styles.metaLabel}>SERVICE PERIOD</span>
                <p className={styles.metaValue}>{servicePeriod}</p>
              </div>
              <div>
                <span className={styles.metaLabel}>STATUS</span>
                <p className={`${styles.metaValue} ${styles.statusAccent}`.trim()}>
                  <span className={styles.statusDot} aria-hidden='true' />
                  {statusText}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.infoActions}>
            <Link className={styles.ghostAction} href='/projects'>
              <span>Usage History</span>
            </Link>
          </div>
        </article>
      </section>

      <section className={styles.historySection}>
        <div className={styles.historyHeader}>
          <div className={styles.historyTitleRow}>
            <h2 className={styles.historyTitle}>
              요청 이력 <span>History</span>
            </h2>
          </div>

          <div className={styles.historyToolbar}>
            <label className={styles.searchField}>
              <FiSearch size={16} />
              <input
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='요청 내용 검색'
                aria-label='요청 내용 검색'
              />
            </label>

            <button
              className={styles.iconButton}
              type='button'
              aria-label='정렬 방향 변경'
              onClick={() => setSortDescending((prev) => !prev)}
            >
              <FiSliders size={18} />
            </button>

            <select
              className={styles.filterSelect}
              aria-label='상태 필터'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | ProjectModificationRequestStatus)}
            >
              <option value='all'>전체 상태</option>
              <option value='pending'>대기</option>
              <option value='review'>검토 중</option>
              <option value='in_progress'>진행 중</option>
              <option value='completed'>완료</option>
            </select>

            <button
              className={styles.primaryAction}
              type='button'
              disabled={!hasProject}
              onClick={() => setIsRequestModalOpen(true)}
            >
              <FiPlus size={16} />
              <span>수정 요청하기</span>
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th scope='col'>상태</th>
                <th scope='col'>제목</th>
                <th scope='col'>요청일</th>
                <th scope='col'>첨부</th>
              </tr>
            </thead>
            <tbody>
              {visibleHistory.length ? (
                visibleHistory.map((item) => <RequestHistoryRow key={item.id} item={item} />)
              ) : (
                <tr className={styles.historyRow}>
                  <td colSpan={4} className={styles.emptyTableCell}>
                    아직 등록된 수정 요청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.historyFooter}>
          {hasMore ? (
            <button
              className={styles.moreButton}
              type='button'
              onClick={() => setVisibleCount((prev) => prev + 4)}
            >
              <span>더 많은 요청 보기</span>
              <FiChevronDown size={14} />
            </button>
          ) : visibleHistory.length ? (
            <p className={styles.emptyHint}>표시 중인 요청을 모두 확인했습니다.</p>
          ) : null}
        </div>
      </section>

      <ProjectRequestEditModal
        isOpen={isRequestModalOpen}
        projectId={projectId}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmitted={(item) => {
          setRequestItems((current) => [item, ...current])
          setVisibleCount((current) => current + 1)
          setIsSuccessToastVisible(true)
        }}
      />

      {isSuccessToastVisible ? (
        <div className={styles.inlineToast} role='status' aria-live='polite'>
          수정 요청이 정상적으로 접수되었습니다.
          <button type='button' onClick={() => setIsSuccessToastVisible(false)} aria-label='알림 닫기'>
            확인
          </button>
        </div>
      ) : null}
    </div>
  )
}

function RequestHistoryRow({ item }: { item: ProjectModificationRequestListItem }) {
  const statusMeta = STATUS_META[item.status]

  return (
    <tr className={styles.historyRow}>
      <td>
        <span className={`${styles.statusPill} ${statusMeta.className}`.trim()}>{statusMeta.label}</span>
      </td>
      <td className={styles.titleCell}>
        <div className={styles.historyTitleCell}>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
        </div>
      </td>
      <td className={styles.dateCell}>{item.date}</td>
      <td className={styles.attachmentCell}>{item.attachmentCount ? `${item.attachmentCount}개` : '-'}</td>
    </tr>
  )
}
