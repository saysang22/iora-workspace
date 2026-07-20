import { Button } from '@iora/ui'
import { SECONDARY_BUTTON_THEME } from './AdminProjectCreateModal.shared'
import styles from './ProjectPageStatusButton.module.scss'

type ProjectPageStatusButtonProps = {
  ariaLabel: string
  disabled?: boolean
  label?: string
  onClick: () => void
  tone: 'complete' | 'progress' | 'review'
}

const LABEL_BY_TONE = {
  review: '검토 중',
  progress: '진행',
  complete: '완료',
} as const

const TONE_CLASS_NAME = {
  review: styles.review,
  progress: styles.progress,
  complete: styles.complete,
} as const

export default function ProjectPageStatusButton({
  ariaLabel,
  disabled = false,
  label,
  onClick,
  tone,
}: ProjectPageStatusButtonProps) {
  return (
    <Button
      {...SECONDARY_BUTTON_THEME}
      className={`${styles.button} ${TONE_CLASS_NAME[tone]}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label ?? LABEL_BY_TONE[tone]}
    </Button>
  )
}
