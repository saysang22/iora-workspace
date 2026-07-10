import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'
import { Button } from '../button/Button'
import styles from './Toast.module.scss'

type ToastProps = {
  visible: boolean
  title?: string
  message: string
  type?: 'info' | 'success' | 'error'
  duration?: number
  position?: 'top-center' | 'center' | 'bottom-center'
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
}

export function Toast({
  visible,
  title = '알림',
  message,
  type = 'info',
  duration = 2200,
  position = 'center',
  actionLabel,
  onAction,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!visible || duration <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      onClose?.()
    }, duration)

    return () => {
      window.clearTimeout(timer)
    }
  }, [duration, onClose, visible])

  if (!visible) {
    return null
  }

  const iconByType = {
    info: <FiInfo size={18} aria-hidden />,
    success: <FiCheckCircle size={18} aria-hidden />,
    error: <FiAlertCircle size={18} aria-hidden />,
  } as const

  const rootStyle: CSSProperties = {
    ...(position === 'top-center' ? { top: '20px', bottom: 'auto', transform: 'translateX(-50%)' } : {}),
    ...(position === 'bottom-center' ? { bottom: '20px', top: 'auto', transform: 'translateX(-50%)' } : {}),
    ...(position === 'center' ? { top: '50%', bottom: 'auto', transform: 'translate(-50%, -50%)' } : {}),
  }

  return (
    <div className={styles.viewport} style={rootStyle} role='status' aria-live='polite'>
      <div className={[styles.toast, styles[type]].join(' ')}>
        <div className={styles.iconWrap}>{iconByType[type]}</div>

        <div className={styles.content}>
          <p className={styles.title}>{title}</p>
          <p className={styles.message}>{message}</p>
          {actionLabel ? (
            <Button
              type='button'
              className={styles.actionButton}
              size='12px'
              background='transparent'
              textColor='inherit'
              borderColor='transparent'
              hoverBackground='transparent'
              hoverTextColor='inherit'
              hoverBorderColor='transparent'
              round='0'
              padding='0'
              onClick={() => onAction?.()}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>

        <Button
          type='button'
          className={styles.closeButton}
          size='12px'
          background='transparent'
          textColor='inherit'
          borderColor='transparent'
          hoverBackground='transparent'
          hoverTextColor='inherit'
          hoverBorderColor='transparent'
          round='4px'
          padding='2px'
          onClick={() => onClose?.()}
          aria-label='토스트 닫기'
        >
          <FiX size={16} aria-hidden />
        </Button>
      </div>
    </div>
  )
}
