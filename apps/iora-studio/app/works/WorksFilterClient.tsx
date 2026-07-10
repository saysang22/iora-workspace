'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import styles from './page.module.scss'
import { WORK_CATEGORIES, type WorkCategory, type WorkItem } from './works.shared'

type WorksFilterClientProps = {
  items: WorkItem[]
}

export default function WorksFilterClient({ items }: WorksFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('all')

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return items
    }

    return items.filter((item) => item.category === activeCategory)
  }, [activeCategory, items])

  const activeCategoryLabel =
    WORK_CATEGORIES.find((category) => category.id === activeCategory)?.label ?? '전체'

  return (
    <section className={styles.worksSection} aria-labelledby='works-filter-title'>
      <h2 id='works-filter-title' className={styles.screenReaderOnly}>
        포트폴리오 필터
      </h2>

      <nav className={styles.filterNav} aria-label='포트폴리오 카테고리'>
        {WORK_CATEGORIES.map((category) => {
          const isActive = category.id === activeCategory

          return (
            <button
              key={category.id}
              type='button'
              className={isActive ? styles.activeFilterButton : styles.filterButton}
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          )
        })}
      </nav>

      {filteredItems.length ? (
        <div className={styles.workGrid}>
          {filteredItems.map((item) => (
            <Link className={styles.workLink} href={`/works/${item.slug}`} key={item.slug}>
              <article className={styles.workCard}>
                <div className={styles.thumbnailWrap}>
                  <Image
                    src={item.thumbnailSrc}
                    alt={item.thumbnailAlt}
                    fill
                    sizes='(max-width: 900px) 100vw, 50vw'
                  />
                </div>

                <div className={styles.workContent}>
                  <div className={styles.workHeadingRow}>
                    <h3>{item.title}</h3>
                    <span className={styles.categoryBadge}>{item.badgeLabel}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState} role='status' aria-live='polite'>
          <strong>{activeCategoryLabel}</strong>
          <p>아직 등록된 포트폴리오가 없습니다. 다른 카테고리를 확인해 주세요.</p>
        </div>
      )}
    </section>
  )
}
