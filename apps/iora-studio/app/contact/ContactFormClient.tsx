'use client'

import { Button, Input, SelectBox } from '@iora/ui'
import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createBrowserSupabaseClient } from '../../lib/supabase'
import DateAvailabilityModal from './DateAvailabilityModal'
import {
  BUDGET_OPTIONS,
  INITIAL_FORM_VALUES,
  SERVICE_OPTIONS,
  TONE_OPTIONS,
  formatPhoneNumber,
  type ContactFormValues,
  validateContactForm,
} from './contactForm.shared'
import styles from './ContactFormClient.module.scss'

type ContactFormField = keyof ContactFormValues
type ContactFormErrors = Partial<Record<ContactFormField, string>>
type DateFieldTarget = 'deadline' | 'zoomMeetingAt'

const FIELD_FOCUS_ORDER: ContactFormField[] = [
  'name',
  'email',
  'phone',
  'serviceType',
  'budgetRange',
  'deadline',
  'zoomMeetingAt',
  'referenceSite',
  'backgroundTone',
  'pointColor',
  'requestDetails',
]

type FieldLabelProps = {
  htmlFor: ContactFormField
  label: string
  required?: boolean
  onClick?: () => void
}

function FieldLabel({ htmlFor, label, required, onClick }: FieldLabelProps) {
  if (onClick) {
    return (
      <button className={styles.fieldLabelButton} type="button" onClick={onClick} aria-haspopup="dialog">
        <span className={styles.fieldLabel}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </span>
      </button>
    )
  }

  return (
    <label className={styles.fieldLabel} htmlFor={htmlFor}>
      {label}
      {required ? <span aria-hidden="true"> *</span> : null}
    </label>
  )
}

function getInputClassName(hasError: boolean) {
  return hasError ? `${styles.control} ${styles.controlError}` : styles.control
}

function formatCalendarFieldValue(field: DateFieldTarget, value: string) {
  if (!value) {
    return ''
  }

  if (field === 'deadline') {
    return value
  }

  const [datePart, timePart] = value.split('T')
  return timePart ? `${datePart} ${timePart.slice(0, 5)}` : datePart
}

type CalendarFieldTriggerProps = {
  id: DateFieldTarget
  target: DateFieldTarget
  value: string
  hasError: boolean
  placeholder: string
  describedBy?: string
  expanded: boolean
  onOpen: () => void
}

function CalendarFieldTrigger({
  id,
  target,
  value,
  hasError,
  placeholder,
  describedBy,
  expanded,
  onOpen,
}: CalendarFieldTriggerProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onOpen()
  }

  return (
    <div className={styles.calendarField}>
      <Input
        className={`${getInputClassName(hasError)} ${styles.calendarFieldInput}`}
        id={id}
        name={id}
        type="text"
        value={formatCalendarFieldValue(target, value)}
        readOnly
        inputMode="none"
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        background="#1d1d1d"
        textColor="#f3efe5"
        focusBorderColor="#c8f135"
        round="4px"
        padding="0 54px 0 18px"
        fontSize="17px"
        onClick={onOpen}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className={styles.calendarFieldIconButton}
        aria-label={`${target === 'deadline' ? '희망 마감일' : 'Zoom 미팅 희망 일시'} 예약 현황 열기`}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.calendarFieldIcon} aria-hidden="true" />
      </button>
    </div>
  )
}

async function submitContactForm(values: ContactFormValues) {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const { error } = await supabase.from('contact_requests').insert({
    user_id: user?.id ?? null,
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    service_type: values.serviceType,
    request_details: values.requestDetails.trim(),
    budget_range: values.budgetRange.trim() || null,
    reference_site: values.referenceSite.trim() || null,
    background_tone: values.backgroundTone.trim() || null,
    point_color: values.pointColor.trim() || null,
    desired_deadline: values.deadline,
    zoom_meeting_at: `${values.zoomMeetingAt}:00+09:00`,
  })

  if (error) {
    throw error
  }
}

