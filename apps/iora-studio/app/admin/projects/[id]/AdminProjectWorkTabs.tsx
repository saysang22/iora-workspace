'use client'

import { Board, Modal, Tab } from '@iora/ui'
import { useEffect, useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import type { Database } from '../../../../lib/database.types'
import {
  PROJECT_MODIFICATION_STATUS_LABELS,
  type ProjectModificationRequestListItem,
  type ProjectModificationRequestStatus,
} from '../../../../lib/projectModificationRequests'
import { createBrowserSupabaseClient } from '../../../../lib/supabase'
import ProjectPageStatusButton from '../ProjectPageStatusButton'
import AdminProjectPagesSection from './AdminProjectPagesSection'
import styles from './page.module.scss'

type AdminProjectWorkTabsProps = {
  currentStage: Database['public']['Enums']['project_stage']
  initialRequests: ProjectModificationRequestListItem[]
  initialTabId?: 'pages' | 'requests'
  pages: Array<{
    id: string
    page_name: string
    sort_order: number
    status: 'pending' | 'in_progress' | 'completed'
  }>
  projectId: string
  stageProgressLabel: string
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

const MODAL_CANCEL_THEME = {
  size: '14px',
  background: '#16233b',
  textColor: '#d5deed',
  borderColor: 'rgb(148 163 184 / 0.16)',
  hoverBackground: '#1c2c49',
  hoverTextColor: '#ffffff',
  hoverBorderColor: 'rgb(148 163 184 / 0.28)',
  round: '14px',
  padding: '12px 18px',
} as const

function getPendingIssueCount(issues: ProjectModificationRequestListItem[]) {
  return issues.filter((issue) => issue.status === 'pending').length
}

function AdminProjectRequestIssuesSection({
  initialRequests,
  onPendingIssueCountChange,
}: {
  initialRequests: ProjectModificationRequestListItem[]
  onPendingIssueCountChange: (count: number) => void
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [issues, setIssues] = useState<ProjectModificationRequestListItem[]>(initialRequests)
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([])
  const [selectedIssue, setSelectedIssue] = useState<ProjectModificationRequestListItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleUpdateSelectedStatus = async (nextStatus: ProjectModificationRequestStatus) => {
    if (!hasSelection || isUpdating) {
      return
    }

    setIsUpdating(true)
    setErrorMessage(null)

    const { error } = await supabase
      .from('project_modification_requests')
      .update({ status: nextStatus })
      .in('id', selectedIssueIds)

    if (error) {
      setErrorMessage(error.message || '수정 요청 상태를 변경하지 못했습니다.')
      setIsUpdating(false)
      return
    }

    setIssues((current) =>
      current.map((issue) =>
        selectedIssueIds.includes(issue.id) ? { ...issue, status: nextStatus } : issue,
      ),
    )
    setSelectedIssueIds([])
    setIsUpdating(false)
  }

  const columns = useMemo(
    () => [
      { key: 'select', header: '#', align: 'center' as const },
      { key: 'status', header: '상태', align: 'center' as const },
      { key: 'title', header: '요청 내용', align: 'center' as const },
      { key: 'date', header: '요청일', align: 'center' as const },
      { key: 'requester', header: '요청자', align: 'center' as const },
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
              {PROJECT_MODIFICATION_STATUS_LABELS[issue.status]}
            </span>
          ),
          title: (
            <button
              type='button'
              className={styles.requestContentButton}
              onClick={(event) => {
                event.stopPropagation()
                setSelectedIssue(issue)
              }}
            >
              {issue.title}
            </button>
          ),
          date: issue.date,
          requester: issue.requesterName,
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
              disabled={!hasSelection || isUpdating}
              onClick={() => void handleUpdateSelectedStatus('review')}
              tone='review'
            />
            <ProjectPageStatusButton
              ariaLabel='선택한 요청을 진행 중 상태로 변경'
              disabled={!hasSelection || isUpdating}
              onClick={() => void handleUpdateSelectedStatus('in_progress')}
              tone='progress'
              label='진행 중'
            />
            <ProjectPageStatusButton
              ariaLabel='선택한 요청을 완료 상태로 변경'
              disabled={!hasSelection || isUpdating}
              onClick={() => void handleUpdateSelectedStatus('completed')}
              tone='complete'
            />
          </>
        }
        listColumns={columns}
        listRows={rows}
        listRowKeyField='id'
        onListRowClick={(row) => {
          const issueId = typeof row.id === 'string' ? row.id : null

          if (!issueId || isUpdating) {
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
      {errorMessage ? <p className={styles.flowError}>{errorMessage}</p> : null}

      <Modal
        isOpen={Boolean(selectedIssue)}
        title='수정 요청 내용'
        width='min(100%, 720px)'
        background='#101010'
        confirmLabel='확인'
        cancelLabel='닫기'
        closeOnOverlayClick
        onConfirm={() => setSelectedIssue(null)}
        onClose={() => setSelectedIssue(null)}
        cancelButtonProps={{
          ...MODAL_CANCEL_THEME,
          style: { minHeight: '42px', fontWeight: 700 },
        }}        
        confirmButtonProps={{
          size: '14px',
          background: '#ff2d7a',
          textColor: '#ffffff',
          borderColor: '#ff2d7a',
          hoverBackground: '#ff4f9f',
          hoverTextColor: '#ffffff',
          hoverBorderColor: '#ff4f9f',
          round: '14px',
          padding: '12px 18px',
          style: { minHeight: '42px', fontWeight: 700 },
        }}
        titleStyle={{
          color: '#f8fafc',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        {selectedIssue ? (
          <div className={styles.requestContentModalBody}>
            <div className={styles.requestContentModalMeta}>
              <div>
                <span>제목</span>
                <strong>{selectedIssue.title}</strong>
              </div>
              <div>
                <span>요청일</span>
                <strong>{selectedIssue.date}</strong>
              </div>
              <div>
                <span>요청자</span>
                <strong>{selectedIssue.requesterName}</strong>
              </div>
            </div>
            <div className={styles.requestContentModalBox}>
              <p>{selectedIssue.description || '등록된 요청 내용이 없습니다.'}</p>
            </div>
          </div>
        ) : null}
      </Modal>
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
  initialRequests,
  initialTabId = 'pages',
  pages,
  projectId,
  stageProgressLabel,
}: AdminProjectWorkTabsProps) {
  const [pendingIssueCount, setPendingIssueCount] = useState(() => getPendingIssueCount(initialRequests))

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
          {pendingIssueCount > 0 ? <span className={styles.tabAlarmBadge}>{pendingIssueCount}</span> : null}
        </span>
      ),
      content: (
        <AdminProjectRequestIssuesSection
          initialRequests={initialRequests}
          onPendingIssueCountChange={setPendingIssueCount}
        />
      ),
    },
  ]

  return (
    <Tab
      items={items}
      initialTabId={initialTabId}
      ariaLabel='프로젝트 작업 탭'
      className={styles.adminWorkTabs}
      tabRowClassName={styles.adminWorkTabRow}
      tabButtonClassName={styles.adminWorkTabButton}
      activeTabButtonClassName={styles.adminWorkTabButtonActive}
      contentClassName={styles.adminWorkTabContent}
    />
  )
}
