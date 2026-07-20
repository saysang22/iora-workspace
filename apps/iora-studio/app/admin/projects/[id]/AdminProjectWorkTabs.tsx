'use client'

import { Board, Tab } from '@iora/ui'
import { useEffect, useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import type { Database } from '../../../../lib/database.types'
import { PROJECT_REQUEST_HISTORY } from '../../../projects/request/projectRequest.mock'
import ProjectPageStatusButton from '../ProjectPageStatusButton'
import AdminProjectPagesSection from './AdminProjectPagesSection'
import styles from './page.module.scss'

type AdminProjectWorkTabsProps = {
  currentStage: Database['public']['Enums']['project_stage']
  pages: Array<{
    id: string
    page_name: string
    sort_order: number
    status: 'pending' | 'in_progress' | 'completed'
  }>
  projectId: string
  stageProgressLabel: string
}

type RequestIssueStatus = 'completed' | 'in_progress' | 'pending' | 'review'

type RequestIssueItem = {
  assignee: string
  date: string
  id: string
  status: RequestIssueStatus
  title: string
}

const PAGINATION_BUTTON_THEME = {
  size: '14px',
  background: 'rgb(11 20 35 / 0.9)',
  textColor: '#d7e4f8',
  borderColor: 'rgb(148 163 184 / 0.16)',
  hoverBackground: 'rgb(19 31 53 / 0.96)',
  hoverTextColor: '#ffffff',
  hoverBorderColor: 'rgb(148 163 184 / 0.28)',
  round: '10px',
  padding: '6px 10px',
}

const PAGINATION_ACTIVE_THEME = {
  ...PAGINATION_BUTTON_THEME,
  background: '#ff2d7a',
  textColor: '#ffffff',
  borderColor: '#ff2d7a',
  hoverBackground: '#ff4f9f',
  hoverTextColor: '#ffffff',
  hoverBorderColor: '#ff4f9f',
}

const PAGINATION_DISABLED_THEME = {
  ...PAGINATION_BUTTON_THEME,
  textColor: '#6f83a3',
  hoverTextColor: '#6f83a3',
}

function toRequestIssueStatus(status: 'completed' | 'processing' | 'received'): RequestIssueStatus {
  if (status === 'completed') {
    return 'completed'
  }

  if (status === 'processing') {
    return 'in_progress'
  }

  return 'pending'
}

function createInitialRequestIssues(): RequestIssueItem[] {
  return PROJECT_REQUEST_HISTORY.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    assignee: item.assignee,
    status: toRequestIssueStatus(item.status),
  }))
}

