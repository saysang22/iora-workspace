'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Login } from '@iora/ui/client'
import { supabase } from '../../lib/supabase'
import { resolvePostAuthPath } from '../../lib/onboarding'
import { getAuthErrorMessage } from './authErrorMessage'
import { startSocialAuth, type SocialProvider } from './socialAuth'

type LoginSubmitValues = {
  email: string
  password: string
  remember: boolean
}

type SignInClientProps = {
  initialError?: string | null
  nextPath?: string | null
}

export default function SignInClient({
  initialError = null,
  nextPath = null,
}: SignInClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    initialError ? getAuthErrorMessage(initialError) : '',
  )

  useEffect(() => {
    let isMounted = true

    const redirectSignedInUser = async (userId: string) => {
      const redirectPath = await resolvePostAuthPath(supabase, userId, nextPath)

      if (!isMounted) {
        return
      }

      router.replace(redirectPath)
      router.refresh()
    }

    const syncSignedInUser = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null

      // TEMP DEBUG LOG - 문제 해결 후 제거 예정
      console.log('[AUTH][SignInClient][ExistingSessionCheck]', {
        checkedAt: new Date().toISOString(),
        hasSession: Boolean(data.session),
        sessionUserId: sessionUser?.id ?? null,
        sessionEmail: sessionUser?.email ?? null,
        sessionExpiresAt: data.session?.expires_at ?? null,
        nextPath,
      })

      if (!isMounted || !sessionUser) {
        return
      }

      await redirectSignedInUser(sessionUser.id)
    }

    void syncSignedInUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const sessionUser = session?.user ?? null

        if (!sessionUser) {
          return
        }

        void redirectSignedInUser(sessionUser.id)
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [nextPath, router])

  const handleSubmit = async ({ email, password }: LoginSubmitValues) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // TEMP DEBUG LOG - 문제 해결 후 제거 예정
      console.log('[AUTH][SignInClient][SignInAttempt]', {
        attemptedAt: new Date().toISOString(),
        email,
        nextPath,
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // TEMP DEBUG LOG - 문제 해결 후 제거 예정
        console.error('[AUTH][SignInClient][SignInFailure]', {
          attemptedAt: new Date().toISOString(),
          email,
          error,
          errorCode: error.code ?? null,
          errorMessage: error.message,
          errorStatus: error.status ?? null,
          errorName: error.name ?? null,
        })
        setErrorMessage(getAuthErrorMessage(error.message))
        return
      }

      // TEMP DEBUG LOG - 문제 해결 후 제거 예정
      console.log('[AUTH][SignInClient][SignInSuccess]', {
        attemptedAt: new Date().toISOString(),
        email,
        userId: data.user?.id ?? data.session?.user?.id ?? null,
        sessionUserId: data.session?.user?.id ?? null,
        sessionExpiresAt: data.session?.expires_at ?? null,
      })

      const userId = data.user?.id ?? data.session?.user?.id

      if (!userId) {
        setErrorMessage('로그인 세션을 확인하지 못했습니다. 다시 시도해 주세요.')
        return
      }

      const redirectPath = await resolvePostAuthPath(supabase, userId, nextPath)
      router.push(redirectPath)
      router.refresh()
    } catch (error) {
      // TEMP DEBUG LOG - 문제 해결 후 제거 예정
      console.error('[AUTH][SignInClient][SignInException]', {
        attemptedAt: new Date().toISOString(),
        email,
        error,
      })
      setErrorMessage('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setErrorMessage('')

    const { error } = await startSocialAuth({
      nextPath,
      provider,
      returnPath: '/signin',
    })

    if (error) {
      setErrorMessage(getAuthErrorMessage(error))
    }

    return false
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
      socialTitle='간편 로그인'
      socialDividerLabel='또는'
      onSocialLogin={handleSocialLogin}
      onSubmit={handleSubmit}
    />
  )
}
