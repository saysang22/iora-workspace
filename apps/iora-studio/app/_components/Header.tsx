'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiEdit3, FiFolder, FiLogOut, FiUser } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import styles from './Header.module.scss'

export type HeaderNavItem = {
  label: string
  href: string
  isButton?: boolean
}

type HeaderProps = {
  logo: string
  navItems: HeaderNavItem[]
}

const ACCOUNT_MENU_ITEMS = [
  { href: '/profile', icon: FiEdit3, label: '회원 수정' },
  { href: '/projects', icon: FiFolder, label: '프로젝트 현황' },
] as const

export default function Header({ logo, navItems }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      setIsSignedIn(Boolean(data.session))
    }

    void syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session))
      setIsAccountMenuOpen(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isAccountMenuOpen])

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.href === '/signup' && isSignedIn) {
          return false
        }

        return true
      }),
    [isSignedIn, navItems],
  )

  const isActiveLink = (href: string) => {
    if (href === '/home') {
      return pathname === href
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleAccountToggle = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const handleMenuLinkClick = () => {
    setIsAccountMenuOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAccountMenuOpen(false)
    router.push('/home')
    router.refresh()
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.logoLink} href='/home' aria-label='IORA STUDIO 홈'>
          <Image src={logo} alt='IORA STUDIO' width={172} height={96} priority />
        </Link>
        <nav className={styles.nav} aria-label='주요 메뉴'>
          {visibleNavItems.map((item) => {
            const isActive = isActiveLink(item.href)
            const isProfileEntry = item.href === '/signin' && isSignedIn
            const classNames = [
              item.isButton ? styles.navButton : '',
              isProfileEntry ? styles.profileTrigger : '',
              isActive && !item.isButton ? styles.activeLink : '',
            ]
              .filter(Boolean)
              .join(' ')

            if (isProfileEntry) {
              return (
                <div className={styles.accountMenuWrap} key={item.href} ref={accountMenuRef}>
                  <button
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup='menu'
                    aria-label='내 계정 메뉴'
                    className={classNames || undefined}
                    type='button'
                    onClick={handleAccountToggle}
                  >
                    <FiUser aria-hidden='true' size={24} />
                  </button>

                  {isAccountMenuOpen ? (
                    <div className={styles.accountMenu} role='menu' aria-label='계정 메뉴'>
                      {ACCOUNT_MENU_ITEMS.map(({ href, icon: Icon, label }) => (
                        <Link
                          className={styles.accountMenuItem}
                          href={href}
                          key={href}
                          role='menuitem'
                          onClick={handleMenuLinkClick}
                        >
                          <Icon aria-hidden='true' size={16} />
                          <span>{label}</span>
                        </Link>
                      ))}
                      <button className={styles.accountMenuItem} role='menuitem' type='button' onClick={handleLogout}>
                        <FiLogOut aria-hidden='true' size={16} />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            }

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={classNames || undefined}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