function AdminProjectRequestIssuesSection({
  onPendingIssueCountChange,
}: {
  onPendingIssueCountChange: (count: number) => void
}) {
  const [issues, setIssues] = useState<RequestIssueItem[]>(createInitialRequestIssues)
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([])

  const hasSelection = selectedIssueIds.length > 0
  const pendingIssueCount = issues.filter((issue) => issue.status === 'pending').length

  useEffect(() => {
    onPendingIssueCountChange(pendingIssueCount)
  }, [onPendingIssueCountChange, pendingIssueCount])

  const handleToggleSelect = (issueId: string) => {
    setSelectedIssueIds((current) =>
      current.includes(issueId) ? current.filter((id) => id !== issueId) : [...current, issueId],
    )
  }

  const handleUpdateSelectedStatus = (nextStatus: RequestIssueStatus) => {
    if (!hasSelection) {
      return
    }

    setIssues((current) =>
      current.map((issue) =>
        selectedIssueIds.includes(issue.id) ? { ...issue, status: nextStatus } : issue,
      ),
    )
    setSelectedIssueIds([])
  }

  const columns = useMemo(
    () => [
      { key: 'select', header: '#', align: 'center' as const },
      { key: 'status', header: '상태', align: 'center' as const },
      { key: 'title', header: '요청 내용', align: 'center' as const },
      { key: 'date', header: '요청일', align: 'center' as const },
      { key: 'assignee', header: '담당자', align: 'center' as const },
    ],
    [],
  )

  const rows = useMemo(
    () =>
      issues.map((issue) => {
        const isSelected = selectedIssueIds.includes(issue.id)

        return {
          id: issue.id,
          select: (
            <button
              type='button'
              className={`${styles.checkCellButton} ${
                isSelected ? styles.checkCellButtonActive : ''
              }`.trim()}
              onClick={(event) => {
                event.stopPropagation()
                handleToggleSelect(issue.id)
              }}
              aria-label={`${issue.title} 선택`}
              aria-pressed={isSelected}
            >
              <span
                className={`${styles.checkCell} ${isSelected ? styles.checkCellActive : ''}`.trim()}
                aria-hidden='true'
              >
                {isSelected ? <FiCheck size={12} /> : null}
              </span>
            </button>
          ),
          status: (
            <span
              className={`${styles.statusPill} ${
                issue.status === 'completed'
                  ? styles.statusDone
                  : issue.status === 'in_progress'
                    ? styles.statusInProgress
                    : issue.status === 'review'
                      ? styles.statusReview
                      : styles.statusPending
              }`.trim()}
            >
              {issue.status === 'completed'
                ? '완료'
                : issue.status === 'in_progress'
                  ? '진행 중'
                  : issue.status === 'review'
                    ? '검토 중'
                    : '대기'}
            </span>
          ),
          title: issue.title,
          date: issue.date,
          assignee: issue.assignee,
        }
      }),
    [issues, selectedIssueIds],
  )

  return (
    <section className={styles.requestSection}>
      <Board
        title='수정 요청 사항'
        className={styles.projectBoard}
        headerClassName={styles.projectBoardHeader}
        titleClassName={styles.projectBoardTitle}
        actionClassName={styles.projectBoardActions}
        paginationClassName={styles.projectBoardPagination}
        tableClassName={styles.projectBoardTable}
        hideWriteButton
        pageSize={10}
        headerActions={
          <>
            <ProjectPageStatusButton
              ariaLabel='선택한 요청을 검토 중 상태로 변경'
              disabled={!hasSelection}
              onClick={() => handleUpdateSelectedStatus('review')}
              tone='review'
            />
            <ProjectPageStatusButton
              ariaLabel='선택한 요청을 진행 중 상태로 변경'
              disabled={!hasSelection}
              onClick={() => handleUpdateSelectedStatus('in_progress')}
              tone='progress'
              label='진행 중'
            />
            <ProjectPageStatusButton
              ariaLabel='선택한 요청을 완료 상태로 변경'
              disabled={!hasSelection}
              onClick={() => handleUpdateSelectedStatus('completed')}
              tone='complete'
            />
          </>
        }
        listColumns={columns}
        listRows={rows}
        listRowKeyField='id'
        onListRowClick={(row) => {
          const issueId = typeof row.id === 'string' ? row.id : null

          if (!issueId) {
            return
          }

          handleToggleSelect(issueId)
        }}
        thColor='#9caecc'
        thBackground='rgb(28 41 67 / 0.84)'
        tdColor='#e5edf9'
        tdBackground='transparent'
        borderColor='rgb(148 163 184 / 0.08)'
        paginationButtonTheme={PAGINATION_BUTTON_THEME}
        paginationActiveButtonTheme={PAGINATION_ACTIVE_THEME}
        paginationDisabledButtonTheme={PAGINATION_DISABLED_THEME}
      />
    </section>
  )
}

function AdminProjectPageStatusNotice({ stageProgressLabel }: { stageProgressLabel: string }) {
  return (
    <section className={styles.requestSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>페이지 현황</h2>
      </div>

      <div className={styles.stageNoticeCard}>
        <span className={styles.stageNoticeIcon} aria-hidden='true'>
          <span className={styles.stageNoticeDot} />
        </span>
        <div className={styles.stageNoticeText}>
          <strong>{stageProgressLabel}</strong>
          <p>페이지 현황 리스트는 개발 단계에서만 표시됩니다.</p>
        </div>
      </div>
    </section>
  )
}

export default function AdminProjectWorkTabs({
  currentStage,
  pages,
  projectId,
  stageProgressLabel,
}: AdminProjectWorkTabsProps) {
  const [pendingIssueCount, setPendingIssueCount] = useState(0)

  const items = [
    {
      id: 'pages',
      label: '페이지 현황',
      content:
        currentStage === 'development' ? (
          <AdminProjectPagesSection pages={pages} projectId={projectId} />
        ) : (
          <AdminProjectPageStatusNotice stageProgressLabel={stageProgressLabel} />
        ),
    },
    {
      id: 'requests',
      label: (
        <span className={styles.tabLabelWithBadge}>
          <span>수정 요청 사항</span>
          {pendingIssueCount > 0 ? (
            <span className={styles.tabAlarmBadge}>{pendingIssueCount}</span>
          ) : null}
        </span>
      ),
      content: <AdminProjectRequestIssuesSection onPendingIssueCountChange={setPendingIssueCount} />,
    },
  ]

  return (
    <Tab
      items={items}
      initialTabId='pages'
      ariaLabel='프로젝트 작업 탭'
      className={styles.adminWorkTabs}
      tabRowClassName={styles.adminWorkTabRow}
      tabButtonClassName={styles.adminWorkTabButton}
      activeTabButtonClassName={styles.adminWorkTabButtonActive}
      contentClassName={styles.adminWorkTabContent}
    />
  )
}
