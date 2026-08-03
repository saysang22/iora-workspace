'use client'

import { Modal } from '@iora/ui'
import { useId, useMemo, useState, type ChangeEvent, type DragEvent } from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import type { TablesInsert } from '../../../lib/database.types'
import type {
  ProjectModificationRequestAttachment,
  ProjectModificationRequestListItem,
} from '../../../lib/projectModificationRequests'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import styles from './ProjectRequestEditModal.module.scss'

type ProjectRequestEditModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmitted: (item: ProjectModificationRequestListItem) => void
  projectId: string | null
}

const ACCEPTED_FILE_TYPES = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024
const STORAGE_BUCKET = 'modification-request-attachments'

function formatBytes(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

function formatRequestDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}.${month}.${day}`
}

function sanitizeFileName(value: string) {
  const [name, extension = ''] = value.split(/\.(?=[^.]+$)/)
  const baseName = name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'file'
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

  return safeExtension ? `${baseName}.${safeExtension}` : baseName
}

function buildValidationError(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} 파일은 10MB 이하만 업로드할 수 있습니다.`
  }

  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return `${file.name} 파일 형식은 지원되지 않습니다.`
  }

  return null
}

export default function ProjectRequestEditModal({
  isOpen,
  onClose,
  onSubmitted,
  projectId,
}: ProjectRequestEditModalProps) {
  const titleId = useId()
  const detailId = useId()
  const fileInputId = useId()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedFilesLabel = useMemo(() => {
    if (files.length === 0) {
      return '선택된 파일이 없습니다.'
    }

    return `${files.length}개 파일 선택됨`
  }, [files.length])

  const resetForm = () => {
    setTitle('')
    setDetail('')
    setFiles([])
    setIsDragging(false)
    setIsSubmitting(false)
    setErrorMessage(null)
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    resetForm()
    onClose()
  }

  const handleFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) {
      return
    }

    const normalizedFiles = Array.from(nextFiles)
    const validationError = normalizedFiles.map((file) => buildValidationError(file)).find(Boolean)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setErrorMessage(null)
    setFiles(normalizedFiles)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleSubmit = async () => {
    if (isSubmitting || !projectId) {
      return
    }

    if (!title.trim()) {
      setErrorMessage('수정 요청 제목을 입력해 주세요.')
      return
    }

    if (!detail.trim()) {
      setErrorMessage('수정 요청 상세 내용을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage('로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.')
      setIsSubmitting(false)
      return
    }

    const requestId = crypto.randomUUID()
    const uploadedPaths: string[] = []

    try {
      const attachments: ProjectModificationRequestAttachment[] = []

      for (const [index, file] of files.entries()) {
        const safeName = sanitizeFileName(file.name)
        const filePath = `${user.id}/${requestId}/${Date.now()}-${index}-${safeName}`

        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type || undefined,
          upsert: false,
        })

        if (uploadError) {
          throw uploadError
        }

        uploadedPaths.push(filePath)
        attachments.push({
          contentType: file.type || null,
          name: file.name,
          path: filePath,
          size: file.size,
        })
      }

      const payload: TablesInsert<'project_modification_requests'> = {
        attachments,
        description: detail.trim(),
        id: requestId,
        project_id: projectId,
        requester_id: user.id,
        title: title.trim(),
      }

      const { data, error } = await supabase
        .from('project_modification_requests')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      const submittedItem: ProjectModificationRequestListItem = {
        assignee: '미배정',
        attachmentCount: attachments.length,
        attachments,
        date: formatRequestDate(data.requested_at),
        description: data.description,
        id: data.id,
        requestedAtValue: data.requested_at,
        requesterName:
          typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
            ? user.user_metadata.full_name.trim()
            : user.email || '고객',
        status: data.status,
        title: data.title,
      }

      onSubmitted(submittedItem)
      resetForm()
      onClose()
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(STORAGE_BUCKET).remove(uploadedPaths)
      }

      setErrorMessage(error instanceof Error ? error.message : '수정 요청을 저장하지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.requestModal}>
      <Modal
        isOpen={isOpen}
        title='수정 요청하기'
        width='min(100%, 672px)'
        background='#131313'
        confirmLabel={isSubmitting ? '제출 중...' : '제출하기'}
        cancelLabel='취소'
        titleStyle={{
          color: '#e5e2e1',
          fontSize: '16px',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.6,
        }}
        cancelButtonProps={{
          size: '16px',
          background: 'transparent',
          textColor: '#c5c9ae',
          borderColor: 'transparent',
          hoverBackground: 'rgb(255 255 255 / 0.03)',
          hoverTextColor: '#e5e2e1',
          hoverBorderColor: 'transparent',
          round: '0',
          padding: '13px 33px',
          style: {
            minWidth: '98px',
            minHeight: '52px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            opacity: isSubmitting ? 0.6 : 1,
          },
        }}
        confirmButtonProps={{
          size: '16px',
          background: '#c8f135',
          textColor: '#293500',
          borderColor: '#c8f135',
          hoverBackground: '#d7fb55',
          hoverTextColor: '#293500',
          hoverBorderColor: '#d7fb55',
          round: '0',
          padding: '12px 40px',
          style: {
            minWidth: '144px',
            minHeight: '50px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            opacity: isSubmitting || !projectId ? 0.72 : 1,
          },
        }}
        closeOnOverlayClick
        onConfirm={() => void handleSubmit()}
        onClose={handleClose}
      >
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor={titleId}>
              제목
            </label>
            <input
              id={titleId}
              className={styles.input}
              type='text'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='수정 요청 제목을 입력해 주세요.'
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor={detailId}>
              상세 내용
            </label>
            <textarea
              id={detailId}
              className={styles.textarea}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder='수정이 필요한 페이지나 구간, 구체적인 요청 사항을 자세히 남겨주세요.'
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>첨부 파일 업로드</span>
            <label
              className={`${styles.uploadArea} ${isDragging ? styles.uploadAreaDragging : ''}`.trim()}
              htmlFor={fileInputId}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                id={fileInputId}
                className={styles.fileInput}
                type='file'
                accept={ACCEPTED_FILE_TYPES}
                multiple
                onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
              />
              <FiUploadCloud className={styles.uploadIcon} size={34} aria-hidden='true' />
              <strong className={styles.uploadTitle}>파일을 드래그하거나 클릭해 업로드</strong>
              <span className={styles.uploadCaption}>JPG, PNG, PDF, DOC, XLS (최대 10MB)</span>
              <span className={styles.uploadStatus}>{selectedFilesLabel}</span>
            </label>

            {files.length > 0 ? (
              <ul className={styles.fileList}>
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`} className={styles.fileItem}>
                    <span>{file.name}</span>
                    <span>{formatBytes(file.size)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {!projectId ? (
            <p className={styles.errorText}>연결된 프로젝트가 없어 수정 요청을 제출할 수 없습니다.</p>
          ) : null}
          {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
        </form>
      </Modal>
    </div>
  )
}
