import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Modal } from '../modal/Modal'
import { Toast } from '../toast/Toast'
import { Calendar, type CalendarSlotClassNames } from './Calendar'
import type { CalendarCell } from './Holiday'
import styles from './Calendar.module.scss'

type CellOverride = Partial<Pick<CalendarCell, 'status' | 'events' | 'holidayKind'>>

export type CalendarAdminAvailabilityMap = Record<
  string,
  {
    reservedCount: number
    maxCapacity: number | null
    isUnavailable: boolean
  }
>

export type CalendarAdminProps = {
  title?: ReactNode | null
  description?: ReactNode | null
  legend?: ReactNode | null
  showSelectedLegend?: boolean
  showTopRow?: boolean
  showDebugPanel?: boolean
  saveButtonLabel?: ReactNode
  statusText?: ReactNode
  className?: string
  style?: CSSProperties
  slotClassNames?: CalendarSlotClassNames
  headerExtraClassName?: string
  headerExtraControlsClassName?: string
  headerExtraTextClassName?: string
  primaryActionRowClassName?: string
  debugPanelClassName?: string
  defaultProjectLimit?: number
  loadAvailability?: (params: { year: number; month: number }) => Promise<CalendarAdminAvailabilityMap>
  onSaveCapacitySettings?: (params: { dateKeys: string[]; maxCapacity: number }) => Promise<void> | void
}

