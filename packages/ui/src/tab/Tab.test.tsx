import { fireEvent, render, screen } from '@testing-library/react'
import { FileText } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { Tab } from './Tab'

const tabItems = [
  {
    id: 'overview',
    label: '개요',
    icon: <FileText size={18} aria-hidden />,
    content: <div>개요 내용</div>,
  },
  {
    id: 'history',
    label: '이력',
    content: <div>이력 내용</div>,
  },
  {
    id: 'settings',
    label: '설정',
    content: <div>설정 내용</div>,
  },
]

describe('Tab', () => {
  describe('Rendering', () => {
    it('Tab 목록과 활성 Tab content, icon 유무를 정상적으로 렌더링한다', () => {
      render(<Tab items={tabItems} />)

      expect(screen.getByRole('tab', { name: /개요/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /이력/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /설정/ })).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toHaveTextContent('개요 내용')
      expect(screen.getByRole('tab', { name: /개요/ }).querySelector('svg')).not.toBeNull()
      expect(screen.getByRole('tab', { name: /이력/ }).querySelector('svg')).toBeNull()
    })
  })

  describe('Default Items', () => {
    it('items를 전달하지 않으면 기본 Tab과 기본 content를 렌더링한다', () => {
      render(<Tab />)

      expect(screen.getByRole('tab', { name: /갤러리/ })).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toHaveTextContent('프로젝트 갤러리')
    })
  })

  describe('Tab Selection', () => {
    it('Tab을 클릭하면 해당 Tab이 활성화되고 content가 변경된다', async () => {
      render(<Tab items={tabItems} />)

      fireEvent.click(screen.getByRole('tab', { name: /이력/ }))

      expect(screen.getByRole('tab', { name: /이력/ })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /개요/ })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('이력 내용')
    })

    it('여러 번 Tab을 변경해도 정상 동작한다', async () => {
      render(<Tab items={tabItems} />)

      fireEvent.click(screen.getByRole('tab', { name: /이력/ }))
      fireEvent.click(screen.getByRole('tab', { name: /설정/ }))

      expect(screen.getByRole('tab', { name: /설정/ })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('설정 내용')
    })
  })

  describe('Initial Tab', () => {
    it('initialTabId를 전달하면 해당 Tab을 기본으로 선택한다', () => {
      render(<Tab items={tabItems} initialTabId='history' />)

      expect(screen.getByRole('tab', { name: /이력/ })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('이력 내용')
    })

    it('존재하지 않는 initialTabId를 전달하면 첫 번째 Tab을 선택한다', () => {
      render(<Tab items={tabItems} initialTabId='missing' />)

      expect(screen.getByRole('tab', { name: /개요/ })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('개요 내용')
    })
  })

  describe('Props', () => {
    it('items의 label, content, icon, id를 정상적으로 반영한다', () => {
      render(<Tab items={tabItems} />)

      expect(screen.getByRole('tab', { name: /개요/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /개요/ }).querySelector('svg')).not.toBeNull()
      expect(screen.getByRole('tabpanel')).toHaveTextContent('개요 내용')
    })
  })

  describe('Accessibility', () => {
    it('tablist, tab, tabpanel role과 aria-selected를 적용한다', () => {
      render(<Tab items={tabItems} />)

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /개요/ })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /이력/ })).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Error Case', () => {
    it('items가 빈 배열이면 렌더링하지 않는다', () => {
      const { container } = render(<Tab items={[]} />)

      expect(container).toBeEmptyDOMElement()
    })

    it('items가 하나만 있어도 정상 동작한다', () => {
      render(
        <Tab
          items={[
            {
              id: 'only',
              label: '하나',
              content: <div>하나 내용</div>,
            },
          ]}
        />,
      )

      expect(screen.getByRole('tab', { name: /하나/ })).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toHaveTextContent('하나 내용')
    })

    it('icon이나 content가 없어도 오류 없이 렌더링한다', () => {
      render(
        <Tab
          items={[
            {
              id: 'empty',
              label: '빈 탭',
              content: <></>,
            },
          ]}
        />,
      )

      expect(screen.getByRole('tab', { name: /빈 탭/ })).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })
  })
})
