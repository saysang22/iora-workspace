import type { Metadata } from 'next'
import Script from 'next/script'
import AppChrome from './_components/AppChrome'
import type { FooterGroup } from './_components/Footer'
import type { HeaderNavItem } from './_components/Header'
import './globals.css'

const ASSETS = {
  logo: '/images/logo/light_logo.svg',
} as const

const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: 'Home', href: '/home' },
  { label: 'Service', href: '/service' },
  { label: 'Works', href: '/works' },
  { label: 'Contact', href: '/contact' },
  { label: 'Sign in', href: '/signin' },
  { label: 'Sign up', href: '/signup', isButton: true },
]

const FOOTER_GROUPS: FooterGroup[] = [
  { title: 'MENU', links: ['Home', 'Services', 'Works'] },
  { title: 'SOCIAL', links: ['Instagram', 'LinkedIn'] },
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
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ko">
      <body>
        <AppChrome footerGroups={FOOTER_GROUPS} headerNavItems={HEADER_NAV_ITEMS} logo={ASSETS.logo}>
          {children}
        </AppChrome>
      </body>
      {gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy='afterInteractive'
          />
          <Script id='ga4-init' strategy='afterInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      ) : null}
    </html>
  )
}
