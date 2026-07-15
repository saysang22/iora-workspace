'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheck, FiEdit3, FiLock, FiX } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import styles from './ProfileEditClient.module.scss'

type ProfileValues = {
  name: string
  email: string
  phone: string
  password: string
  passwordConfirm: string
  companyName: string
}

type EditableField = 'name' | 'email' | 'phone' | 'password' | 'companyName'
type ProfileErrors = Partial<Record<keyof ProfileValues, string>>

const INITIAL_VALUES: ProfileValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  companyName: '',
}

function isValidEmail(value: string) {
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

function getInputId(field: keyof ProfileValues) {
  return `profile-${field}`
}

export default function ProfileEditClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState<ProfileValues>(INITIAL_VALUES)
  const [originalValues, setOriginalValues] = useState<ProfileValues>(INITIAL_VALUES)
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const inputRefs = useRef<Partial<Record<keyof ProfileValues, HTMLInputElement | null>>>({})
  const currentPasswordInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user

      if (!isMounted) {
        return
      }

      if (!sessionUser) {
        router.push('/signin')
        return
      }

      const nextValues: ProfileValues = {
        name: typeof sessionUser.user_metadata?.full_name === 'string' ? sessionUser.user_metadata.full_name : '',
        email: sessionUser.email ?? '',
        phone:
          typeof sessionUser.user_metadata?.phone_number === 'string'
            ? formatPhoneNumber(sessionUser.user_metadata.phone_number)
            : '',
        password: '',
        passwordConfirm: '',
        companyName:
          typeof sessionUser.user_metadata?.company_name === 'string' ? sessionUser.user_metadata.company_name : '',
      }

      setValues(nextValues)
      setOriginalValues(nextValues)
      setIsLoading(false)
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [router])

  useEffect(() => {
    if (!editingField) {
      return
    }

    const targetField = editingField === 'password' ? 'password' : editingField
    const target = inputRefs.current[targetField]

    window.requestAnimationFrame(() => {
      target?.focus()
    })
  }, [editingField])

  useEffect(() => {
    if (!isPasswordConfirmOpen) {
      return
    }

    window.requestAnimationFrame(() => {
      currentPasswordInputRef.current?.focus()
    })
  }, [isPasswordConfirmOpen])

  const updateField = (field: keyof ProfileValues, nextValue: string) => {
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

  const handleEdit = (field: EditableField) => {
    setSubmitMessage(null)
    setErrors({})

    if (field === 'password') {
      setCurrentPassword('')
      setCurrentPasswordError('')
      setIsPasswordConfirmOpen(true)
      setEditingField(null)
      return
    }

    setIsPasswordConfirmOpen(false)
    setEditingField(field)
  }

  const handleCancel = (field: EditableField) => {
    if (field === 'password') {
      setValues((prev) => ({
        ...prev,
        password: '',
        passwordConfirm: '',
      }))
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors.password
        delete nextErrors.passwordConfirm
        return nextErrors
      })
    } else {
      setValues((prev) => ({
        ...prev,
        [field]: originalValues[field],
      }))
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[field]
        return nextErrors
      })
    }

    setSubmitMessage(null)
    setEditingField(null)
  }

  const handlePasswordConfirmCancel = () => {
    setCurrentPassword('')
    setCurrentPasswordError('')
    setIsPasswordConfirmOpen(false)
    setEditingField(null)
  }

  const handleCurrentPasswordConfirm = async () => {
    if (!currentPassword.trim()) {
      setCurrentPasswordError('현재 비밀번호를 입력해 주세요.')
      currentPasswordInputRef.current?.focus()
      return
    }

    setIsVerifyingPassword(true)
    setCurrentPasswordError('')
    setSubmitMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: originalValues.email,
        password: currentPassword,
      })

      if (error) {
        setCurrentPasswordError('현재 비밀번호가 일치하지 않습니다.')
        return
      }

      setCurrentPassword('')
      setCurrentPasswordError('')
      setIsPasswordConfirmOpen(false)
      setEditingField('password')
    } finally {
      setIsVerifyingPassword(false)
    }
  }

  const saveField = async (field: EditableField) => {
    setSubmitMessage(null)

    if (field === 'name') {
      if (!values.name.trim()) {
        setErrors({ name: '이름을 입력해 주세요.' })
        inputRefs.current.name?.focus()
        return
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: values.name.trim(),
          phone_number: originalValues.phone,
          company_name: originalValues.companyName,
        },
      })

      if (error) {
        setSubmitMessage({ type: 'error', text: error.message })
        return
      }

      setOriginalValues((prev) => ({ ...prev, name: values.name.trim() }))
      setValues((prev) => ({ ...prev, name: values.name.trim() }))
      setEditingField(null)
      setSubmitMessage({ type: 'success', text: '이름이 저장되었습니다.' })
      return
    }

    if (field === 'email') {
      if (!values.email.trim()) {
        setErrors({ email: '이메일을 입력해 주세요.' })
        inputRefs.current.email?.focus()
        return
      }

      if (!isValidEmail(values.email.trim())) {
        setErrors({ email: '올바른 이메일 형식으로 입력해 주세요.' })
        inputRefs.current.email?.focus()
        return
      }

      const { error } = await supabase.auth.updateUser({
        email: values.email.trim(),
      })

      if (error) {
        setSubmitMessage({ type: 'error', text: error.message })
        return
      }

      setOriginalValues((prev) => ({ ...prev, email: values.email.trim() }))
      setValues((prev) => ({ ...prev, email: values.email.trim() }))
      setEditingField(null)
      setSubmitMessage({ type: 'success', text: '이메일 변경 요청이 저장되었습니다. 인증 메일을 확인해 주세요.' })
      return
    }

    if (field === 'phone') {
      if (!values.phone.trim()) {
        setErrors({ phone: '휴대폰 번호를 입력해 주세요.' })
        inputRefs.current.phone?.focus()
        return
      }

      if (!isValidPhoneNumber(values.phone.trim())) {
        setErrors({ phone: '010으로 시작하는 휴대폰 번호 형식으로 입력해 주세요.' })
        inputRefs.current.phone?.focus()
        return
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: originalValues.name,
          phone_number: values.phone.trim(),
          company_name: originalValues.companyName,
        },
      })

      if (error) {
        setSubmitMessage({ type: 'error', text: error.message })
        return
      }

      setOriginalValues((prev) => ({ ...prev, phone: values.phone.trim() }))
      setValues((prev) => ({ ...prev, phone: values.phone.trim() }))
      setEditingField(null)
      setSubmitMessage({ type: 'success', text: '휴대폰 번호가 저장되었습니다.' })
      return
    }

    if (field === 'companyName') {
      if (!values.companyName.trim()) {
        setErrors({ companyName: '기업명 또는 업체명을 입력해 주세요.' })
        inputRefs.current.companyName?.focus()
        return
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: originalValues.name,
          phone_number: originalValues.phone,
          company_name: values.companyName.trim(),
        },
      })

      if (error) {
        setSubmitMessage({ type: 'error', text: error.message })
        return
      }

      setOriginalValues((prev) => ({ ...prev, companyName: values.companyName.trim() }))
      setValues((prev) => ({ ...prev, companyName: values.companyName.trim() }))
      setEditingField(null)
      setSubmitMessage({ type: 'success', text: '기업명 또는 업체명이 저장되었습니다.' })
      return
    }

    if (!values.password.trim()) {
      setErrors({ password: '변경할 비밀번호를 입력해 주세요.' })
      inputRefs.current.password?.focus()
      return
    }

    if (values.password.length < 8) {
      setErrors({ password: '비밀번호는 8자 이상이어야 합니다.' })
      inputRefs.current.password?.focus()
      return
    }

    if (!values.passwordConfirm.trim()) {
      setErrors({ passwordConfirm: '변경된 비밀번호 확인을 입력해 주세요.' })
      inputRefs.current.passwordConfirm?.focus()
      return
    }

    if (values.password !== values.passwordConfirm) {
      setErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다.' })
      inputRefs.current.passwordConfirm?.focus()
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      setSubmitMessage({ type: 'error', text: error.message })
      return
    }

    setValues((prev) => ({
      ...prev,
      password: '',
      passwordConfirm: '',
    }))
    setOriginalValues((prev) => ({
      ...prev,
      password: '',
      passwordConfirm: '',
    }))
    setEditingField(null)
    setSubmitMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
  }

  const isFieldEditing = (field: EditableField) => editingField === field
  const isPasswordEditing = editingField === 'password'
  const hasPasswordValues = values.password.trim().length > 0 && values.passwordConfirm.trim().length > 0
  const isPasswordMatch = values.password === values.passwordConfirm
  const isPasswordSaveDisabled = values.password !== values.passwordConfirm

  if (isLoading) {
    return <p className={styles.loading}>프로필 정보를 불러오는 중...</p>
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.form}>
        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor={getInputId('name')}>
            이름
          </label>
          <div className={styles.inputWrap}>
            <input
              ref={(node) => {
                inputRefs.current.name = node
              }}
              className={`${styles.input} ${!isFieldEditing('name') ? styles.inputDisabled : ''}`.trim()}
              disabled={!isFieldEditing('name')}
              id={getInputId('name')}
              type='text'
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            <div className={styles.actionGroup}>
              {isFieldEditing('name') ? (
                <>
                  <button className={styles.iconButton} type='button' onClick={() => void saveField('name')}>
                    <FiCheck size={15} />
                    <span>저장</span>
                  </button>
                  <button className={styles.iconButtonSecondary} type='button' onClick={() => handleCancel('name')}>
                    <FiX size={15} />
                    <span>취소</span>
                  </button>
                </>
              ) : (
                <button className={styles.iconButton} type='button' onClick={() => handleEdit('name')}>
                  <FiEdit3 size={15} />
                  <span>수정</span>
                </button>
              )}
            </div>
          </div>
          {errors.name ? <p className={styles.errorText}>{errors.name}</p> : null}
        </div>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor={getInputId('email')}>
            이메일
          </label>
          <div className={styles.inputWrap}>
            <input
              ref={(node) => {
                inputRefs.current.email = node
              }}
              className={`${styles.input} ${!isFieldEditing('email') ? styles.inputDisabled : ''}`.trim()}
              disabled={!isFieldEditing('email')}
              id={getInputId('email')}
              type='email'
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
            <div className={styles.actionGroup}>
              {isFieldEditing('email') ? (
                <>
                  <button className={styles.iconButton} type='button' onClick={() => void saveField('email')}>
                    <FiCheck size={15} />
                    <span>저장</span>
                  </button>
                  <button className={styles.iconButtonSecondary} type='button' onClick={() => handleCancel('email')}>
                    <FiX size={15} />
                    <span>취소</span>
                  </button>
                </>
              ) : (
                <button className={styles.iconButton} type='button' onClick={() => handleEdit('email')}>
                  <FiEdit3 size={15} />
                  <span>수정</span>
                </button>
              )}
            </div>
          </div>
          {errors.email ? <p className={styles.errorText}>{errors.email}</p> : null}
        </div>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor={getInputId('phone')}>
            휴대폰 번호
          </label>
          <div className={styles.inputWrap}>
            <input
              ref={(node) => {
                inputRefs.current.phone = node
              }}
              className={`${styles.input} ${!isFieldEditing('phone') ? styles.inputDisabled : ''}`.trim()}
              disabled={!isFieldEditing('phone')}
              id={getInputId('phone')}
              inputMode='numeric'
              maxLength={13}
              type='tel'
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
            <div className={styles.actionGroup}>
              {isFieldEditing('phone') ? (
                <>
                  <button className={styles.iconButton} type='button' onClick={() => void saveField('phone')}>
                    <FiCheck size={15} />
                    <span>저장</span>
                  </button>
                  <button className={styles.iconButtonSecondary} type='button' onClick={() => handleCancel('phone')}>
                    <FiX size={15} />
                    <span>취소</span>
                  </button>
                </>
              ) : (
                <button className={styles.iconButton} type='button' onClick={() => handleEdit('phone')}>
                  <FiEdit3 size={15} />
                  <span>수정</span>
                </button>
              )}
            </div>
          </div>
          {errors.phone ? <p className={styles.errorText}>{errors.phone}</p> : null}
        </div>

        <div className={styles.passwordSection}>
          {isPasswordConfirmOpen ? (
            <div className={styles.passwordConfirmCard}>
              <p className={styles.passwordConfirmTitle}>현재 비밀번호 확인</p>
              <p className={styles.passwordConfirmDescription}>
                비밀번호를 변경하기 전에 현재 비밀번호를 먼저 확인해 주세요.
              </p>
              <div className={styles.passwordConfirmRow}>
                <input
                  ref={currentPasswordInputRef}
                  autoComplete='current-password'
                  className={styles.input}
                  placeholder='현재 비밀번호를 입력해 주세요.'
                  type='password'
                  value={currentPassword}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') {
                      return
                    }

                    event.preventDefault()

                    if (isVerifyingPassword) {
                      return
                    }

                    void handleCurrentPasswordConfirm()
                  }}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <div className={styles.passwordConfirmActions}>
                  <button
                    className={styles.iconButton}
                    disabled={isVerifyingPassword}
                    type='button'
                    onClick={() => void handleCurrentPasswordConfirm()}
                  >
                    <FiCheck size={15} />
                    <span>{isVerifyingPassword ? '확인 중' : '확인'}</span>
                  </button>
                  <button
                    className={styles.iconButtonSecondary}
                    disabled={isVerifyingPassword}
                    type='button'
                    onClick={handlePasswordConfirmCancel}
                  >
                    <FiX size={15} />
                    <span>취소</span>
                  </button>
                </div>
              </div>
              {currentPasswordError ? <p className={styles.errorText}>{currentPasswordError}</p> : null}
            </div>
          ) : null}

          <div className={styles.fieldBlock}>
            <label className={styles.label} htmlFor={getInputId('password')}>
              비밀번호 변경
            </label>
            <div className={styles.inputWrap}>
              <input
                ref={(node) => {
                  inputRefs.current.password = node
                }}
                autoComplete='new-password'
                className={`${styles.input} ${!isPasswordEditing ? styles.inputDisabled : ''}`.trim()}
                disabled={!isPasswordEditing}
                id={getInputId('password')}
                placeholder='새 비밀번호를 입력해 주세요.'
                type='password'
                value={values.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
              <div className={styles.actionGroup}>
                {isPasswordEditing ? null : (
                  <button className={styles.iconButton} type='button' onClick={() => handleEdit('password')}>
                    <FiLock size={15} />
                    <span>수정</span>
                  </button>
                )}
              </div>
            </div>
            {errors.password ? <p className={styles.errorText}>{errors.password}</p> : null}
          </div>

          <div className={styles.fieldBlock}>
            <label className={styles.label} htmlFor={getInputId('passwordConfirm')}>
              변경된 비밀번호 확인
            </label>
            <div className={styles.inputWrap}>
              <input
                ref={(node) => {
                  inputRefs.current.passwordConfirm = node
                }}
                autoComplete='new-password'
                className={`${styles.input} ${!isPasswordEditing ? styles.inputDisabled : ''}`.trim()}
                disabled={!isPasswordEditing}
                id={getInputId('passwordConfirm')}
                placeholder='변경한 비밀번호를 다시 입력해 주세요.'
                type='password'
                value={values.passwordConfirm}
                onChange={(event) => updateField('passwordConfirm', event.target.value)}
              />
            </div>
            {hasPasswordValues ? (
              <p
                aria-live='polite'
                className={isPasswordMatch ? styles.passwordMatchText : styles.passwordMismatchText}
              >
                {isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </p>
            ) : null}
            {errors.passwordConfirm ? <p className={styles.errorText}>{errors.passwordConfirm}</p> : null}
          </div>

          {isPasswordEditing ? (
            <div className={styles.passwordActions}>
              <button
                className={styles.iconButton}
                disabled={isPasswordSaveDisabled}
                type='button'
                onClick={() => void saveField('password')}
              >
                <FiCheck size={15} />
                <span>저장</span>
              </button>
              <button className={styles.iconButtonSecondary} type='button' onClick={() => handleCancel('password')}>
                <FiX size={15} />
                <span>취소</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor={getInputId('companyName')}>
            기업명 or 업체명
          </label>
          <div className={styles.inputWrap}>
            <input
              ref={(node) => {
                inputRefs.current.companyName = node
              }}
              className={`${styles.input} ${!isFieldEditing('companyName') ? styles.inputDisabled : ''}`.trim()}
              disabled={!isFieldEditing('companyName')}
              id={getInputId('companyName')}
              type='text'
              value={values.companyName}
              onChange={(event) => updateField('companyName', event.target.value)}
            />
            <div className={styles.actionGroup}>
              {isFieldEditing('companyName') ? (
                <>
                  <button className={styles.iconButton} type='button' onClick={() => void saveField('companyName')}>
                    <FiCheck size={15} />
                    <span>저장</span>
                  </button>
                  <button className={styles.iconButtonSecondary} type='button' onClick={() => handleCancel('companyName')}>
                    <FiX size={15} />
                    <span>취소</span>
                  </button>
                </>
              ) : (
                <button className={styles.iconButton} type='button' onClick={() => handleEdit('companyName')}>
                  <FiEdit3 size={15} />
                  <span>수정</span>
                </button>
              )}
            </div>
          </div>
          {errors.companyName ? <p className={styles.errorText}>{errors.companyName}</p> : null}
        </div>

        {submitMessage ? (
          <p className={submitMessage.type === 'success' ? styles.successMessage : styles.errorBanner} role='status' aria-live='polite'>
            {submitMessage.text}
          </p>
        ) : null}
      </div>
    </div>
  )
}
