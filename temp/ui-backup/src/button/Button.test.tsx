import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

const defaultProps = {
  size: '',
  background: '',
  round: '',
  padding: '',
  textColor: '',
  borderColor: '',
  hoverBackground: '',
  hoverTextColor: '',
  hoverBorderColor: '',
}

describe('Button', () => {
  it('버튼을 렌더링하고 children 텍스트를 표시한다', () => {
    render(<Button {...defaultProps}>저장</Button>)

    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('클릭 시 onClick 함수를 호출한다', () => {
    const handleClick = vi.fn()

    render(
      <Button {...defaultProps} onClick={handleClick}>
        클릭
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: '클릭' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서는 onClick 함수를 호출하지 않는다', () => {
    const handleClick = vi.fn()

    render(
      <Button {...defaultProps} disabled onClick={handleClick}>
        비활성
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: '비활성' }))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disabled 속성을 정상적으로 적용한다', () => {
    render(
      <Button {...defaultProps} disabled>
        비활성
      </Button>,
    )

    expect(screen.getByRole('button', { name: '비활성' })).toBeDisabled()
  })
})