export default function ContactFormClient() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_FORM_VALUES)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [calendarTarget, setCalendarTarget] = useState<DateFieldTarget | null>(null)

  const updateField = (field: ContactFormField, nextValue: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(nextValue) : nextValue,
    }))

    setErrors((prev) => {
      if (!prev[field]) {
        return prev
      }

      const nextErrors = { ...prev }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleChange =
    (field: ContactFormField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      updateField(field, event.target.value)
    }

  const focusFirstErrorField = (nextErrors: ContactFormErrors) => {
    const firstErrorField = FIELD_FOCUS_ORDER.find((field) => Boolean(nextErrors[field]))

    if (!firstErrorField) {
      return
    }

    window.requestAnimationFrame(() => {
      const target = document.getElementById(firstErrorField) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null

      target?.focus()

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (target.readOnly) {
          return
        }

        const end = target.value.length
        target.setSelectionRange(end, end)
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateContactForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitMessage({
        type: 'error',
        text: '입력값을 확인한 뒤 다시 제출해주세요.',
      })
      focusFirstErrorField(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      await submitContactForm(values)
      setValues(INITIAL_FORM_VALUES)
      setErrors({})
      setSubmitMessage({
        type: 'success',
        text: '상담 신청이 접수되었습니다. 영업일 기준 24시간 이내에 답변 드릴게요.',
      })
    } catch (error) {
      console.error(error)
      setSubmitMessage({
        type: 'error',
        text: '상담 신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="name" label="이름" required />
          <Input
            className={getInputClassName(Boolean(errors.name))}
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange('name')}
            placeholder="성함을 입력해주세요."
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.name ? (
            <p className={styles.errorText} id="name-error">
              {errors.name}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="email" label="이메일" required />
          <Input
            className={getInputClassName(Boolean(errors.email))}
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            placeholder="example@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.email ? (
            <p className={styles.errorText} id="email-error">
              {errors.email}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="phone" label="전화번호" required />
          <Input
            className={getInputClassName(Boolean(errors.phone))}
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={handleChange('phone')}
            placeholder="010-0000-0000"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.phone ? (
            <p className={styles.errorText} id="phone-error">
              {errors.phone}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="serviceType" label="서비스 종류" required />
          <SelectBox
            className={getInputClassName(Boolean(errors.serviceType))}
            id="serviceType"
            name="serviceType"
            value={values.serviceType}
            onChange={handleChange('serviceType')}
            aria-invalid={Boolean(errors.serviceType)}
            aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
            options={[{ label: '기업 홈페이지', value: '' }, ...SERVICE_OPTIONS]}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.serviceType ? (
            <p className={styles.errorText} id="serviceType-error">
              {errors.serviceType}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="budgetRange" label="예산 범위" />
          <SelectBox
            className={getInputClassName(Boolean(errors.budgetRange))}
            id="budgetRange"
            name="budgetRange"
            value={values.budgetRange}
            onChange={handleChange('budgetRange')}
            aria-invalid={Boolean(errors.budgetRange)}
            aria-describedby={errors.budgetRange ? 'budgetRange-error' : undefined}
            options={[{ label: '100-300만원', value: '' }, ...BUDGET_OPTIONS]}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.budgetRange ? (
            <p className={styles.errorText} id="budgetRange-error">
              {errors.budgetRange}
            </p>
          ) : null}
        </fieldset>

        <div className={styles.dateGrid}>
          <fieldset className={styles.fieldset}>
            <FieldLabel
              htmlFor="deadline"
              label="희망 마감일"
              required
              onClick={() => setCalendarTarget('deadline')}
            />
            <CalendarFieldTrigger
              id="deadline"
              target="deadline"
              value={values.deadline}
              hasError={Boolean(errors.deadline)}
              describedBy={errors.deadline ? 'deadline-error' : undefined}
              placeholder="연도-월-일"
              expanded={calendarTarget === 'deadline'}
              onOpen={() => setCalendarTarget('deadline')}
            />
            {errors.deadline ? (
              <p className={styles.errorText} id="deadline-error">
                {errors.deadline}
              </p>
            ) : null}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <FieldLabel
              htmlFor="zoomMeetingAt"
              label="Zoom 미팅 희망 일시"
              required
              onClick={() => setCalendarTarget('zoomMeetingAt')}
            />
            <CalendarFieldTrigger
              id="zoomMeetingAt"
              target="zoomMeetingAt"
              value={values.zoomMeetingAt}
              hasError={Boolean(errors.zoomMeetingAt)}
              describedBy={errors.zoomMeetingAt ? 'zoomMeetingAt-error' : undefined}
              placeholder="연도-월-일 --:--"
              expanded={calendarTarget === 'zoomMeetingAt'}
              onOpen={() => setCalendarTarget('zoomMeetingAt')}
            />
            {errors.zoomMeetingAt ? (
              <p className={styles.errorText} id="zoomMeetingAt-error">
                {errors.zoomMeetingAt}
              </p>
            ) : null}
          </fieldset>
        </div>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="referenceSite" label="참고 사이트" />
          <Input
            className={getInputClassName(Boolean(errors.referenceSite))}
            id="referenceSite"
            name="referenceSite"
            type="url"
            value={values.referenceSite}
            onChange={handleChange('referenceSite')}
            placeholder="참고하고 싶은 사이트 URL을 입력해주세요."
            aria-invalid={Boolean(errors.referenceSite)}
            aria-describedby={errors.referenceSite ? 'referenceSite-error' : undefined}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
          {errors.referenceSite ? (
            <p className={styles.errorText} id="referenceSite-error">
              {errors.referenceSite}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="backgroundTone" label="선호하는 배경 톤" />
          <SelectBox
            className={styles.control}
            id="backgroundTone"
            name="backgroundTone"
            value={values.backgroundTone}
            onChange={handleChange('backgroundTone')}
            options={[{ label: 'Dark (다크)', value: '' }, ...TONE_OPTIONS]}
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="pointColor" label="선호하는 포인트 색상" />
          <Input
            className={styles.control}
            id="pointColor"
            name="pointColor"
            value={values.pointColor}
            onChange={handleChange('pointColor')}
            placeholder="예: 일렉트릭 라임, 블루, 오렌지 등"
            background="#1d1d1d"
            textColor="#f3efe5"
            focusBorderColor="#c8f135"
            round="4px"
            padding="0 18px"
            fontSize="17px"
          />
        </fieldset>

        <fieldset className={styles.fieldset}>
          <FieldLabel htmlFor="requestDetails" label="요청 내용" required />
          <textarea
            className={getInputClassName(Boolean(errors.requestDetails))}
            id="requestDetails"
            name="requestDetails"
            value={values.requestDetails}
            onChange={handleChange('requestDetails')}
            placeholder="프로젝트의 목적과 필수 기능에 대해 설명해주세요."
            rows={7}
            aria-invalid={Boolean(errors.requestDetails)}
            aria-describedby={errors.requestDetails ? 'requestDetails-error' : undefined}
          />
          {errors.requestDetails ? (
            <p className={styles.errorText} id="requestDetails-error">
              {errors.requestDetails}
            </p>
          ) : null}
        </fieldset>

        {submitMessage ? (
          <p
            className={submitMessage.type === 'success' ? styles.inlineSuccess : styles.inlineError}
            role="status"
            aria-live="polite"
          >
            {submitMessage.text}
          </p>
        ) : null}

        <Button
          className={styles.submitButton}
          type="submit"
          disabled={isSubmitting}
          size="20px"
          background="#c8f135"
          textColor="#0d0d0d"
          borderColor="#c8f135"
          hoverBackground="#d8fb54"
          hoverTextColor="#0d0d0d"
          hoverBorderColor="#d8fb54"
          round="4px"
          padding="0 18px"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? '상담 신청 중...' : '상담 신청하기 ->'}
        </Button>

        <hr className={styles.divider} />

        <section className={styles.chatBlock} aria-label="실시간 채팅 문의">
          <p>또는 실시간 채팅으로 상담이 필요하신가요?</p>
          <a href="https://open.kakao.com/o/example" target="_blank" rel="noreferrer">
            카카오톡으로 빠르게 문의하기
            <span aria-hidden="true" />
          </a>
        </section>
      </form>

      <DateAvailabilityModal
        key={`${calendarTarget ?? 'closed'}-${calendarTarget ? values[calendarTarget] : ''}`}
        isOpen={calendarTarget !== null}
        field={calendarTarget ?? 'deadline'}
        value={calendarTarget ? values[calendarTarget] : ''}
        onClose={() => setCalendarTarget(null)}
        onApply={(nextValue) => {
          if (!calendarTarget) {
            return
          }

          updateField(calendarTarget, nextValue)
          setCalendarTarget(null)
        }}
      />
    </>
  )
}
