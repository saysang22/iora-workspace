'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pagination, Table, Toast } from '@iora/ui'
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
} from 'react-icons/fi'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import type { AdminProjectListItem, AdminProjectStats } from '../../../lib/projects'
import AdminProjectCreateModal from './AdminProjectCreateModal'
import styles from './page.module.scss'

const PAGE_SIZE = 5

const STATUS_CLASS_MAP = {
  대기: styles.statusPlanning,
  개발: styles.statusDevelopment,
  배포: styles.statusLaunch,
  기획: styles.statusPlanning,
  검수: styles.statusReview,
  유지보수: styles.statusMaintenance,
} as const

const PROJECT_TYPE_META = {
  member: {
    label: '회원',
    className: styles.typeMember,
  },
  guest: {
    label: '비회원',
    className: styles.typeGuest,
  },
} as const

const TABLE_COLUMNS: Array<{ key: string; header: string; align?: 'left' | 'center' | 'right' }> = [
  { key: 'company', header: '업체명' },
  { key: 'projectType', header: '구분', align: 'center' },
  { key: 'projectName', header: '프로젝트명' },
  { key: 'status', header: '현재 상태' },
  { key: 'startDate', header: '시작일' },
  { key: 'dueDate', header: '마감일' },
  { key: 'actions', header: '관리', align: 'center' },
]

type ProjectsListClientProps = {
  projects: AdminProjectListItem[]
  stats: AdminProjectStats
}

type ToastState = {
  visible: boolean
  title: string
  message: string
  type: 'info' | 'success' | 'error'
}

type DeleteTarget = {
  companyName: string
  id: string
}

