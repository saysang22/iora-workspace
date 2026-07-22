'use client'

import { Input, Modal, SelectBox } from '@iora/ui'
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { FiLoader, FiUploadCloud, FiX } from 'react-icons/fi'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import type { PortfolioListItem, PortfolioProjectOption } from './page'
import styles from './page.module.scss'

export type PortfolioFormPayload = {
  title: string
  description: string
  thumbnailUrl: string
  category: string
  isPublished: boolean
  projectId: string
}

type PortfolioUpsertModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialItem?: PortfolioListItem | null
  projectOptions: PortfolioProjectOption[]
  onClose: () => void
  onSubmit: (payload: PortfolioFormPayload) => Promise<void> | void
}

const PRIMARY_BUTTON_THEME = {
  size: '14px',
  background: '#e2ff46',
  textColor: '#08111f',
  borderColor: '#e2ff46',
  hoverBackground: '#f0ff84',
  hoverTextColor: '#08111f',
  hoverBorderColor: '#f0ff84',
  round: '14px',
  padding: '12px 18px',
} as const

const SECONDARY_BUTTON_THEME = {
  size: '14px',
  background: '#16233b',
  textColor: '#d5deed',
  borderColor: 'rgb(148 163 184 / 0.16)',
  hoverBackground: '#1c2c49',
  hoverTextColor: '#ffffff',
  hoverBorderColor: 'rgb(148 163 184 / 0.28)',
  round: '14px',
  padding: '12px 18px',
} as const

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function PortfolioUpsertModal({
  isOpen,
  mode,
  initialItem = null,
  projectOptions,
  onClose,
  onSubmit,
}: PortfolioUpsertModalProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const fileInputId = useId()
  const [title, setTitle] = useState(initialItem?.title ?? '')
  const [description, setDescription] = useState(initialItem?.description ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialItem?.thumbnail_url ?? '')
  const [category, setCategory] = useState(initialItem?.category ?? '')
  const [projectId, setProjectId] = useState(initialItem?.project_id ?? '')
  const [isPublished, setIsPublished] = useState(initialItem?.is_published ?? false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(initialItem?.thumbnail_url ?? '')
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectOptions = useMemo(
    () => [
      { value: '', label: '프로젝트 연결 안 함' },
      ...projectOptions.map((option) => ({ value: option.id, label: option.label })),
    ],
    [projectOptions],
  )

  const selectedThumbnailLabel = thumbnailFile
    ? thumbnailFile.name
    : thumbnailPreviewUrl
      ? '기존 썸네일 사용 중'
      : '선택된 파일이 없습니다'

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreviewUrl)
      }
    }
  }, [thumbnailPreviewUrl])

  function resetUploadError() {
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  function handleThumbnailFile(nextFile: File | null) {
    if (!nextFile) {
      return
    }

    if (!ACCEPTED_MIME_TYPES.includes(nextFile.type)) {
      setErrorMessage('썸네일은 JPG, PNG, WEBP 이미지 파일만 업로드할 수 있습니다.')
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setErrorMessage('썸네일 파일 크기는 5MB 이하여야 합니다.')
      return
    }

    if (thumbnailPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreviewUrl)
    }

    setThumbnailFile(nextFile)
    setThumbnailPreviewUrl(URL.createObjectURL(nextFile))
    setThumbnailUrl('')
    resetUploadError()
  }

  function clearThumbnailSelection() {
    if (thumbnailPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreviewUrl)
    }

    setThumbnailFile(null)
    setThumbnailPreviewUrl('')
    setThumbnailUrl('')
    resetUploadError()
  }

  async function uploadThumbnailIfNeeded() {
    if (!thumbnailFile) {
      return thumbnailUrl.trim()
    }

    setIsUploadingThumbnail(true)

    const extension = thumbnailFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeTitle = (title.trim() || 'portfolio')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
    const filePath = `portfolios/${Date.now()}-${safeTitle || 'portfolio'}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('portfolio-thumbnails')
      .upload(filePath, thumbnailFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: thumbnailFile.type,
      })

    if (uploadError) {
      throw new Error(uploadError.message || '썸네일 업로드 중 오류가 발생했습니다.')
    }

    const { data } = supabase.storage.from('portfolio-thumbnails').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (isSubmitting || isUploadingThumbnail) {
      return
    }

    if (!title.trim()) {
      setErrorMessage('포트폴리오 제목을 입력해 주세요.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const uploadedThumbnailUrl = await uploadThumbnailIfNeeded()

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl: uploadedThumbnailUrl,
        category: category.trim(),
        isPublished,
        projectId,
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '썸네일 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
      setIsUploadingThumbnail(false)
    }
  }

  return (
    <div className={styles.modalShell}>
      <Modal
        isOpen={isOpen}
        title={mode === 'create' ? '포트폴리오 등록' : '포트폴리오 수정'}
        width='min(100%, 760px)'
        background='#101010'
        confirmLabel={
          isUploadingThumbnail
            ? '업로드 중...'
            : isSubmitting
              ? '저장 중...'
              : mode === 'create'
                ? '등록'
                : '수정완료'
        }
        cancelLabel='닫기'
        closeOnOverlayClick={!isSubmitting && !isUploadingThumbnail}
        onConfirm={() => void handleSubmit()}
        onClose={onClose}
        titleStyle={{
          color: '#f8fafc',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
        cancelButtonProps={{
          ...SECONDARY_BUTTON_THEME,
          style: { minHeight: '42px', fontWeight: 700 },
        }}
        confirmButtonProps={{
          ...PRIMARY_BUTTON_THEME,
          style: {
            minHeight: '42px',
            fontWeight: 800,
            opacity: isSubmitting || isUploadingThumbnail ? 0.72 : 1,
          },
        }}
      >
        <div className={styles.modalBody}>
          <div className={styles.modalSectionHeader}>
            <p className={styles.modalEyebrow}>PORTFOLIO</p>
            <h2 className={styles.modalTitle}>{mode === 'create' ? '새 포트폴리오 등록' : '포트폴리오 수정'}</h2>
            <p className={styles.modalDescription}>홈페이지에 노출할 포트폴리오 정보와 공개 상태를 설정합니다.</p>
          </div>

          <div className={styles.modalForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor='portfolio-title'>
                제목
              </label>
              <Input
                id='portfolio-title'
                className={styles.fieldControl}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder='예: IORA 브랜드 사이트 리뉴얼'
                background='#0d1a30'
                textColor='#f8fafc'
                focusBorderColor='#ff4f9f'
                padding='14px 16px'
                round='14px'
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor='portfolio-category'>
                카테고리
              </label>
              <Input
                id='portfolio-category'
                className={styles.fieldControl}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder='예: 쇼핑몰'
                background='#0d1a30'
                textColor='#f8fafc'
                focusBorderColor='#ff4f9f'
                padding='14px 16px'
                round='14px'
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor='portfolio-project-id'>
                프로젝트 연결
              </label>
              <SelectBox
                id='portfolio-project-id'
                className={styles.fieldControl}
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                options={selectOptions}
                background='#0d1a30'
                textColor='#f8fafc'
                focusBorderColor='#ff4f9f'
                padding='14px 16px'
                round='14px'
              />
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>썸네일 업로드</span>
              <label
                className={`${styles.uploadArea} ${isDraggingFile ? styles.uploadAreaDragging : ''}`.trim()}
                htmlFor={fileInputId}
                onDragEnter={() => setIsDraggingFile(true)}
                onDragLeave={() => setIsDraggingFile(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event: DragEvent<HTMLLabelElement>) => {
                  event.preventDefault()
                  setIsDraggingFile(false)
                  handleThumbnailFile(event.dataTransfer.files?.[0] ?? null)
                }}
              >
                <input
                  id={fileInputId}
                  className={styles.fileInput}
                  type='file'
                  accept='.jpg,.jpeg,.png,.webp'
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleThumbnailFile(event.target.files?.[0] ?? null)
                  }
                />
                {isUploadingThumbnail ? (
                  <FiLoader className={styles.uploadIconSpinning} size={34} aria-hidden='true' />
                ) : thumbnailPreviewUrl ? (
                  <div
                    className={styles.thumbnailPreview}
                    style={{ backgroundImage: `url("${thumbnailPreviewUrl}")` }}
                    aria-hidden='true'
                  />
                ) : (
                  <FiUploadCloud className={styles.uploadIcon} size={34} aria-hidden='true' />
                )}
                <strong className={styles.uploadTitle}>이미지 파일을 드래그하거나 클릭하여 업로드</strong>
                <span className={styles.uploadCaption}>JPG, PNG, WEBP / 최대 5MB</span>
                <span className={styles.uploadStatus}>{selectedThumbnailLabel}</span>
              </label>

              {thumbnailPreviewUrl ? (
                <button className={styles.clearThumbnailButton} type='button' onClick={clearThumbnailSelection}>
                  <FiX size={14} />
                  썸네일 제거
                </button>
              ) : null}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor='portfolio-description'>
                설명
              </label>
              <textarea
                id='portfolio-description'
                className={`${styles.textarea} ${styles.fieldControl}`.trim()}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder='포트폴리오 소개 문구를 입력해 주세요.'
              />
            </div>

            <label className={styles.publishToggle}>
              <input
                type='checkbox'
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />
              <span>{isPublished ? '홈페이지 Works에 공개' : '비공개 보관'}</span>
            </label>

            {errorMessage ? <p className={styles.modalError}>{errorMessage}</p> : null}
          </div>
        </div>
      </Modal>
    </div>
  )
}
