'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FiArrowRight, FiChevronDown, FiDownload, FiPlus, FiSearch, FiSliders } from 'react-icons/fi'
import ProjectStatusFlow from '../../_components/project-status-flow/ProjectStatusFlow'
import type { ProjectStatusFlowStep } from '../../_components/project-status-flow/ProjectStatusFlow'
import ProjectRequestEditModal from './ProjectRequestEditModal'
import {
  PROJECT_REQUEST_HISTORY,
  PROJECT_REQUEST_PHASES,
  PROJECT_REQUEST_SUMMARY,
  type ProjectRequestHistoryItem,
  type RequestStatus,
} from './projectRequest.mock'
import styles from './page.module.scss'

type ProjectRequestClientProps = {
  clientName: string
}

const STATUS_META: Record<
  RequestStatus,
  {
    label: string
    className: string
  }
> = {
  completed: { label: 'COMPLETED', className: styles.statusCompleted },
  processing: { label: 'PROCESSING', className: styles.statusProcessing },
  received: { label: 'RECEIVED', className: styles.statusReceived },
}

export default function ProjectRequestClient({ clientName }: ProjectRequestClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all')
  const [sortDescending, setSortDescending] = useState(true)
  const [visibleCount, setVisibleCount] = useState(4)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return [...PROJECT_REQUEST_HISTORY]
      .filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!normalizedSearch) {
          return true
        }

        return [item.title, item.assignee, item.date].some((value) => value.toLowerCase().includes(normalizedSearch))
      })
      .sort((a, b) => {
        const left = a.date.replaceAll('.', '')
        const right = b.date.replaceAll('.', '')

        return sortDescending ? right.localeCompare(left) : left.localeCompare(right)
      })
  }, [searchTerm, sortDescending, statusFilter])

  const visibleHistory = filteredHistory.slice(0, visibleCount)
  const hasMore = visibleCount < filteredHistory.length
  const projectDeadline = PROJECT_REQUEST_SUMMARY.servicePeriod.split('~').at(-1)?.trim() ?? PROJECT_REQUEST_SUMMARY.servicePeriod
  const flowSteps: ProjectStatusFlowStep[] = PROJECT_REQUEST_PHASES.map((phase) => ({
    id: phase.key,
    label: phase.label,
    labelEn: phase.labelEn,
    state: phase.state === 'current' ? 'active' : phase.state,
  }))

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>프로젝트 요청</h1>
          <p className={styles.pageDescription}>유지보수 진행 현황을 확인하고, 필요한 수정 요청을 빠르게 남길 수 있습니다.</p>
          <p className={styles.clientCaption}>CLIENT · {clientName}</p>
        </div>
      </section>

      <ProjectStatusFlow steps={flowSteps} title='프로젝트 진행 단계' deadlineValue={projectDeadline} />

      <section className={styles.summaryGrid}>
        <article className={styles.remainingCard}>
          <span className={styles.cardEyebrow}>REMAINING DAYS</span>
          <strong className={styles.remainingValue}>{PROJECT_REQUEST_SUMMARY.remainingDays}</strong>
          <span className={styles.contractBadge}>ACTIVE CONTRACT</span>
        </article>

        <article className={styles.infoCard}>
          <div className={styles.infoMain}>
            <span className={styles.cardEyebrow}>PROJECT NAME</span>
            <h2 className={styles.infoTitle}>{PROJECT_REQUEST_SUMMARY.projectName}</h2>

            <div className={styles.infoMetaGrid}>
              <div>
                <span className={styles.metaLabel}>SERVICE PERIOD</span>
                <p className={styles.metaValue}>{PROJECT_REQUEST_SUMMARY.servicePeriod}</p>
              </div>
              <div>
                <span className={styles.metaLabel}>STATUS</span>
                <p className={`${styles.metaValue} ${styles.statusAccent}`.trim()}>
                  <span className={styles.statusDot} aria-hidden='true' />
                  {PROJECT_REQUEST_SUMMARY.statusText}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.infoActions}>
            <Link className={styles.ghostAction} href='/contact'>
              <FiDownload size={14} />
              <span>Download Contract</span>
            </Link>
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
              onChange={(event) => setStatusFilter(event.target.value as 'all' | RequestStatus)}
            >
              <option value='all'>전체 상태</option>
              <option value='completed'>완료</option>
              <option value='processing'>진행 중</option>
              <option value='received'>접수</option>
            </select>

            <button className={styles.primaryAction} type='button' onClick={() => setIsRequestModalOpen(true)}>
              <FiPlus size={16} />
              <span>수정 요청하기</span>
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th scope='col'>STATUS</th>
                <th scope='col'>TITLE</th>
                <th scope='col'>DATE</th>
                <th scope='col'>ASSIGNED TO</th>
                <th scope='col'>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {visibleHistory.map((item) => (
                <RequestHistoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.historyFooter}>
          {hasMore ? (
            <button className={styles.moreButton} type='button' onClick={() => setVisibleCount((prev) => prev + 4)}>
              <span>더 많은 요청 보기</span>
              <FiChevronDown size={14} />
            </button>
          ) : (
            <p className={styles.emptyHint}>표시할 요청을 모두 확인했습니다.</p>
          )}
        </div>
      </section>

      <ProjectRequestEditModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </div>
  )
}

function RequestHistoryRow({ item }: { item: ProjectRequestHistoryItem }) {
  const statusMeta = STATUS_META[item.status]

  return (
    <tr className={styles.historyRow}>
      <td>
        <span className={`${styles.statusPill} ${statusMeta.className}`.trim()}>{statusMeta.label}</span>
      </td>
      <td className={styles.titleCell}>{item.title}</td>
      <td className={styles.dateCell}>{item.date}</td>
      <td>
        <div className={styles.assigneeCell}>
          {item.assigneeInitials ? <span className={styles.avatar}>{item.assigneeInitials}</span> : null}
          <span>{item.assignee}</span>
        </div>
      </td>
      <td>
        <button className={styles.rowAction} type='button' aria-label={`${item.title} 상세 보기`}>
          <FiArrowRight size={16} />
        </button>
      </td>
    </tr>
  )
}