function formatProjectDate(value: string | null) {
  if (!value) {
    return '미정'
  }

  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

export default function ProjectsListClient({ projects, stats }: ProjectsListClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const actionMenuRef = useRef<HTMLDivElement | null>(null)
  const [page, setPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<AdminProjectListItem | null>(null)
  const [localProjects, setLocalProjects] = useState(projects)
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  })

  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(localProjects.length / PAGE_SIZE))
    setPage((current) => Math.min(current, totalPages))
  }, [localProjects.length])

  useEffect(() => {
    const handleDocumentPointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (actionMenuRef.current?.contains(target)) {
        return
      }

      setOpenMenuProjectId(null)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [])

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
      trend: '진행 중',
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

  const totalPages = Math.max(1, Math.ceil(localProjects.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const handleRequestDelete = (project: AdminProjectListItem) => {
    setOpenMenuProjectId(null)
    setDeleteTarget({
      id: project.id,
      companyName: project.companyName,
    })
  }

  const handleOpenEditModal = (project: AdminProjectListItem) => {
    setOpenMenuProjectId(null)
    setEditingProject(project)
  }

  const handleEditComplete = (payload: {
    careEndedAt: string | null
    deadline: string | null
    depositAmount: number | null
    id: string
    projectName: string
    startedAt: string
    totalAmount: number | null
  }) => {
    setEditingProject(null)
    setLocalProjects((current) =>
      current.map((project) =>
        project.id === payload.id
          ? {
              ...project,
              projectName: payload.projectName,
              startDate: formatProjectDate(payload.startedAt),
              dueDate: formatProjectDate(payload.deadline),
              startedAtValue: payload.startedAt,
              deadlineValue: payload.deadline,
              careEndedAtValue: payload.careEndedAt,
              totalAmountValue: payload.totalAmount,
              depositAmountValue: payload.depositAmount,
            }
          : project,
      ),
    )
    setToastState({
      visible: true,
      title: '수정 완료',
      message: '프로젝트 정보가 수정되었습니다.',
      type: 'success',
    })
    router.refresh()
  }

  const handleDeleteProject = async () => {
    if (!deleteTarget || isDeleting) {
      return
    }

    setIsDeleting(true)

    const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id)

    if (error) {
      setDeleteTarget(null)
      setToastState({
        visible: true,
        title: '삭제 실패',
        message: error.message || '프로젝트를 삭제하지 못했습니다.',
        type: 'error',
      })
      setIsDeleting(false)
      return
    }

    setLocalProjects((current) => current.filter((project) => project.id !== deleteTarget.id))
    setDeleteTarget(null)
    setToastState({
      visible: true,
      title: '삭제 완료',
      message: '프로젝트가 삭제되었습니다.',
      type: 'success',
    })
    setIsDeleting(false)
    router.refresh()
  }

  const pagedRows = useMemo(
    () =>
      localProjects.slice(startIndex, endIndex).map((project) => ({
        __rowId: project.id,
        company: (
          <div className={styles.companyCell}>
            <span className={styles.companyBadge}>{project.companyCode}</span>
            <Link
              className={styles.companyLink}
              href={`/admin/projects/${project.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {project.companyName}
            </Link>
          </div>
        ),
        projectType: (
          <span className={`${styles.typePill} ${PROJECT_TYPE_META[project.projectType].className}`.trim()}>
            {PROJECT_TYPE_META[project.projectType].label}
          </span>
        ),
        projectName: <span className={styles.projectNameCell}>{project.projectName}</span>,
        status: (
          <span className={`${styles.statusPill} ${STATUS_CLASS_MAP[project.status]}`.trim()}>
            {project.status}
          </span>
        ),
        startDate: <span className={styles.dateCell}>{project.startDate}</span>,
        dueDate: <span className={styles.dateCell}>{project.dueDate}</span>,
        actions: (
          <div className={styles.actionMenuWrap} ref={openMenuProjectId === project.id ? actionMenuRef : null}>
            <button
              className={styles.moreButton}
              type='button'
              aria-label={`${project.companyName} 관리`}
              aria-expanded={openMenuProjectId === project.id}
              onClick={(event) => {
                event.stopPropagation()
                setOpenMenuProjectId((current) => (current === project.id ? null : project.id))
              }}
            >
              <FiMoreVertical size={18} />
            </button>

            {openMenuProjectId === project.id ? (
              <div
                className={styles.actionMenu}
                role='menu'
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className={styles.actionMenuItem}
                  type='button'
                  role='menuitem'
                  onClick={() => handleOpenEditModal(project)}
                >
                  수정
                </button>
                <button
                  className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`.trim()}
                  type='button'
                  role='menuitem'
                  onClick={() => handleRequestDelete(project)}
                >
                  삭제
                </button>
              </div>
            ) : null}
          </div>
        ),
      })),
    [endIndex, localProjects, openMenuProjectId, startIndex],
  )

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div className={styles.heroCopy}>
          <h1 className={styles.pageTitle}>프로젝트 관리</h1>
          <p className={styles.pageDescription}>등록된 프로젝트를 한눈에 확인하고 진행 상태를 관리합니다.</p>
        </div>

        <button className={styles.primaryButton} type='button' onClick={() => setIsCreateModalOpen(true)}>
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
        </div>

        <div className={styles.searchStatus}>
          <FiSearch size={16} />
          <span>총 {localProjects.length}개의 프로젝트가 조회됨</span>
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
            onRowClick={(row) => {
              const projectId = row.__rowId

              if (typeof projectId === 'string') {
                router.push(`/admin/projects/${projectId}`)
              }
            }}
          />
        </div>

        <div className={styles.paginationRow}>
          <p className={styles.paginationSummary}>
            Showing {localProjects.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, localProjects.length)} of{' '}
            {localProjects.length} projects
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

      {isCreateModalOpen ? (
        <AdminProjectCreateModal
          key='create-project'
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
        />
      ) : null}

      {editingProject ? (
        <AdminProjectCreateModal
          key={`edit-project-${editingProject.id}`}
          isOpen
          mode='edit'
          initialProject={editingProject}
          onClose={() => setEditingProject(null)}
          onSaveComplete={handleEditComplete}
          onSaveFailed={(message) =>
            setToastState({
              visible: true,
              title: '수정 실패',
              message,
              type: 'error',
            })
          }
        />
      ) : null}

      <Toast
        visible={deleteTarget !== null}
        title='프로젝트 삭제'
        message={
          deleteTarget
            ? `${deleteTarget.companyName} 프로젝트를 정말 삭제하시겠습니까?`
            : '정말 삭제하시겠습니까?'
        }
        type='error'
        duration={0}
        actionLabel={isDeleting ? '삭제 중...' : '삭제'}
        onAction={() => void handleDeleteProject()}
        onClose={() => {
          if (isDeleting) {
            return
          }

          setDeleteTarget(null)
        }}
      />

      <Toast
        visible={toastState.visible}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
        position='bottom-center'
        onClose={() =>
          setToastState((current) => ({
            ...current,
            visible: false,
          }))
        }
      />
    </div>
  )
}
