import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './Input'

describe('Input', () => {
  it('placeholder, value, type, defaultValue를 렌더링한다', () => {
    const { unmount } = render(
      <Input placeholder='이름 입력' value='hello' onChange={() => {}} type='email' />,
    )

    const input = screen.getByPlaceholderText('이름 입력')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('hello')
    expect(input).toHaveAttribute('type', 'email')

    unmount()
    render(<Input defaultValue='default text' />)
    expect(screen.getByDisplayValue('default text')).toBeInTheDocument()
  })

  it('값 입력 시 onChange로 변경된 값을 전달한다', () => {
    const handleChange = vi.fn()

    render(<Input placeholder='입력' onChange={handleChange} />)

    const input = screen.getByPlaceholderText('입력')
    fireEvent.change(input, { target: { value: 'new value' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange.mock.calls[0][0].target).toHaveValue('new value')
  })

  it('disabled 상태에서는 값 입력과 onChange 호출이 일어나지 않는다', () => {
    const handleChange = vi.fn()

    render(<Input value='fixed' onChange={handleChange} disabled aria-label='disabled input' />)

    const input = screen.getByRole('textbox', { name: 'disabled input' })
    expect(input).toBeDisabled()

    fireEvent.keyDown(input, { key: 'a' })
    fireEvent.keyUp(input, { key: 'a' })

    expect(input).toHaveValue('fixed')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('readOnly 상태에서는 값 수정과 onChange 호출이 일어나지 않는다', () => {
    const handleChange = vi.fn()

    render(<Input value='readonly' onChange={handleChange} readOnly aria-label='readonly input' />)

    const input = screen.getByRole('textbox', { name: 'readonly input' })
    expect(input).toHaveAttribute('readonly')

    fireEvent.keyDown(input, { key: 'a' })
    fireEvent.keyUp(input, { key: 'a' })

    expect(input).toHaveValue('readonly')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('focus와 blur가 정상 동작하고 포커스 상태에서 입력할 수 있다', () => {
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} aria-label='focus input' />)

    const input = screen.getByRole('textbox', { name: 'focus input' })
    input.focus()
    expect(input).toHaveFocus()

    fireEvent.change(input, { target: { value: 'typing' } })
    expect(handleChange).toHaveBeenCalledTimes(1)

    input.blur()
    expect(input).not.toHaveFocus()
  })

  it('keyboard 입력과 Backspace, Delete, Enter, Tab 이벤트를 처리한다', () => {
    const handleKeyDown = vi.fn()

    render(<Input defaultValue='abcd' onKeyDown={handleKeyDown} aria-label='keyboard input' />)

    const input = screen.getByRole('textbox', { name: 'keyboard input' })

    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'Backspace' })
    fireEvent.keyDown(input, { key: 'Delete' })
    fireEvent.keyDown(input, { key: 'Tab' })

    expect(handleKeyDown).toHaveBeenCalledTimes(4)
    expect(handleKeyDown.mock.calls.map(([event]) => event.key)).toEqual(['Enter', 'Backspace', 'Delete', 'Tab'])
  })

  it('name, id, autoComplete, required, min/max/step, maxLength/minLength props를 적용한다', () => {
    render(
      <Input
        aria-label='props input'
        type='number'
        name='projectLimit'
        id='project-limit'
        autoComplete='off'
        required
        min={0}
        max={10}
        step={2}
        maxLength={5}
        minLength={1}
      />,
    )

    const input = screen.getByRole('spinbutton', { name: 'props input' })

    expect(input).toHaveAttribute('name', 'projectLimit')
    expect(input).toHaveAttribute('id', 'project-limit')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '10')
    expect(input).toHaveAttribute('step', '2')
    expect(input).toHaveAttribute('maxlength', '5')
    expect(input).toHaveAttribute('minlength', '1')
  })

  it('label, aria-label, 빈 값, onChange 없음, 지원하는 여러 type에서 오류 없이 동작한다', () => {
    const { rerender, container } = render(
      <label htmlFor='user-name'>
        이름
        <Input id='user-name' defaultValue='' aria-label='이름 입력' />
      </label>,
    )

    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이름 입력')).toHaveValue('')

    const supportedTypes = ['text', 'password', 'email', 'number', 'tel', 'search', 'url'] as const

    supportedTypes.forEach((type) => {
      rerender(<Input type={type} />)
      const input = container.querySelector('input')

      expect(input).not.toBeNull()

      expect(input).toHaveAttribute('type', type)
    })
  })
})
