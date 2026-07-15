'use client'

import { CalendarAdmin, type CalendarAdminAvailabilityMap } from '@iora/ui'
import { useMemo, type CSSProperties } from 'react'
import { fetchCapacityAvailability, upsertCapacitySettings } from '../../../lib/capacity'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import styles from './page.module.scss'

type CalendarStyleOverrides = CSSProperties & Record<`--${string}`, string | number>

const reservationCalendarStyle: CalendarStyleOverrides = {
  '--calendar-page-background': 'transparent',
  '--calendar-page-padding': '0',
  '--calendar-layout-max-width': '100%',
  '--calendar-top-row-margin-bottom': '0',
  '--calendar-panel-background': 'transparent',
  '--calendar-panel-border': 'transparent',
  '--calendar-panel-radius': '0',
  '--calendar-panel-shadow': 'none',
  '--calendar-panel-padding': '0',
  '--calendar-header-margin-bottom': '22px',
  '--calendar-header-gap': '14px',
  '--calendar-title-color': '#f1f5f9',
  '--calendar-body-text': '#cbd5e1',
  '--calendar-muted-text': '#64748b',
  '--calendar-month-title-size': '24px',
  '--calendar-month-title-weight': '700',
  '--calendar-nav-button-size': '30px',
  '--calendar-nav-button-radius': '999px',
  '--calendar-nav-button-border': 'rgb(148 163 184 / 0.18)',
  '--calendar-nav-button-background': '#071423',
  '--calendar-nav-button-color': '#94a3b8',
  '--calendar-grid-background': 'rgb(148 163 184 / 0.08)',
  '--calendar-grid-radius': '16px',
  '--calendar-day-header-background': 'rgb(30 41 59 / 0.65)',
  '--calendar-day-header-text': '#94a3b8',
  '--calendar-day-header-size': '12px',
  '--calendar-day-cell-background': 'rgb(11 24 44 / 0.45)',
  '--calendar-day-cell-hover-background': 'rgb(18 36 61 / 0.72)',
  '--calendar-day-cell-min-height': '102px',
  '--calendar-day-cell-padding': '10px',
  '--calendar-day-number-color': '#cbd5e1',
  '--calendar-sunday-color': '#fda4af',
  '--calendar-saturday-color': '#93c5fd',
  '--calendar-holiday-color': '#fda4af',
  '--calendar-holiday-background': 'rgb(255 45 122 / 0.1)',
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

export default function ReservationsCalendar() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const loadAvailability = async (params: { year: number; month: number }): Promise<CalendarAdminAvailabilityMap> =>
    fetchCapacityAvailability(supabase, params)

  const saveCapacitySettings = async (params: { dateKeys: string[]; maxCapacity: number }) => {
    await upsertCapacitySettings(supabase, params)
  }

  return (
    <div className={styles.calendarExperience}>
      <CalendarAdmin
        title={null}
        description={null}
        legend={null}
        showTopRow={false}
        showDebugPanel={false}
        saveButtonLabel='작업 허용 수 저장'
        statusText='선택한 날짜별 작업 허용 수를 저장하고, 예약이 가득 찬 날짜는 자동으로 작업중으로 표시됩니다.'
        style={reservationCalendarStyle}
        slotClassNames={{
          root: styles.calendarRoot,
          mainSection: styles.calendarMainSection,
          calendarPanel: styles.calendarSurface,
          calendarHeader: styles.calendarHeader,
          leftHeaderGroup: styles.calendarHeaderLeft,
          monthTitleButton: styles.calendarTitleButton,
          navigationButtons: styles.calendarNavigation,
          monthModal: styles.calendarMonthModal,
          calendarGrid: styles.calendarGrid,
          dayHeader: styles.calendarDayHeader,
          dayCell: styles.calendarDayCell,
          dayNumber: styles.calendarDayNumber,
          eventBadge: styles.calendarEventBadge,
        }}
        headerExtraClassName={styles.calendarControls}
        headerExtraControlsClassName={styles.calendarControlsRow}
        headerExtraTextClassName={styles.calendarControlsText}
        primaryActionRowClassName={styles.calendarPrimaryActionRow}
        defaultProjectLimit={1}
        loadAvailability={loadAvailability}
        onSaveCapacitySettings={saveCapacitySettings}
      />
    </div>
  )
}
