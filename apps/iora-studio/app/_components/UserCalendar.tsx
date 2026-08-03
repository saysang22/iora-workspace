'use client'

import { Calendar } from '@iora/ui/client'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { fetchCapacityAvailability, type CapacityAvailabilityMap } from '../../lib/capacity'
import { createBrowserSupabaseClient } from '../../lib/supabase'
import styles from './UserCalendar.module.scss'

type UserCalendarProps = {
  className?: string
}

type CustomCellMap = Record<
  string,
  {
    status: 'unavailable'
    events: Array<{
      label: '작업중'
      tone: 'white'
    }>
  }
>

function buildAvailabilityCellMap(availabilityMap: CapacityAvailabilityMap): CustomCellMap {
  return Object.entries(availabilityMap).reduce<CustomCellMap>((acc, [dateKey, availability]) => {
    if (!availability.isUnavailable) {
      return acc
    }

    acc[dateKey] = {
      status: 'unavailable',
      events: [{ label: '작업중', tone: 'white' }],
    }

    return acc
  }, {})
}

function CalendarLegend() {
  return (
    <ul className={styles.calendarLegend}>
      <li>
        <span className={styles.legendAvailable} aria-hidden='true' />
        예약 가능
      </li>
      <li>
        <span className={styles.legendUnavailable} aria-hidden='true' />
        작업중
      </li>
      <li>
        <span className={styles.legendNotice} aria-hidden='true' />
        주말/공휴일
      </li>
    </ul>
  )
}

export default function UserCalendar({ className }: UserCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const [calendarMonth, setCalendarMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  })
  const [availabilityMap, setAvailabilityMap] = useState<CapacityAvailabilityMap>({})
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const customCellMap = useMemo(() => buildAvailabilityCellMap(availabilityMap), [availabilityMap])

  useEffect(() => {
    let isMounted = true

    const loadAvailability = async () => {
      try {
        const nextAvailabilityMap = await fetchCapacityAvailability(supabase, calendarMonth)
        if (!isMounted) {
          return
        }

        setAvailabilityError(null)
        setAvailabilityMap(nextAvailabilityMap)
      } catch {
        if (!isMounted) {
          return
        }

        setAvailabilityError('이번 달 예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        setAvailabilityMap({})
      }
    }

    void loadAvailability()

    return () => {
      isMounted = false
    }
  }, [calendarMonth, supabase])

  return (
    <div className={`${styles.calendarCard}${className ? ` ${className}` : ''}`}>
      <div className={styles.header}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>MONTHLY AVAILABILITY</p>
          <h2>이번 달 작업 가능 현황</h2>
          <p className={styles.description}>
            문의 전에 현재 작업 가능 일정을 먼저 확인해주세요. 빨간 날짜는 이미 작업이 진행 중인 일정입니다.
          </p>
        </div>
      </div>

      {availabilityError ? <p className={styles.error}>{availabilityError}</p> : null}

      <Calendar
        className={styles.calendar}
        style={
          {
            '--calendar-page-background': 'transparent',
            '--calendar-page-padding': '0',
            '--calendar-layout-max-width': '100%',
            '--calendar-panel-background': 'transparent',
            '--calendar-panel-border': '#242424',
            '--calendar-panel-radius': '18px',
            '--calendar-panel-shadow': 'none',
            '--calendar-panel-padding': '0',
            '--calendar-header-margin-bottom': '18px',
            '--calendar-header-gap': '12px',
            '--calendar-title-color': '#f7f2eb',
            '--calendar-body-text': '#b9b2ab',
            '--calendar-muted-text': '#666666',
            '--calendar-month-title-size': '1.12rem',
            '--calendar-nav-button-size': '30px',
            '--calendar-nav-button-border': '#2d2d2d',
            '--calendar-nav-button-background': '#141414',
            '--calendar-nav-button-color': '#c9c1bc',
            '--calendar-grid-background': '#171717',
            '--calendar-grid-radius': '18px',
            '--calendar-day-header-background': '#111111',
            '--calendar-day-header-text': '#b9b2ab',
            '--calendar-day-header-size': '0.72rem',
            '--calendar-day-cell-background': '#101010',
            '--calendar-day-cell-hover-background': '#161616',
            '--calendar-day-cell-min-height': '76px',
            '--calendar-day-cell-padding': '8px',
            '--calendar-day-number-color': '#f7f2eb',
            '--calendar-sunday-color': '#d79a9a',
            '--calendar-saturday-color': '#67a3ea',
            '--calendar-unavailable-background': '#e03131',
            '--calendar-unavailable-hover-background': '#e03131',
            '--calendar-holiday-background': '#e03131',
            '--calendar-holiday-border': '#e03131',
            '--calendar-event-badge-color': '#101010',
            '--calendar-event-white-background': '#b82525',
            '--calendar-event-white-color': '#ffe6e6',
          } as CSSProperties
        }
        title={null}
        description={null}
        year={calendarMonth.year}
        month={calendarMonth.month}
        customCellMap={customCellMap}
        legend={null}
        headerExtra={<CalendarLegend />}
        showSelectedLegend={false}
        showTopRow={false}
        onDisplayMonthChange={setCalendarMonth}
      />
    </div>
  )
}
