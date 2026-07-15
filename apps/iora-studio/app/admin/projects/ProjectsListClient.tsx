'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pagination, Table } from '@iora/ui'
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFolderPlus,
  FiLayers,
  FiMoreVertical,
  FiSearch,
  FiSliders,
  FiTrendingDown,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi'
import type { AdminProjectListItem, AdminProjectStats } from '../../../lib/projects'
import styles from './page.module.scss'

const PAGE_SIZE = 5

const STATUS_CLASS_MAP = {
  개발: styles.statusDevelopment,
  배포: styles.statusLaunch,
  기획: styles.statusPlanning,
  검수: styles.statusReview,
  유지보수: styles.statusMaintenance,
} as const

const PRIORITY_CLASS_MAP = {
  긴급: styles.priorityUrgent,
  높음: styles.priorityHigh,
  보통: styles.priorityNormal,
  낮음: styles.priorityLow,
} as const

const TABLE_COLUMNS: Array<{ key: string; header: string; align?: 'left' | 'center' | 'right' }> = [
  { key: 'company', header: '업체명' },
  { key: 'projectName', header: '프로젝트명' },
  { key: 'status', header: '현재 상태' },
  { key: 'startDate', header: '시작일' },
  { key: 'dueDate', header: '마감일' },
  { key: 'priority', header: '우선순위' },
  { key: 'actions', header: '관리', align: 'center' },
]

type ProjectsListClientProps = {
  projects: AdminProjectListItem[]
  stats: AdminProjectStats
}

