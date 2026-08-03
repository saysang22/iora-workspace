'use client'

import { Spinner } from '@iora/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiClock, FiFileText, FiFolder, FiSearch } from 'react-icons/fi'
import styles from './AdminShell.module.scss'

type SearchProjectItem = {
  id: string
  title: string
  subtitle: string
  href: string
  stageLabel: string
  updatedAt: string
}

type SearchContactItem = {
  id: string
  title: string
  subtitle: string
  href: string
  statusLabel: string
  createdAt: string
}

type SearchResponse = {
  projects: SearchProjectItem[]
  contacts: SearchContactItem[]
  message?: string
}

const MIN_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 300

export default function AdminHeaderSearch() {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse>({
    projects: [],
    contacts: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const trimmedQuery = query.trim()
  const canSearch = trimmedQuery.length >= MIN_QUERY_LENGTH
  const hasProjectResults = results.projects.length > 0
  const hasContactResults = results.contacts.length > 0
  const hasAnyResults = hasProjectResults || hasContactResults

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (rootRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!canSearch) return

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        setIsOpen(true)

        const response = await fetch(`/admin/search?q=${encodeURIComponent(trimmedQuery)}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('검색 결과를 불러오지 못했습니다.')
        }

        const payload = (await response.json()) as SearchResponse

        setResults({
          projects: payload.projects ?? [],
          contacts: payload.contacts ?? [],
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setResults({
          projects: [],
          contacts: [],
          message: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
        })
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [canSearch, trimmedQuery])

  const emptyMessage = useMemo(() => {
    if (!canSearch || isLoading) {
      return ''
    }

    return results.message || '검색 결과가 없습니다.'
  }, [canSearch, isLoading, results.message])

  const handleSelect = (href: string) => {
    setQuery('')
    setResults({
      projects: [],
      contacts: [],
    })
    setIsOpen(false)
    router.push(href)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults({
        projects: [],
        contacts: [],
      })
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <div className={styles.searchWrap} ref={rootRef}>
      <label className={styles.searchShell}>
        <FiSearch size={18} />
        <input
          type='search'
          value={query}
          placeholder='프로젝트, 고객사, 예약 검색...'
          aria-label='프로젝트, 고객사, 예약 검색'
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            if (canSearch) {
              setIsOpen(true)
            }
          }}
        />
        {isLoading ? (
          <span className={styles.searchLoading} aria-hidden='true'>
            <Spinner size={16} />
          </span>
        ) : null}
      </label>

      {isOpen ? (
        <div className={styles.searchDropdown} role='listbox' aria-label='관리자 통합 검색 결과'>
          {hasProjectResults ? (
            <section className={styles.searchGroup}>
              <div className={styles.searchGroupHeader}>
                <FiFolder size={14} />
                <span>프로젝트</span>
              </div>

              <div className={styles.searchResultList}>
                {results.projects.map((item) => (
                  <button
                    key={item.id}
                    className={styles.searchResultItem}
                    type='button'
                    onClick={() => handleSelect(item.href)}
                  >
                    <div className={styles.searchResultIcon}>
                      <FiFolder size={16} />
                    </div>
                    <div className={styles.searchResultCopy}>
                      <div className={styles.searchResultTopRow}>
                        <strong>{item.title}</strong>
                        <span className={styles.searchResultBadge}>{item.stageLabel}</span>
                      </div>
                      <span className={styles.searchResultMeta}>{item.subtitle}</span>
                    </div>
                    <span className={styles.searchResultDate}>{item.updatedAt}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {hasContactResults ? (
            <section className={styles.searchGroup}>
              <div className={styles.searchGroupHeader}>
                <FiFileText size={14} />
                <span>예약/문의</span>
              </div>

              <div className={styles.searchResultList}>
                {results.contacts.map((item) => (
                  <button
                    key={item.id}
                    className={styles.searchResultItem}
                    type='button'
                    onClick={() => handleSelect(item.href)}
                  >
                    <div className={styles.searchResultIcon}>
                      <FiFileText size={16} />
                    </div>
                    <div className={styles.searchResultCopy}>
                      <div className={styles.searchResultTopRow}>
                        <strong>{item.title}</strong>
                        <span className={`${styles.searchResultBadge} ${styles.searchResultBadgeSlate}`.trim()}>
                          {item.statusLabel}
                        </span>
                      </div>
                      <span className={styles.searchResultMeta}>{item.subtitle}</span>
                    </div>
                    <span className={styles.searchResultDate}>{item.createdAt}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {!hasAnyResults && emptyMessage ? (
            <div className={styles.searchEmptyState}>
              <FiClock size={16} />
              <span>{emptyMessage}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
