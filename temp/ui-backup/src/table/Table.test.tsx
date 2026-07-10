import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Table } from './Table'

const columns = [
  { key: 'name', header: '이름', align: 'left' as const },
  { key: 'count', header: '수량', align: 'center' as const },
  { key: 'status', header: '상태', align: 'right' as const },
]

const rows = [
  { id: 'a1', name: '사과', count: 3, status: '판매중' },
  { id: 'a2', name: '배', count: 5, status: null },
]

describe('Table', () => {
  describe('Rendering', () => {
    it('Header, Row, Cell 데이터를 정상적으로 렌더링한다', () => {
      render(<Table columns={columns} rows={rows} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '이름' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: '수량' })).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(3)
      expect(screen.getByRole('cell', { name: '사과' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '판매중' })).toBeInTheDocument()
    })
  })

  describe('Header', () => {
    it('Header명과 정렬을 정상적으로 적용한다', () => {
      render(<Table columns={columns} rows={rows} />)

      expect(screen.getByRole('columnheader', { name: '이름' })).toHaveStyle({ textAlign: 'left' })
      expect(screen.getByRole('columnheader', { name: '수량' })).toHaveStyle({ textAlign: 'center' })
      expect(screen.getByRole('columnheader', { name: '상태' })).toHaveStyle({ textAlign: 'right' })
    })
  })

  describe('Row', () => {
    it('null과 undefined는 "-"로 표시하고 문자/숫자 데이터를 정상적으로 보여준다', () => {
      render(
        <Table
          columns={columns}
          rows={[
            { name: '사과', count: 3, status: null },
            { name: '배', count: undefined, status: '대기중' },
          ]}
        />,
      )

      expect(screen.getByRole('cell', { name: '사과' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument()
      expect(screen.getAllByRole('cell', { name: '-' })).toHaveLength(2)
      expect(screen.getByRole('cell', { name: '대기중' })).toBeInTheDocument()
    })
  })

  describe('Row Click', () => {
    it('onRowClick이 있으면 Row 클릭 시 row 데이터와 rowIndex를 전달한다', () => {
      const handleRowClick = vi.fn()

      render(<Table columns={columns} rows={rows} onRowClick={handleRowClick} />)

      fireEvent.click(screen.getByRole('cell', { name: '사과' }))

      expect(handleRowClick).toHaveBeenCalledTimes(1)
      expect(handleRowClick).toHaveBeenCalledWith(rows[0], 0)
    })

    it('onRowClick이 없어도 클릭 시 오류가 발생하지 않는다', () => {
      render(<Table columns={columns} rows={rows} />)

      expect(() => fireEvent.click(screen.getByRole('cell', { name: '사과' }))).not.toThrow()
    })
  })

  describe('Row Key', () => {
    it('rowKeyField가 있으면 해당 값을 key로 사용하는 구조로 렌더링한다', () => {
      const { container } = render(<Table columns={columns} rows={rows} rowKeyField='id' />)

      expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
    })

    it('rowKeyField가 없어도 rowIndex 기반으로 오류 없이 렌더링한다', () => {
      const { container } = render(<Table columns={columns} rows={rows} />)

      expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
    })
  })

  describe('Mobile Card', () => {
    it('mobileCard 값에 따라 wrapper class를 적용한다', () => {
      const { rerender, container } = render(<Table columns={columns} rows={rows} mobileCard />)

      expect(container.firstChild?.className).toContain('mobileCard')

      rerender(<Table columns={columns} rows={rows} mobileCard={false} />)
      expect(container.firstChild?.className).not.toContain('mobileCard')
    })
  })

  describe('Props', () => {
    it('minWidth, thColor, thBackground, tdColor, tdBackground, borderColor, className props를 적용한다', () => {
      const { container } = render(
        <Table
          columns={columns}
          rows={rows}
          minWidth='640px'
          thColor='#111111'
          thBackground='#eeeeee'
          tdColor='#222222'
          tdBackground='#ffffff'
          borderColor='#dddddd'
          className='custom-table'
        />,
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-table')
      expect(wrapper).toHaveStyle({
        '--table-min-width': '640px',
        '--table-th-color': '#111111',
        '--table-th-background': '#eeeeee',
        '--table-td-color': '#222222',
        '--table-td-background': '#ffffff',
        '--table-border-color': '#dddddd',
      })
    })
  })

  describe('Accessibility', () => {
    it('table, thead, tbody를 렌더링하고 mobileCard 모드에서 data-label을 적용한다', () => {
      const { container } = render(<Table columns={columns} rows={rows} mobileCard />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(container.querySelector('thead')).not.toBeNull()
      expect(container.querySelector('tbody')).not.toBeNull()
      expect(screen.getByRole('cell', { name: '사과' })).toHaveAttribute('data-label', '이름')
    })
  })

  describe('Error Case', () => {
    it('columns가 비어 있어도 오류 없이 렌더링한다', () => {
      render(<Table columns={[]} rows={rows} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('rows가 비어 있으면 Header만 렌더링한다', () => {
      render(<Table columns={columns} rows={[]} />)

      expect(screen.getAllByRole('row')).toHaveLength(1)
    })

    it('rowKeyField가 존재하지 않아도 오류 없이 동작한다', () => {
      expect(() => render(<Table columns={columns} rows={rows} rowKeyField='missing' />)).not.toThrow()
    })

    it('Cell 값이 null이나 undefined여도 오류 없이 렌더링한다', () => {
      render(
        <Table
          columns={columns}
          rows={[
            { name: null, count: undefined, status: null },
          ]}
        />,
      )

      expect(screen.getAllByRole('cell', { name: '-' })).toHaveLength(3)
    })
  })
})
