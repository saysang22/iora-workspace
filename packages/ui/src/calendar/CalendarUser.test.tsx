import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarUser } from './CalendarUser'

const USER_RESERVATION_STORAGE_KEY = 'calendar_user_reservations'
const ADMIN_PROJECT_LIMIT_STORAGE_KEY = 'calendar_admin_project_limit'
const ADMIN_UNAVAILABLE_DATES_STORAGE_KEY = 'calendar_admin_unavailable_dates'
const USER_RESERVATION_UPDATED_EVENT = 'calendar-user-reservations-updated'
const ADMIN_PROJECT_LIMIT_UPDATED_EVENT = 'calendar-admin-project-limit-updated'
const ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT = 'calendar-admin-unavailable-dates-updated'

function getReserveButton() {
  return screen.getByRole('button', { name: /예약하기/ })
}

function getCancelButton() {
  return screen.getByRole('button', { name: /예약 취소하기/ })
}

function getDateCell(day: number) {
  const dayElement = screen.getByText(String(day), { selector: 'span' })
  const article = dayElement.closest('article')

  if (!article) {
    throw new Error(`날짜 ${day} 셀을 찾을 수 없습니다.`)
  }

  return article
}

describe('CalendarUser', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-20T12:00:00.000Z'))
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
  })

  describe('Rendering', () => {
    it('사용자 예약 캘린더와 액션 버튼, 저장된 예약 날짜 목록을 렌더링한다', () => {
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, JSON.stringify(['2024-01-25']))

      render(<CalendarUser />)

      expect(getReserveButton()).toBeInTheDocument()
      expect(getCancelButton()).toBeInTheDocument()
      expect(document.body).toHaveTextContent('2024-01-25')
    })
  })

  describe('Date Selection', () => {
    it('예약 가능한 미래 날짜는 선택과 해제가 가능하고 예약 요청 상태로 표시된다', () => {
      render(<CalendarUser />)

      expect(getReserveButton()).toBeDisabled()

      fireEvent.click(getDateCell(25))

      expect(getReserveButton()).toBeEnabled()
      expect(document.body).toHaveTextContent('예약 신청')

      fireEvent.click(getDateCell(25))

      expect(getReserveButton()).toBeDisabled()
    })

    it('여러 날짜를 동시에 선택할 수 있다', () => {
      render(<CalendarUser />)

      fireEvent.click(getDateCell(25))
      fireEvent.click(getDateCell(26))

      expect(getReserveButton()).toBeEnabled()
      expect(document.body).toHaveTextContent('예약 신청')
    })
  })

  describe('Reservation', () => {
    it('선택한 날짜가 있으면 예약하기 버튼으로 예약 확인 모달을 열고 닫을 수 있다', () => {
      render(<CalendarUser />)

      fireEvent.click(getDateCell(25))
      fireEvent.click(getReserveButton())

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: '닫기' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('예약 확인 시 LocalStorage와 이벤트가 갱신되고 선택 상태가 초기화된다', () => {
      const reservationUpdated = vi.fn()
      window.addEventListener(USER_RESERVATION_UPDATED_EVENT, reservationUpdated)

      render(<CalendarUser />)

      fireEvent.click(getDateCell(25))
      fireEvent.click(getReserveButton())
      fireEvent.click(screen.getByRole('button', { name: '확인' }))

      expect(window.localStorage.getItem(USER_RESERVATION_STORAGE_KEY)).toBe(JSON.stringify(['2024-01-25']))
      expect(reservationUpdated).toHaveBeenCalledTimes(1)
      expect(getReserveButton()).toBeDisabled()
      expect(document.body).toHaveTextContent('작업중')
      window.removeEventListener(USER_RESERVATION_UPDATED_EVENT, reservationUpdated)
    })
  })

  describe('Reservation Cancel', () => {
    it('예약된 날짜를 선택하면 예약 취소하기 버튼이 활성화되고 확인 시 취소된다', () => {
      window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, '2')
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, JSON.stringify(['2024-01-25']))
      const reservationUpdated = vi.fn()
      window.addEventListener(USER_RESERVATION_UPDATED_EVENT, reservationUpdated)

      render(<CalendarUser />)

      fireEvent.click(getDateCell(25))

      expect(getCancelButton()).toBeEnabled()
      fireEvent.click(getCancelButton())
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: '확인' }))

      expect(window.localStorage.getItem(USER_RESERVATION_STORAGE_KEY)).toBe(JSON.stringify([]))
      expect(reservationUpdated).toHaveBeenCalledTimes(1)
      expect(getCancelButton()).toBeDisabled()
      window.removeEventListener(USER_RESERVATION_UPDATED_EVENT, reservationUpdated)
    })
  })

  describe('Project Limit Synchronization', () => {
    it('관리자 프로젝트 수 변경 이벤트가 오면 예약 가능 상태가 갱신된다', () => {
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, JSON.stringify(['2024-01-25']))
      render(<CalendarUser />)

      window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, '1')

      act(() => {
        window.dispatchEvent(new Event(ADMIN_PROJECT_LIMIT_UPDATED_EVENT))
      })

      expect(document.body).toHaveTextContent('작업중')
    })
  })

  describe('Admin Synchronization', () => {
    it('관리자 작업중 날짜를 읽고 변경 이벤트가 오면 갱신되며 선택할 수 없다', () => {
      render(<CalendarUser />)

      window.localStorage.setItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY, JSON.stringify(['2024-01-25']))

      act(() => {
        window.dispatchEvent(new Event(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT))
      })

      expect(document.body).toHaveTextContent('작업중')

      fireEvent.click(getDateCell(25))

      expect(getReserveButton()).toBeDisabled()
    })
  })

  describe('Error Case', () => {
    it('예약 정보, 관리자 프로젝트 수, 관리자 작업중 날짜가 비정상이어도 오류 없이 동작한다', () => {
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, 'broken-json')
      window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, 'not-a-number')
      window.localStorage.setItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY, 'broken-json')

      render(<CalendarUser />)

      expect(getReserveButton()).toBeInTheDocument()
      expect(getCancelButton()).toBeInTheDocument()
      expect(document.body).toHaveTextContent('[]')
    })
  })
})
