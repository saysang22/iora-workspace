import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '../button/Button'
import { CheckBox } from '../checkBox/CheckBox'
import styles from './EventPopup.module.scss'

type EventPopupProps = {
  popupId: string
  bannerImageUrl: string
  bannerAlt?: string
  linkUrl?: string
  hideForDays?: number
  initiallyOpen?: boolean
  title?: string
  onClose?: (reason: 'close' | 'hide-today' | 'hide-n-days') => void
}

const DISMISS_STORAGE_PREFIX = 'event_popup_dismiss_until:'

function getDismissUntil(popupId: string): number {
  const raw = window.localStorage.getItem(`${DISMISS_STORAGE_PREFIX}${popupId}`)
  if (!raw) {
    return 0
  }

  const parsed = Number(raw)
  return Number.isNaN(parsed) ? 0 : parsed
}

function isDismissedNow(popupId: string): boolean {
  return getDismissUntil(popupId) > Date.now()
}

function getEndOfTodayTimestamp(): number {
  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return endOfToday.getTime()
}

function getNDaysLaterTimestamp(days: number): number {
  const now = new Date()
  const until = new Date(now)
  until.setDate(until.getDate() + days)
  return until.getTime()
}

export function EventPopup({
  popupId,
  bannerImageUrl,
  bannerAlt = '이벤트 배너',
  linkUrl,
  hideForDays = 7,
  initiallyOpen = true,
  title = '이벤트 팝업',
  onClose,
}: EventPopupProps) {
  const [visible, setVisible] = useState(false)
  const [hideTodayChecked, setHideTodayChecked] = useState(false)
  const [hideNDaysChecked, setHideNDaysChecked] = useState(false)

  useEffect(() => {
    if (!initiallyOpen) {
      setVisible(false)
      return
    }

    setVisible(!isDismissedNow(popupId))
  }, [initiallyOpen, popupId])

  const safeHideForDays = useMemo(() => Math.max(1, Math.floor(hideForDays)), [hideForDays])

  const toggleHideToday = () => {
    setHideTodayChecked((prev) => {
      const next = !prev
      if (next) {
        setHideNDaysChecked(false)
      }
      return next
    })
  }

  const toggleHideNDays = () => {
    setHideNDaysChecked((prev) => {
      const next = !prev
      if (next) {
        setHideTodayChecked(false)
      }
      return next
    })
  }

  const closePopup = () => {
    if (hideNDaysChecked) {
      window.localStorage.setItem(`${DISMISS_STORAGE_PREFIX}${popupId}`, String(getNDaysLaterTimestamp(safeHideForDays)))
      onClose?.('hide-n-days')
    } else if (hideTodayChecked) {
      window.localStorage.setItem(`${DISMISS_STORAGE_PREFIX}${popupId}`, String(getEndOfTodayTimestamp()))
      onClose?.('hide-today')
    } else {
      onClose?.('close')
    }

    setVisible(false)
  }

  if (!visible) {
    return null
  }

  const banner = <img className={styles.banner} src={bannerImageUrl} alt={bannerAlt} />

  return (
    <div className={styles.popup} role='dialog' aria-label={title} aria-modal='false'>
      <div className={styles.mediaSection}>
        {linkUrl ? (
          <a className={styles.bannerLink} href={linkUrl} target='_blank' rel='noreferrer noopener' aria-label='이벤트 링크 이동'>
            {banner}
          </a>
        ) : (
          banner
        )}

        {linkUrl ? (
          <a className={styles.eventLinkButton} href={linkUrl} target='_blank' rel='noreferrer noopener'>
            <ExternalLink size={14} />
            <span>이벤트 바로가기</span>
          </a>
        ) : null}

        <Button
          type='button'
          className={styles.iconCloseButton}
          size='13px'
          background='rgba(0, 0, 0, 0.55)'
          round='999px'
          padding='0'
          textColor='#ffffff'
          borderColor='transparent'
          hoverBackground='rgba(0, 0, 0, 0.7)'
          hoverTextColor='#ffffff'
          hoverBorderColor='transparent'
          onClick={closePopup}
          aria-label='팝업 닫기'
        >
          <X size={16} />
        </Button>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.actions}>
          <label className={styles.checkLabel} htmlFor={`hide-today-${popupId}`}>
            <CheckBox
              id={`hide-today-${popupId}`}
              checked={hideTodayChecked}
              onChange={toggleHideToday}
              size='14px'
              round='999px'
              background='#ffffff'
              borderColor='#c4c4c4'
              borderWidth='2px'
              checkColor='#5b6bff'
              checkSize='8px'
              checkThickness='2px'
              checkedBackground='#ffffff'
              checkedBorderColor='#5b6bff'
            />
            <span>오늘 하루 보지 않기</span>
          </label>

          <label className={styles.checkLabel} htmlFor={`hide-n-days-${popupId}`}>
            <CheckBox
              id={`hide-n-days-${popupId}`}
              checked={hideNDaysChecked}
              onChange={toggleHideNDays}
              size='14px'
              round='999px'
              background='#ffffff'
              borderColor='#c4c4c4'
              borderWidth='2px'
              checkColor='#5b6bff'
              checkSize='8px'
              checkThickness='2px'
              checkedBackground='#ffffff'
              checkedBorderColor='#5b6bff'
            />
            <span>{safeHideForDays}일간 보지 않기</span>
          </label>
        </div>

        <div className={styles.footer}>
          <Button
            type='button'
            className={styles.closeButton}
            size='20px'
            background='#efefef'
            round='10px'
            padding='12px'
            textColor='#2f3743'
            borderColor='#d3d3d3'
            hoverBackground='#e9e9e9'
            hoverTextColor='#2f3743'
            hoverBorderColor='#d3d3d3'
            onClick={closePopup}
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