function getTodayMonth() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function CalendarAdmin({
  title = '관리자 캘린더',
  description = '날짜를 클릭해서 예약 불가 상태를 지정하거나 허용 수를 설정합니다.',
  legend,
  showSelectedLegend = false,
  showTopRow = true,
  showDebugPanel = true,
  saveButtonLabel = '작업 허용 수 저장',
  statusText,
  className,
  style,
  slotClassNames,
  headerExtraClassName,
  headerExtraControlsClassName,
  headerExtraTextClassName,
  primaryActionRowClassName,
  debugPanelClassName,
  defaultProjectLimit = 1,
  loadAvailability,
  onSaveCapacitySettings,
}: CalendarAdminProps = {}) {
  const initialMonth = getTodayMonth()
  const [selectedDateKeys, setSelectedDateKeys] = useState<Record<string, boolean>>({})
  const [availabilityMap, setAvailabilityMap] = useState<CalendarAdminAvailabilityMap>({})
  const [displayMonth, setDisplayMonth] = useState(initialMonth)
  const [draftProjectLimit, setDraftProjectLimit] = useState(String(defaultProjectLimit))
  const [savedProjectLimit, setSavedProjectLimit] = useState(defaultProjectLimit)
  const [isLimitWarningModalOpen, setIsLimitWarningModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refreshAvailability = useCallback(
    async (params: { year: number; month: number }) => {
      if (!loadAvailability) {
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const nextAvailability = await loadAvailability(params)
        setAvailabilityMap(nextAvailability)
      } catch (error) {
        console.error(error)
        setAvailabilityMap({})
        setErrorMessage('예약 현황을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [loadAvailability],
  )

  useEffect(() => {
    void refreshAvailability(displayMonth)
  }, [displayMonth, refreshAvailability])

  useEffect(() => {
    const selectedKeys = Object.keys(selectedDateKeys).filter((dateKey) => selectedDateKeys[dateKey])

    if (!selectedKeys.length) {
      setSavedProjectLimit(defaultProjectLimit)
      setDraftProjectLimit(String(defaultProjectLimit))
      return
    }

    const selectedCapacities = selectedKeys
      .map((dateKey) => availabilityMap[dateKey]?.maxCapacity)
      .filter((value): value is number => typeof value === 'number')

    const nextLimit = selectedCapacities[0] ?? defaultProjectLimit
    setSavedProjectLimit(nextLimit)
    setDraftProjectLimit(String(nextLimit))
  }, [availabilityMap, defaultProjectLimit, selectedDateKeys])

  const customCellMap = useMemo<Record<string, CellOverride>>(() => {
    const result: Record<string, CellOverride> = {}

    Object.entries(availabilityMap).forEach(([dateKey, availability]) => {
      if (availability.isUnavailable) {
        result[dateKey] = {
          status: 'unavailable',
          events: [{ label: '작업중', tone: 'white' }],
        }
      }
    })

    Object.entries(selectedDateKeys).forEach(([dateKey, isSelected]) => {
      if (!isSelected) {
        return
      }

      const availability = availabilityMap[dateKey]
      const detailLabel = availability?.isUnavailable
        ? '작업중'
        : availability && typeof availability.maxCapacity === 'number'
          ? `예약 ${availability.reservedCount}/${availability.maxCapacity}`
          : '선택됨'

      result[dateKey] = {
        status: availability?.isUnavailable ? 'unavailable' : 'selected',
        events: [{ label: detailLabel, tone: availability?.isUnavailable ? 'white' : 'blue' }],
      }
    })

    return result
  }, [availabilityMap, selectedDateKeys])

  const selectedDateCount = useMemo(
    () => Object.values(selectedDateKeys).filter(Boolean).length,
    [selectedDateKeys],
  )

  const selectedDateList = useMemo(
    () =>
      Object.entries(selectedDateKeys)
        .filter(([, isSelected]) => isSelected)
        .map(([dateKey]) => dateKey)
        .sort(),
    [selectedDateKeys],
  )

  const hasSelection = selectedDateCount > 0

  const handleSave = async () => {
    const parsed = Number(draftProjectLimit)
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)

    const exceedsExistingReservations = selectedDateList.some((dateKey) => {
      const reservedCount = availabilityMap[dateKey]?.reservedCount ?? 0
      return safeValue < reservedCount
    })

    if (exceedsExistingReservations) {
      setIsLimitWarningModalOpen(true)
      return
    }

    if (!onSaveCapacitySettings || !selectedDateList.length) {
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      await onSaveCapacitySettings({
        dateKeys: selectedDateList,
        maxCapacity: safeValue,
      })

      setSavedProjectLimit(safeValue)
      setSelectedDateKeys({})
      setToastMessage('작업 허용 수가 저장되었습니다.')
      setIsToastVisible(true)
      await refreshAvailability(displayMonth)
    } catch (error) {
      console.error(error)
      setErrorMessage('작업 허용 수 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Calendar
        title={title}
        description={description}
        customCellMap={customCellMap}
        legend={legend}
        showSelectedLegend={showSelectedLegend}
        showTopRow={showTopRow}
        className={className}
        style={style}
        slotClassNames={slotClassNames}
        onDisplayMonthChange={setDisplayMonth}
        headerExtra={(
          <div className={[styles.calendarAdminHeaderExtra, headerExtraClassName].filter(Boolean).join(' ')}>
            <div className={[styles.calendarAdminHeaderExtraControls, headerExtraControlsClassName].filter(Boolean).join(' ')}>
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
                placeholder='허용 수'
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
                disabled={!hasSelection || isSaving}
                onClick={() => void handleSave()}
              >
                저장
              </Button>
            </div>
            <span className={[styles.calendarAdminHeaderExtraText, headerExtraTextClassName].filter(Boolean).join(' ')}>
              {statusText ?? <>선택한 날짜의 작업 허용 수를 설정하세요. 현재 기준값: {savedProjectLimit}</>}
            </span>
          </div>
        )}
        onCellClick={({ dateKey, isWeekend, isHoliday }) => {
          if (isWeekend || isHoliday) {
            return
          }

          setSelectedDateKeys((prev) => ({
            ...prev,
            [dateKey]: !prev[dateKey],
          }))
        }}
      />

      <div className={[styles.calendarAdminPrimaryActionRow, primaryActionRowClassName].filter(Boolean).join(' ')}>
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
          disabled={!hasSelection || isSaving}
          onClick={() => void handleSave()}
        >
          {saveButtonLabel}
        </Button>
      </div>

      {showDebugPanel ? (
        <section className={[styles.calendarAdminPanel, debugPanelClassName].filter(Boolean).join(' ')}>
          <h3 className={styles.calendarAdminPanelTitle}>선택한 작업 허용 수</h3>
          <pre className={`${styles.calendarAdminPanelPre} ${styles.calendarAdminPanelPreWithGap}`}>
            {JSON.stringify({ savedProjectLimit, draftProjectLimit, selectedDateList }, null, 2)}
          </pre>
          <h3 className={styles.calendarAdminPanelTitle}>월별 예약 집계</h3>
          <pre className={styles.calendarAdminPanelPre}>
            {JSON.stringify(availabilityMap, null, 2)}
          </pre>
        </section>
      ) : null}

      <Modal
        isOpen={isLimitWarningModalOpen}
        title='저장 불가'
        confirmLabel='확인'
        cancelLabel='닫기'
        onConfirm={() => setIsLimitWarningModalOpen(false)}
        onClose={() => setIsLimitWarningModalOpen(false)}
      >
        이미 예약된 건수보다 작은 작업 허용 수는 저장할 수 없습니다.
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

      {errorMessage ? (
        <Toast
          visible
          title='오류'
          message={errorMessage}
          type='error'
          position='center'
          duration={2400}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

    </>
  )
}
