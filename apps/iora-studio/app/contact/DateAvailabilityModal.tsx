'use client'

import { Calendar, Modal, SelectBox } from '@iora/ui'
import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from 'react'
import {
  fetchCapacityAvailability,
  fetchZoomMeetingAvailability,
  type CapacityAvailabilityMap,
  type ZoomMeetingAvailabilityMap,
} from '../../lib/capacity'
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

const DEFAULT_ZOOM_TIME = '10:30'
const ZOOM_TIME_SLOTS = [
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
] as const

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

function buildDeadlineCellMap(selectedDateKey: string | null, availabilityMap: CapacityAvailabilityMap): CustomCellMap {
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

function buildZoomCellMap(selectedDateKey: string | null, availabilityMap: ZoomMeetingAvailabilityMap): CustomCellMap {
  const map: CustomCellMap = {}

  Object.entries(availabilityMap).forEach(([dateKey, availability]) => {
    if (!availability.isUnavailable) {
      return
    }

    map[dateKey] = {
      status: 'unavailable',
      events: [{ label: '예약마감', tone: 'white' }],
    }
  })

  if (selectedDateKey && !map[selectedDateKey]) {
    map[selectedDateKey] = {
      status: 'selected',
      events: [{ label: '시간 선택', tone: 'blue' }],
    }
  }

  return map
}

function buildNextValue(field: DateFieldTarget, dateKey: string, currentTime: string) {
  if (field === 'deadline') {
    return dateKey
  }

  return `${dateKey}T${currentTime || DEFAULT_ZOOM_TIME}`
}

function CalendarLegend({ isZoomMeeting }: { isZoomMeeting: boolean }) {
  return (
    <ul className={styles.calendarLegend}>
      <li>
        <span className={styles.legendAvailable} aria-hidden='true' />
        예약 가능
      </li>
      <li>
        <span className={styles.legendUnavailable} aria-hidden='true' />
        {isZoomMeeting ? '예약 마감' : '예약 불가'}
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
  const [deadlineAvailabilityMap, setDeadlineAvailabilityMap] = useState<CapacityAvailabilityMap>({})
  const [zoomAvailabilityMap, setZoomAvailabilityMap] = useState<ZoomMeetingAvailabilityMap>({})
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const selectedDateKey = selection?.dateKey ?? null
  const hasZoomTimeSelect = field === 'zoomMeetingAt'
  const modalTitle = hasZoomTimeSelect ? 'Zoom 미팅 일정 선택' : '희망 마감일 선택'

  const customCellMap = useMemo(
    () =>
      hasZoomTimeSelect
        ? buildZoomCellMap(selectedDateKey, zoomAvailabilityMap)
        : buildDeadlineCellMap(selectedDateKey, deadlineAvailabilityMap),
    [deadlineAvailabilityMap, hasZoomTimeSelect, selectedDateKey, zoomAvailabilityMap],
  )

  const selectedZoomAvailability = selectedDateKey ? zoomAvailabilityMap[selectedDateKey] : undefined
  const reservedTimes = selectedZoomAvailability?.reservedTimes ?? []
  const zoomTimeOptions = useMemo(
    () =>
      ZOOM_TIME_SLOTS.map((time) => ({
        label: reservedTimes.includes(time) ? `${time} (예약됨)` : time,
        value: time,
        disabled: reservedTimes.includes(time),
      })),
    [reservedTimes],
  )
  const availableZoomOption = zoomTimeOptions.find((option) => !option.disabled)?.value ?? ''

  useEffect(() => {
    const nextSelection = getInitialSelection(value)
    setSelection(nextSelection)
    setCalendarMonth(getCalendarMonth(nextSelection))
    setSelectedTime(value.includes('T') ? value.split('T')[1].slice(0, 5) : DEFAULT_ZOOM_TIME)
  }, [value])

  useEffect(() => {
    if (!hasZoomTimeSelect) {
      return
    }

    if (!selectedDateKey) {
      setSelectedTime('')
      return
    }

    const isCurrentTimeReserved = reservedTimes.includes(selectedTime)

    if (!selectedTime || isCurrentTimeReserved) {
      setSelectedTime(availableZoomOption)
    }
  }, [availableZoomOption, hasZoomTimeSelect, reservedTimes, selectedDateKey, selectedTime])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    const loadAvailability = async () => {
      try {
        if (hasZoomTimeSelect) {
          const nextAvailabilityMap = await fetchZoomMeetingAvailability(supabase, calendarMonth)
          if (isMounted) {
            setAvailabilityError(null)
            setZoomAvailabilityMap(nextAvailabilityMap)
          }
          return
        }

        const nextAvailabilityMap = await fetchCapacityAvailability(supabase, calendarMonth)
        if (isMounted) {
          setAvailabilityError(null)
          setDeadlineAvailabilityMap(nextAvailabilityMap)
        }
      } catch (error) {
        if (isMounted) {
          setAvailabilityError(
            hasZoomTimeSelect
              ? 'Zoom 미팅 예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
              : '예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          )
          if (hasZoomTimeSelect) {
            setZoomAvailabilityMap({})
          } else {
            setDeadlineAvailabilityMap({})
          }
        }
      }
    }

    void loadAvailability()

    return () => {
      isMounted = false
    }
  }, [calendarMonth, hasZoomTimeSelect, isOpen, supabase])

  return (
    <div className={styles.availabilityModal}>
      <Modal
        isOpen={isOpen}
        title={modalTitle}
        width='min(100%, 560px)'
        background='#101010'
        confirmLabel='선택 완료'
        cancelLabel='닫기'
        titleClassName={styles.availabilityModalTitle}
        titleStyle={{ color: '#f7f2eb' }}
        cancelButtonProps={{
          className: styles.availabilityModalCancelButton,
          background: '#171717',
          textColor: '#f4efe7',
          borderColor: '#3a3533',
          hoverBackground: '#1f1f1f',
          hoverTextColor: '#ffffff',
          hoverBorderColor: '#54504c',
          round: '999px',
          padding: '0 16px',
          size: '13px',
        }}
        confirmButtonProps={{
          className: styles.availabilityModalConfirmButton,
          background: '#c8f135',
          textColor: '#101010',
          borderColor: '#c8f135',
          hoverBackground: '#d8fb54',
          hoverTextColor: '#101010',
          hoverBorderColor: '#d8fb54',
          round: '999px',
          padding: '0 18px',
          size: '13px',
        }}
        closeOnOverlayClick
        onConfirm={() => {
          if (!selection?.dateKey) {
            return
          }

          if (hasZoomTimeSelect) {
            if (!selectedTime || selectedZoomAvailability?.isUnavailable || reservedTimes.includes(selectedTime)) {
              return
            }

            onApply(buildNextValue(field, selection.dateKey, selectedTime))
            return
          }

          if (deadlineAvailabilityMap[selection.dateKey]?.isUnavailable) {
            return
          }

          onApply(buildNextValue(field, selection.dateKey, value))
        }}
        onClose={onClose}
      >
        <div className={styles.availabilityModalBody}>
          {availabilityError ? <p className={styles.availabilityModalError}>{availabilityError}</p> : null}
          {hasZoomTimeSelect ? (
            <section className={styles.zoomTimeSection} aria-label='Zoom 미팅 시간 선택'>
              <label className={styles.zoomTimeLabel} htmlFor='zoomMeetingTime'>
                Zoom 미팅 시간
              </label>
              {selectedDateKey ? (
                <>
                  <SelectBox
                    className={`${styles.control} ${styles.zoomTimeSelect}`}
                    id='zoomMeetingTime'
                    name='zoomMeetingTime'
                    value={selectedTime}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedTime(event.target.value)}
                    background='#1d1d1d'
                    textColor='#f3efe5'
                    focusBorderColor='#c8f135'
                    round='4px'
                    padding='0 18px'
                    fontSize='17px'
                  >
                    <option value='' disabled>
                      {availableZoomOption ? '예약 가능한 시간을 선택해 주세요.' : '선택 가능한 시간이 없습니다.'}
                    </option>
                    {zoomTimeOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </SelectBox>
                  <p className={styles.zoomTimeHint}>
                    {selectedZoomAvailability?.isUnavailable
                      ? '이 날짜는 Zoom 미팅 예약이 마감되었습니다.'
                      : '하루 최대 3건까지 예약 가능하며, 이미 예약된 시간은 선택할 수 없습니다.'}
                  </p>
                </>
              ) : (
                <p className={styles.zoomTimeHint}>먼저 캘린더에서 날짜를 선택해 주세요.</p>
              )}
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
            headerExtra={<CalendarLegend isZoomMeeting={hasZoomTimeSelect} />}
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
