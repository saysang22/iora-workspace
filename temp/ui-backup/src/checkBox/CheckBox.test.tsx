import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CheckBox } from './CheckBox'

describe('CheckBox', () => {
  it('checkbox 타입으로 기본 렌더링되고 checked 상태를 표시한다', () => {
    const { rerender } = render(<CheckBox aria-label='default checkbox' />)

    const defaultCheckBox = screen.getByRole('checkbox', { name: 'default checkbox' })
    expect(defaultCheckBox).toBeInTheDocument()
    expect(defaultCheckBox).toHaveAttribute('type', 'checkbox')
    expect(defaultCheckBox).not.toBeChecked()

    rerender(<CheckBox aria-label='checked checkbox' checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'checked checkbox' })).toBeChecked()
  })

  it('선택과 해제 시 onChange가 호출되고 checked 값과 value를 전달한다', () => {
    const handleChange = vi.fn()
    const { rerender } = render(<CheckBox aria-label='select checkbox' value='agree' onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'select checkbox' })
    fireEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange.mock.calls[0][0].target).toBeChecked()
    expect(handleChange.mock.calls[0][0].target).toHaveAttribute('value', 'agree')

    rerender(<CheckBox aria-label='select checkbox' value='agree' defaultChecked onChange={handleChange} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'select checkbox' }))

    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange.mock.calls[1][0].target.checked).toBe(false)
  })

  it('disabled 상태에서는 선택/해제가 불가능하고 onChange가 호출되지 않는다', () => {
    const handleChange = vi.fn()

    render(<CheckBox aria-label='disabled checkbox' disabled onChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox', { name: 'disabled checkbox' })
    expect(checkbox).toBeDisabled()

    checkbox.click()

    expect(checkbox).not.toBeChecked()
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('value, checked, defaultChecked, name, id, className, style props를 적용한다', () => {
    const { rerender } = render(
      <CheckBox
        aria-label='props checkbox'
        value='newsletter'
        name='terms'
        id='terms-id'
        className='custom-checkbox'
        style={{ marginTop: '12px' }}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'props checkbox' })
    expect(checkbox).toHaveAttribute('value', 'newsletter')
    expect(checkbox).toHaveAttribute('name', 'terms')
    expect(checkbox).toHaveAttribute('id', 'terms-id')
    expect(checkbox).toHaveClass('custom-checkbox')
    expect(checkbox).toHaveStyle({ marginTop: '12px' })

    rerender(<CheckBox aria-label='props checkbox' checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'props checkbox' })).toBeChecked()

    rerender(<CheckBox aria-label='default checked checkbox' defaultChecked />)
    expect(screen.getByRole('checkbox', { name: 'default checked checkbox' })).toBeChecked()
  })

  it('커스텀 스타일 props를 style에 반영한다', () => {
    render(
      <CheckBox
        aria-label='styled checkbox'
        size='24px'
        round='8px'
        background='#ffffff'
        borderColor='#111111'
        borderWidth='2px'
        checkColor='#0053db'
        checkSize='14px'
        checkThickness='3px'
        checkedBackground='#e5f0ff'
        checkedBorderColor='#0053db'
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'styled checkbox' })
    expect(checkbox).toHaveStyle({ width: '24px', height: '24px', borderRadius: '8px', borderWidth: '2px' })
    expect(checkbox).toHaveStyle({
      '--checkbox-background': '#ffffff',
      '--checkbox-border-color': '#111111',
      '--checkbox-check-color': '#0053db',
      '--checkbox-check-size': '14px',
      '--checkbox-check-thickness': '3px',
      '--checkbox-checked-background': '#e5f0ff',
      '--checkbox-checked-border-color': '#0053db',
    })
  })

  it('label, aria-label, required 접근성을 적용한다', () => {
    render(
      <label htmlFor='terms-checkbox'>
        약관 동의
        <CheckBox id='terms-checkbox' aria-label='약관 동의 체크박스' required />
      </label>,
    )

    expect(screen.getByLabelText('약관 동의')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '약관 동의 체크박스' })).toBeRequired()
  })

  it('value, className, style, onChange가 없어도 오류 없이 동작한다', () => {
    render(<CheckBox aria-label='safe checkbox' />)

    const checkbox = screen.getByRole('checkbox', { name: 'safe checkbox' })
    expect(checkbox).toBeInTheDocument()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})
