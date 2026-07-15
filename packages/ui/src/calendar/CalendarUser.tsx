import { useEffect, useMemo, useState } from 'react'
import { Button } from '../button/Button'
import { Modal } from '../modal/Modal'
import { Calendar } from './Calendar'
import type { CalendarCell } from './Holiday'
import styles from './Calendar.module.scss'

type CellOverride = Partial<Pick<CalendarCell, 'status' | 'events' | 'holidayKind'>>
const USER_RESERVATION_STORAGE_KEY = 'calendar_user_reservations'
const ADMIN_PROJECT_LIMIT_STORAGE_KEY = 'calendar_admin_project_limit'
const ADMIN_UNAVAILABLE_DATES_STORAGE_KEY = 'calendar_admin_unavailable_dates'
const USER_RESERVATION_UPDATED_EVENT = 'calendar-user-reservations-updated'
const ADMIN_PROJECT_LIMIT_UPDATED_EVENT = 'calendar-admin-project-limit-updated'
const ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT = 'calendar-admin-unavailable-dates-updated'

export function CalendarUser() {
  const [selectedDateKeys, setSelectedDateKeys] = useState<string[]>([])
  const [confirmedDateKeys, setConfirmedDateKeys] = useState<string[]>([])
  const [savedReservations, setSavedReservations] = useState<string[]>([])
  const [savedProjectLimit, setSavedProjectLimit] = useState(0)
  const [adminBlockedDateKeys, setAdminBlockedDateKeys] = useState<string[]>([])
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState<'reserve' | 'cancel' | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(USER_RESERVATION_STORAGE_KEY)
    if (!stored) {
      return
    }

    try {
      const parsed = JSON.parse(stored) as string[]
      if (Array.isArray(parsed)) {
        setSavedReservations(parsed)
        setConfirmedDateKeys(parsed)
      }
    } catch {
      setSavedReservations([])
      setConfirmedDateKeys([])
    }
  }, [])

  useEffect(() => {
    const syncProjectLimit = () => {
      const stored = window.localStorage.getItem(ADMIN_PROJECT_LIMIT_STORAGE_KEY)
      if (!stored) {
        setSavedProjectLimit(0)
        return
      }

      const parsed = Number(stored)
      setSavedProjectLimit(Number.isNaN(parsed) ? 0 : Math.max(0, parsed))
    }

    syncProjectLimit()
    window.addEventListener('storage', syncProjectLimit)
    window.addEventListener(ADMIN_PROJECT_LIMIT_UPDATED_EVENT, syncProjectLimit)
    return () => {
      window.removeEventListener('storage', syncProjectLimit)
      window.removeEventListener(ADMIN_PROJECT_LIMIT_UPDATED_EVENT, syncProjectLimit)
    }
  }, [])

  useEffect(() => {
    const syncAdminUnavailableDates = () => {
      const stored = window.localStorage.getItem(ADMIN_UNAVAILABLE_DATES_STORAGE_KEY)
      if (!stored) {
        setAdminBlockedDateKeys([])
        return
      }

      try {
        const parsed = JSON.parse(stored) as string[]
        setAdminBlockedDateKeys(Array.isArray(parsed) ? parsed : [])
      } catch {
        setAdminBlockedDateKeys([])
      }
    }

    syncAdminUnavailableDates()
    window.addEventListener('storage', syncAdminUnavailableDates)
    window.addEventListener(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT, syncAdminUnavailableDates)
    return () => {
      window.removeEventListener('storage', syncAdminUnavailableDates)
      window.removeEventListener(ADMIN_UNAVAILABLE_DATES_UPDATED_EVENT, syncAdminUnavailableDates)
    }
  }, [])

  const customCellMap = useMemo<Record<string, CellOverride>>(() => {
    if (!selectedDateKeys.length && !confirmedDateKeys.length && !savedReservations.length && !adminBlockedDateKeys.length) {
      return {}
    }

    const result: Record<string, CellOverride> = {}
    const reservationCountByDate = savedReservations.reduce<Record<string, number>>((acc, dateKey) => {
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

    adminBlockedDateKeys.forEach((dateKey) => {
      result[dateKey] = {
        status: 'unavailable',
        events: [{ label: '작업중', tone: 'white' }],
      }
    })

    selectedDateKeys.forEach((dateKey) => {
      if (result[dateKey]?.status === 'unavailable') {
        return
      }

      result[dateKey] = {
        status: 'selected',
        events: [{ label: '예약 신청', tone: 'blue' }],
      }
    })

    confirmedDateKeys.forEach((dateKey) => {
      if (result[dateKey]?.status === 'unavailable') {
        return
      }

      const isCancellationSelected = selectedDateKeys.includes(dateKey)
      result[dateKey] = {
        status: 'selected',
        events: [{ label: isCancellationSelected ? '예약 취소 선택' : '예약 완료', tone: 'blue' }],
      }
    })

    return result
  }, [adminBlockedDateKeys, confirmedDateKeys, savedProjectLimit, savedReservations, selectedDateKeys])

  const hasCancelableSelection = useMemo(
    () => selectedDateKeys.some((dateKey) => confirmedDateKeys.includes(dateKey)),
    [confirmedDateKeys, selectedDateKeys],
  )

  const openConfirmModal = (actionType: 'reserve' | 'cancel') => {
    setConfirmActionType(actionType)
    setIsConfirmModalOpen(true)
  }

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setConfirmActionType(null)
  }

  const handleConfirmAction = () => {
    if (confirmActionType === 'cancel') {
      const selectedSet = new Set(selectedDateKeys)
      const nextSaved = savedReservations.filter((dateKey) => !selectedSet.has(dateKey))
      setSavedReservations(nextSaved)
      setConfirmedDateKeys(nextSaved)
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, JSON.stringify(nextSaved))
      window.dispatchEvent(new Event(USER_RESERVATION_UPDATED_EVENT))
      setSelectedDateKeys([])
      closeConfirmModal()
      return
    }

    if (confirmActionType === 'reserve') {
      const nextSaved = [...savedReservations, ...selectedDateKeys]
      setSavedReservations(nextSaved)
      setConfirmedDateKeys(nextSaved)
      window.localStorage.setItem(USER_RESERVATION_STORAGE_KEY, JSON.stringify(nextSaved))
      window.dispatchEvent(new Event(USER_RESERVATION_UPDATED_EVENT))
      setSelectedDateKeys([])
      closeConfirmModal()
    }
  }

  return (
    <>
      <Calendar
        title='유저 예약 캘린더'
        description='예약 가능한 날짜를 선택해 예약 신청할 수 있습니다.'
        customCellMap={customCellMap}
        onCellClick={({ dateKey, cell, isWeekend, isHoliday }) => {
          const isUnavailable = cell.status === 'unavailable' || customCellMap[dateKey]?.status === 'unavailable'

          if (isWeekend || isHoliday || isUnavailable) {
            return
          }

          setSelectedDateKeys((prev) => {
            if (prev.includes(dateKey)) {
              return prev.filter((key) => key !== dateKey)
            }
            return [...prev, dateKey]
          })
        }}
      />
      <div className={styles.calendarUserActions}>
        <Button
          type='button'
          size='14px'
          background='#9b1c1c'
          round='8px'
          padding='10px 16px'
          textColor='#ffffff'
          borderColor='#9b1c1c'
          hoverBackground='#7f1d1d'
          hoverTextColor='#ffffff'
          hoverBorderColor='#7f1d1d'
          disabled={!hasCancelableSelection}
          onClick={() => openConfirmModal('cancel')}
        >
          예약 취소하기
        </Button>
        <Button
          type='button'
          className={styles.calendarUserReserveButton}
          size='14px'
          background='#0053db'
          round='8px'
          padding='10px 16px'
          textColor='#ffffff'
          borderColor='#0053db'
          hoverBackground='#0047bd'
          hoverTextColor='#ffffff'
          hoverBorderColor='#0047bd'
          disabled={!selectedDateKeys.length}
          onClick={() => openConfirmModal('reserve')}
        >
          예약하기
        </Button>
      </div>
      <section className={styles.calendarUserSavedPanel}>
        <h3>저장된 예약 날짜 배열</h3>
        <pre>{JSON.stringify(savedReservations, null, 2)}</pre>
      </section>
      <Modal
        isOpen={isConfirmModalOpen}
        title={confirmActionType === 'cancel' ? '예약 취소 확인' : '예약 확인'}
        confirmLabel='확인'
        cancelLabel='닫기'
        onConfirm={handleConfirmAction}
        onClose={closeConfirmModal}
      >
        {confirmActionType === 'cancel'
          ? '선택한 예약을 취소하시겠습니까?'
          : '선택한 날짜로 예약하시겠습니까?'}
      </Modal>
    </>
  )
}
