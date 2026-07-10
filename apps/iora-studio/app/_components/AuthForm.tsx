'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import styles from './AuthForm.module.scss'

type AuthMode = 'signin' | 'signup'

type AuthFormProps = {
  mode: AuthMode
}

const AUTH_COPY = {
  signin: {
    title: 'Sign in',
    submitLabel: '로그인',
    loadingLabel: '로그인 중...',
    alternatePrompt: '아직 계정이 없으신가요?',
    alternateHref: '/signup',
    alternateLabel: 'Sign up',
  },
  signup: {
    title: 'Sign up',
    submitLabel: '회원가입',
    loadingLabel: '가입 중...',
    alternatePrompt: '이미 계정이 있으신가요?',
    alternateHref: '/signin',
    alternateLabel: 'Sign in',
  },
} as const

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const copy = AUTH_COPY[mode]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMessage(error.message)
          return
        }

        router.push('/home')
        router.refresh()
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}/home`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
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
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={`${mode}-email`}>
          이메일
        </label>
        <input
          autoComplete='email'
          className={styles.input}
          id={`${mode}-email`}
          onChange={(event) => setEmail(event.target.value)}
          placeholder='you@example.com'
          required
          type='email'
          value={email}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor={`${mode}-password`}>
          비밀번호
        </label>
        <input
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          className={styles.input}
          id={`${mode}-password`}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder='8자 이상 입력해 주세요'
          required
          type='password'
          value={password}
        />
      </div>

      {errorMessage ? (
        <p aria-live='polite' className={styles.errorMessage}>
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p aria-live='polite' className={styles.successMessage}>
          {successMessage}
        </p>
      ) : null}

      <button className={styles.submitButton} disabled={isLoading} type='submit'>
        {isLoading ? copy.loadingLabel : copy.submitLabel}
      </button>

      <p className={styles.alternateAction}>
        <span>{copy.alternatePrompt}</span>{' '}
        <Link href={copy.alternateHref}>{copy.alternateLabel}</Link>
      </p>
    </form>
  )
}
