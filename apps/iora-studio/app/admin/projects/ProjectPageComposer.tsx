'use client'

import { Button, Input } from '@iora/ui'
import { type ReactNode, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
  INPUT_THEME,
  PRIMARY_BUTTON_THEME,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './ProjectPageComposer.module.scss'

type ProjectPageComposerProps = {
  addButtonLabel?: string
  allowBulk?: boolean
  bulkLabel?: string
  bulkPlaceholder?: string
  className?: string
  fieldLabel?: string
  layout?: 'inline' | 'stacked'
  onAddPages: (pageNames: string[]) => Promise<void> | void
  placeholder?: string
  secondaryAction?: ReactNode
}

export default function ProjectPageComposer({
  addButtonLabel = '페이지 추가',
  allowBulk = false,
  bulkLabel = '페이지명 일괄 입력',
  bulkPlaceholder = '예시\n메인 페이지\n회사 소개\n포트폴리오',
  className,
  fieldLabel = '페이지명',
  layout = 'inline',
  onAddPages,
  placeholder = '예: 메인 페이지',
  secondaryAction = null,
}: ProjectPageComposerProps) {
  const [draftPageName, setDraftPageName] = useState('')
  const [bulkPageNames, setBulkPageNames] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (pageNames: string[]) => {
    if (!pageNames.length || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await onAddPages(pageNames)
      setDraftPageName('')
      setBulkPageNames('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '페이지를 추가하지 못했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const normalizedBulkPageNames = bulkPageNames
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)

  return (
    <div
      className={`${styles.composer} ${
        layout === 'inline' ? styles.inline : styles.stacked
      } ${className ?? ''}`.trim()}
    >
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{fieldLabel}</span>
        <Input
          {...INPUT_THEME}
          padding='10px 14px'
          value={draftPageName}
          onChange={(event) => setDraftPageName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleSubmit([draftPageName.trim()].filter(Boolean))
            }
          }}
          placeholder={placeholder}
        />
      </label>

      <div className={styles.actions}>
        <Button
          {...PRIMARY_BUTTON_THEME}
          className={styles.button}
          style={{ minHeight: '50px' }}
          onClick={() => void handleSubmit([draftPageName.trim()].filter(Boolean))}
          disabled={isSubmitting}
        >
          <FiPlus size={16} />
          <span>{addButtonLabel}</span>
        </Button>
        {secondaryAction}
      </div>

      {allowBulk ? (
        <>
          <label className={styles.bulkArea}>
            <span className={styles.fieldLabel}>{bulkLabel}</span>
            <textarea
              className={styles.textarea}
              value={bulkPageNames}
              onChange={(event) => setBulkPageNames(event.target.value)}
              placeholder={bulkPlaceholder}
            />
          </label>

          <div className={styles.actions}>
            <Button
              {...SECONDARY_BUTTON_THEME}
              className={styles.button}
              style={{ minHeight: '50px' }}
              onClick={() => void handleSubmit(normalizedBulkPageNames)}
              disabled={isSubmitting}
            >
              일괄 추가
            </Button>
          </div>
        </>
      ) : null}

      {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
    </div>
  )
}
