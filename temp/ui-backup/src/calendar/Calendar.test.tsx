import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Calendar } from './Calendar'

function getCalendarHeading() {
  return screen.getByRole('heading', { level: 2 })
}

function getMonthTitleButton() {
  return screen.getAllByRole('button')[0]
}

function getPrevMonthButton() {
  return screen.getAllByRole('button')[1]
}

function getNextMonthButton() {
  return screen.getAllByRole('button')[2]
}

function getMonthSelectButton(month: number) {
  return screen
    .getAllByRole('button')
    .find((button) => button.textContent?.trim() === `${month}월`)
}

function getDateCell(day: number) {
  const dayElement = screen.getByText(String(day), { selector: 'span' })
  const article = dayElement.closest('article')

  if (!article) {
    throw new Error(`날짜 ${day} 셀을 찾을 수 없습니다.`)
  }

  return article
}

describe('Calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-20T12:00:00.000Z'))
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('타이틀, 설명, 헤더 추가 영역과 달력 셀을 렌더링한다', () => {
    render(
      <Calendar
        title='Calendar Title'
        description='Calendar Description'
        year={2024}
        month={1}
        headerExtra={<div>Header Extra</div>}
        showSelectedLegend={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Calendar Title' })).toBeInTheDocument()
    expect(screen.getByText('Calendar Description')).toBeInTheDocument()
    expect(screen.getByText('Header Extra')).toBeInTheDocument()
    expect(screen.getAllByText(/\d+/, { selector: 'span' })).toHaveLength(42)
  })

  it('이전 달 버튼을 누르면 연도 경계를 넘어 이동한다', () => {
    render(<Calendar year={2024} month={1} />)

    fireEvent.click(getPrevMonthButton())

    expect(getCalendarHeading()).toHaveTextContent('2023')
    expect(getCalendarHeading()).toHaveTextContent('12')
  })

  it('다음 달 버튼을 누르면 연도 경계를 넘어 이동한다', () => {
    render(<Calendar year={2024} month={12} />)

    fireEvent.click(getNextMonthButton())

    expect(getCalendarHeading()).toHaveTextContent('2025')
    expect(getCalendarHeading()).toHaveTextContent('1')
  })

  it('월 제목 버튼으로 월 선택 모달을 열고 바깥 클릭으로 닫는다', () => {
    render(<Calendar year={2024} month={1} />)

    fireEvent.click(getMonthTitleButton())
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('월 선택 모달에서 월을 고르면 해당 월로 이동한다', () => {
    render(<Calendar year={2024} month={1} />)

    fireEvent.click(getMonthTitleButton())

    const marchButton = getMonthSelectButton(3)
    if (!marchButton) {
      throw new Error('3월 선택 버튼을 찾을 수 없습니다.')
    }

    fireEvent.click(marchButton)

    expect(getCalendarHeading()).toHaveTextContent('2024')
    expect(getCalendarHeading()).toHaveTextContent('3')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('미래 날짜 클릭 시 onCellClick에 payload를 전달한다', () => {
    const handleCellClick = vi.fn()

    render(<Calendar year={2024} month={1} onCellClick={handleCellClick} />)

    fireEvent.click(getDateCell(25))

    expect(handleCellClick).toHaveBeenCalledTimes(1)
    expect(handleCellClick).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2024,
        month: 1,
        day: 25,
        dateKey: '2024-01-25',
        isWeekend: false,
        isHoliday: false,
      }),
    )
  })

  it('과거 날짜는 클릭해도 onCellClick을 호출하지 않는다', () => {
    const handleCellClick = vi.fn()

    render(<Calendar year={2024} month={1} onCellClick={handleCellClick} />)

    fireEvent.click(getDateCell(11))

    expect(handleCellClick).not.toHaveBeenCalled()
  })

  it('customCellMap으로 전달한 이벤트를 렌더링한다', () => {
    render(
      <Calendar
        year={2024}
        month={1}
        customCellMap={{
          '2024-01-25': {
            status: 'selected',
            events: [{ label: 'Reserved', tone: 'blue' }],
          },
        }}
      />,
    )

    expect(screen.getByText('Reserved')).toBeInTheDocument()
  })
})
