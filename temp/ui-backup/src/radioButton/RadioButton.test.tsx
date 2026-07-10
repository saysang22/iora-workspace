import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RadioButton } from './RadioButton'

describe('RadioButton', () => {
  describe('Rendering', () => {
    it('radio 타입으로 기본 렌더링되고 checked 상태를 표시한다', () => {
      const { rerender } = render(<RadioButton aria-label='default radio' />)

      const radio = screen.getByRole('radio', { name: 'default radio' })
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('type', 'radio')
      expect(radio).not.toBeChecked()

      rerender(<RadioButton aria-label='checked radio' checked onChange={() => {}} />)
      expect(screen.getByRole('radio', { name: 'checked radio' })).toBeChecked()
    })
  })

  describe('Selection', () => {
    it('선택 시 onChange가 호출되고 value를 전달한다', () => {
      const handleChange = vi.fn()

      render(<RadioButton aria-label='option a' value='a' onChange={handleChange} />)

      const radio = screen.getByRole('radio', { name: 'option a' })
      fireEvent.click(radio)

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0].target).toBeChecked()
      expect(handleChange.mock.calls[0][0].target).toHaveAttribute('value', 'a')
    })

    it('같은 name 그룹에서 다른 RadioButton을 선택하면 기존 선택이 해제된다', () => {
      render(
        <>
          <RadioButton aria-label='option a' name='group' defaultChecked />
          <RadioButton aria-label='option b' name='group' />
        </>,
      )

      const firstRadio = screen.getByRole('radio', { name: 'option a' })
      const secondRadio = screen.getByRole('radio', { name: 'option b' })

      expect(firstRadio).toBeChecked()
      expect(secondRadio).not.toBeChecked()

      fireEvent.click(secondRadio)

      expect(firstRadio).not.toBeChecked()
      expect(secondRadio).toBeChecked()
    })
  })

  describe('Disabled', () => {
    it('disabled 상태에서는 선택되지 않고 onChange가 호출되지 않는다', () => {
      const handleChange = vi.fn()

      render(<RadioButton aria-label='disabled radio' disabled onChange={handleChange} />)

      const radio = screen.getByRole('radio', { name: 'disabled radio' })
      expect(radio).toBeDisabled()

      radio.click()

      expect(radio).not.toBeChecked()
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Props', () => {
    it('value, checked, defaultChecked, name, id, className, style props를 적용한다', () => {
      const { rerender } = render(
        <RadioButton
          aria-label='props radio'
          value='newsletter'
          name='terms'
          id='terms-id'
          className='custom-radio'
          style={{ marginTop: '12px' }}
        />,
      )

      const radio = screen.getByRole('radio', { name: 'props radio' })
      expect(radio).toHaveAttribute('value', 'newsletter')
      expect(radio).toHaveAttribute('name', 'terms')
      expect(radio).toHaveAttribute('id', 'terms-id')
      expect(radio).toHaveClass('custom-radio')
      expect(radio).toHaveStyle({ marginTop: '12px' })

      rerender(<RadioButton aria-label='props radio' checked onChange={() => {}} />)
      expect(screen.getByRole('radio', { name: 'props radio' })).toBeChecked()

      rerender(<RadioButton aria-label='default checked radio' defaultChecked />)
      expect(screen.getByRole('radio', { name: 'default checked radio' })).toBeChecked()
    })
  })

  describe('Custom Style', () => {
    it('커스텀 스타일 props를 style에 반영한다', () => {
      render(
        <RadioButton
          aria-label='styled radio'
          size='24px'
          background='#ffffff'
          dotColor='#0053db'
          checkedBackground='#e5f0ff'
          dotSize='10px'
        />,
      )

      const radio = screen.getByRole('radio', { name: 'styled radio' })
      expect(radio).toHaveStyle({ width: '24px', height: '24px' })
      expect(radio).toHaveStyle({
        '--radio-background': '#ffffff',
        '--radio-dot-color': '#0053db',
        '--radio-checked-background': '#e5f0ff',
        '--radio-dot-size': '10px',
      })
    })
  })

  describe('Accessibility', () => {
    it('label, aria-label, required 접근성을 적용한다', () => {
      render(
        <label htmlFor='terms-radio'>
          약관 동의
          <RadioButton id='terms-radio' aria-label='약관 동의 라디오' required />
        </label>,
      )

      expect(screen.getByLabelText('약관 동의')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: '약관 동의 라디오' })).toBeRequired()
    })
  })

  describe('Error Case', () => {
    it('value, className, style, onChange가 없어도 오류 없이 동작한다', () => {
      render(<RadioButton aria-label='safe radio' />)

      const radio = screen.getByRole('radio', { name: 'safe radio' })
      expect(radio).toBeInTheDocument()

      fireEvent.click(radio)
      expect(radio).toBeChecked()
    })
  })
})
