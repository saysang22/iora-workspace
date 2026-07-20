'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { FileText, Image, Settings } from 'lucide-react'
import { Button } from '../button/Button'
import styles from './Tab.module.scss'

type TabItem = {
  id: string
  label: ReactNode
  icon?: ReactNode
  content: ReactNode
}

type TabProps = {
  items?: TabItem[]
  initialTabId?: string
  ariaLabel?: string
  className?: string
  contentClassName?: string
  tabRowClassName?: string
  tabButtonClassName?: string
  activeTabButtonClassName?: string
}

function createDefaultItems(): TabItem[] {
  return [
    {
      id: 'gallery',
      label: '갤러리',
      icon: <Image size={18} aria-hidden />,
      content: (
        <div className={styles.panelGrid}>
          <div className={styles.previewCard}>
            <div className={styles.previewIconWrap}>
              <Image size={30} aria-hidden />
            </div>
          </div>

          <div className={styles.panelBody}>
            <h3>프로젝트 갤러리</h3>
            <p>
              최근 업로드된 이미지와 미디어 파일을 확인해 보세요. 드래그 앤 드롭으로 쉽게
              파일을 추가할 수 있습니다.
            </p>
            <div className={styles.statsRow}>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>총 이미지</span>
                <strong className={styles.statValue}>128개</strong>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>전체 용량</span>
                <strong className={styles.statValue}>2.4GB</strong>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'docs',
      label: '문서',
      icon: <FileText size={18} aria-hidden />,
      content: (
        <div className={styles.simplePanel}>
          <h3>문서 관리</h3>
          <p>공유 문서 버전과 최근 수정 이력을 확인할 수 있습니다.</p>
        </div>
      ),
    },
    {
      id: 'settings',
      label: '설정',
      icon: <Settings size={18} aria-hidden />,
      content: (
        <div className={styles.simplePanel}>
          <h3>프로젝트 설정</h3>
          <p>권한, 알림, 대시보드 등 주요 옵션을 관리할 수 있습니다.</p>
        </div>
      ),
    },
  ]
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export function Tab({
  items,
  initialTabId,
  ariaLabel = '탭 컴포넌트',
  className,
  contentClassName,
  tabRowClassName,
  tabButtonClassName,
  activeTabButtonClassName,
}: TabProps) {
  const resolvedItems = useMemo(() => {
    if (items?.length) {
      return items
    }

    return createDefaultItems()
  }, [items])

  const initialId = useMemo(() => {
    if (!resolvedItems.length) {
      return ''
    }

    const hasInitialTab = initialTabId && resolvedItems.some((item) => item.id === initialTabId)

    if (hasInitialTab && initialTabId) {
      return initialTabId
    }

    return resolvedItems[0].id
  }, [initialTabId, resolvedItems])

  const [activeTabId, setActiveTabId] = useState(initialId)

  const activeItem = resolvedItems.find((item) => item.id === activeTabId) ?? resolvedItems[0]

  if (!resolvedItems.length || !activeItem) {
    return null
  }

  const tabRowStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${resolvedItems.length}, minmax(0, 1fr))`,
  }

  return (
    <section className={joinClassNames(styles.container, className)} aria-label={ariaLabel}>
      <div
        className={joinClassNames(styles.tabRow, tabRowClassName)}
        style={tabRowStyle}
        role='tablist'
        aria-label='탭 목록'
      >
        {resolvedItems.map((item) => {
          const isActive = item.id === activeItem.id

          return (
            <Button
              key={item.id}
              type='button'
              role='tab'
              aria-selected={isActive}
              className={
                isActive
                  ? joinClassNames(styles.activeTabButton, activeTabButtonClassName)
                  : joinClassNames(styles.tabButton, tabButtonClassName)
              }
              size='15px'
              background='transparent'
              round='0'
              padding='16px 12px'
              textColor={isActive ? '#2563eb' : '#8ba0bd'}
              borderColor='transparent'
              hoverBackground='transparent'
              hoverTextColor={isActive ? '#2563eb' : '#5f7faa'}
              hoverBorderColor='transparent'
              onClick={() => setActiveTabId(item.id)}
            >
              {item.icon ? <span className={styles.tabIcon}>{item.icon}</span> : null}
              <span>{item.label}</span>
            </Button>
          )
        })}
      </div>

      <div className={joinClassNames(styles.content, contentClassName)} role='tabpanel'>
        {activeItem.content}
      </div>
    </section>
  )
}
