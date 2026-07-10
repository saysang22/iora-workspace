import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CalendarModal } from './CalendarModal'

const defaultYearOptions = [
  { label: '2023년', value: '2023' },
  { label: '2024년', value: '2024' },
  { label: '2025년', value: '2025' },
]

function renderCalendarModal(props?: Partial<React.ComponentProps<typeof CalendarModal>>) {
  const monthModalRef = props?.monthModalRef ?? createRef<HTMLElement>()

  return render(
    <CalendarModal
      displayYear={2024}
      displayMonth={3}
      yearOptions={defaultYearOptions}
      onYearChange={vi.fn()}
      onMonthSelect={vi.fn()}
      monthModalRef={monthModalRef}
      {...props}
    />,
  )
}

describe('CalendarModal', () => {
  describe('Rendering', () => {
    it('월 선택 모달, 연도 SelectBox, 1월부터 12월까지 버튼, 현재 선택 월을 렌더링한다', () => {
      renderCalendarModal()

      expect(screen.getByLabelText('월 선택 모달')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()

      const monthButtons = screen.getAllByRole('button')
      expect(monthButtons).toHaveLength(12)
      expect(screen.getByRole('button', { name: '3월' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '3월' }).className).toContain('activeMonthButton')
    })
  })

  describe('Year Selection', () => {
    it('연도를 변경하면 onYearChange가 호출되고 전달한 yearOptions가 모두 표시된다', () => {
      const onYearChange = vi.fn()

      renderCalendarModal({ onYearChange })

      const select = screen.getByRole('combobox')
      defaultYearOptions.forEach((option) => {
        expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument()
      })

      fireEvent.change(select, { target: { value: '2025' } })

      expect(onYearChange).toHaveBeenCalledTimes(1)
      expect(onYearChange).toHaveBeenCalledWith(2025)
    })
  })

  describe('Month Selection', () => {
    it('월 버튼을 클릭하면 onMonthSelect가 호출되고 선택한 월 번호를 전달한다', () => {
      const onMonthSelect = vi.fn()

      renderCalendarModal({ onMonthSelect })

      fireEvent.click(screen.getByRole('button', { name: '7월' }))

      expect(onMonthSelect).toHaveBeenCalledTimes(1)
      expect(onMonthSelect).toHaveBeenCalledWith(7)
    })

    it('선택한 월은 active 스타일, 나머지 월은 기본 스타일을 사용한다', () => {
      renderCalendarModal({ displayMonth: 5 })

      expect(screen.getByRole('button', { name: '5월' }).className).toContain('activeMonthButton')
      expect(screen.getByRole('button', { name: '4월' }).className).toContain('monthButton')
    })
  })

  describe('Props', () => {
    it('displayYear가 SelectBox에 반영되고 monthModalRef가 연결된다', () => {
      const monthModalRef = createRef<HTMLElement>()

      renderCalendarModal({
        displayYear: 2025,
        monthModalRef,
      })

      expect(screen.getByRole('combobox')).toHaveValue('2025')
      expect(monthModalRef.current).toBe(screen.getByLabelText('월 선택 모달'))
    })

    it('yearOptions와 displayMonth가 변경되면 화면이 갱신된다', () => {
      renderCalendarModal({
        displayMonth: 9,
        yearOptions: [{ label: '2030년', value: '2030' }],
      })

      expect(screen.getByRole('button', { name: '9월' }).className).toContain('activeMonthButton')
      expect(screen.getByRole('option', { name: '2030년' })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('모든 월 버튼은 클릭 가능하고 SelectBox는 키보드로 조작할 수 있다', () => {
      const onYearChange = vi.fn()
      const onMonthSelect = vi.fn()

      renderCalendarModal({ onYearChange, onMonthSelect })

      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '2023' } })
      fireEvent.keyDown(screen.getByRole('button', { name: '1월' }), { key: 'Enter' })
      fireEvent.click(screen.getByRole('button', { name: '1월' }))

      expect(onYearChange).toHaveBeenCalledWith(2023)
      expect(onMonthSelect).toHaveBeenCalledWith(1)
    })
  })

  describe('Error Case', () => {
    it('yearOptions가 비어 있어도 오류 없이 렌더링한다', () => {
      renderCalendarModal({ yearOptions: [] })

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(12)
    })
  })
})
