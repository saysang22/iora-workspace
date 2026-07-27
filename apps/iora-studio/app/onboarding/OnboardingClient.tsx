'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import styles from './OnboardingClient.module.scss'

type OnboardingValues = {
  companyName: string
  managerName: string
  phone: string
  websiteUrl: string
}

type OnboardingErrors = Partial<Record<keyof OnboardingValues, string>>

type OnboardingClientProps = {
  initialValues: OnboardingValues
}

const phonePattern = /^(0\d{1,2}-?\d{3,4}-?\d{4})$/

const onboardingSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, '업체명은 2자 이상 입력해 주세요.')
    .max(100, '업체명은 100자 이하로 입력해 주세요.'),
  managerName: z.string().trim().max(100, '담당자명은 100자 이하로 입력해 주세요.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || phonePattern.test(value), {
      message: '연락처 형식을 확인해 주세요.',
    }),
  websiteUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) {
        return true
      }

      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, '홈페이지 주소 형식을 확인해 주세요.'),
})

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function formatPhoneNumber(value: string) {
  const digits = normalizePhoneNumber(value)

  if (digits.length < 4) {
    return digits
  }

  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export default function OnboardingClient({
  initialValues,
}: OnboardingClientProps) {
  const router = useRouter()
  const [values, setValues] = useState<OnboardingValues>(initialValues)
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCompanyNameFilled = useMemo(
    () => values.companyName.trim().length >= 2,
    [values.companyName],
  )

  const updateField = (field: keyof OnboardingValues, nextValue: string) => {
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

  const validate = () => {
    const parsed = onboardingSchema.safeParse(values)

    if (parsed.success) {
      return {
        data: parsed.data,
        errors: {} satisfies OnboardingErrors,
      }
    }

    const nextErrors: OnboardingErrors = {}

    for (const issue of parsed.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof OnboardingValues] = issue.message
      }
    }

    return {
      data: null,
      errors: nextErrors,
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const { data: validatedData, errors: validationErrors } = validate()

    setErrors(validationErrors)
    setSubmitError('')
    setSuccessMessage('')

    if (!validatedData) {
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setSubmitError('세션이 만료되었습니다. 다시 로그인해 주세요.')
        router.replace('/signin?next=%2Fonboarding')
        router.refresh()
        return
      }

      const profilePayload = {
        id: user.id,
        email: user.email ?? null,
        company_name: validatedData.companyName,
        full_name: normalizeOptionalText(validatedData.managerName),
        phone_number: normalizeOptionalText(validatedData.phone),
        website_url: normalizeOptionalText(validatedData.websiteUrl),
        onboarding_completed: true,
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })

      if (profileError) {
        setSubmitError('업체 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          company_name: profilePayload.company_name,
          full_name: profilePayload.full_name,
          phone_number: profilePayload.phone_number,
          website_url: profilePayload.website_url,
        },
      })

      if (authUpdateError) {
        setSubmitError('프로필 동기화 중 문제가 발생했습니다. 다시 시도해 주세요.')
        return
      }

      setSuccessMessage('업체 정보가 저장되었습니다. 홈으로 이동합니다.')
      router.replace('/home')
      router.refresh()
    } catch {
      setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`.trim()}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor='onboarding-company-name'>
              업체명
            </label>
            <span className={styles.required}>필수</span>
          </div>
          <input
            id='onboarding-company-name'
            className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`.trim()}
            maxLength={100}
            onChange={(event) => updateField('companyName', event.target.value)}
            placeholder='예: IORA STUDIO'
            required
            type='text'
            value={values.companyName}
          />
          {errors.companyName ? (
            <p className={styles.errorText}>{errors.companyName}</p>
          ) : (
            <p className={styles.hint}>회사명 또는 브랜드명을 입력해 주세요.</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor='onboarding-manager-name'>
            담당자명
          </label>
          <input
            id='onboarding-manager-name'
            className={`${styles.input} ${errors.managerName ? styles.inputError : ''}`.trim()}
            maxLength={100}
            onChange={(event) => updateField('managerName', event.target.value)}
            placeholder='예: 김민서'
            type='text'
            value={values.managerName}
          />
          {errors.managerName ? <p className={styles.errorText}>{errors.managerName}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor='onboarding-phone'>
            연락처
          </label>
          <input
            id='onboarding-phone'
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`.trim()}
            inputMode='numeric'
            maxLength={13}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder='010-0000-0000'
            type='tel'
            value={values.phone}
          />
          {errors.phone ? <p className={styles.errorText}>{errors.phone}</p> : null}
        </div>

        <div className={`${styles.fieldGroup} ${styles.fieldFull}`.trim()}>
          <label className={styles.label} htmlFor='onboarding-website-url'>
            홈페이지 주소
          </label>
          <input
            id='onboarding-website-url'
            className={`${styles.input} ${errors.websiteUrl ? styles.inputError : ''}`.trim()}
            onChange={(event) => updateField('websiteUrl', event.target.value)}
            placeholder='https://example.com'
            type='url'
            value={values.websiteUrl}
          />
          {errors.websiteUrl ? <p className={styles.errorText}>{errors.websiteUrl}</p> : null}
        </div>
      </div>

      {submitError ? (
        <p aria-live='polite' className={styles.submitError}>
          {submitError}
        </p>
      ) : null}

      {successMessage ? (
        <p aria-live='polite' className={styles.successMessage}>
          {successMessage}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          disabled={!isCompanyNameFilled || isSubmitting}
          type='submit'
        >
          {isSubmitting ? '저장 중...' : '시작하기'}
        </button>
      </div>
    </form>
  )
}
