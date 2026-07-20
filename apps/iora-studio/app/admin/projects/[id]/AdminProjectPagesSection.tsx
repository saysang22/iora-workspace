'use client'

import { Board } from '@iora/ui'
import { useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '../../../../lib/supabase'
import ProjectPageComposer from '../ProjectPageComposer'
import ProjectPageDeleteButton from '../ProjectPageDeleteButton'
import ProjectPageStatusButton from '../ProjectPageStatusButton'
import styles from './page.module.scss'

type ProjectPageStatus = 'pending' | 'in_progress' | 'completed'

type AdminProjectPagesSectionProps = {
  pages: Array<{
    id: string
    page_name: string
    sort_order: number
    status: ProjectPageStatus
  }>
  projectId: string
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

function toStatusLabel(status: ProjectPageStatus) {
  if (status === 'completed') {
    return '완료'
  }

  if (status === 'in_progress') {
    return '진행 중'
  }

  return '대기'
}

export default function AdminProjectPagesSection({
  pages: initialPages,
  projectId,
}: AdminProjectPagesSectionProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [pages, setPages] = useState(
    [...initialPages].sort((left, right) => left.sort_order - right.sort_order),
  )
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)

  const hasSelection = selectedPageIds.length > 0

  const handleAddPages = async (pageNames: string[]) => {
    const normalizedPageNames = pageNames.map((name) => name.trim()).filter(Boolean)

    if (!normalizedPageNames.length) {
      return
    }

    const startOrder = pages.length
    const payload = normalizedPageNames.map((pageName, index) => ({
      project_id: projectId,
      page_name: pageName,
      status: 'pending' as const,
      sort_order: startOrder + index,
    }))

    const { data, error } = await supabase
      .from('project_pages')
      .insert(payload)
      .select('id, page_name, sort_order, status')

    if (error) {
      throw new Error('페이지를 추가하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    }

    setErrorMessage(null)
    setPages((current) =>
      [...current, ...((data ?? []) as AdminProjectPagesSectionProps['pages'])].sort(
        (left, right) => left.sort_order - right.sort_order,
      ),
    )
    router.refresh()
  }

  const handleToggleSelect = (pageId: string) => {
    setSelectedPageIds((current) =>
      current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId],
    )
  }

  const handleUpdateSelectedStatus = async (
    nextStatus: Extract<ProjectPageStatus, 'completed' | 'in_progress'>,
  ) => {
    if (!hasSelection || isMutating) {
      return
    }

    const previousPages = pages

    setIsMutating(true)
    setErrorMessage(null)
    setPages((current) =>
      current.map((page) =>
        selectedPageIds.includes(page.id) ? { ...page, status: nextStatus } : page,
      ),
    )

    const { error } = await supabase
      .from('project_pages')
      .update({ status: nextStatus })
      .in('id', selectedPageIds)

    if (error) {
      setPages(previousPages)
      setErrorMessage('선택한 페이지 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setIsMutating(false)
      return
    }

    setSelectedPageIds([])
    setIsMutating(false)
    router.refresh()
  }

  const handleDeleteSelected = async () => {
    if (!hasSelection || isMutating) {
      return
    }

    const previousPages = pages
    const nextPages = pages.filter((page) => !selectedPageIds.includes(page.id))

    setIsMutating(true)
    setErrorMessage(null)
    setPages(nextPages)

    const { error } = await supabase.from('project_pages').delete().in('id', selectedPageIds)

    if (error) {
      setPages(previousPages)
      setErrorMessage('선택한 페이지를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setIsMutating(false)
      return
    }

    setSelectedPageIds([])
    setIsMutating(false)
    router.refresh()
  }

  const columns = useMemo(
    () => [
      { key: 'select', header: '#', align: 'center' as const },
      { key: 'status', header: '상태', align: 'center' as const },
      { key: 'pageName', header: '페이지명', align: 'center' as const },
    ],
    [],
  )

  const rows = useMemo(
    () =>
      pages.map((page) => {
        const isSelected = selectedPageIds.includes(page.id)

        return {
          id: page.id,
          select: (
            <button
              type='button'
              className={`${styles.checkCellButton} ${
                isSelected ? styles.checkCellButtonActive : ''
              }`.trim()}
              onClick={(event) => {
                event.stopPropagation()
                handleToggleSelect(page.id)
              }}
              aria-label={`${page.page_name} 선택`}
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
                page.status === 'completed'
                  ? styles.statusDone
                  : page.status === 'in_progress'
                    ? styles.statusInProgress
                    : styles.statusPending
              }`.trim()}
            >
              {toStatusLabel(page.status)}
            </span>
          ),
          pageName: page.page_name,
        }
      }),
    [pages, selectedPageIds],
  )

  return (
    <section className={styles.requestSection}>
      {errorMessage ? <p className={styles.flowError}>{errorMessage}</p> : null}

      <Board
        title='페이지 현황'
        className={styles.projectBoard}
        headerClassName={styles.projectBoardHeader}
        titleClassName={styles.projectBoardTitle}
        actionClassName={styles.projectBoardActions}
        toolbarClassName={styles.projectBoardToolbar}
        paginationClassName={styles.projectBoardPagination}
        tableClassName={styles.projectBoardTable}
        hideWriteButton
        pageSize={10}
        headerActions={
          <>
            <ProjectPageStatusButton
              ariaLabel='선택한 페이지를 진행 상태로 변경'
              disabled={!hasSelection || isMutating}
              onClick={() => void handleUpdateSelectedStatus('in_progress')}
              tone='progress'
            />
            <ProjectPageStatusButton
              ariaLabel='선택한 페이지를 완료 상태로 변경'
              disabled={!hasSelection || isMutating}
              onClick={() => void handleUpdateSelectedStatus('completed')}
              tone='complete'
            />
            <ProjectPageDeleteButton
              ariaLabel='선택한 페이지 삭제'
              disabled={!hasSelection || isMutating}
              onClick={() => void handleDeleteSelected()}
            />
          </>
        }
        toolbar={
          <ProjectPageComposer
            addButtonLabel='페이지 추가'
            className={styles.detailPageComposer}
            layout='inline'
            onAddPages={handleAddPages}
          />
        }
        listColumns={columns}
        listRows={rows}
        listRowKeyField='id'
        onListRowClick={(row) => {
          const pageId = typeof row.id === 'string' ? row.id : null

          if (!pageId) {
            return
          }

          handleToggleSelect(pageId)
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
