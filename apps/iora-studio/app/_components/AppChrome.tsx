'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Footer, { type FooterGroup } from './Footer'
import Header, { type HeaderNavItem } from './Header'

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

  return (
    <>
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
    </>
  )
}
