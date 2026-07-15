import { useEffect } from 'react'
import type { ComponentProps, CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../button/Button'
import styles from './Modal.module.scss'

type ModalButtonDesignProps = Partial<
  Pick<
    ComponentProps<typeof Button>,
    | 'className'
    | 'style'
    | 'size'
    | 'background'
    | 'textColor'
    | 'borderColor'
    | 'hoverBackground'
    | 'hoverTextColor'
    | 'hoverBorderColor'
    | 'round'
    | 'padding'
  >
>

type ModalProps = {
  isOpen: boolean
  title?: string
  children?: ReactNode
  width?: string
  background?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  confirmLabel?: string
  cancelLabel?: string
  titleClassName?: string
  titleStyle?: CSSProperties
  cancelButtonProps?: ModalButtonDesignProps
  confirmButtonProps?: ModalButtonDesignProps
  onConfirm?: () => void
  onClose?: () => void
}

const DEFAULT_CANCEL_BUTTON_PROPS: ComponentProps<typeof Button> = {
  type: 'button',
  size: '14px',
  background: '#f8fafc',
  textColor: '#111827',
  borderColor: '#cbd5e1',
  hoverBackground: '#f1f5f9',
  hoverTextColor: '#111827',
  hoverBorderColor: '#94a3b8',
  round: '8px',
  padding: '8px 14px',
}

const DEFAULT_CONFIRM_BUTTON_PROPS: ComponentProps<typeof Button> = {
  type: 'button',
  size: '14px',
  background: '#2563eb',
  textColor: '#ffffff',
  borderColor: '#2563eb',
  hoverBackground: '#1d4ed8',
  hoverTextColor: '#ffffff',
  hoverBorderColor: '#1d4ed8',
  round: '8px',
  padding: '8px 14px',
}

export function Modal({
  isOpen,
  title = '모달',
  children,
  width = '480px',
  background = '#ffffff',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  confirmLabel = '확인',
  cancelLabel = '닫기',
  titleClassName = '',
  titleStyle,
  cancelButtonProps,
  confirmButtonProps,
  onConfirm,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeOnEscape, isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const modalStyle: CSSProperties = {
    ...(width ? { width } : {}),
    ...(background ? ({ '--modal-background': background } as CSSProperties) : {}),
  }

  const resolvedTitleClassName = [styles.title, titleClassName].filter(Boolean).join(' ')

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        if (closeOnOverlayClick) {
          onClose?.()
        }
      }}
      role='presentation'
    >
      <section
        className={styles.container}
        style={modalStyle}
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label={title}
      >
        <header className={styles.header}>
          <h3 className={resolvedTitleClassName} style={titleStyle}>
            {title}
          </h3>
          <Button
            type='button'
            className={styles.closeButton}
            size='24px'
            background='transparent'
            textColor='#64748b'
            borderColor='transparent'
            hoverBackground='transparent'
            hoverTextColor='#334155'
            hoverBorderColor='transparent'
            round='8px'
            padding='0'
            onClick={() => onClose?.()}
            aria-label='모달 닫기'
          >
            <X size={18} aria-hidden />
          </Button>
        </header>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>
          <Button {...DEFAULT_CANCEL_BUTTON_PROPS} {...cancelButtonProps} onClick={() => onClose?.()}>
            {cancelLabel}
          </Button>
          <Button {...DEFAULT_CONFIRM_BUTTON_PROPS} {...confirmButtonProps} onClick={() => onConfirm?.()}>
            {confirmLabel}
          </Button>
        </footer>
      </section>
    </div>
  )
}
