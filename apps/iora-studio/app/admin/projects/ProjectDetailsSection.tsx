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
  deadline: string
  depositAmount: string
  projectName: string
  startedAt: string
  totalAmount: string
  amountError: string | null
  onCareEndedAtClear: () => void
  onDeadlineClear: () => void
  onDatePickerOpen: (field: Exclude<DatePickerField, null>) => void
  onDepositAmountChange: (value: string) => void
  onProjectNameChange: (value: string) => void
  onTotalAmountChange: (value: string) => void
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

function ProjectDateField({
  field,
  label,
  value,
  visibleClearButton,
  onClear,
  onDatePickerOpen,
}: {
  field: Exclude<DatePickerField, null>
  label: string
  value: string
  visibleClearButton: boolean
  onClear?: () => void
  onDatePickerOpen: (field: Exclude<DatePickerField, null>) => void
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.dateField}>
        <Input
          {...INPUT_THEME}
          className={styles.dateInput}
          value={formatDisplayDate(value)}
          readOnly
          placeholder='날짜를 선택해 주세요'
          onClick={() => onDatePickerOpen(field)}
        />
        <Button
          {...SECONDARY_BUTTON_THEME}
          className={styles.dateButton}
          style={{ minHeight: '50px', width: '50px', padding: '0' }}
          onClick={() => onDatePickerOpen(field)}
          aria-label={`${label} 선택`}
        >
          <FiCalendar size={16} />
        </Button>
      </div>
      <DateFieldFooter
        buttonLabel='날짜 지우기'
        visible={visibleClearButton}
        onClick={onClear}
      />
    </label>
  )
}

export default function ProjectDetailsSection({
  careEndedAt,
  deadline,
  depositAmount,
  projectName,
  startedAt,
  totalAmount,
  amountError,
  onCareEndedAtClear,
  onDeadlineClear,
  onDatePickerOpen,
  onDepositAmountChange,
  onProjectNameChange,
  onTotalAmountChange,
}: ProjectDetailsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>프로젝트 정보</h2>
        <p className={styles.sectionDescription}>
          프로젝트 기본 정보와 일정, 계약 금액을 함께 등록합니다.
        </p>
      </div>

      <label className={`${styles.field} ${styles.fieldFull}`.trim()}>
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
        <ProjectDateField
          field='startedAt'
          label='시작일'
          value={startedAt}
          visibleClearButton={false}
          onDatePickerOpen={onDatePickerOpen}
        />
        <ProjectDateField
          field='deadline'
          label='프로젝트 마감일'
          value={deadline}
          visibleClearButton={Boolean(deadline)}
          onClear={onDeadlineClear}
          onDatePickerOpen={onDatePickerOpen}
        />
      </div>

      <div className={styles.dateFieldRow}>
        <ProjectDateField
          field='careEndedAt'
          label='유지보수 종료일'
          value={careEndedAt}
          visibleClearButton={Boolean(careEndedAt)}
          onClear={onCareEndedAtClear}
          onDatePickerOpen={onDatePickerOpen}
        />
        <div className={styles.fieldPlaceholder} aria-hidden='true' />
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>총 금액</span>
          <Input
            {...INPUT_THEME}
            className={styles.uiInput}
            inputMode='numeric'
            value={totalAmount}
            onChange={(event) => onTotalAmountChange(event.target.value)}
            placeholder='예: 3,000,000'
            aria-describedby={amountError ? 'project-amount-error' : undefined}
          />
        </label>

        <label className={styles.field}>
          <span>계약금</span>
          <Input
            {...INPUT_THEME}
            className={styles.uiInput}
            inputMode='numeric'
            value={depositAmount}
            onChange={(event) => onDepositAmountChange(event.target.value)}
            placeholder='예: 1,000,000'
            aria-describedby={amountError ? 'project-amount-error' : undefined}
          />
        </label>
      </div>

      {amountError ? (
        <p id='project-amount-error' className={styles.fieldError}>
          {amountError}
        </p>
      ) : null}
    </section>
  )
}
