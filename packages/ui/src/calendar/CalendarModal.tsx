import { SelectBox } from '../selectBox/SelectBox'
import styles from './Calendar.module.scss'

type CalendarModalProps = {
  displayYear: number
  displayMonth: number
  yearOptions: Array<{ label: string; value: string }>
  onYearChange: (year: number) => void
  onMonthSelect: (month: number) => void
  monthModalRef: React.RefObject<HTMLElement | null>
}

export function CalendarModal({
  displayYear,
  displayMonth,
  yearOptions,
  onYearChange,
  onMonthSelect,
  monthModalRef,
}: CalendarModalProps) {
  return (
    <section className={styles.monthModal} aria-label='월 선택 모달' ref={monthModalRef}>
      <div className={styles.yearSelectRow}>
        <SelectBox
          value={String(displayYear)}
          options={yearOptions}
          width='100%'
          fontSize='13px'
          padding='6px 8px'
          round='6px'
          background='#ffffff'
          textColor='#121c2a'
          focusBorderColor='#0053db'
          onChange={(event) => onYearChange(Number(event.target.value))}
        />
      </div>
      {Array.from({ length: 12 }, (_, index) => index + 1).map((monthNumber) => (
        <button
          key={monthNumber}
          type='button'
          className={monthNumber === displayMonth ? styles.activeMonthButton : styles.monthButton}
          onClick={() => onMonthSelect(monthNumber)}
        >
          {monthNumber}월
        </button>
      ))}
    </section>
  )
}
