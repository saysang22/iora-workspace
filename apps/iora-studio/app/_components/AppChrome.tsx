'use client'

import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Footer, { type FooterGroup } from './Footer'
import Header, { type HeaderNavItem } from './Header'
import styles from './AppChrome.module.scss'

type AppChromeProps = {
  businessAddress: string
  businessNumber: string
  children: ReactNode
  footerGroups: FooterGroup[]
  headerNavItems: HeaderNavItem[]
  logo: string
  phone: string
  phoneHref: string
  representativeName: string
}

export default function AppChrome({
  businessAddress,
  businessNumber,
  children,
  footerGroups,
  headerNavItems,
  logo,
  phone,
  phoneHref,
  representativeName,
}: AppChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const routeLoadingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setIsRouteLoading(false)

    if (routeLoadingTimeoutRef.current) {
      window.clearTimeout(routeLoadingTimeoutRef.current)
      routeLoadingTimeoutRef.current = null
    }
  }, [pathname])

  useEffect(() => {
    return () => {
      if (routeLoadingTimeoutRef.current) {
        window.clearTimeout(routeLoadingTimeoutRef.current)
      }
    }
  }, [])

  const handleRouteIntent = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.defaultPrevented) {
      return
    }

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      ('button' in event && event.button !== 0)
    ) {
      return
    }

    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const anchor = target.closest('a')

    if (!(anchor instanceof HTMLAnchorElement)) {
      return
    }

    if (!anchor.href || anchor.target === '_blank' || anchor.hasAttribute('download')) {
      return
    }

    const nextUrl = new URL(anchor.href, window.location.href)
    const currentUrl = new URL(window.location.href)

    if (nextUrl.origin !== currentUrl.origin) {
      return
    }

    if (
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search &&
      nextUrl.hash === currentUrl.hash
    ) {
      return
    }

    setIsRouteLoading(true)

    if (routeLoadingTimeoutRef.current) {
      window.clearTimeout(routeLoadingTimeoutRef.current)
    }

    routeLoadingTimeoutRef.current = window.setTimeout(() => {
      setIsRouteLoading(false)
      routeLoadingTimeoutRef.current = null
    }, 10000)
  }

  return (
    <div className={styles.chromeShell} onClickCapture={handleRouteIntent}>
      {isAdminRoute ? null : <Header logo={logo} navItems={headerNavItems} />}
      {children}
      {isAdminRoute ? null : (
        <Footer
          businessAddress={businessAddress}
          businessNumber={businessNumber}
          groups={footerGroups}
          logo={logo}
          phone={phone}
          phoneHref={phoneHref}
          representativeName={representativeName}
        />
      )}
      {isRouteLoading ? (
        <div className={styles.routeLoadingOverlay} aria-live='polite' aria-busy='true'>
          <div className={styles.routeLoadingIndicator}>
            <span className={styles.routeLoadingRing} aria-hidden='true' />
            <span className={styles.routeLoadingLabel}>페이지를 불러오고 있어요</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
