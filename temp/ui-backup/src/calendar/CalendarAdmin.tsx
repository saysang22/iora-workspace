import { useEffect, useMemo, useState } from 'react'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Modal } from '../modal/Modal'
import { Toast } from '../toast/Toast'
import { Calendar } from './Calendar'
import type { CalendarCell } from './Holiday'
import styles from './Calendar.module.scss'

type CellOverride = Partial<Pick<CalendarCell, 'status' | 'events' | 'holidayKind'>>
const USER_RESERVATION_STORAGE_KEY = 'calendar_user_reservations'
const ADMIN_PROJECT_LIMIT_STORAGE_KEY = 'calendar_admin_project_limit'
const ADMIN_BLOCKED_DATES_STORAGE_KEY = 'calendar_admin_blocked_dates'
const ADMIN_UNAVAILABLE_DATES_STORAGE_KEY = 'calendar_admin_unavailable_dates'
const USER_RESERVATION_UPDATED_EVENT = 'calendar-user-reservations-updated'
const ADMIN_PROJECT_LIMIT_UPDATED_EVENT = 'calendar-admin-project-limit-updated'
const ADMIN_BLOCKED_DATES_UPDATED_EVENT = 'calendar-admin-blocked-dates-updated'
const ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT = 'calendar-admin-unavailable-dates-updated'

