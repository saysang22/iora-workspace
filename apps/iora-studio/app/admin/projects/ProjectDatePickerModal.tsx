'use client'

import { Calendar, Modal, Toast } from '@iora/ui'
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  getCalendarMonth,
  getInitialDateSelection,
  LIME_BUTTON_THEME,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './AdminProjectCreateModal.module.scss'

type ProjectDatePickerModalProps = {
  isOpen: boolean
  title: string
  value: string
  onClose: () => void
  onApply: (nextValue: string) => void
}

type CalendarStyleOverrides = CSSProperties & Record<`--${string}`, string | number>

const datePickerCalendarStyle: CalendarStyleOverrides = {
  '--calendar-page-background': 'transparent',
  '--calendar-page-padding': '0',
  '--calendar-layout-max-width': '100%',
  '--calendar-top-row-margin-bottom': '0',
  '--calendar-panel-background': 'transparent',
  '--calendar-panel-border': 'transparent',
  '--calendar-panel-radius': '0',
  '--calendar-panel-shadow': 'none',
  '--calendar-panel-padding': '0',
  '--calendar-header-margin-bottom': '14px',
  '--calendar-header-gap': '10px',
  '--calendar-title-color': '#f8fafc',
  '--calendar-body-text': '#cbd5e1',
  '--calendar-muted-text': '#64748b',
  '--calendar-month-title-size': '26px',
  '--calendar-month-title-weight': '800',
  '--calendar-nav-button-size': '32px',
  '--calendar-nav-button-radius': '999px',
  '--calendar-nav-button-border': 'rgb(148 163 184 / 0.18)',
  '--calendar-nav-button-background': '#0b1423',
  '--calendar-nav-button-color': '#cbd5e1',
  '--calendar-grid-background': 'rgb(148 163 184 / 0.1)',
  '--calendar-grid-radius': '18px',
  '--calendar-day-header-background': 'rgb(15 23 42 / 0.88)',
  '--calendar-day-header-text': '#8ea1bf',
  '--calendar-day-header-size': '12px',
  '--calendar-day-cell-background': 'rgb(11 20 35 / 0.96)',
  '--calendar-day-cell-hover-background': 'rgb(17 28 49 / 0.96)',
  '--calendar-day-cell-min-height': '76px',
  '--calendar-day-cell-padding': '8px',
  '--calendar-day-number-color': '#f8fafc',
  '--calendar-sunday-color': '#fda4af',
  '--calendar-saturday-color': '#93c5fd',
  '--calendar-holiday-color': '#fda4af',
  '--calendar-holiday-background': 'rgb(255 45 122 / 0.08)',
  '--calendar-holiday-border': 'rgb(255 45 122 / 0.14)',
  '--calendar-unavailable-background': '#ff2d7a',
  '--calendar-unavailable-hover-background': '#ff2d7a',
  '--calendar-unavailable-text': '#fff',
  '--calendar-selected-background': 'rgb(255 45 122 / 0.18)',
  '--calendar-selected-hover-background': 'rgb(255 45 122 / 0.22)',
  '--calendar-selected-text': '#fff',
  '--calendar-selected-toggle-background': 'rgb(255 45 122 / 0.24)',
  '--calendar-event-badge-color': '#e2e8f0',
  '--calendar-event-badge-radius': '8px',
  '--calendar-event-blue-background': 'rgb(255 45 122 / 0.16)',
  '--calendar-event-blue-color': '#ffd5e8',
  '--calendar-event-white-background': 'rgb(255 255 255 / 0.12)',
  '--calendar-event-white-color': '#f8fafc',
  '--calendar-card-background': 'transparent',
  '--calendar-card-border': 'transparent',
  '--calendar-card-radius': '0',
  '--calendar-card-shadow': 'none',
  '--calendar-legend-text': '#94a3b8',
}

export default function ProjectDatePickerModal({
  isOpen,
  title,
  value,
  onClose,
  onApply,
}: ProjectDatePickerModalProps) {
  const [selection, setSelection] = useState<{ dateKey: string } | null>(() => getInitialDateSelection(value))
  const [calendarMonth, setCalendarMonth] = useState(() => getCalendarMonth(getInitialDateSelection(value)))
  const [isConfirmToastVisible, setIsConfirmToastVisible] = useState(false)

  const customCellMap = useMemo(() => {
    if (!selection?.dateKey) {
      return {}
    }

    return {
      [selection.dateKey]: {
        status: 'selected' as const,
        events: [{ label: '선택됨', tone: 'blue' as const }],
      },
    }
  }, [selection])

  const confirmSelection = () => {
    if (!selection?.dateKey) {
      return
    }

    setIsConfirmToastVisible(false)
    onApply(selection.dateKey)
  }

  return (
    <div className={styles.datePickerModal}>
      <Modal
        isOpen={isOpen}
        title={title}
        width='min(100%, 560px)'
        background='#101010'
        confirmLabel='선택 완료'
        cancelLabel='닫기'
        closeOnOverlayClick
        onConfirm={() => {
          if (!selection?.dateKey) {
            return
          }

          setIsConfirmToastVisible(true)
        }}
        onClose={() => {
          setIsConfirmToastVisible(false)
          onClose()
        }}
        titleStyle={{
          color: '#f8fafc',
          fontSize: '16px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
        cancelButtonProps={{
          ...SECONDARY_BUTTON_THEME,
          style: { minHeight: '40px', fontWeight: 700 },
        }}
        confirmButtonProps={{
          ...LIME_BUTTON_THEME,
          style: { minHeight: '40px', fontWeight: 800 },
        }}
      >
        <div className={styles.datePickerBody}>
          <Calendar
            title={null}
            description={null}
            style={datePickerCalendarStyle}
            year={calendarMonth.year}
            month={calendarMonth.month}
            customCellMap={customCellMap}
            legend={null}
            showTopRow={false}
            showSelectedLegend={false}
            className={styles.calendarRoot}
            slotClassNames={{
              root: styles.calendarRoot,
              mainSection: styles.calendarMainSection,
              calendarPanel: styles.calendarPanel,
              calendarHeader: styles.calendarHeader,
              leftHeaderGroup: styles.calendarLeftHeaderGroup,
              monthTitleButton: styles.calendarTitleButton,
              navigationButtons: styles.calendarNavigationButtons,
              monthModal: styles.calendarMonthModal,
              calendarGrid: styles.calendarGrid,
              dayHeader: styles.calendarDayHeader,
              dayCell: styles.calendarDayCell,
              dayNumber: styles.calendarDayNumber,
              eventBadge: styles.calendarEventBadge,
            }}
            onDisplayMonthChange={setCalendarMonth}
            onCellClick={({ dateKey }) => {
              setIsConfirmToastVisible(false)
              setSelection({ dateKey })
            }}
          />
        </div>
      </Modal>

      <Toast
        visible={isConfirmToastVisible}
        title='날짜 선택 확인'
        message='선택한 날짜로 적용할까요?'
        type='info'
        position='center'
        duration={0}
        actionLabel='적용'
        onAction={confirmSelection}
        onClose={() => setIsConfirmToastVisible(false)}
      />
    </div>
  )
}
