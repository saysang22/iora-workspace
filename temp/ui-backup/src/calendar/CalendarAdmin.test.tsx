import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarAdmin } from './CalendarAdmin'

const USER_RESERVATION_STORAGE_KEY = 'calendar_user_reservations'
const ADMIN_PROJECT_LIMIT_STORAGE_KEY = 'calendar_admin_project_limit'
const ADMIN_BLOCKED_DATES_STORAGE_KEY = 'calendar_admin_blocked_dates'
const ADMIN_UNAVAILABLE_DATES_STORAGE_KEY = 'calendar_admin_unavailable_dates'
const USER_RESERVATION_UPDATED_EVENT = 'calendar-user-reservations-updated'
const ADMIN_PROJECT_LIMIT_UPDATED_EVENT = 'calendar-admin-project-limit-updated'
const ADMIN_BLOCKED_DATES_UPDATED_EVENT = 'calendar-admin-blocked-dates-updated'

function getProjectLimitInput() {
  return screen.getByRole('spinbutton')
}

function getProjectLimitSaveButton() {
  const button = screen.getByRole('button', { name: /^저장$/ })

  return button
}

function getBlockedDatesSaveButton() {
  return screen.getByRole('button', { name: /저장하기/ })
}

function getDateCell(day: number) {
  const dayElement = screen.getByText(String(day), { selector: 'span' })
  const article = dayElement.closest('article')

  if (!article) {
    throw new Error(`날짜 ${day} 셀을 찾을 수 없습니다.`)
  }

  return article
}

function expectTextContent(text: string) {
  expect(document.body).toHaveTextContent(text)
}

describe('CalendarAdmin', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-20T12:00:00.000Z'))
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('저장된 프로젝트 수와 작업중 날짜를 읽어 렌더링한다', () => {
    window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, '3')
    window.localStorage.setItem(ADMIN_BLOCKED_DATES_STORAGE_KEY, JSON.stringify(['2024-01-25']))

    render(<CalendarAdmin />)

    expect(getProjectLimitInput()).toBeInTheDocument()
    expect(getProjectLimitSaveButton()).toBeInTheDocument()
    expect(getBlockedDatesSaveButton()).toBeDisabled()
    expectTextContent('"savedProjectLimit": 3')
    expectTextContent('2024-01-25')
  })

  it('프로젝트 수를 저장하면 현재 프로젝트 수, LocalStorage, 이벤트, Toast가 갱신된다', () => {
    const onProjectLimitUpdated = vi.fn()
    window.addEventListener(ADMIN_PROJECT_LIMIT_UPDATED_EVENT, onProjectLimitUpdated)

    render(<CalendarAdmin />)

    fireEvent.change(getProjectLimitInput(), { target: { value: '2' } })
    fireEvent.click(getProjectLimitSaveButton())

    expect(window.localStorage.getItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY)).toBe('2')
    expect(onProjectLimitUpdated).toHaveBeenCalledTimes(1)
    expectTextContent('"savedProjectLimit": 2')
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1800)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    window.removeEventListener(ADMIN_PROJECT_LIMIT_UPDATED_EVENT, onProjectLimitUpdated)
  })

  it('일반 미래 날짜는 선택과 해제가 가능하다', () => {
    render(<CalendarAdmin />)

    const saveButton = getBlockedDatesSaveButton()
    expect(saveButton).toBeDisabled()

    fireEvent.click(getDateCell(25))
    expect(saveButton).toBeEnabled()

    fireEvent.click(getDateCell(25))
    expect(saveButton).toBeDisabled()
  })

  it('주말 날짜는 선택되지 않는다', () => {
    render(<CalendarAdmin />)

    fireEvent.click(getDateCell(21))

    expect(getBlockedDatesSaveButton()).toBeDisabled()
  })

  it('선택한 날짜를 저장하면 LocalStorage, 이벤트, 선택 상태가 갱신된다', () => {
    const onBlockedDatesUpdated = vi.fn()
    window.addEventListener(ADMIN_BLOCKED_DATES_UPDATED_EVENT, onBlockedDatesUpdated)

    render(<CalendarAdmin />)

    fireEvent.click(getDateCell(25))
    fireEvent.click(getBlockedDatesSaveButton())

    expect(window.localStorage.getItem(ADMIN_BLOCKED_DATES_STORAGE_KEY)).toBe(JSON.stringify(['2024-01-25']))
    expect(window.localStorage.getItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY)).toContain('2024-01-25')
    expect(onBlockedDatesUpdated).toHaveBeenCalledTimes(1)
    expect(getBlockedDatesSaveButton()).toBeDisabled()
    expect(screen.getByRole('status')).toBeInTheDocument()
    window.removeEventListener(ADMIN_BLOCKED_DATES_UPDATED_EVENT, onBlockedDatesUpdated)
  })

  it('현재 예약 수보다 작은 프로젝트 수는 경고 모달을 띄우고 닫을 수 있다', () => {
    window.localStorage.setItem(
      USER_RESERVATION_STORAGE_KEY,
      JSON.stringify(['2024-01-25', '2024-01-25']),
    )

    render(<CalendarAdmin />)

    fireEvent.change(getProjectLimitInput(), { target: { value: '1' } })
    fireEvent.click(getProjectLimitSaveButton())

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('사용자 예약 변경 이벤트가 오면 작업중 날짜 목록을 갱신한다', () => {
    render(<CalendarAdmin />)

    window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, '1')
    window.localStorage.setItem(
      USER_RESERVATION_STORAGE_KEY,
      JSON.stringify(['2024-01-25', '2024-01-25']),
    )

    act(() => {
      window.dispatchEvent(new Event(USER_RESERVATION_UPDATED_EVENT))
    })

    expectTextContent('2024-01-25')
  })

  it('비정상 LocalStorage 값이 있어도 오류 없이 렌더링한다', () => {
    window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, 'broken-json')
    window.localStorage.setItem(ADMIN_BLOCKED_DATES_STORAGE_KEY, 'broken-json')
    window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, 'not-a-number')

    render(<CalendarAdmin />)

    expect(getProjectLimitInput()).toBeInTheDocument()
    expect(getBlockedDatesSaveButton()).toBeDisabled()
    expectTextContent('"savedProjectLimit": 0')
  })
})
