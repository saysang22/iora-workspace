'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiGoogle, SiKakaotalk, SiNaver } from 'react-icons/si'
import { supabase } from '../../lib/supabase'
import styles from './SignUpClient.module.scss'

type SignUpValues = {
  name: string
  email: string
  phone: string
  password: string
  passwordConfirm: string
  companyName: string
}

type SignUpField = keyof SignUpValues
type SignUpErrors = Partial<Record<SignUpField, string>>
type SocialProvider = 'kakao' | 'naver' | 'google'

const INITIAL_VALUES: SignUpValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  companyName: '',
}

const FIELD_ORDER: SignUpField[] = ['name', 'email', 'phone', 'password', 'passwordConfirm', 'companyName']

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

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

function isValidPhoneNumber(value: string) {
  return /^010-\d{4}-\d{4}$/.test(value)
}

function getErrors(values: SignUpValues) {
  const errors: SignUpErrors = {}

  if (!values.name.trim()) {
    errors.name = '이름을 입력해 주세요.'
  }

  if (!values.email.trim()) {
    errors.email = '이메일을 입력해 주세요.'
  } else if (!validateEmail(values.email.trim())) {
    errors.email = '올바른 이메일 형식을 입력해 주세요.'
  }

  if (!values.phone.trim()) {
    errors.phone = '휴대폰 번호를 입력해 주세요.'
  } else if (!isValidPhoneNumber(values.phone.trim())) {
    errors.phone = '010으로 시작하는 휴대폰 번호 형식을 입력해 주세요.'
  }

  if (!values.password.trim()) {
    errors.password = '비밀번호를 입력해 주세요.'
  } else if (values.password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다.'
  }

  if (!values.passwordConfirm.trim()) {
    errors.passwordConfirm = '비밀번호 확인을 입력해 주세요.'
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
  }

  if (!values.companyName.trim()) {
    errors.companyName = '기업명 또는 업체명을 입력해 주세요.'
  }

  return errors
}

function getFieldInputId(field: SignUpField) {
  return `signup-${field}`
}

export default function SignUpClient() {
  const router = useRouter()
  const [values, setValues] = useState<SignUpValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationErrors = useMemo(() => getErrors(values), [values])
  const isFormComplete = FIELD_ORDER.every((field) => values[field].trim().length > 0)
  const isFormValid = isFormComplete && Object.keys(validationErrors).length === 0

  const updateField = (field: SignUpField, nextValue: string) => {
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

  const focusFirstInvalidField = (nextErrors: SignUpErrors) => {
    const firstInvalidField = FIELD_ORDER.find((field) => Boolean(nextErrors[field]))

    if (!firstInvalidField) {
      return
    }

    window.requestAnimationFrame(() => {
      const target = document.getElementById(getFieldInputId(firstInvalidField)) as HTMLInputElement | null
      target?.focus()
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = getErrors(values)

    setErrors(nextErrors)
    setSubmitError('')
    setSuccessMessage('')

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}/home`,
          data: {
            full_name: values.name.trim(),
            phone_number: values.phone.trim(),
            company_name: values.companyName.trim(),
          },
        },
      })

      if (error) {
        setSubmitError(error.message)
        return
      }

      if (data.user && !data.session) {
        setSuccessMessage('이메일 인증 링크를 보냈습니다. 메일함을 확인해 주세요.')
        return
      }

      setSuccessMessage('회원가입이 완료되었습니다. 홈으로 이동합니다.')
      router.push('/home')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialSignUp = (provider: SocialProvider) => {
    const authPathByProvider: Record<SocialProvider, string> = {
      kakao: '/auth/kakao',
      naver: '/auth/naver',
      google: '/auth/google',
    }

    if (typeof window !== 'undefined') {
      window.location.href = authPathByProvider[provider]
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('name')}>
            이름
          </label>
          <input
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('name')}
            name='name'
            onChange={(event) => updateField('name', event.target.value)}
            placeholder='성함을 입력해 주세요'
            required
            type='text'
            value={values.name}
          />
          {errors.name ? <p className={styles.errorText}>{errors.name}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('email')}>
            이메일
          </label>
          <input
            autoComplete='email'
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('email')}
            name='email'
            onChange={(event) => updateField('email', event.target.value)}
            placeholder='you@example.com'
            required
            type='email'
            value={values.email}
          />
          {errors.email ? <p className={styles.errorText}>{errors.email}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('phone')}>
            휴대폰 번호
          </label>
          <input
            autoComplete='tel'
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('phone')}
            inputMode='numeric'
            maxLength={13}
            name='phone'
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder='010-0000-0000'
            required
            type='tel'
            value={values.phone}
          />
          {errors.phone ? <p className={styles.errorText}>{errors.phone}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('password')}>
            비밀번호
          </label>
          <input
            autoComplete='new-password'
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('password')}
            name='password'
            onChange={(event) => updateField('password', event.target.value)}
            placeholder='8자 이상 입력해 주세요'
            required
            type='password'
            value={values.password}
          />
          {errors.password ? <p className={styles.errorText}>{errors.password}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('passwordConfirm')}>
            비밀번호 확인
          </label>
          <input
            autoComplete='new-password'
            className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('passwordConfirm')}
            name='passwordConfirm'
            onChange={(event) => updateField('passwordConfirm', event.target.value)}
            placeholder='비밀번호를 다시 입력해 주세요'
            required
            type='password'
            value={values.passwordConfirm}
          />
          {errors.passwordConfirm ? <p className={styles.errorText}>{errors.passwordConfirm}</p> : null}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={getFieldInputId('companyName')}>
            기업명 or 업체명
          </label>
          <input
            className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`.trim()}
            id={getFieldInputId('companyName')}
            name='companyName'
            onChange={(event) => updateField('companyName', event.target.value)}
            placeholder='회사 또는 업체명을 입력해 주세요'
            required
            type='text'
            value={values.companyName}
          />
          {errors.companyName ? <p className={styles.errorText}>{errors.companyName}</p> : null}
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

        <button className={styles.submitButton} disabled={!isFormValid || isSubmitting} type='submit'>
          {isSubmitting ? '가입 처리 중...' : 'Sign up'}
        </button>

        <p className={styles.alternateAction}>
          <span>이미 계정이 있으신가요?</span> <Link href='/signin'>Sign in</Link>
        </p>
      </form>

      <div className={styles.dividerWrap} aria-hidden='true'>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>또는</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.socialSection} aria-label='소셜 회원가입'>
        <button className={`${styles.socialButton} ${styles.kakaoButton}`.trim()} type='button' onClick={() => handleSocialSignUp('kakao')}>
          <span className={styles.socialIcon} aria-hidden='true'>
            <SiKakaotalk size={14} />
          </span>
          <span>카카오톡으로 회원가입</span>
        </button>
        <button className={`${styles.socialButton} ${styles.naverButton}`.trim()} type='button' onClick={() => handleSocialSignUp('naver')}>
          <span className={styles.socialIcon} aria-hidden='true'>
            <SiNaver size={14} />
          </span>
          <span>네이버로 회원가입</span>
        </button>
        <button className={`${styles.socialButton} ${styles.googleButton}`.trim()} type='button' onClick={() => handleSocialSignUp('google')}>
          <span className={`${styles.socialIcon} ${styles.googleIcon}`.trim()} aria-hidden='true'>
            <SiGoogle size={14} />
          </span>
          <span>구글로 회원가입</span>
        </button>
      </div>
    </div>
  )
}
