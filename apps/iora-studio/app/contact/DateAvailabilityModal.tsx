'use client'

import { Calendar, Modal, SelectBox } from '@iora/ui'
import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import { fetchCapacityAvailability, type CapacityAvailabilityMap } from '../../lib/capacity'
import { createBrowserSupabaseClient } from '../../lib/supabase'
import styles from './ContactFormClient.module.scss'

type DateFieldTarget = 'deadline' | 'zoomMeetingAt'

type DateAvailabilityModalProps = {
  isOpen: boolean
  field: DateFieldTarget
  value: string
  onClose: () => void
  onApply: (nextValue: string) => void
}

type CalendarSelection = {
  dateKey: string
}

type CellEventTone = 'white' | 'blue'
type CellStatus = 'unavailable' | 'selected'

type CustomCellMap = Record<
  string,
  {
    status: CellStatus
    events: Array<{
      label: string
      tone: CellEventTone
    }>
  }
>

const DEFAULT_ZOOM_TIME = '10:00'
const ZOOM_TIME_OPTIONS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
].map((time) => ({
  label: time,
  value: time,
}))

function getInitialSelection(value: string) {
  if (!value) {
    return null
  }

  return { dateKey: value.slice(0, 10) }
}

function getCalendarMonth(selection: CalendarSelection | null) {
  if (!selection) {
    const today = new Date()
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    }
  }

  const [year, month] = selection.dateKey.split('-').map(Number)
  return { year, month }
}

function buildCustomCellMap(selectedDateKey: string | null, availabilityMap: CapacityAvailabilityMap): CustomCellMap {
  const map: CustomCellMap = {}

  Object.entries(availabilityMap).forEach(([dateKey, availability]) => {
    if (!availability.isUnavailable) {
      return
    }

    map[dateKey] = {
      status: 'unavailable',
      events: [{ label: '작업중', tone: 'white' }],
    }
  })

  if (selectedDateKey && !map[selectedDateKey]) {
    map[selectedDateKey] = {
      status: 'selected',
      events: [{ label: '선택됨', tone: 'blue' }],
    }
  }

  return map
}

function buildNextValue(field: DateFieldTarget, dateKey: string, currentValue: string) {
  if (field === 'deadline') {
    return dateKey
  }

  const currentTime = currentValue.includes('T') ? currentValue.split('T')[1].slice(0, 5) : DEFAULT_ZOOM_TIME
  return `${dateKey}T${currentTime || DEFAULT_ZOOM_TIME}`
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
        예약 불가
      </li>
      <li>
        <span className={styles.legendNotice} aria-hidden='true' />
        주말/공휴일
      </li>
    </ul>
  )
}

