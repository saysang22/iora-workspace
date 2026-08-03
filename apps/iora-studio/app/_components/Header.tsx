'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { FiEdit3, FiFileText, FiFolder, FiLogOut, FiUser } from 'react-icons/fi'
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
  { href: '/profile', icon: FiEdit3, label: '프로필 수정' },
  { href: '/projects/request', icon: FiFileText, label: '프로젝트 수정 요청' },
  { href: '/projects', icon: FiFolder, label: '프로젝트 현황' },
] as const

type MobileAccountMenuItem = {
  href: string
  icon: typeof FiFolder | typeof FiEdit3 | typeof FiFileText
  label: string
}

export default function Header({ logo, navItems }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const isMobileMenuOpen = mobileMenuPath === pathname

  const closeMobileMenu = () => {
    setMobileMenuPath(null)
  }

  useEffect(() => {
    let isMounted = true

    const syncAdminState = async (userId: string | null) => {
      if (!userId) {
        if (isMounted) {
          setIsAdmin(false)
        }
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      setIsAdmin(Boolean(profile?.is_admin))
    }

    const syncSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) {
        return
      }

      setIsSignedIn(Boolean(user))
      await syncAdminState(user?.id ?? null)
    }

    void syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const sessionUser = session?.user ?? null

      setIsSignedIn(Boolean(sessionUser))
      setIsAccountMenuOpen(false)
      closeMobileMenu()
      void syncAdminState(sessionUser?.id ?? null)
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
    }

    return () => {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)')

    const syncMobileMenuViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      if (!event.matches) {
        closeMobileMenu()
      }
    }

    syncMobileMenuViewport(mobileMediaQuery)

    const handleChange = (event: MediaQueryListEvent) => {
      syncMobileMenuViewport(event)
    }

    mobileMediaQuery.addEventListener('change', handleChange)

    return () => {
      mobileMediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const visibleNavItems = useMemo(() => {
    const filteredNavItems = navItems.filter((item) => {
      if (item.href === '/signup' && isSignedIn) {
        return false
      }

      return true
    })

    if (isAdmin) {
      filteredNavItems.push({ label: '관리자페이지 보기', href: '/admin' })
    }

    return filteredNavItems
  }, [isAdmin, isSignedIn, navItems])

  const mobilePrimaryItems = useMemo(
    () =>
      visibleNavItems.filter(
        (item) => item.href !== '/signin' && item.href !== '/signup' && item.href !== '/admin',
      ),
    [visibleNavItems],
  )

  const mobileAccountItems = useMemo<MobileAccountMenuItem[]>(() => {
    if (!isSignedIn) {
      return []
    }

    const items: MobileAccountMenuItem[] = [...ACCOUNT_MENU_ITEMS]

    if (isAdmin) {
      items.push({ href: '/admin', icon: FiFolder, label: '관리자페이지' })
    }

    return items
  }, [isAdmin, isSignedIn])

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/home'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleAccountToggle = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const handleMenuLinkClick = () => {
    setIsAccountMenuOpen(false)
    closeMobileMenu()
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuPath((current) => (current === pathname ? null : pathname))
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return
      }

      setIsAccountMenuOpen(false)
      closeMobileMenu()
      setIsAdmin(false)
      router.push('/')
      router.refresh()
    } catch {
      return
    }
  }

  return (
    <div className={styles.headerShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logoLink} href='/' aria-label='IORA STUDIO 홈으로 이동'>
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
                        <button
                          className={styles.accountMenuItem}
                          role='menuitem'
                          type='button'
                          onClick={handleLogout}
                        >
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

          <button
            aria-controls='mobile-navigation'
            aria-expanded={isMobileMenuOpen}
            aria-label='모바일 메뉴 열기'
            className={styles.mobileMenuButton}
            type='button'
            onClick={handleMobileMenuToggle}
          >
            <span className={styles.mobileMenuIcon} aria-hidden='true'>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`${styles.mobileMenuOverlay} ${
          isMobileMenuOpen ? styles.mobileMenuOverlayOpen : ''
        }`.trim()}
        aria-hidden={isMobileMenuOpen ? undefined : 'true'}
      >
        <button
          aria-label='모바일 메뉴 닫기'
          className={styles.mobileMenuBackdrop}
          type='button'
          onClick={closeMobileMenu}
        />
        <div
          className={`${styles.mobileMenuPanel} ${
            isMobileMenuOpen ? styles.mobileMenuPanelOpen : ''
          }`.trim()}
          id='mobile-navigation'
          role='dialog'
          aria-modal='true'
          aria-label='모바일 메뉴'
        >
          <div className={styles.mobileMenuSection}>
            <p className={styles.mobileMenuTitle}>MENU</p>
            <div className={styles.mobileMenuList}>
              {mobilePrimaryItems.map((item) => (
                <Link
                  className={`${styles.mobileMenuLink} ${
                    isActiveLink(item.href) ? styles.mobileMenuLinkActive : ''
                  }`.trim()}
                  href={item.href}
                  key={item.href}
                  onClick={handleMenuLinkClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {mobileAccountItems.length > 0 ? (
            <div className={`${styles.mobileMenuSection} ${styles.mobileMenuSectionBorder}`.trim()}>
              <p className={styles.mobileMenuTitle}>ACCOUNT</p>
              <div className={styles.mobileMenuList}>
                {mobileAccountItems.map(({ href, icon: Icon, label }) => (
                  <Link
                    className={`${styles.mobileMenuLink} ${styles.mobileMenuLinkWithIcon} ${
                      isActiveLink(href) ? styles.mobileMenuLinkActive : ''
                    }`.trim()}
                    href={href}
                    key={href}
                    onClick={handleMenuLinkClick}
                  >
                    <Icon aria-hidden='true' size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.mobileMenuFooter}>
            {isSignedIn ? (
              <button className={styles.mobileActionButton} type='button' onClick={() => void handleLogout()}>
                로그아웃
              </button>
            ) : (
              <Link className={styles.mobileActionButton} href='/signin' onClick={handleMenuLinkClick}>
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
