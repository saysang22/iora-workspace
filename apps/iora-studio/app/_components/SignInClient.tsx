'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Login } from '@iora/ui'
import { supabase } from '../../lib/supabase'

type LoginSubmitValues = {
  email: string
  password: string
  remember: boolean
}

type SocialProvider = 'google' | 'kakao' | 'naver'

type SignInClientProps = {
  nextPath?: string | null
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid_credentials')
  ) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }

  if (normalized.includes('email rate limit exceeded') || normalized.includes('too many requests')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (normalized.includes('user not found')) {
    return '등록되지 않은 계정입니다.'
  }

  if (normalized.includes('network')) {
    return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}

function isProfileIncomplete(user: { user_metadata?: { phone_number?: unknown; company_name?: unknown } } | null) {
  if (!user) {
    return false
  }

  const phoneNumber = typeof user.user_metadata?.phone_number === 'string' ? user.user_metadata.phone_number.trim() : ''
  const companyName = typeof user.user_metadata?.company_name === 'string' ? user.user_metadata.company_name.trim() : ''

  return !phoneNumber || !companyName
}

function getRedirectPath(user: { user_metadata?: { phone_number?: unknown; company_name?: unknown } } | null) {
  return isProfileIncomplete(user) ? '/profile?setup=1' : '/home'
}

export default function SignInClient({ nextPath = null }: SignInClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const syncSignedInUser = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null

      if (!isMounted || !sessionUser) {
        return
      }

      router.replace(getRedirectPath(sessionUser))
      router.refresh()
    }

    void syncSignedInUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        return
      }

      router.replace(getRedirectPath(sessionUser))
      router.refresh()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async ({ email, password }: LoginSubmitValues) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(getAuthErrorMessage(error.message))
        return
      }

      router.push(nextPath || getRedirectPath(data.user ?? data.session?.user ?? null))
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setErrorMessage('')

    if (provider === 'naver') {
      // TODO: Supabase does not provide Naver as a built-in provider.
      // Replace this branch with Custom OAuth / OIDC or an Edge Function flow later.
      setErrorMessage('네이버 로그인은 현재 준비 중입니다. 추후 Custom OAuth 연동으로 연결될 예정입니다.')
      return false
    }

    const redirectTo = typeof window === 'undefined' ? undefined : `${window.location.origin}/signin`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      setErrorMessage(getAuthErrorMessage(error.message))
      return false
    }

    if (data.url && typeof window !== 'undefined') {
      window.location.assign(data.url)
      return false
    }

    return true
  }

  return (
    <Login
      title=''
      submitLabel='로그인'
      loading={isLoading}
      errorMessage={errorMessage}
      formBackground='#111111'
      formBorderColor='transparent'
      labelColor='#f5f1ed'
      rememberTextColor='#c5c0bc'
      socialTitleColor='#c5c0bc'
      helperLinkColor='#c8f135'
      buttonBackground='#c8f135'
      buttonTextColor='#0d0d0d'
      buttonHoverBackground='#b7de2f'
      inputBackground='#1a1a1a'
      inputTextColor='#f5f1ed'
      inputFocusBorderColor='#c8f135'
      rememberBackground='#111111'
      rememberBorderColor='#4a453f'
      rememberCheckColor='#0d0d0d'
      rememberCheckedBackground='#c8f135'
      rememberCheckedBorderColor='#c8f135'
      forgotPasswordHref='/forgot-password'
      forgotPasswordLabel='비밀번호 찾기'
      signUpHref='/signup'
      signUpLabel='회원가입'
      signUpPrompt='아직 계정이 없으신가요?'
      socialTitle='소셜 로그인'
      socialDividerLabel='또는'
      onSocialLogin={handleSocialLogin}
      onSubmit={handleSubmit}
    />
  )
}
