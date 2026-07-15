import { describe, expect, it } from 'vitest'

import { buildCells, createCalendarCells } from './Holiday'

function getCurrentMonthCell(year: number, month: number, day: number) {
  const cell = createCalendarCells(year, month).find((item) => item.inCurrentMonth && item.day === day)

  if (!cell) {
    throw new Error(`${year}-${month}-${day} 현재 월 셀을 찾을 수 없습니다.`)
  }

  return cell
}

describe('Holiday', () => {
  describe('Calendar Cell', () => {
    it('항상 42개의 Calendar Cell을 생성하고 이전/현재/다음 달 날짜를 포함한다', () => {
      const cells = buildCells(2024, 1)

      expect(cells).toHaveLength(42)
      expect(cells[0]).toMatchObject({ day: 31, inCurrentMonth: false })
      expect(cells[1]).toMatchObject({ day: 1, inCurrentMonth: true })
      expect(cells[31]).toMatchObject({ day: 31, inCurrentMonth: true })
      expect(cells[32]).toMatchObject({ day: 1, inCurrentMonth: false })
    })

    it('윤년 2월 29일을 정상적으로 처리한다', () => {
      const cells = buildCells(2024, 2)
      const leapDay = cells.find((cell) => cell.inCurrentMonth && cell.day === 29)

      expect(cells).toHaveLength(42)
      expect(leapDay).toBeDefined()
    })
  })

  describe('대한민국 공휴일', () => {
    it('대한민국 법정 공휴일을 holiday 이벤트와 함께 반영한다', () => {
      const newYearCell = getCurrentMonthCell(2024, 1, 1)

      expect(newYearCell.holidayKind).toBe('holiday')
      expect(newYearCell.events?.some((event) => event.tone === 'light')).toBe(true)
      expect(newYearCell.events?.some((event) => event.label.length > 0)).toBe(true)
    })

    it('공휴일이 아닌 날짜는 공휴일로 표시하지 않는다', () => {
      const normalDayCell = getCurrentMonthCell(2024, 1, 2)

      expect(normalDayCell.holidayKind).toBeUndefined()
    })
  })

  describe('대한민국 대체공휴일', () => {
    it('법정 대상 공휴일이 주말과 겹치면 대체공휴일을 생성한다', () => {
      const substituteHolidayCell = getCurrentMonthCell(2024, 5, 6)

      expect(substituteHolidayCell.holidayKind).toBe('substitute')
      expect(substituteHolidayCell.events?.some((event) => event.label.includes('대체공휴일'))).toBe(true)
    })
  })

  describe('명절', () => {
    it('추석 연휴를 정상적으로 반영한다', () => {
      const dayBeforeChuseok = getCurrentMonthCell(2024, 9, 16)
      const chuseok = getCurrentMonthCell(2024, 9, 17)
      const dayAfterChuseok = getCurrentMonthCell(2024, 9, 18)

      expect(dayBeforeChuseok.events?.some((event) => event.label.includes('추석'))).toBe(true)
      expect(chuseok.events?.some((event) => event.label.includes('추석'))).toBe(true)
      expect(dayAfterChuseok.events?.some((event) => event.label.includes('추석'))).toBe(true)
    })
  })

  describe('createCalendarCells', () => {
    it('공휴일과 대체공휴일 정보를 포함한 Calendar Cell을 생성한다', () => {
      const januaryCells = createCalendarCells(2024, 1)
      const mayCells = createCalendarCells(2024, 5)

      expect(januaryCells).toHaveLength(42)
      expect(mayCells).toHaveLength(42)
      expect(januaryCells.some((cell) => cell.holidayKind === 'holiday')).toBe(true)
      expect(mayCells.some((cell) => cell.holidayKind === 'substitute')).toBe(true)
    })
  })

  describe('Error Case', () => {
    it('공휴일이 없는 월도 오류 없이 셀을 생성한다', () => {
      const cells = createCalendarCells(2024, 11)

      expect(cells).toHaveLength(42)
    })

    it('잘못된 연도나 월이 전달되어도 오류 없이 처리한다', () => {
      expect(() => createCalendarCells(2024, 13)).not.toThrow()
      expect(() => buildCells(2024, 13)).not.toThrow()
    })
  })
})
