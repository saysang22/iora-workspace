import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Toast } from './Toast'

function renderToast(props?: Partial<React.ComponentProps<typeof Toast>>) {
  return render(
    <Toast
      visible
      message='테스트 메시지'
      onClose={vi.fn()}
      {...props}
    />,
  )
}

function getCloseButton() {
  return screen.getByRole('button', {
    name: (name) => name.includes('닫기'),
  })
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('Toast는 title, message, 닫기 버튼을 정상적으로 렌더링한다', () => {
      renderToast({ title: '알림 제목' })

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('알림 제목')).toBeInTheDocument()
      expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
      expect(getCloseButton()).toBeInTheDocument()
    })

    it('visible이 false면 렌더링되지 않는다', () => {
      render(
        <Toast
          visible={false}
          message='테스트 메시지'
        />,
      )

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Visibility', () => {
    it('visible 상태가 변경되면 Toast 표시 여부가 갱신된다', () => {
      const { rerender } = render(
        <Toast
          visible={false}
          message='테스트 메시지'
        />,
      )

      expect(screen.queryByRole('status')).not.toBeInTheDocument()

      rerender(
        <Toast
          visible
          message='테스트 메시지'
        />,
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Auto Close', () => {
    it('duration이 지나면 onClose가 호출된다', () => {
      const onClose = vi.fn()
      renderToast({ onClose, duration: 1000 })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('duration이 0 이하이면 자동으로 닫히지 않는다', () => {
      const onClose = vi.fn()
      renderToast({ onClose, duration: 0 })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Close', () => {
    it('닫기 버튼 클릭 시 onClose가 한 번 호출된다', () => {
      const onClose = vi.fn()
      renderToast({ onClose })

      fireEvent.click(getCloseButton())

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Action', () => {
    it('actionLabel이 있으면 Action 버튼이 보이고 클릭 시 onAction이 한 번 호출된다', () => {
      const onAction = vi.fn()
      renderToast({ actionLabel: '재시도', onAction })

      fireEvent.click(screen.getByRole('button', { name: '재시도' }))

      expect(screen.getByRole('button', { name: '재시도' })).toBeInTheDocument()
      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('actionLabel이 없으면 Action 버튼이 렌더링되지 않는다', () => {
      renderToast()

      expect(screen.queryByRole('button', { name: '재시도' })).not.toBeInTheDocument()
    })
  })

  describe('Toast Type', () => {
    it('info, success, error 타입을 정상적으로 렌더링한다', () => {
      const { rerender } = renderToast({ type: 'info' })
      expect(screen.getByRole('status').firstChild?.className).toContain('info')

      rerender(<Toast visible message='테스트 메시지' type='success' />)
      expect(screen.getByRole('status').firstChild?.className).toContain('success')

      rerender(<Toast visible message='테스트 메시지' type='error' />)
      expect(screen.getByRole('status').firstChild?.className).toContain('error')
    })
  })

  describe('Position', () => {
    it('top-center, center, bottom-center 위치를 정상적으로 적용한다', () => {
      const { rerender } = renderToast({ position: 'top-center' })
      expect(screen.getByRole('status')).toHaveStyle({ top: '20px', bottom: 'auto' })

      rerender(<Toast visible message='테스트 메시지' position='center' />)
      expect(screen.getByRole('status')).toHaveStyle({ top: '50%', bottom: 'auto' })

      rerender(<Toast visible message='테스트 메시지' position='bottom-center' />)
      expect(screen.getByRole('status')).toHaveStyle({ bottom: '20px', top: 'auto' })
    })
  })

  describe('Props', () => {
    it('title, message, duration, position prop 변경이 정상적으로 반영된다', () => {
      renderToast({
        title: '변경된 제목',
        message: '변경된 메시지',
        duration: 3000,
        position: 'bottom-center',
      })

      expect(screen.getByText('변경된 제목')).toBeInTheDocument()
      expect(screen.getByText('변경된 메시지')).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveStyle({ bottom: '20px', top: 'auto' })
    })
  })

  describe('Accessibility', () => {
    it('role=status, aria-live=polite, 닫기 버튼 aria-label을 적용한다', () => {
      renderToast()

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
      expect(getCloseButton()).toBeInTheDocument()
    })
  })

  describe('Error Case', () => {
    it('title, onClose, onAction이 없어도 오류 없이 동작한다', () => {
      render(
        <Toast
          visible
          message='테스트 메시지'
          actionLabel='재시도'
        />,
      )

      expect(screen.getByText('알림')).toBeInTheDocument()
      expect(() => fireEvent.click(screen.getByRole('button', { name: '재시도' }))).not.toThrow()
      expect(() => fireEvent.click(getCloseButton())).not.toThrow()
    })
  })
})
