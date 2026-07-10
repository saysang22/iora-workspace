import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../button/Button'
import { CalendarModal } from './CalendarModal'
import { createCalendarCells, type CalendarCell } from './Holiday'
import styles from './Calendar.module.scss'

const ADMIN_UNAVAILABLE_DATES_STORAGE_KEY = 'calendar_admin_unavailable_dates'
const ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT = 'calendar-admin-unavailable-dates-updated'

export type CalendarSlotClassNames = Partial<{
  root: string
  mainSection: string
  topRow: string
  pageHeader: string
  legendAside: string
  card: string
  legendList: string
  calendarPanel: string
  calendarHeader: string
  leftHeaderGroup: string
  monthTitleButton: string
  navigationButtons: string
  monthModal: string
  calendarGrid: string
  dayHeader: string
  dayCell: string
  dayNumber: string
  eventBadge: string
}>

export type CalendarProps = {
  title?: string
  description?: string
  year?: number
  month?: number
  customCellMap?: Record<string, Partial<Pick<CalendarCell, 'status' | 'events' | 'holidayKind'>>>
  onCellClick?: (payload: {
    year: number
    month: number
    day: number
    dateKey: string
    cell: CalendarCell
    isWeekend: boolean
    isHoliday: boolean
  }) => void
  legend?: ReactNode | null
  headerExtra?: ReactNode
  showSelectedLegend?: boolean
  className?: string
  style?: CSSProperties
  slotClassNames?: CalendarSlotClassNames
}

