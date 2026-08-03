import type { Metadata } from 'next'
import Script from 'next/script'
import AppChrome from './_components/AppChrome'
import type { FooterGroup } from './_components/Footer'
import type { HeaderNavItem } from './_components/Header'
import './globals.css'
import {
  BUSINESS_ADDRESS,
  BUSINESS_NUMBER,
  BUSINESS_PHONE,
  BUSINESS_PHONE_HREF,
  createOrganizationJsonLd,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  REPRESENTATIVE_NAME,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '../lib/seo'

const ASSETS = {
  logo: '/images/logo/light_logo.svg',
} as const

const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Service', href: '/service' },
  { label: 'Works', href: '/works' },
  { label: 'Contact', href: '/contact' },
  { label: 'Sign in', href: '/signin' },
  { label: 'Sign up', href: '/signup', isButton: true },
]

const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'MENU',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Service', href: '/service' },
      { label: 'Works', href: '/works' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'SNS',
    links: [
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/iorastudio2212/',
        icon: 'instagram',
        isExternal: true,
      },
      {
        label: '카카오채널',
        href: 'http://pf.kakao.com/_qrCBX',
        icon: 'kakao',
        isExternal: true,
      },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  verification: {
    google: 'exwkJp2xhi7BnMpZMD8RAohw9pFWqHdNvE-ozTxTqX8',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const organizationJsonLd = createOrganizationJsonLd()

  return (
    <html lang='ko'>
      <body>
        <script
          id='organization-jsonld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AppChrome
          businessAddress={BUSINESS_ADDRESS}
          businessNumber={BUSINESS_NUMBER}
          footerGroups={FOOTER_GROUPS}
          headerNavItems={HEADER_NAV_ITEMS}
          logo={ASSETS.logo}
          phone={BUSINESS_PHONE}
          phoneHref={BUSINESS_PHONE_HREF}
          representativeName={REPRESENTATIVE_NAME}
        >
          {children}
        </AppChrome>
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
      </body>
    </html>
  )
}
