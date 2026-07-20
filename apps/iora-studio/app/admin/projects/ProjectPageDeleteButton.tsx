import { Button } from '@iora/ui'
import { SECONDARY_BUTTON_THEME } from './AdminProjectCreateModal.shared'
import styles from './ProjectPageDeleteButton.module.scss'

type ProjectPageDeleteButtonProps = {
  ariaLabel: string
  disabled?: boolean
  onClick: () => void
}

export default function ProjectPageDeleteButton({
  ariaLabel,
  disabled = false,
  onClick,
}: ProjectPageDeleteButtonProps) {
  return (
    <Button
      {...SECONDARY_BUTTON_THEME}
      className={styles.deleteButton}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      삭제
    </Button>
  )
}
