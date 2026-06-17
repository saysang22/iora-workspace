import type { Metadata } from 'next'
import Footer, { type FooterGroup } from './_components/Footer'
import Header, { type HeaderNavItem } from './_components/Header'
import './globals.css'

const ASSETS = {
  logo: '/images/logo/light_logo.svg',
} as const

const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: 'Home', href: '/home' },
  { label: 'About', href: '/about' },
  { label: 'Service', href: '/service' },
  { label: 'Works', href: '/works' },
  { label: 'Contact', href: '/contact' },
  { label: 'Consult', href: '/consult', isButton: true },
]

const FOOTER_GROUPS: FooterGroup[] = [
  { title: 'MENU', links: ['About', 'Services', 'Works'] },
  { title: 'SOCIAL', links: ['Instagram', 'LinkedIn', 'Twitter (X)'] },
  { title: 'LEGAL', links: ['Privacy Policy', 'Terms of Service'] },
]

export const metadata: Metadata = {
  title: 'IORA STUDIO',
  description: 'AI 기반 프리미엄 웹 개발 스튜디오',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <Header logo={ASSETS.logo} navItems={HEADER_NAV_ITEMS} />
        {children}
        <Footer logo={ASSETS.logo} groups={FOOTER_GROUPS} />
      </body>
    </html>
  )
}
