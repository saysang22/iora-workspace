'use client'

import { Modal } from '@iora/ui'
import { useId, useMemo, useState, type ChangeEvent, type DragEvent } from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import styles from './ProjectRequestEditModal.module.scss'

type ProjectRequestEditModalProps = {
  isOpen: boolean
  onClose: () => void
}

const ACCEPTED_FILE_TYPES = '.jpg,.jpeg,.png,.pdf'

function formatBytes(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

export default function ProjectRequestEditModal({ isOpen, onClose }: ProjectRequestEditModalProps) {
  const titleId = useId()
  const detailId = useId()
  const fileInputId = useId()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const selectedFilesLabel = useMemo(() => {
    if (files.length === 0) {
      return '선택된 파일이 없습니다'
    }

    return `${files.length}개 파일 선택됨`
  }, [files.length])

  const resetForm = () => {
    setTitle('')
    setDetail('')
    setFiles([])
    setIsDragging(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) {
      return
    }

    setFiles(Array.from(nextFiles))
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className={styles.requestModal}>
      <Modal
        isOpen={isOpen}
        title='수정 요청하기'
        width='min(100%, 672px)'
        background='#131313'
        confirmLabel='제출하기'
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
          },
        }}
        closeOnOverlayClick
        onConfirm={handleClose}
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
              placeholder='수정 사항을 간략히 입력해 주세요'
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
              placeholder='수정이 필요한 페이지의 URL 또는 영역, 구체적인 수정 요청 사항을 기술해 주세요.'
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>참조 파일 업로드</span>
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
              <strong className={styles.uploadTitle}>파일을 드래그하거나 클릭하여 업로드</strong>
              <span className={styles.uploadCaption}>JPG, PNG, PDF (최대 10MB)</span>
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
        </form>
      </Modal>
    </div>
  )
}