const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export function Calendar({
  title = '예약 현황 달력',
  description = '시설 예약 현황을 확인하고 관리합니다.',
  year,
  month,
  customCellMap,
  onCellClick,
  legend,
  headerExtra,
  showSelectedLegend = true,
  className,
  style,
  slotClassNames,
}: CalendarProps) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const initialYear = year ?? now.getFullYear()
  const initialMonth = month ?? now.getMonth() + 1
  const [displayYear, setDisplayYear] = useState(initialYear)
  const [displayMonth, setDisplayMonth] = useState(initialMonth)
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false)
  const [adminUnavailableDateKeys, setAdminUnavailableDateKeys] = useState<string[]>([])
  const monthModalRef = useRef<HTMLElement | null>(null)
  const monthTitleButtonRef = useRef<HTMLButtonElement | null>(null)

  const cells = useMemo(() => createCalendarCells(displayYear, displayMonth), [displayYear, displayMonth])

  const yearOptions = useMemo(() => {
    return Array.from({ length: 11 }, (_, index) => {
      const optionYear = displayYear - 5 + index
      return { label: `${optionYear}년`, value: String(optionYear) }
    })
  }, [displayYear])

  const buildDateKeyFromDate = (targetDate: Date) =>
    `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`

  const firstDayOfWeek = useMemo(() => new Date(displayYear, displayMonth - 1, 1).getDay(), [displayMonth, displayYear])

  const handlePrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayYear((prev) => prev - 1)
      setDisplayMonth(12)
      return
    }

    setDisplayMonth((prev) => prev - 1)
  }

  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayYear((prev) => prev + 1)
      setDisplayMonth(1)
      return
    }

    setDisplayMonth((prev) => prev + 1)
  }

  const handleMonthSelect = (selectedMonth: number) => {
    setDisplayMonth(selectedMonth)
    setIsMonthModalOpen(false)
  }

  useEffect(() => {
    const syncAdminUnavailableDates = () => {
      const stored = window.localStorage.getItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY)
      if (!stored) {
        setAdminUnavailableDateKeys([])
        return
      }

      try {
        const parsed = JSON.parse(stored) as string[]
        setAdminUnavailableDateKeys(Array.isArray(parsed) ? parsed : [])
      } catch {
        setAdminUnavailableDateKeys([])
      }
    }

    syncAdminUnavailableDates()
    window.addEventListener('storage', syncAdminUnavailableDates)
    window.addEventListener(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT, syncAdminUnavailableDates)
    return () => {
      window.removeEventListener('storage', syncAdminUnavailableDates)
      window.removeEventListener(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT, syncAdminUnavailableDates)
    }
  }, [])

  useEffect(() => {
    if (!isMonthModalOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideModal = monthModalRef.current?.contains(target)
      const isInsideTitleButton = monthTitleButtonRef.current?.contains(target)

      if (isInsideModal || isInsideTitleButton) {
        return
      }

      setIsMonthModalOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isMonthModalOpen])

  const defaultLegend = (
    <section className={cx(styles.card, slotClassNames?.card)} data-slot='card'>
      <h3>캘린더 범례</h3>
      <ul className={cx(styles.legendList, slotClassNames?.legendList)} data-slot='legend-list'>
        <li><span className={styles.legendAvailable} />예약 가능</li>
        <li><span className={styles.legendUnavailable} />예약 불가</li>
        {showSelectedLegend ? <li><span className={styles.legendSelected} />선택한 날짜</li> : null}
        <li><span className={styles.legendNotice} />주말/공휴일</li>
      </ul>
    </section>
  )

  return (
    <main className={cx(styles.page, className, slotClassNames?.root)} style={style} data-slot='root'>
      <section className={cx(styles.mainSection, slotClassNames?.mainSection)} data-slot='main-section'>
        <header className={cx(styles.topRow, slotClassNames?.topRow)} data-slot='top-row'>
          <section className={cx(styles.pageHeader, slotClassNames?.pageHeader)} data-slot='page-header'>
            <h1>{title}</h1>
            <p>{description}</p>
          </section>
          {legend === null ? null : (
            <div className={cx(styles.legendAside, slotClassNames?.legendAside)} data-slot='legend-aside'>
              {legend ?? defaultLegend}
            </div>
          )}
        </header>

        <section className={cx(styles.layout, styles.calendarPanel, slotClassNames?.calendarPanel)} data-slot='calendar-panel'>
          <header className={cx(styles.calendarHeader, slotClassNames?.calendarHeader)} data-slot='calendar-header'>
            <section className={cx(styles.leftHeaderGroup, slotClassNames?.leftHeaderGroup)} data-slot='left-header-group'>
              <button
                type='button'
                className={cx(styles.monthTitleButton, slotClassNames?.monthTitleButton)}
                onClick={() => setIsMonthModalOpen((prev) => !prev)}
                ref={monthTitleButtonRef}
                data-slot='month-title-button'
              >
                <h2>{displayYear}년 {displayMonth}월</h2>
              </button>
              <nav className={cx(styles.navigationButtons, slotClassNames?.navigationButtons)} aria-label='월 이동' data-slot='navigation-buttons'>
                <Button
                  type='button'
                  aria-label='이전 달'
                  onClick={handlePrevMonth}
                  size='30px'
                  background='#fff'
                  round='2px'
                  padding='0'
                  textColor='#434655'
                  borderColor='#c3c6d7'
                  hoverBackground='#f3f4f6'
                  hoverTextColor='#434655'
                  hoverBorderColor='#c3c6d7'
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  type='button'
                  aria-label='다음 달'
                  onClick={handleNextMonth}
                  size='30px'
                  background='#fff'
                  round='2px'
                  padding='0'
                  textColor='#434655'
                  borderColor='#c3c6d7'
                  hoverBackground='#f3f4f6'
                  hoverTextColor='#434655'
                  hoverBorderColor='#c3c6d7'
                >
                  <ChevronRight size={20} />
                </Button>
              </nav>
            </section>
            {headerExtra}
          </header>

          {isMonthModalOpen ? (
            <div className={slotClassNames?.monthModal} data-slot='month-modal'>
              <CalendarModal
                displayYear={displayYear}
                displayMonth={displayMonth}
                yearOptions={yearOptions}
                onYearChange={setDisplayYear}
                onMonthSelect={handleMonthSelect}
                monthModalRef={monthModalRef}
              />
            </div>
          ) : null}

          <section className={cx(styles.calendarGrid, slotClassNames?.calendarGrid)} data-slot='calendar-grid'>
            {dayLabels.map((label, index) => (
              <div
                key={label}
                className={cx(styles.dayHeader, index === 0 && styles.sundayText, index === 6 && styles.saturdayText, slotClassNames?.dayHeader)}
                data-slot='day-header'
              >
                {label}
              </div>
            ))}

            {cells.map((cell, index) => {
              const cellDate = cell.inCurrentMonth
                ? new Date(displayYear, displayMonth - 1, cell.day)
                : index < firstDayOfWeek
                  ? new Date(displayYear, displayMonth - 2, cell.day)
                  : new Date(displayYear, displayMonth, cell.day)
              const dateKey = buildDateKeyFromDate(cellDate)
              const adminOverride = adminUnavailableDateKeys.includes(dateKey)
                ? { status: 'unavailable' as const, events: [{ label: '작업중', tone: 'white' as const }] }
                : undefined
              const customOverride = customCellMap?.[dateKey]
              const override = { ...(adminOverride ?? {}), ...(customOverride ?? {}) }
              const mergedCell: CalendarCell = { ...cell, ...(override ?? {}) }
              const column = index % 7
              const isWeekend = column === 0 || column === 6
              const isHoliday = Boolean(mergedCell.holidayKind)
              const isPastDate = cellDate < todayStart
              const isCancelSelected = Boolean(mergedCell.events?.some((event) => event.label === '예약 취소 선택'))
              const displayEvents = mergedCell.status === 'unavailable' && !mergedCell.events?.length
                ? [{ label: '작업중', tone: 'white' as const }]
                : mergedCell.events
              const cellClassNames = [styles.dayCell, slotClassNames?.dayCell]

              if (!mergedCell.inCurrentMonth && isPastDate) cellClassNames.push(styles.fadedCell)
              if (isPastDate) cellClassNames.push(styles.pastDateCell)
              if (!isPastDate && mergedCell.status === 'unavailable') cellClassNames.push(styles.unavailableCell)
              if (!isPastDate && mergedCell.status === 'selected') cellClassNames.push(styles.selectedCell)
              if (!isPastDate && isCancelSelected) cellClassNames.push(styles.selectedToggleCell)
              if (mergedCell.holidayKind === 'holiday') cellClassNames.push(styles.holidayCell, styles.holidayText)
              if (mergedCell.holidayKind === 'substitute') cellClassNames.push(styles.holidayCell, styles.substituteText)
              if (column === 0) cellClassNames.push(styles.sundayText)
              if (column === 6) cellClassNames.push(styles.saturdayText)
              if (onCellClick && !isPastDate) cellClassNames.push(styles.clickableCell)

              return (
                <article
                  key={`${mergedCell.day}-${index}`}
                  className={cellClassNames.join(' ')}
                  data-slot='day-cell'
                  onClick={() => {
                    if (!onCellClick || isPastDate) return
                    onCellClick({
                      year: cellDate.getFullYear(),
                      month: cellDate.getMonth() + 1,
                      day: cellDate.getDate(),
                      dateKey,
                      cell: mergedCell,
                      isWeekend,
                      isHoliday,
                    })
                  }}
                  >
                    <span className={cx(styles.dayNumber, slotClassNames?.dayNumber)} data-slot='day-number'>{mergedCell.day}</span>
                    {displayEvents?.length ? (
                      displayEvents.map((event) => (
                        <div
                          key={event.label}
                          className={cx(styles.eventBadge, styles[`event${event.tone[0].toUpperCase()}${event.tone.slice(1)}`], slotClassNames?.eventBadge)}
                          data-slot='event-badge'
                        >
                          {event.label}
                        </div>
                      ))
                    ) : (
                      <span className={styles.eventPlaceholder} aria-hidden='true' />
                    )}
                  </article>
                )
              })}
          </section>
        </section>
      </section>
    </main>
  )
}
