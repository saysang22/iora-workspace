'use client'

import { Button, Pagination, Table, Toast } from '@iora/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiImage, FiMoreVertical, FiPlus } from 'react-icons/fi'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import {
  ADMIN_PAGINATION_ACTIVE_THEME,
  ADMIN_PAGINATION_BUTTON_THEME,
  ADMIN_PAGINATION_DISABLED_THEME,
} from '../_components/paginationTheme'
import type { PortfolioListItem, PortfolioProjectOption } from './page'
import PortfolioUpsertModal, { type PortfolioFormPayload } from './PortfolioUpsertModal'
import styles from './page.module.scss'

const PAGE_SIZE = 10

type ToastState = {
  visible: boolean
  title: string
  message: string
  type: 'info' | 'success' | 'error'
}

const TABLE_COLUMNS: Array<{ key: string; header: string; align?: 'left' | 'center' }> = [
  { key: 'thumbnail', header: '썸네일', align: 'center' },
  { key: 'title', header: '제목' },
  { key: 'category', header: '카테고리', align: 'center' },
  { key: 'published', header: '노출 여부', align: 'center' },
  { key: 'sortOrder', header: '순서', align: 'center' },
  { key: 'actions', header: '관리', align: 'center' },
]

function buildEmptyToast(): ToastState {
  return {
    visible: false,
    title: '',
    message: '',
    type: 'info',
  }
}

