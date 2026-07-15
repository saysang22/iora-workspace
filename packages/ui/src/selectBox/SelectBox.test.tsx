import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SelectBox } from './SelectBox'

const options = [
  { label: '첫 번째', value: 'first' },
  { label: '두 번째', value: 'second' },
  { label: '세 번째', value: 'third' },
]

describe('SelectBox', () => {
  describe('Rendering', () => {
    it('option 목록과 label/value, children을 정상적으로 렌더링한다', () => {
      render(
        <SelectBox aria-label='render select' options={options}>
          <option value='child-option'>직접 전달</option>
        </SelectBox>,
      )

      const select = screen.getByRole('combobox', { name: 'render select' })
      expect(select).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '첫 번째' })).toHaveAttribute('value', 'first')
      expect(screen.getByRole('option', { name: '두 번째' })).toHaveAttribute('value', 'second')
      expect(screen.getByRole('option', { name: '직접 전달' })).toHaveAttribute('value', 'child-option')
    })
  })

  describe('Selection', () => {
    it('option 선택 시 value가 변경되고 onChange로 전달된다', () => {
      const handleChange = vi.fn()

      render(<SelectBox aria-label='select box' options={options} onChange={handleChange} />)

      const select = screen.getByRole('combobox', { name: 'select box' })
      fireEvent.change(select, { target: { value: 'second' } })

      expect(select).toHaveValue('second')
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0].target).toHaveValue('second')
    })
  })

  describe('Disabled', () => {
    it('disabled 상태에서는 변경할 수 없고 onChange가 호출되지 않는다', () => {
      const handleChange = vi.fn()

      render(
        <SelectBox
          aria-label='disabled select'
          options={options}
          value='first'
          disabled
          onChange={handleChange}
        />,
      )

      const select = screen.getByRole('combobox', { name: 'disabled select' })
      expect(select).toBeDisabled()

      select.focus()
      fireEvent.keyDown(select, { key: 'ArrowDown' })

      expect(select).toHaveValue('first')
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Props', () => {
    it('value prop을 적용한다', () => {
      render(<SelectBox aria-label='value select' options={options} value='second' onChange={() => {}} />)

      expect(screen.getByRole('combobox', { name: 'value select' })).toHaveValue('second')
    })

    it('defaultValue prop을 적용한다', () => {
      render(<SelectBox aria-label='default value select' options={options} defaultValue='third' />)

      expect(screen.getByRole('combobox', { name: 'default value select' })).toHaveValue('third')
    })

    it('name prop을 적용한다', () => {
      render(<SelectBox aria-label='name select' options={options} name='project' />)

      expect(screen.getByRole('combobox', { name: 'name select' })).toHaveAttribute('name', 'project')
    })

    it('id prop을 적용한다', () => {
      render(<SelectBox aria-label='id select' options={options} id='project-id' />)

      expect(screen.getByRole('combobox', { name: 'id select' })).toHaveAttribute('id', 'project-id')
    })

    it('className prop을 적용한다', () => {
      render(<SelectBox aria-label='class select' options={options} className='custom-select' />)

      expect(screen.getByRole('combobox', { name: 'class select' })).toHaveClass('custom-select')
    })

    it('style prop을 적용한다', () => {
      render(<SelectBox aria-label='style select' options={options} style={{ marginTop: '12px' }} />)

      expect(screen.getByRole('combobox', { name: 'style select' })).toHaveStyle({ marginTop: '12px' })
    })
  })

  describe('Custom Style', () => {
    it('커스텀 스타일 props를 style에 반영한다', () => {
      render(
        <SelectBox
          aria-label='styled select'
          options={options}
          width='240px'
          fontSize='14px'
          padding='8px 10px'
          round='6px'
          background='#ffffff'
          textColor='#121c2a'
          focusBorderColor='#0053db'
        />,
      )

      const select = screen.getByRole('combobox', { name: 'styled select' })
      expect(select).toHaveStyle({
        width: '240px',
        fontSize: '14px',
        padding: '8px 10px',
        borderRadius: '6px',
      })
      expect(select).toHaveStyle({
        '--select-background': '#ffffff',
        '--select-text-color': '#121c2a',
        '--select-focus-border-color': '#0053db',
      })
    })
  })

  describe('Accessibility', () => {
    it('label, aria-label, required 접근성을 적용한다', () => {
      render(
        <label htmlFor='terms-select'>
          프로젝트
          <SelectBox id='terms-select' aria-label='프로젝트 선택' options={options} required />
        </label>,
      )

      expect(screen.getByLabelText('프로젝트')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: '프로젝트 선택' })).toBeRequired()
    })
  })

  describe('Error Case', () => {
    it('options가 비어 있어도 오류 없이 렌더링한다', () => {
      render(<SelectBox aria-label='empty select' options={[]} />)

      expect(screen.getByRole('combobox', { name: 'empty select' })).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    it('children만 전달해도 오류 없이 렌더링한다', () => {
      render(
        <SelectBox aria-label='children select'>
          <option value='child-option'>직접 전달</option>
        </SelectBox>,
      )

      expect(screen.getByRole('option', { name: '직접 전달' })).toBeInTheDocument()
    })

    it('options와 children을 함께 전달해도 오류 없이 렌더링한다', () => {
      render(
        <SelectBox aria-label='mixed select' options={options}>
          <option value='child-option'>직접 전달</option>
        </SelectBox>,
      )

      expect(screen.getAllByRole('option')).toHaveLength(4)
    })

    it('onChange가 없어도 오류 없이 동작한다', () => {
      render(<SelectBox aria-label='safe select' options={options} />)

      const select = screen.getByRole('combobox', { name: 'safe select' })
      fireEvent.change(select, { target: { value: 'third' } })

      expect(select).toHaveValue('third')
    })
  })
})
