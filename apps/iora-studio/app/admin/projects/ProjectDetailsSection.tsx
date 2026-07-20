import { Button, Input } from '@iora/ui'
import { FiCalendar } from 'react-icons/fi'
import {
  DatePickerField,
  formatDisplayDate,
  INPUT_THEME,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './AdminProjectCreateModal.module.scss'

type ProjectDetailsSectionProps = {
  careEndedAt: string
  projectName: string
  startedAt: string
  onCareEndedAtClear: () => void
  onDatePickerOpen: (field: Exclude<DatePickerField, null>) => void
  onProjectNameChange: (value: string) => void
}

function DateFieldFooter({
  buttonLabel,
  visible,
  onClick,
}: {
  buttonLabel: string
  visible: boolean
  onClick?: () => void
}) {
  return (
    <div className={styles.dateFieldFooter}>
      {visible ? (
        <Button
          {...SECONDARY_BUTTON_THEME}
          className={styles.clearDateButton}
          style={{ minHeight: '38px', width: '112px' }}
          onClick={onClick}
        >
          {buttonLabel}
        </Button>
      ) : (
        <span className={styles.dateFieldSpacer} aria-hidden />
      )}
    </div>
  )
}

export default function ProjectDetailsSection({
  careEndedAt,
  projectName,
  startedAt,
  onCareEndedAtClear,
  onDatePickerOpen,
  onProjectNameChange,
}: ProjectDetailsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>프로젝트 정보</h2>
        <p className={styles.sectionDescription}>프로젝트 기본 정보와 일정만 간단히 등록합니다.</p>
      </div>

      <label className={styles.field}>
        <span>프로젝트명</span>
        <Input
          {...INPUT_THEME}
          className={styles.uiInput}
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
          placeholder='예: 이오라 브랜드 사이트 구축'
        />
      </label>

      <div className={styles.dateFieldRow}>
        <label className={styles.field}>
          <span>시작일</span>
          <div className={styles.dateField}>
            <Input
              {...INPUT_THEME}
              className={styles.dateInput}
              value={formatDisplayDate(startedAt)}
              readOnly
              placeholder='날짜를 선택해 주세요'
              onClick={() => onDatePickerOpen('startedAt')}
            />
            <Button
              {...SECONDARY_BUTTON_THEME}
              className={styles.dateButton}
              style={{ minHeight: '50px', width: '50px', padding: '0' }}
              onClick={() => onDatePickerOpen('startedAt')}
              aria-label='시작일 선택'
            >
              <FiCalendar size={16} />
            </Button>
          </div>
          <DateFieldFooter buttonLabel='날짜 지우기' visible={false} />
        </label>

        <label className={styles.field}>
          <span>유지보수 종료일</span>
          <div className={styles.dateField}>
            <Input
              {...INPUT_THEME}
              className={styles.dateInput}
              value={formatDisplayDate(careEndedAt)}
              readOnly
              placeholder='날짜를 선택해 주세요'
              onClick={() => onDatePickerOpen('careEndedAt')}
            />
            <Button
              {...SECONDARY_BUTTON_THEME}
              className={styles.dateButton}
              style={{ minHeight: '50px', width: '50px', padding: '0' }}
              onClick={() => onDatePickerOpen('careEndedAt')}
              aria-label='유지보수 종료일 선택'
            >
              <FiCalendar size={16} />
            </Button>
          </div>
          <DateFieldFooter
            buttonLabel='날짜 지우기'
            visible={Boolean(careEndedAt)}
            onClick={onCareEndedAtClear}
          />
        </label>
      </div>
    </section>
  )
}