export default function DateAvailabilityModal({
  isOpen,
  field,
  value,
  onClose,
  onApply,
}: DateAvailabilityModalProps) {
  const [selection, setSelection] = useState<CalendarSelection | null>(() => getInitialSelection(value))
  const [selectedTime, setSelectedTime] = useState(() =>
    value.includes('T') ? value.split('T')[1].slice(0, 5) : DEFAULT_ZOOM_TIME,
  )
  const [calendarMonth, setCalendarMonth] = useState(() => getCalendarMonth(getInitialSelection(value)))
  const [availabilityMap, setAvailabilityMap] = useState<CapacityAvailabilityMap>({})
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const selectedDateKey = selection?.dateKey ?? null
  const customCellMap = useMemo(
    () => buildCustomCellMap(selectedDateKey, availabilityMap),
    [availabilityMap, selectedDateKey],
  )
  const hasZoomTimeSelect = field === 'zoomMeetingAt'

  useEffect(() => {
    const nextSelection = getInitialSelection(value)
    setSelection(nextSelection)
    setCalendarMonth(getCalendarMonth(nextSelection))
    setSelectedTime(value.includes('T') ? value.split('T')[1].slice(0, 5) : DEFAULT_ZOOM_TIME)
  }, [value])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    void fetchCapacityAvailability(supabase, calendarMonth)
      .then((nextAvailabilityMap) => {
        if (isMounted) {
          setAvailabilityMap(nextAvailabilityMap)
        }
      })
      .catch((error) => {
        console.error(error)
        if (isMounted) {
          setAvailabilityMap({})
        }
      })

    return () => {
      isMounted = false
    }
  }, [calendarMonth, isOpen, supabase])

  return (
    <div className={styles.availabilityModal}>
      <Modal
        isOpen={isOpen}
        title='예약 현황 확인'
        width='min(100%, 560px)'
        background='#101010'
        confirmLabel='확인'
        cancelLabel='취소'
        closeOnOverlayClick
        onConfirm={() => {
          if (!selection?.dateKey || availabilityMap[selection.dateKey]?.isUnavailable) {
            return
          }

          const currentValue = hasZoomTimeSelect ? `${selection.dateKey}T${selectedTime || DEFAULT_ZOOM_TIME}` : value
          onApply(buildNextValue(field, selection.dateKey, currentValue))
        }}
        onClose={onClose}
      >
        <div className={styles.availabilityModalBody}>
          {hasZoomTimeSelect ? (
            <section className={styles.zoomTimeSection} aria-label='Zoom 미팅 시간 선택'>
              <label className={styles.zoomTimeLabel} htmlFor='zoomMeetingTime'>
                Zoom 미팅 시간
              </label>
              <SelectBox
                className={`${styles.control} ${styles.zoomTimeSelect}`}
                id='zoomMeetingTime'
                name='zoomMeetingTime'
                value={selectedTime}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedTime(event.target.value)}
                options={ZOOM_TIME_OPTIONS}
                background='#1d1d1d'
                textColor='#f3efe5'
                focusBorderColor='#c8f135'
                round='4px'
                padding='0 18px'
                fontSize='17px'
              />
            </section>
          ) : null}
          <Calendar
            className={styles.availabilityCalendar}
            style={
              {
                '--calendar-page-background': 'transparent',
                '--calendar-page-padding': '0',
                '--calendar-layout-max-width': '100%',
                '--calendar-panel-background': 'transparent',
                '--calendar-panel-border': 'transparent',
                '--calendar-panel-radius': '0',
                '--calendar-panel-shadow': 'none',
                '--calendar-panel-padding': '0',
                '--calendar-header-margin-bottom': '8px',
                '--calendar-header-gap': '10px',
                '--calendar-title-color': '#f7f2eb',
                '--calendar-body-text': '#b9b2ab',
                '--calendar-muted-text': '#666666',
                '--calendar-month-title-size': '1.08rem',
                '--calendar-nav-button-size': '20px',
                '--calendar-nav-button-border': '#3a3533',
                '--calendar-nav-button-background': '#111111',
                '--calendar-nav-button-color': '#bdb4ae',
                '--calendar-grid-background': '#1f1f1f',
                '--calendar-grid-radius': '0',
                '--calendar-day-header-background': '#171717',
                '--calendar-day-header-text': '#b9b2ab',
                '--calendar-day-header-size': '0.56rem',
                '--calendar-day-cell-background': '#121212',
                '--calendar-day-cell-hover-background': '#181818',
                '--calendar-day-cell-min-height': '48px',
                '--calendar-day-cell-padding': '4px',
                '--calendar-day-number-color': '#f7f2eb',
                '--calendar-sunday-color': '#d79a9a',
                '--calendar-saturday-color': '#3c86da',
                '--calendar-unavailable-background': '#e03131',
                '--calendar-unavailable-hover-background': '#e03131',
                '--calendar-selected-background': '#c8f135',
                '--calendar-selected-hover-background': '#c8f135',
                '--calendar-selected-text': '#101010',
                '--calendar-holiday-background': '#e03131',
                '--calendar-holiday-border': '#e03131',
                '--calendar-event-badge-color': '#101010',
                '--calendar-event-blue-background': 'rgb(16 16 16 / 14%)',
                '--calendar-event-blue-color': '#101010',
                '--calendar-event-white-background': '#b82525',
                '--calendar-event-white-color': '#ffe6e6',
              } as CSSProperties
            }
            title=''
            description=''
            year={calendarMonth.year}
            month={calendarMonth.month}
            customCellMap={customCellMap}
            legend={null}
            headerExtra={<CalendarLegend />}
            showSelectedLegend={false}
            onDisplayMonthChange={setCalendarMonth}
            onCellClick={({ dateKey, cell, isWeekend, isHoliday }) => {
              if (cell.status === 'unavailable' || isWeekend || isHoliday) {
                return
              }

              setSelection({ dateKey })
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