export function CalendarAdmin() {
  const [selectedBlockedDateKeys, setSelectedBlockedDateKeys] = useState<Record<string, boolean>>({})
  const [savedBlockedDateKeys, setSavedBlockedDateKeys] = useState<string[]>([])
  const [userReservedDateKeys, setUserReservedDateKeys] = useState<string[]>([])
  const [draftProjectLimit, setDraftProjectLimit] = useState('0')
  const [savedProjectLimit, setSavedProjectLimit] = useState(0)
  const [isLimitWarningModalOpen, setIsLimitWarningModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)

  useEffect(() => {
    const syncUserReservations = () => {
      const stored = window.localStorage.getItem(USER_RESERVATION_STORAGE_KEY)
      if (!stored) {
        setUserReservedDateKeys([])
        return
      }

      try {
        const parsed = JSON.parse(stored) as string[]
        setUserReservedDateKeys(Array.isArray(parsed) ? parsed : [])
      } catch {
        setUserReservedDateKeys([])
      }
    }

    syncUserReservations()
    window.addEventListener('storage', syncUserReservations)
    window.addEventListener(USER_RESERVATION_UPDATED_EVENT, syncUserReservations)
    return () => {
      window.removeEventListener('storage', syncUserReservations)
      window.removeEventListener(USER_RESERVATION_UPDATED_EVENT, syncUserReservations)
    }
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY)
    if (!stored) {
      return
    }

    const parsed = Number(stored)
    if (Number.isNaN(parsed)) {
      return
    }

    setSavedProjectLimit(parsed)
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_BLOCKED_DATES_STORAGE_KEY)
    if (!stored) {
      return
    }

    try {
      const parsed = JSON.parse(stored) as string[]
      setSavedBlockedDateKeys(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSavedBlockedDateKeys([])
    }
  }, [])

  const customCellMap = useMemo<Record<string, CellOverride>>(() => {
    const result: Record<string, CellOverride> = {}
    const reservationCountByDate = userReservedDateKeys.reduce<Record<string, number>>((acc, dateKey) => {
      acc[dateKey] = (acc[dateKey] ?? 0) + 1
      return acc
    }, {})

    Object.entries(reservationCountByDate).forEach(([dateKey, count]) => {
      if (savedProjectLimit <= 0 || count >= savedProjectLimit) {
        result[dateKey] = {
          status: 'unavailable',
          events: [{ label: '작업중', tone: 'white' }],
        }
      }
    })

    savedBlockedDateKeys.forEach((dateKey) => {
      result[dateKey] = {
        status: 'unavailable',
        events: [{ label: '작업중', tone: 'white' }],
      }
    })

    Object.entries(selectedBlockedDateKeys).forEach(([dateKey, isBlocked]) => {
      if (!isBlocked) {
        return
      }

      result[dateKey] = {
        status: 'unavailable',
        events: [{ label: '작업중', tone: 'white' }],
      }
    })

    return result
  }, [savedBlockedDateKeys, savedProjectLimit, selectedBlockedDateKeys, userReservedDateKeys])

  const unavailableDateKeys = useMemo(
    () =>
      Object.entries(customCellMap)
        .filter(([, cell]) => cell.status === 'unavailable')
        .map(([dateKey]) => dateKey),
    [customCellMap],
  )

  useEffect(() => {
    window.localStorage.setItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY, JSON.stringify(unavailableDateKeys))
    window.dispatchEvent(new Event(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT))
  }, [unavailableDateKeys])

  return (
    <>
      <Calendar
        title='관리자 캘린더'
        description='날짜를 클릭해서 예약 불가 상태를 지정/해제할 수 있습니다.'
        customCellMap={customCellMap}
        showSelectedLegend={false}
        headerExtra={(
          <div className={styles.calendarAdminHeaderExtra}>
            <div className={styles.calendarAdminHeaderExtraControls}>
              <Input
                type='number'
                min={0}
                value={draftProjectLimit}
                onChange={(event) => {
                  setDraftProjectLimit(event.target.value)
                }}
                width='120px'
                padding='6px 8px'
                round='6px'
                background='#ffffff'
                textColor='#121c2a'
                focusBorderColor='#0053db'
                placeholder='프로젝트 수'
              />
              <Button
                type='button'
                size='12px'
                background='#111827'
                round='6px'
                padding='6px 10px'
                textColor='#ffffff'
                borderColor='#111827'
                hoverBackground='#1f2937'
                hoverTextColor='#ffffff'
                hoverBorderColor='#1f2937'
                onClick={() => {
                  const parsed = Number(draftProjectLimit)
                  const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
                  const reservationCountByDate = userReservedDateKeys.reduce<Record<string, number>>((acc, dateKey) => {
                    acc[dateKey] = (acc[dateKey] ?? 0) + 1
                    return acc
                  }, {})
                  const maxReservedCount = Object.values(reservationCountByDate).reduce(
                    (maxValue, count) => Math.max(maxValue, count),
                    0,
                  )

                  if (safeValue < maxReservedCount) {
                    setIsLimitWarningModalOpen(true)
                    return
                  }

                  setSavedProjectLimit(safeValue)
                  setDraftProjectLimit('0')
                  window.localStorage.setItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY, String(safeValue))
                  window.dispatchEvent(new Event(ADMIN_PROJECT_LIMIT_UPDATED_EVENT))
                  setToastMessage('저장이 완료되었습니다.')
                  setIsToastVisible(true)
                }}
              >
                저장
              </Button>
            </div>
            <span className={styles.calendarAdminHeaderExtraText}>하루에 받을 수 있는 프로젝트 수 : {savedProjectLimit}</span>
          </div>
        )}
        onCellClick={({ dateKey, isWeekend, isHoliday, cell }) => {
          if (isWeekend || isHoliday || (cell.status === 'unavailable' && !selectedBlockedDateKeys[dateKey])) {
            return
          }

          setSelectedBlockedDateKeys((prev) => ({
            ...prev,
            [dateKey]: !prev[dateKey],
          }))
        }}
      />
      <div className={styles.calendarAdminPrimaryActionRow}>
        <Button
          type='button'
          size='14px'
          background='#0053db'
          round='8px'
          padding='10px 16px'
          textColor='#ffffff'
          borderColor='#0053db'
          hoverBackground='#0047bd'
          hoverTextColor='#ffffff'
          hoverBorderColor='#0047bd'
          disabled={!Object.values(selectedBlockedDateKeys).some(Boolean)}
          onClick={() => {
            const selectedKeys = Object.entries(selectedBlockedDateKeys)
              .filter(([, isBlocked]) => isBlocked)
              .map(([dateKey]) => dateKey)

            const nextSaved = Array.from(new Set([...savedBlockedDateKeys, ...selectedKeys]))
            setSavedBlockedDateKeys(nextSaved)
            window.localStorage.setItem(ADMIN_BLOCKED_DATES_STORAGE_KEY, JSON.stringify(nextSaved))
            window.dispatchEvent(new Event(ADMIN_BLOCKED_DATES_UPDATED_EVENT))
            setToastMessage('저장이 완료되었습니다.')
            setIsToastVisible(true)
            setSelectedBlockedDateKeys({})
          }}
        >
          저장하기
        </Button>
      </div>
      <section className={styles.calendarAdminPanel}>
        <h3 className={styles.calendarAdminPanelTitle}>관리자 저장 프로젝트 수</h3>
        <pre className={`${styles.calendarAdminPanelPre} ${styles.calendarAdminPanelPreWithGap}`}>
          {JSON.stringify({ savedProjectLimit }, null, 2)}
        </pre>
        <h3 className={styles.calendarAdminPanelTitle}>저장된 작업중 날짜 배열</h3>
        <pre className={styles.calendarAdminPanelPre}>
          {JSON.stringify(unavailableDateKeys, null, 2)}
        </pre>
      </section>
      <Modal
        isOpen={isLimitWarningModalOpen}
        title='저장 불가'
        confirmLabel='확인'
        cancelLabel='닫기'
        onConfirm={() => setIsLimitWarningModalOpen(false)}
        onClose={() => setIsLimitWarningModalOpen(false)}
      >
        이미 예약된 프로젝트가 캘린더에 등록되어 있습니다.
      </Modal>
      <Toast
        visible={isToastVisible}
        title='저장 완료'
        message={toastMessage}
        type='success'
        position='center'
        duration={1800}
        onClose={() => setIsToastVisible(false)}
      />
    </>
  )
}