function sortPortfolioItems(items: PortfolioListItem[]) {
  return [...items].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

export default function PortfolioListClient({
  items,
  projectOptions,
}: {
  items: PortfolioListItem[]
  projectOptions: PortfolioProjectOption[]
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const actionMenuRef = useRef<HTMLDivElement | null>(null)
  const [localItems, setLocalItems] = useState(items)
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PortfolioListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastState, setToastState] = useState<ToastState>(buildEmptyToast())
  const totalPages = Math.max(1, Math.ceil(localItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  useEffect(() => {
    const handleDocumentPointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (actionMenuRef.current?.contains(target)) {
        return
      }

      setOpenMenuId(null)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [])

  const pagedRows = useMemo(
    () =>
      localItems.slice(startIndex, endIndex).map((item) => ({
        __rowId: item.id,
        thumbnail: item.thumbnail_url ? (
          <div
            className={styles.thumbnailImage}
            role='img'
            aria-label={item.title}
            style={{ backgroundImage: `url("${item.thumbnail_url}")` }}
          />
        ) : (
          <div className={styles.thumbnailFallback}>
            <FiImage size={16} />
          </div>
        ),
        title: (
          <div className={styles.titleCell}>
            <strong>{item.title}</strong>
            <span>{item.project_label ?? '프로젝트 연결 없음'}</span>
          </div>
        ),
        category: <span className={styles.categoryText}>{item.category || '-'}</span>,
        published: (
          <span className={`${styles.publishPill} ${item.is_published ? styles.publishOn : styles.publishOff}`.trim()}>
            {item.is_published ? '공개' : '비공개'}
          </span>
        ),
        sortOrder: <span className={styles.sortOrderText}>{item.sort_order}</span>,
        actions: (
          <div className={styles.actionMenuWrap} ref={openMenuId === item.id ? actionMenuRef : null}>
            <button
              className={styles.moreButton}
              type='button'
              aria-label={`${item.title} 관리`}
              aria-expanded={openMenuId === item.id}
              onClick={(event) => {
                event.stopPropagation()
                setOpenMenuId((current) => (current === item.id ? null : item.id))
              }}
            >
              <FiMoreVertical size={18} />
            </button>

            {openMenuId === item.id ? (
              <div className={styles.actionMenu} role='menu' onClick={(event) => event.stopPropagation()}>
                <button
                  className={styles.actionMenuItem}
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setOpenMenuId(null)
                    setEditingItem(item)
                  }}
                >
                  수정
                </button>
                <button
                  className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`.trim()}
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setOpenMenuId(null)
                    setDeleteTarget(item)
                  }}
                >
                  삭제
                </button>
              </div>
            ) : null}
          </div>
        ),
      })),
    [endIndex, localItems, openMenuId, startIndex],
  )

  async function handleCreate(payload: PortfolioFormPayload) {
    const nextSortOrder =
      localItems.length > 0 ? Math.max(...localItems.map((item) => item.sort_order)) + 1 : 0

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        title: payload.title,
        description: payload.description || null,
        thumbnail_url: payload.thumbnailUrl || null,
        category: payload.category || null,
        is_published: payload.isPublished,
        sort_order: nextSortOrder,
        project_id: payload.projectId || null,
      })
      .select('*')
      .single()

    if (error) {
      setToastState({
        visible: true,
        title: '등록 실패',
        message: error.message,
        type: 'error',
      })
      return
    }

    const projectLabel = payload.projectId
      ? projectOptions.find((project) => project.id === payload.projectId)?.label ?? null
      : null

    setLocalItems((current) =>
      sortPortfolioItems([
        {
          ...data,
          project_name: projectLabel ? projectLabel.split(' / ').slice(-1)[0] ?? null : null,
          project_label: projectLabel,
        },
        ...current,
      ]),
    )
    setIsCreateOpen(false)
    setToastState({
      visible: true,
      title: '등록 완료',
      message: '포트폴리오가 등록되었습니다.',
      type: 'success',
    })
  }

  async function handleUpdate(payload: PortfolioFormPayload) {
    if (!editingItem) {
      return
    }

    const { data, error } = await supabase
      .from('portfolios')
      .update({
        title: payload.title,
        description: payload.description || null,
        thumbnail_url: payload.thumbnailUrl || null,
        category: payload.category || null,
        is_published: payload.isPublished,
        project_id: payload.projectId || null,
      })
      .eq('id', editingItem.id)
      .select('*')
      .single()

    if (error) {
      setToastState({
        visible: true,
        title: '수정 실패',
        message: error.message,
        type: 'error',
      })
      return
    }

    const projectLabel = payload.projectId
      ? projectOptions.find((project) => project.id === payload.projectId)?.label ?? null
      : null

    setLocalItems((current) =>
      sortPortfolioItems(
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...data,
                project_name: projectLabel ? projectLabel.split(' / ').slice(-1)[0] ?? null : null,
                project_label: projectLabel,
              }
            : item,
        ),
      ),
    )
    setEditingItem(null)
    setToastState({
      visible: true,
      title: '수정 완료',
      message: '포트폴리오가 수정되었습니다.',
      type: 'success',
    })
  }

  async function handleDelete() {
    if (!deleteTarget || isDeleting) {
      return
    }

    setIsDeleting(true)

    const { error } = await supabase.from('portfolios').delete().eq('id', deleteTarget.id)

    if (error) {
      setIsDeleting(false)
      setDeleteTarget(null)
      setToastState({
        visible: true,
        title: '삭제 실패',
        message: error.message,
        type: 'error',
      })
      return
    }

    setLocalItems((current) => sortPortfolioItems(current.filter((item) => item.id !== deleteTarget.id)))
    setDeleteTarget(null)
    setIsDeleting(false)
    setToastState({
      visible: true,
      title: '삭제 완료',
      message: '포트폴리오가 삭제되었습니다.',
      type: 'success',
    })
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>포트폴리오 리스트</h2>
          <p className={styles.panelDescription}>썸네일, 카테고리, 공개 여부, 노출 순서를 한 번에 관리합니다.</p>
        </div>

        <Button
          type='button'
          size='14px'
          background='#ff2d7a'
          textColor='#ffffff'
          borderColor='#ff2d7a'
          hoverBackground='#ff4f9f'
          hoverTextColor='#ffffff'
          hoverBorderColor='#ff4f9f'
          round='14px'
          padding='12px 16px'
          onClick={() => setIsCreateOpen(true)}
        >
          <span className={styles.primaryButtonInner}>
            <FiPlus size={16} />
            새 포트폴리오 등록
          </span>
        </Button>
      </div>

      <div className={styles.tableShell}>
        <Table
          columns={TABLE_COLUMNS}
          rows={pagedRows}
          rowKeyField='__rowId'
          minWidth='980px'
          thColor='#97a8c3'
          thBackground='rgb(28 41 67 / 0.72)'
          tdColor='#f8fafc'
          tdBackground='rgb(20 31 53 / 0.96)'
          borderColor='rgb(148 163 184 / 0.08)'
          headerPadding='20px 24px'
          cellPadding='20px 24px'
          thFontSize='14px'
          tdFontSize='15px'
          thFontWeight='500'
          rowHoverBackground='rgb(24 38 63 / 0.96)'
        />
      </div>

      <div className={styles.paginationRow}>
        <p className={styles.paginationSummary}>
          Showing {localItems.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, localItems.length)} of{' '}
          {localItems.length} portfolios
        </p>

        <Pagination
          className={styles.paginationShell}
          currentPage={currentPage}
          totalPages={totalPages}
          groupSize={3}
          onPageChange={setPage}
          previousLabel={<FiChevronLeft size={16} />}
          nextLabel={<FiChevronRight size={16} />}
          buttonTheme={ADMIN_PAGINATION_BUTTON_THEME}
          activeButtonTheme={ADMIN_PAGINATION_ACTIVE_THEME}
          disabledButtonTheme={ADMIN_PAGINATION_DISABLED_THEME}
        />
      </div>

      {isCreateOpen ? (
        <PortfolioUpsertModal
          key='portfolio-create'
          isOpen
          mode='create'
          projectOptions={projectOptions}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {editingItem ? (
        <PortfolioUpsertModal
          key={`portfolio-edit-${editingItem.id}`}
          isOpen
          mode='edit'
          initialItem={editingItem}
          projectOptions={projectOptions}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdate}
        />
      ) : null}

      <Toast
        visible={deleteTarget !== null}
        title='포트폴리오 삭제'
        message={
          deleteTarget
            ? `${deleteTarget.title} 항목을 정말 삭제하시겠습니까?`
            : '선택한 포트폴리오를 삭제하시겠습니까?'
        }
        type='error'
        duration={0}
        actionLabel={isDeleting ? '삭제 중...' : '삭제'}
        onAction={() => void handleDelete()}
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
        onClose={() => setToastState(buildEmptyToast())}
      />
    </section>
  )
}
