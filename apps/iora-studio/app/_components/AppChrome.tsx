'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Footer, { type FooterGroup } from './Footer'
import Header, { type HeaderNavItem } from './Header'

type AppChromeProps = {
  children: ReactNode
  footerGroups: FooterGroup[]
  headerNavItems: HeaderNavItem[]
  logo: string
}

export default function AppChrome({ children, footerGroups, headerNavItems, logo }: AppChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  return (
    <>
      {isAdminRoute ? null : <Header logo={logo} navItems={headerNavItems} />}
      {children}
      {isAdminRoute ? null : <Footer logo={logo} groups={footerGroups} />}
    </>
  )
}
