'use client'

import { Pagination, Table } from '@iora/ui'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  ADMIN_PAGINATION_ACTIVE_THEME,
  ADMIN_PAGINATION_BUTTON_THEME,
  ADMIN_PAGINATION_DISABLED_THEME,
} from '../_components/paginationTheme'
import type { MaintenanceListItem } from './page'
import styles from './page.module.scss'

const PAGE_SIZE = 10

const TABLE_COLUMNS: Array<{ key: string; header: string; align?: 'left' | 'center' }> = [
  { key: 'company', header: '업체 / 고객명' },
  { key: 'projectName', header: '프로젝트명' },
  { key: 'stage', header: '현재 단계', align: 'center' },
  { key: 'startedAt', header: '시작일', align: 'center' },
  { key: 'careEndedAt', header: '유지보수 종료일', align: 'center' },
]

function formatDate(value: string | null) {
  if (!value) {
    return '미정'
  }

  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

function getStageLabel(stage: MaintenanceListItem['currentStage']) {
  return stage === 'completed' ? '계약 완료' : '유지보수'
}

export default function MaintenanceListClient({ items }: { items: MaintenanceListItem[] }) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const rows = useMemo(
    () =>
      items.slice(startIndex, endIndex).map((item) => ({
        __rowId: item.id,
        company: (
          <div className={styles.companyCell}>
            <strong className={styles.companyName}>{item.companyName}</strong>
            <span className={styles.clientName}>{item.clientName}</span>
          </div>
        ),
        projectName: <span className={styles.projectName}>{item.projectName}</span>,
        stage: (
          <span
            className={`${styles.stagePill} ${
              item.currentStage === 'completed' ? styles.stageCompleted : styles.stageCare
            }`.trim()}
          >
            {getStageLabel(item.currentStage)}
          </span>
        ),
        startedAt: <span className={styles.dateCell}>{formatDate(item.startedAt)}</span>,
        careEndedAt: <span className={styles.dateCell}>{formatDate(item.careEndedAt)}</span>,
      })),
    [endIndex, items, startIndex],
  )

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>유지보수 프로젝트 리스트</h2>
          <p className={styles.panelDescription}>유지보수 및 계약 완료 프로젝트만 별도로 표시합니다.</p>
        </div>
        <span className={styles.panelMeta}>총 {items.length}건</span>
      </div>

      <div className={styles.tableShell}>
        <Table
          columns={TABLE_COLUMNS}
          rows={rows}
          rowKeyField='__rowId'
          minWidth='860px'
          thColor='#97a8c3'
          thBackground='rgb(28 41 67 / 0.72)'
          tdColor='#f8fafc'
          tdBackground='rgb(20 31 53 / 0.96)'
          borderColor='rgb(148 163 184 / 0.08)'
          headerPadding='20px 24px'
          cellPadding='22px 24px'
          thFontSize='14px'
          tdFontSize='15px'
          thFontWeight='500'
          rowHoverBackground='rgb(24 38 63 / 0.96)'
          onRowClick={(row) => {
            if (typeof row.__rowId === 'string') {
              router.push(`/admin/projects/${row.__rowId}`)
            }
          }}
        />
      </div>

      <div className={styles.paginationRow}>
        <p className={styles.paginationSummary}>
          Showing {items.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length}{' '}
          projects
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
    </section>
  )
}