export default function ProjectsListClient({ projects, stats }: ProjectsListClientProps) {
  const [page, setPage] = useState(1)

  const statCards = [
    {
      id: 'all',
      icon: FiLayers,
      trend: '전체',
      trendTone: 'up' as const,
      label: '전체 프로젝트',
      value: String(stats.all).padStart(2, '0'),
    },
    {
      id: 'active',
      icon: FiCalendar,
      trend: '진행중',
      trendTone: 'down' as const,
      label: '진행 중',
      value: String(stats.active).padStart(2, '0'),
    },
    {
      id: 'deadline',
      icon: FiAlertTriangle,
      trend: '등록됨',
      trendTone: 'alert' as const,
      label: '마감일 등록',
      value: String(stats.deadline).padStart(2, '0'),
    },
    {
      id: 'done',
      icon: FiCheckCircle,
      trend: '완료',
      trendTone: 'muted' as const,
      label: '완료 프로젝트',
      value: String(stats.done).padStart(2, '0'),
    },
  ]

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const pagedRows = useMemo(
    () =>
      projects.slice(startIndex, endIndex).map((project) => ({
        __rowId: project.id,
        company: (
          <div className={styles.companyCell}>
            <span className={styles.companyBadge}>{project.companyCode}</span>
            <Link className={styles.companyLink} href={`/admin/projects/${project.id}`}>
              {project.companyName}
            </Link>
          </div>
        ),
        projectName: <span className={styles.projectNameCell}>{project.projectName}</span>,
        status: <span className={`${styles.statusPill} ${STATUS_CLASS_MAP[project.status]}`.trim()}>{project.status}</span>,
        startDate: <span className={styles.dateCell}>{project.startDate}</span>,
        dueDate: <span className={styles.dateCell}>{project.dueDate}</span>,
        priority: <span className={`${styles.priorityText} ${PRIORITY_CLASS_MAP[project.priority]}`.trim()}>{project.priority}</span>,
        actions: (
          <button className={styles.moreButton} type='button' aria-label={`${project.companyName} 관리`}>
            <FiMoreVertical size={18} />
          </button>
        ),
      })),
    [endIndex, projects, startIndex],
  )

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div className={styles.heroCopy}>
          <h1 className={styles.pageTitle}>프로젝트 관리</h1>
          <p className={styles.pageDescription}>등록된 프로젝트를 한눈에 확인하고 진행 상태를 관리합니다.</p>
        </div>

        <button className={styles.primaryButton} type='button'>
          <FiFolderPlus size={16} />
          <span>새 프로젝트 등록</span>
        </button>
      </section>

      <section className={styles.statsGrid} aria-label='프로젝트 통계'>
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.id} className={styles.statCard}>
              <div className={styles.statTopRow}>
                <span className={styles.statIconWrap}>
                  <Icon size={18} />
                </span>
                <span
                  className={`${styles.statTrend} ${
                    card.trendTone === 'up'
                      ? styles.statTrendUp
                      : card.trendTone === 'down'
                        ? styles.statTrendDown
                        : card.trendTone === 'alert'
                          ? styles.statTrendAlert
                          : styles.statTrendMuted
                  }`.trim()}
                >
                  {card.trendTone === 'up' ? <FiTrendingUp size={14} /> : null}
                  {card.trendTone === 'down' ? <FiTrendingDown size={14} /> : null}
                  <span>{card.trend}</span>
                </span>
              </div>
              <span className={styles.statLabel}>{card.label}</span>
              <strong className={styles.statValue}>{card.value}</strong>
            </article>
          )
        })}
      </section>

      <section className={styles.filterSection} aria-label='프로젝트 필터'>
        <div className={styles.filterGroup}>
          <button className={styles.filterButton} type='button'>
            <FiSliders size={14} />
            <span>전체 상태</span>
            <FiChevronDown size={14} />
          </button>
          <button className={styles.filterButton} type='button'>
            <FiZap size={14} />
            <span>전체 우선순위</span>
            <FiChevronDown size={14} />
          </button>
        </div>

        <div className={styles.searchStatus}>
          <FiSearch size={16} />
          <span>총 {projects.length}개의 프로젝트가 검색됨</span>
        </div>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.projectTableShell}>
          <Table
            columns={TABLE_COLUMNS}
            rows={pagedRows}
            rowKeyField='__rowId'
            minWidth='976px'
            thColor='#97a8c3'
            thBackground='rgb(28 41 67 / 0.72)'
            tdColor='#f8fafc'
            tdBackground='rgb(20 31 53 / 0.96)'
            borderColor='rgb(148 163 184 / 0.08)'
            headerPadding='20px 24px'
            cellPadding='24px'
            thFontSize='14px'
            tdFontSize='15px'
            thFontWeight='500'
            rowHoverBackground='rgb(24 38 63 / 0.96)'
          />
        </div>

        <div className={styles.paginationRow}>
          <p className={styles.paginationSummary}>
            Showing {projects.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, projects.length)} of {projects.length} projects
          </p>

          <Pagination
            className={styles.paginationShell}
            currentPage={currentPage}
            totalPages={totalPages}
            groupSize={3}
            onPageChange={setPage}
            previousLabel={<FiChevronLeft size={16} />}
            nextLabel={<FiChevronRight size={16} />}
            buttonTheme={{
              size: '15px',
              background: 'transparent',
              textColor: '#d5deed',
              borderColor: 'transparent',
              hoverBackground: 'rgb(255 255 255 / 0.04)',
              hoverTextColor: '#ffffff',
              hoverBorderColor: 'transparent',
              round: '10px',
              padding: '8px 12px',
            }}
            activeButtonTheme={{
              size: '15px',
              background: '#ff2d7a',
              textColor: '#ffffff',
              borderColor: '#ff2d7a',
              hoverBackground: '#ff2d7a',
              hoverTextColor: '#ffffff',
              hoverBorderColor: '#ff2d7a',
              round: '10px',
              padding: '8px 12px',
            }}
            disabledButtonTheme={{
              size: '15px',
              background: 'transparent',
              textColor: '#64748b',
              borderColor: 'transparent',
              hoverBackground: 'transparent',
              hoverTextColor: '#64748b',
              hoverBorderColor: 'transparent',
              round: '10px',
              padding: '8px 12px',
            }}
          />
        </div>
      </section>
    </div>
  )
}
