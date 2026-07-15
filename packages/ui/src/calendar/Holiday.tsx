import Holidays from 'date-holidays'

export type CalendarCellStatus = 'default' | 'unavailable' | 'selected'
export type HolidayKind = 'holiday' | 'substitute'

export type CalendarEvent = {
  label: string
  tone: 'blue' | 'light' | 'white'
}

export type CalendarCell = {
  day: number
  inCurrentMonth: boolean
  status?: CalendarCellStatus
  events?: CalendarEvent[]
  holidayKind?: HolidayKind
}

type KoreanHolidayInfo = {
  name: string
  kind: HolidayKind
  isChuseok?: boolean
}

export function buildCells(year: number, month: number): CalendarCell[] {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const cells: CalendarCell[] = []

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    cells.push({
      day: daysInPrevMonth - firstDayOfWeek + i + 1,
      inCurrentMonth: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, inCurrentMonth: true })
  }

  while (cells.length < 42) {
    cells.push({
      day: cells.length - (firstDayOfWeek + daysInMonth) + 1,
      inCurrentMonth: false,
    })
  }

  return cells
}

function getKoreanHolidays(year: number, month: number): Map<number, KoreanHolidayInfo> {
  const hd = new Holidays('KR')
  hd.setLanguages('ko')

  const holidays = hd.getHolidays(year, 'ko').filter((holiday) => holiday.type === 'public')

  const holidayMap = new Map<number, KoreanHolidayInfo>()
  const dateMap = new Map<string, KoreanHolidayInfo>()
  const substituteEligibleKeywords = [
    '설날',
    '추석',
    '삼일절',
    '3·1절',
    '광복절',
    '개천절',
    '한글날',
    '어린이날',
    '석가탄신일',
    '부처님오신날',
    '기독탄신일',
    '성탄절',
  ]

  const toDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  holidays.forEach((holiday) => {
    const holidayDate = new Date(holiday.start)
    const holidayInfo: KoreanHolidayInfo = {
      name: holiday.name,
      kind: holiday.substitute ? 'substitute' : 'holiday',
      isChuseok: holiday.name.includes('추석'),
    }

    dateMap.set(toDateKey(holidayDate), holidayInfo)

    if (holiday.name.includes('설날') || holiday.name.includes('추석')) {
      ;[-1, 1].forEach((offset) => {
        const relatedDate = new Date(holidayDate)
        relatedDate.setDate(holidayDate.getDate() + offset)
        dateMap.set(toDateKey(relatedDate), holidayInfo)
      })
    }
  })

  const publicHolidayKeys = new Set(dateMap.keys())

  const findNextBusinessDayKey = (fromDate: Date) => {
    const cursor = new Date(fromDate)

    while (true) {
      cursor.setDate(cursor.getDate() + 1)
      const day = cursor.getDay()
      const key = toDateKey(cursor)
      const isWeekend = day === 0 || day === 6

      if (!isWeekend && !publicHolidayKeys.has(key)) {
        return key
      }
    }
  }

  Array.from(dateMap.entries()).forEach(([key, info]) => {
    const [y, m, d] = key.split('-').map(Number)
    const holidayDate = new Date(y, m - 1, d)
    const day = holidayDate.getDay()
    const isWeekend = day === 0 || day === 6

    if (!isWeekend) {
      return
    }

    const isEligibleForSubstitute = substituteEligibleKeywords.some((keyword) => info.name.includes(keyword))
    if (!isEligibleForSubstitute) {
      return
    }

    const substituteKey = findNextBusinessDayKey(holidayDate)
    publicHolidayKeys.add(substituteKey)
    dateMap.set(substituteKey, {
      name: `${info.name} 대체공휴일`,
      kind: 'substitute',
      isChuseok: info.isChuseok,
    })
  })

  dateMap.forEach((info, key) => {
    const [y, m, d] = key.split('-').map(Number)
    if (y === year && m === month) {
      holidayMap.set(d, info)
    }
  })

  return holidayMap
}

function applyDemoStatus(cells: CalendarCell[]): CalendarCell[] {
  return cells.map((cell) => {
    if (!cell.inCurrentMonth) {
      return cell
    }

    return cell
  })
}

function applyHolidayStatus(cells: CalendarCell[], holidayMap: Map<number, KoreanHolidayInfo>): CalendarCell[] {
  return cells.map((cell) => {
    if (!cell.inCurrentMonth) {
      return cell
    }

    const holiday = holidayMap.get(cell.day)

    if (!holiday) {
      return cell
    }

    const holidayLabel = holiday.kind === 'substitute' ? `${holiday.name} (대체공휴일)` : holiday.name
    const holidayEvents: CalendarEvent[] = [{ label: holidayLabel, tone: 'white' }]

    if (holiday.isChuseok && holidayLabel !== '추석') {
      holidayEvents.push({ label: '추석', tone: 'white' })
    }

    return {
      ...cell,
      status: 'unavailable',
      holidayKind: holiday.kind,
      events: [...(cell.events ?? []).filter((event) => event.label !== '작업중'), ...holidayEvents],
    }
  })
}

function removeUnavailableReservationEvent(cells: CalendarCell[]): CalendarCell[] {
  return cells.map((cell, index) => {
    const dayOfWeek = index % 7
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = Boolean(cell.holidayKind)

    if ((!isWeekend && !isHoliday) || !cell.events?.length) {
      return cell
    }

    return {
      ...cell,
      events: cell.events.filter((event) => !event.label.includes('예약됨')),
    }
  })
}

export function createCalendarCells(year: number, month: number): CalendarCell[] {
  const baseCells = buildCells(year, month)
  const cellsWithDemo = applyDemoStatus(baseCells)
  const holidayMap = getKoreanHolidays(year, month)
  const cellsWithHolidays = applyHolidayStatus(cellsWithDemo, holidayMap)
  return removeUnavailableReservationEvent(cellsWithHolidays)
}
